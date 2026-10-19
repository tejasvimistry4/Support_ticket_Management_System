import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../common/constants/roles.enum';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { QueryTicketsDto } from './dto/query-ticket.dto';
import {
  PaginatedTicketsResponseDto,
  TicketResponseDto,
} from './dto/ticket-response.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateTicketDto,
    @GetUser() user: { id: string; role: Role },
  ): Promise<TicketResponseDto> {
    return this.ticketsService.create(createDto, user);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPPORT_AGENT)
  async findAll(
    @Query() query: QueryTicketsDto,
    @GetUser() user: { id: string; role: Role },
  ): Promise<PaginatedTicketsResponseDto> {
    return this.ticketsService.findAll(query, user);
  }


  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPPORT_AGENT)
  async findOne(
    @Param('id') id: string,
    @GetUser() user: { id: string; role: Role },
  ): Promise<TicketResponseDto> {
    return this.ticketsService.findOne(id, user);
  }


  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPPORT_AGENT)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTicketDto,
    @GetUser() user: { id: string; role: Role },
  ): Promise<TicketResponseDto> {
    return this.ticketsService.update(id, updateDto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @GetUser() user: { id: string; role: Role },
  ): Promise<{ success: boolean; message: string }> {
    return this.ticketsService.remove(id, user);
  }
}
