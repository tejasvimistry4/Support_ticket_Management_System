import { Role } from '../../../common/constants/roles.enum';
import { TicketPriority } from '../../../common/constants/ticket-priority';
import { TicketStatus } from '../../../common/constants/ticket-status';
import { PaginationMeta } from '../../../utils/pagination.util';

export class TicketUserSummaryDto {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export class TicketResponseDto {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdById: string;
  createdBy: TicketUserSummaryDto;
  assignedToId: string | null;
  assignedTo: TicketUserSummaryDto | null;
  resolvedAt: Date | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginationMetaDto implements PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PaginatedTicketsResponseDto {
  items: TicketResponseDto[];
  pagination: PaginationMetaDto;
}
