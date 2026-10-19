import type { RootState } from '../store';

export const selectTickets = (state: RootState) => state.tickets.tickets;
export const selectTicketsPagination = (state: RootState) => state.tickets.pagination;
export const selectTicketsFilters = (state: RootState) => state.tickets.filters;
export const selectCurrentTicket = (state: RootState) => state.tickets.currentTicket;
export const selectTicketStats = (state: RootState) => state.tickets.stats;
export const selectTicketsLoading = (state: RootState) => state.tickets.isLoading;
export const selectTicketDetailLoading = (state: RootState) => state.tickets.isDetailLoading;
export const selectTicketSubmitting = (state: RootState) => state.tickets.isSubmitting;
export const selectTicketsError = (state: RootState) => state.tickets.error;
