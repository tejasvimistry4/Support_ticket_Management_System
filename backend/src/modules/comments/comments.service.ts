import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '../../common/constants/roles.enum';
import { PrismaService } from '../../database/prisma.service';
import { CommentsGateway } from './comments.gateway';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

const authorSelectFields = {
  id: true,
  name: true,
  email: true,
  role: true,
};

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => CommentsGateway))
    private readonly commentsGateway: CommentsGateway,
  ) { }

  async canUserAccessTicket(
    userId: string,
    userRole: Role,
    ticketId: string,
  ): Promise<boolean> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, createdById: true, assignedToId: true },
    });

    if (!ticket) {
      return false;
    }
    return userRole === Role.ADMIN || userRole === Role.SUPPORT_AGENT;
  }


  async createComment(
    ticketId: string,
    createDto: CreateCommentDto,
    currentUser: { id: string; role: Role },
  ): Promise<CommentResponseDto> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} was not found`);
    }

    const hasAccess = await this.canUserAccessTicket(
      currentUser.id,
      currentUser.role,
      ticketId,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'Access denied: You are only authorized to comment on tickets assigned to you',
      );
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: createDto.content.trim(),
        ticketId,
        authorId: currentUser.id,
      },
      include: {
        author: { select: authorSelectFields },
      },
    });

    const responseDto = comment as CommentResponseDto;

    try {
      this.commentsGateway.broadcastNewComment(ticketId, responseDto);
    } catch (err: any) {
      this.logger.warn(
        `Failed to broadcast new comment via WebSocket: ${err.message}`,
      );
    }

    return responseDto;
  }

  async getCommentsByTicket(
    ticketId: string,
    currentUser: { id: string; role: Role },
  ): Promise<CommentResponseDto[]> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} was not found`);
    }

    const hasAccess = await this.canUserAccessTicket(
      currentUser.id,
      currentUser.role,
      ticketId,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'Access denied: You are only authorized to view comments for tickets assigned to you',
      );
    }

    const comments = await this.prisma.comment.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: authorSelectFields },
      },
    });

    return comments as CommentResponseDto[];
  }

  async updateComment(
    ticketId: string,
    commentId: string,
    updateDto: UpdateCommentDto,
    currentUser: { id: string; role: Role },
  ): Promise<CommentResponseDto> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} was not found`);
    }

    const hasAccess = await this.canUserAccessTicket(
      currentUser.id,
      currentUser.role,
      ticketId,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'Access denied: You are only authorized to access tickets assigned to you',
      );
    }

    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: { select: authorSelectFields } },
    });

    if (!comment || comment.ticketId !== ticketId) {
      throw new NotFoundException(
        `Comment with ID ${commentId} was not found on this ticket`,
      );
    }

    const isAuthor = comment.authorId === currentUser.id;

    if (!isAuthor) {
      throw new ForbiddenException(
        'Access denied: You are only permitted to edit your own comments',
      );
    }

    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        content: updateDto.content.trim(),
      },
      include: {
        author: { select: authorSelectFields },
      },
    });

    const responseDto = updated as CommentResponseDto;

    try {
      this.commentsGateway.broadcastUpdatedComment(ticketId, responseDto);
    } catch (err: any) {
      this.logger.warn(
        `Failed to broadcast updated comment via WebSocket: ${err.message}`,
      );
    }

    return responseDto;
  }


  async deleteComment(
    ticketId: string,
    commentId: string,
    currentUser: { id: string; role: Role },
  ): Promise<{ success: boolean; message: string; commentId: string }> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} was not found`);
    }

    const hasAccess = await this.canUserAccessTicket(
      currentUser.id,
      currentUser.role,
      ticketId,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'Access denied: You are only authorized to access tickets assigned to you',
      );
    }

    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.ticketId !== ticketId) {
      throw new NotFoundException(
        `Comment with ID ${commentId} was not found on this ticket`,
      );
    }

    const isAuthor = comment.authorId === currentUser.id;

    if (!isAuthor) {
      throw new ForbiddenException(
        'Access denied: You are only permitted to delete your own comments',
      );
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    try {
      this.commentsGateway.broadcastDeletedComment(ticketId, commentId);
    } catch (err: any) {
      this.logger.warn(
        `Failed to broadcast deleted comment via WebSocket: ${err.message}`,
      );
    }

    return {
      success: true,
      message: 'Comment deleted successfully',
      commentId,
    };
  }
}
