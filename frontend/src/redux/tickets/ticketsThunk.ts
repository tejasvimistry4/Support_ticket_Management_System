import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { ticketsApi } from '../../api/tickets.api';
import type {
  CreateTicketPayload,
  PaginatedTicketsResponse,
  Ticket,
  TicketFilterParams,
  TicketStats,
  UpdateTicketPayload,
} from '../../types/ticket';

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as { message?: string | string[] };
    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }
    if (typeof data.message === 'string') {
      return data.message;
    }
  }
  return fallback;
};

export const fetchTickets = createAsyncThunk<
  PaginatedTicketsResponse,
  TicketFilterParams | undefined,
  { rejectValue: string }
>('tickets/fetchTickets', async (params, { rejectWithValue }) => {
  try {
    return await ticketsApi.getTickets(params);
  } catch (err) {
    return rejectWithValue(
      extractErrorMessage(err, 'Failed to fetch tickets. Please try again.'),
    );
  }
});

export const fetchTicketById = createAsyncThunk<
  Ticket,
  string,
  { rejectValue: string }
>('tickets/fetchTicketById', async (id, { rejectWithValue }) => {
  try {
    return await ticketsApi.getTicketById(id);
  } catch (err) {
    return rejectWithValue(
      extractErrorMessage(err, 'Failed to fetch ticket details.'),
    );
  }
});

export const createTicket = createAsyncThunk<
  Ticket,
  CreateTicketPayload,
  { rejectValue: string }
>('tickets/createTicket', async (payload, { rejectWithValue }) => {
  try {
    return await ticketsApi.createTicket(payload);
  } catch (err) {
    return rejectWithValue(
      extractErrorMessage(err, 'Failed to create ticket. Please check input.'),
    );
  }
});

export const updateTicket = createAsyncThunk<
  Ticket,
  { id: string; payload: UpdateTicketPayload },
  { rejectValue: string }
>('tickets/updateTicket', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await ticketsApi.updateTicket(id, payload);
  } catch (err) {
    return rejectWithValue(
      extractErrorMessage(err, 'Failed to update ticket. Check your permissions.'),
    );
  }
});

export const deleteTicket = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('tickets/deleteTicket', async (id, { rejectWithValue }) => {
  try {
    await ticketsApi.deleteTicket(id);
    return id;
  } catch (err) {
    return rejectWithValue(
      extractErrorMessage(err, 'Failed to delete ticket.'),
    );
  }
});

export const fetchTicketStats = createAsyncThunk<
  TicketStats,
  void,
  { rejectValue: string }
>('tickets/fetchTicketStats', async (_, { rejectWithValue }) => {
  try {
    return await ticketsApi.getStats();
  } catch (err) {
    return rejectWithValue(
      extractErrorMessage(err, 'Failed to fetch ticket stats.'),
    );
  }
});
