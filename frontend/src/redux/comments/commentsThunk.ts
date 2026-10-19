import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { commentsApi } from '../../api/comments.api';
import type {
  Comment,
  CreateCommentPayload,
  UpdateCommentPayload,
} from '../../types/comment';

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

export const fetchComments = createAsyncThunk<
  { ticketId: string; comments: Comment[] },
  string,
  { rejectValue: string }
>('comments/fetchComments', async (ticketId, { rejectWithValue }) => {
  try {
    const comments = await commentsApi.getComments(ticketId);
    return { ticketId, comments };
  } catch (err) {
    return rejectWithValue(
      extractErrorMessage(err, 'Failed to load comments for this ticket.'),
    );
  }
});

export const addComment = createAsyncThunk<
  Comment,
  { ticketId: string; payload: CreateCommentPayload },
  { rejectValue: string }
>('comments/addComment', async ({ ticketId, payload }, { rejectWithValue }) => {
  try {
    return await commentsApi.createComment(ticketId, payload);
  } catch (err) {
    return rejectWithValue(
      extractErrorMessage(err, 'Failed to post comment. Check permissions.'),
    );
  }
});

export const updateComment = createAsyncThunk<
  Comment,
  { ticketId: string; commentId: string; payload: UpdateCommentPayload },
  { rejectValue: string }
>(
  'comments/updateComment',
  async ({ ticketId, commentId, payload }, { rejectWithValue }) => {
    try {
      return await commentsApi.updateComment(ticketId, commentId, payload);
    } catch (err) {
      return rejectWithValue(
        extractErrorMessage(err, 'Failed to update comment. Check permissions.'),
      );
    }
  },
);

export const deleteComment = createAsyncThunk<
  { ticketId: string; commentId: string },
  { ticketId: string; commentId: string },
  { rejectValue: string }
>(
  'comments/deleteComment',
  async ({ ticketId, commentId }, { rejectWithValue }) => {
    try {
      await commentsApi.deleteComment(ticketId, commentId);
      return { ticketId, commentId };
    } catch (err) {
      return rejectWithValue(
        extractErrorMessage(err, 'Failed to delete comment. Check permissions.'),
      );
    }
  },
);
