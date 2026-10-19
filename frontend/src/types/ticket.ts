import { Role } from './auth';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface TicketUserSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdById: string;
  createdBy: TicketUserSummary;
  assignedToId: string | null;
  assignedTo: TicketUserSummary | null;
  dueDate?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority?: TicketPriority;
  assignedToId?: string;
  dueDate?: string;
}

export interface UpdateTicketPayload {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToId?: string | null;
  dueDate?: string | null;
}

export interface TicketFilterParams {
  status?: TicketStatus | '';
  priority?: TicketPriority | '';
  search?: string;
  assignedToId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedTicketsResponse {
  items: Ticket[];
  pagination: PaginationMeta;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  low: number;
  medium: number;
  high: number;
  urgent: number;
  unassigned: number;
}

export interface TicketsState {
  tickets: Ticket[];
  pagination: PaginationMeta;
  filters: TicketFilterParams;
  currentTicket: Ticket | null;
  stats: TicketStats | null;
  isLoading: boolean;
  isDetailLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}
