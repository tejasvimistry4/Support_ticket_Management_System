import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Role } from '../../common/constants/roles.enum';
import { TicketPriority } from '../../common/constants/ticket-priority';
import { TicketStatus } from '../../common/constants/ticket-status';
import { PrismaService } from '../../database/prisma.service';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '../../utils/pagination.util';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { QueryTicketsDto } from './dto/query-ticket.dto';
import {
  PaginatedTicketsResponseDto,
  TicketResponseDto,
} from './dto/ticket-response.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

const userSelectFields = {
  id: true,
  name: true,
  email: true,
  role: true,
};

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDto: CreateTicketDto,
    currentUser: { id: string; role: Role },
  ): Promise<TicketResponseDto> {
    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Only administrators are permitted to create tickets',
      );
    }

    let assignedToId: string | null = null;
    if (createDto.assignedToId && createDto.assignedToId.trim() !== '') {
      const assignedUser = await this.prisma.user.findUnique({
        where: { id: createDto.assignedToId },
      });

      if (!assignedUser) {
        throw new BadRequestException('Assigned agent does not exist');
      }
      assignedToId = assignedUser.id;
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        title: createDto.title.trim(),
        description: createDto.description.trim(),
        priority: createDto.priority || TicketPriority.MEDIUM,
        status: TicketStatus.OPEN,
        createdById: currentUser.id,
        assignedToId,
        ...(createDto.dueDate ? { dueDate: new Date(createDto.dueDate) } : {}),
      },
      include: {
        createdBy: { select: userSelectFields },
        assignedTo: { select: userSelectFields },
      },
    });

    return ticket as TicketResponseDto;
  }

  async findAll(
    query: QueryTicketsDto,
    currentUser: { id: string; role: Role },
  ): Promise<PaginatedTicketsResponseDto> {
    const { page, limit, skip, take } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: Prisma.TicketWhereInput = {};

    if (currentUser.role === Role.SUPPORT_AGENT) {
      where.assignedToId = currentUser.id;
    } else if (currentUser.role === Role.ADMIN) {
      where.createdById = currentUser.id;
      if (query.assignedToId) {
        where.assignedToId = query.assignedToId;
      }
    }

    if (query.status) {
      where.status = query.status;
    }
    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.search && query.search.trim() !== '') {
      const searchTerm = query.search.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [total, items] = await this.prisma.$transaction([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          createdBy: { select: userSelectFields },
          assignedTo: { select: userSelectFields },
        },
      }),
    ]);

    return buildPaginatedResponse(
      items as TicketResponseDto[],
      total,
      page,
      limit,
    );
  }


  async findOne(
    id: string,
    currentUser: { id: string; role: Role },
  ): Promise<TicketResponseDto> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: userSelectFields },
        assignedTo: { select: userSelectFields },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} was not found`);
    }

    if (
      currentUser.role === Role.SUPPORT_AGENT &&
      ticket.assignedToId !== currentUser.id
    ) {
      throw new ForbiddenException(
        'Access denied: You are only authorized to view tickets assigned to you',
      );
    }

    if (
      currentUser.role === Role.ADMIN &&
      ticket.createdById !== currentUser.id
    ) {
      throw new ForbiddenException(
        'Access denied: You are only authorized to view tickets created by you',
      );
    }

    return ticket as TicketResponseDto;
  }


  async update(
    id: string,
    updateDto: UpdateTicketDto,
    currentUser: { id: string; role: Role },
  ): Promise<TicketResponseDto> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} was not found`);
    }

    const dataToUpdate: Prisma.TicketUpdateInput = {};

    if (currentUser.role === Role.SUPPORT_AGENT) {
      if (ticket.assignedToId !== currentUser.id) {
        throw new ForbiddenException(
          'Access denied: You are only authorized to update tickets assigned to you',
        );
      }

      if (ticket.status === 'CLOSED') {
        throw new ForbiddenException(
          'Access denied: Closed tickets cannot be edited by Support Agents',
        );
      }

      if (
        updateDto.title !== undefined ||
        updateDto.description !== undefined ||
        updateDto.priority !== undefined ||
        updateDto.assignedToId !== undefined
      ) {
        throw new ForbiddenException(
          'Access denied: Support Agents are only permitted to update ticket status',
        );
      }

      if (updateDto.status) {
        dataToUpdate.status = updateDto.status;
      }
    } else if (currentUser.role === Role.ADMIN) {
      if (ticket.createdById !== currentUser.id) {
        throw new ForbiddenException(
          'Access denied: You are only authorized to edit tickets created by you',
        );
      }
      if (updateDto.title !== undefined) {
        dataToUpdate.title = updateDto.title.trim();
      }
      if (updateDto.description !== undefined) {
        dataToUpdate.description = updateDto.description.trim();
      }
      if (updateDto.status !== undefined) {
        dataToUpdate.status = updateDto.status;
      }
      if (updateDto.priority !== undefined) {
        dataToUpdate.priority = updateDto.priority;
      }
      if (updateDto.dueDate !== undefined) {
        dataToUpdate.dueDate = updateDto.dueDate
          ? new Date(updateDto.dueDate)
          : null;
      }
      if (updateDto.assignedToId !== undefined) {
        if (!updateDto.assignedToId || updateDto.assignedToId.trim() === '') {
          dataToUpdate.assignedTo = { disconnect: true };
        } else {
          const agentExists = await this.prisma.user.findUnique({
            where: { id: updateDto.assignedToId },
          });
          if (!agentExists) {
            throw new BadRequestException('Assigned agent does not exist');
          }
          dataToUpdate.assignedTo = {
            connect: { id: updateDto.assignedToId },
          };
        }
      }
    }

    if (dataToUpdate.status) {
      if (
        dataToUpdate.status === TicketStatus.RESOLVED ||
        dataToUpdate.status === TicketStatus.CLOSED
      ) {
        dataToUpdate.resolvedAt = ticket.resolvedAt || new Date();
      } else if (
        dataToUpdate.status === TicketStatus.OPEN ||
        dataToUpdate.status === TicketStatus.IN_PROGRESS
      ) {
        dataToUpdate.resolvedAt = null;
      }
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: dataToUpdate,
      include: {
        createdBy: { select: userSelectFields },
        assignedTo: { select: userSelectFields },
      },
    });

    return updated as TicketResponseDto;
  }

  async remove(
    id: string,
    currentUser: { id: string; role: Role },
  ): Promise<{ success: boolean; message: string }> {
    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Access denied: Only administrators can delete tickets',
      );
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} was not found`);
    }

    if (ticket.createdById !== currentUser.id) {
      throw new ForbiddenException(
        'Access denied: You are only authorized to delete tickets created by you',
      );
    }

    await this.prisma.ticket.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Ticket "${ticket.title}" deleted successfully`,
    };
  }
}
