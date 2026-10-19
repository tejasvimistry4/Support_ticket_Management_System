import type { Role } from './auth';

export interface CommentAuthor {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Comment {
  id: string;
  content: string;
  ticketId: string;
  authorId: string;
  author: CommentAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentPayload {
  content: string;
}

export interface UpdateCommentPayload {
  content: string;
}

export interface DeleteCommentResponse {
  success: boolean;
  message: string;
  commentId: string;
}

export interface TypingUser {
  id: string;
  name: string;
  role: Role;
}

export interface CommentsState {
  commentsByTicket: Record<string, Comment[]>;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  typingUsersByTicket: Record<string, TypingUser[]>;
}
