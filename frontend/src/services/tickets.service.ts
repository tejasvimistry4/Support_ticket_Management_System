import { apiClient } from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import type {
  CreateTicketPayload,
  PaginatedTicketsResponse,
  Ticket,
  TicketFilterParams,
  TicketStats,
  UpdateTicketPayload,
} from '../types/ticket';

export const ticketsService = {
  getTickets: async (
    params?: TicketFilterParams,
  ): Promise<PaginatedTicketsResponse> => {
    const queryParams: Record<string, any> = {};
    if (params) {
      if (params.status) queryParams.status = params.status;
      if (params.priority) queryParams.priority = params.priority;
      if (params.search && params.search.trim() !== '')
        queryParams.search = params.search.trim();
      if (params.assignedToId) queryParams.assignedToId = params.assignedToId;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
    }

    const response = await apiClient.get<PaginatedTicketsResponse>(
      ENDPOINTS.TICKETS.BASE,
      { params: queryParams },
    );
    return response.data;
  },

  getTicketById: async (id: string): Promise<Ticket> => {
    const response = await apiClient.get<Ticket>(ENDPOINTS.TICKETS.BY_ID(id));
    return response.data;
  },

  createTicket: async (payload: CreateTicketPayload): Promise<Ticket> => {
    const response = await apiClient.post<Ticket>(
      ENDPOINTS.TICKETS.BASE,
      payload,
    );
    return response.data;
  },

  updateTicket: async (
    id: string,
    payload: UpdateTicketPayload,
  ): Promise<Ticket> => {
    const response = await apiClient.patch<Ticket>(
      ENDPOINTS.TICKETS.BY_ID(id),
      payload,
    );
    return response.data;
  },

  deleteTicket: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(ENDPOINTS.TICKETS.BY_ID(id));
    return response.data;
  },

  getStats: async (): Promise<TicketStats> => {
    const response = await apiClient.get<TicketStats>(ENDPOINTS.TICKETS.STATS);
    return response.data;
  },
};

export const ticketsApi = ticketsService;
export default ticketsService;
