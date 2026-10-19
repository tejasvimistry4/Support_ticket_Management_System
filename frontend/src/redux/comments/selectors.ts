import type { RootState } from '../store';
import type { Comment, TypingUser } from '../../types/comment';

const emptyComments: Comment[] = [];
const emptyTypingUsers: TypingUser[] = [];

export const selectCommentsByTicket =
  (ticketId: string) => (state: RootState): Comment[] =>
    state.comments.commentsByTicket[ticketId] || emptyComments;

export const selectCommentsLoading = (state: RootState): boolean =>
  state.comments.isLoading;

export const selectCommentSubmitting = (state: RootState): boolean =>
  state.comments.isSubmitting;

export const selectCommentsError = (state: RootState): string | null =>
  state.comments.error;

export const selectTypingUsers =
  (ticketId: string) => (state: RootState): TypingUser[] =>
    state.comments.typingUsersByTicket[ticketId] || emptyTypingUsers;
