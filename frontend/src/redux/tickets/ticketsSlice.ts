import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  Ticket,
  TicketFilterParams,
  TicketsState,
} from '../../types/ticket';
import {
  createTicket,
  deleteTicket,
  fetchTicketById,
  fetchTickets,
  fetchTicketStats,
  updateTicket,
} from './ticketsThunk';

const initialFilters: TicketFilterParams = {
  status: '',
  priority: '',
  search: '',
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const initialState: TicketsState = {
  tickets: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  filters: initialFilters,
  currentTicket: null,
  stats: null,
  isLoading: false,
  isDetailLoading: false,
  isSubmitting: false,
  error: null,
};

export const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<TicketFilterParams>>,
    ) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
        page: action.payload.page !== undefined ? action.payload.page : 1,
      };
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    },
    clearTicketError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        if (state.tickets.length === 0) {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch tickets';
      });

    builder
      .addCase(fetchTicketById.pending, (state, action) => {
        if (!state.currentTicket || state.currentTicket.id !== action.meta.arg) {
          state.isDetailLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.isDetailLoading = false;
        state.currentTicket = action.payload;
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.isDetailLoading = false;
        state.error = action.payload || 'Failed to fetch ticket details';
      });

    builder
      .addCase(createTicket.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action: PayloadAction<Ticket>) => {
        state.isSubmitting = false;
        state.tickets.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || 'Failed to create ticket';
      });

    builder
      .addCase(updateTicket.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateTicket.fulfilled, (state, action: PayloadAction<Ticket>) => {
        state.isSubmitting = false;
        const index = state.tickets.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        if (state.currentTicket?.id === action.payload.id) {
          state.currentTicket = action.payload;
        }
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || 'Failed to update ticket';
      });

    builder
      .addCase(deleteTicket.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteTicket.fulfilled, (state, action: PayloadAction<string>) => {
        state.isSubmitting = false;
        state.tickets = state.tickets.filter((t) => t.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.currentTicket?.id === action.payload) {
          state.currentTicket = null;
        }
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || 'Failed to delete ticket';
      });

    builder
      .addCase(fetchTicketStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const {
  setFilters,
  setPage,
  resetFilters,
  clearCurrentTicket,
  clearTicketError,
} = ticketsSlice.actions;

export default ticketsSlice.reducer;
