import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  Comment,
  CommentsState,
  TypingUser,
} from '../../types/comment';
import {
  addComment,
  deleteComment,
  fetchComments,
  updateComment,
} from './commentsThunk';

const initialState: CommentsState = {
  commentsByTicket: {},
  isLoading: false,
  isSubmitting: false,
  error: null,
  typingUsersByTicket: {},
};

export const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    commentReceived: (state, action: PayloadAction<Comment>) => {
      const { ticketId } = action.payload;
      if (!state.commentsByTicket[ticketId]) {
        state.commentsByTicket[ticketId] = [];
      }
      const exists = state.commentsByTicket[ticketId].some(
        (c) => c.id === action.payload.id,
      );
      if (!exists) {
        state.commentsByTicket[ticketId].push(action.payload);
      }
    },
    commentUpdated: (state, action: PayloadAction<Comment>) => {
      const { ticketId, id } = action.payload;
      if (state.commentsByTicket[ticketId]) {
        const index = state.commentsByTicket[ticketId].findIndex(
          (c) => c.id === id,
        );
        if (index !== -1) {
          state.commentsByTicket[ticketId][index] = action.payload;
        }
      }
    },
    commentDeleted: (
      state,
      action: PayloadAction<{ ticketId: string; commentId: string }>,
    ) => {
      const { ticketId, commentId } = action.payload;
      if (state.commentsByTicket[ticketId]) {
        state.commentsByTicket[ticketId] = state.commentsByTicket[
          ticketId
        ].filter((c) => c.id !== commentId);
      }
    },
    setTypingStatus: (
      state,
      action: PayloadAction<{
        ticketId: string;
        user: TypingUser;
        isTyping: boolean;
      }>,
    ) => {
      const { ticketId, user, isTyping } = action.payload;
      if (!state.typingUsersByTicket[ticketId]) {
        state.typingUsersByTicket[ticketId] = [];
      }

      if (isTyping) {
        const alreadyTyping = state.typingUsersByTicket[ticketId].some(
          (u) => u.id === user.id,
        );
        if (!alreadyTyping) {
          state.typingUsersByTicket[ticketId].push(user);
        }
      } else {
        state.typingUsersByTicket[ticketId] = state.typingUsersByTicket[
          ticketId
        ].filter((u) => u.id !== user.id);
      }
    },
    clearCommentsForTicket: (state, action: PayloadAction<string>) => {
      delete state.commentsByTicket[action.payload];
      delete state.typingUsersByTicket[action.payload];
    },
    clearCommentsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.commentsByTicket[action.payload.ticketId] =
          action.payload.comments;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch comments';
      });

    builder
      .addCase(addComment.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const { ticketId } = action.payload;
        if (!state.commentsByTicket[ticketId]) {
          state.commentsByTicket[ticketId] = [];
        }
        const exists = state.commentsByTicket[ticketId].some(
          (c) => c.id === action.payload.id,
        );
        if (!exists) {
          state.commentsByTicket[ticketId].push(action.payload);
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || 'Failed to post comment';
      });

    builder
      .addCase(updateComment.fulfilled, (state, action) => {
        const { ticketId, id } = action.payload;
        if (state.commentsByTicket[ticketId]) {
          const index = state.commentsByTicket[ticketId].findIndex(
            (c) => c.id === id,
          );
          if (index !== -1) {
            state.commentsByTicket[ticketId][index] = action.payload;
          }
        }
      });

    builder
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { ticketId, commentId } = action.payload;
        if (state.commentsByTicket[ticketId]) {
          state.commentsByTicket[ticketId] = state.commentsByTicket[
            ticketId
          ].filter((c) => c.id !== commentId);
        }
      });
  },
});

export const {
  commentReceived,
  commentUpdated,
  commentDeleted,
  setTypingStatus,
  clearCommentsForTicket,
  clearCommentsError,
} = commentsSlice.actions;

export default commentsSlice.reducer;
