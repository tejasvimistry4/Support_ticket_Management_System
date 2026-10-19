import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TicketPriority } from '../../../common/constants/ticket-priority';

export class CreateTicketDto {
  @IsNotEmpty({ message: 'Ticket title is required' })
  @IsString({ message: 'Ticket title must be a string' })
  @MinLength(3, { message: 'Ticket title must be at least 3 characters long' })
  @MaxLength(150, { message: 'Ticket title must not exceed 150 characters' })
  title: string;

  @IsNotEmpty({ message: 'Ticket description is required' })
  @IsString({ message: 'Ticket description must be a string' })
  @MinLength(10, { message: 'Ticket description must be at least 10 characters long' })
  @MaxLength(2500, { message: 'Ticket description must not exceed 2500 characters' })
  description: string;

  @IsOptional()
  @IsEnum(TicketPriority, {
    message: 'Priority must be one of: LOW, MEDIUM, HIGH, URGENT',
  })
  priority?: TicketPriority;

  @IsOptional()
  @IsString({ message: 'Assigned agent ID must be a valid string' })
  assignedToId?: string;

  @IsOptional()
  @IsString({ message: 'Due date must be a valid ISO date string' })
  dueDate?: string;
}
