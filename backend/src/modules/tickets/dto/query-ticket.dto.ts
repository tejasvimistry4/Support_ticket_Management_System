import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { TicketPriority } from '../../../common/constants/ticket-priority';
import { TicketStatus } from '../../../common/constants/ticket-status';

export class QueryTicketsDto {
  @IsOptional()
  @IsEnum(TicketStatus, {
    message: 'Status filter must be one of: OPEN, IN_PROGRESS, RESOLVED, CLOSED',
  })
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority, {
    message: 'Priority filter must be one of: LOW, MEDIUM, HIGH, URGENT',
  })
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'title', 'priority', 'status'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
