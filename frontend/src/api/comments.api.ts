import { apiClient } from './axios';
import { ENDPOINTS } from './endpoints';
import type {
  Comment,
  CreateCommentPayload,
  DeleteCommentResponse,
  UpdateCommentPayload,
} from '../types/comment';

export const commentsApi = {
  getComments: async (ticketId: string): Promise<Comment[]> => {
    const response = await apiClient.get<Comment[]>(
      ENDPOINTS.COMMENTS.BY_TICKET(ticketId),
    );
    return response.data;
  },

  createComment: async (
    ticketId: string,
    payload: CreateCommentPayload,
  ): Promise<Comment> => {
    const response = await apiClient.post<Comment>(
      ENDPOINTS.COMMENTS.BY_TICKET(ticketId),
      payload,
    );
    return response.data;
  },

  updateComment: async (
    ticketId: string,
    commentId: string,
    payload: UpdateCommentPayload,
  ): Promise<Comment> => {
    const response = await apiClient.patch<Comment>(
      ENDPOINTS.COMMENTS.BY_ID(ticketId, commentId),
      payload,
    );
    return response.data;
  },

  deleteComment: async (
    ticketId: string,
    commentId: string,
  ): Promise<DeleteCommentResponse> => {
    const response = await apiClient.delete<DeleteCommentResponse>(
      ENDPOINTS.COMMENTS.BY_ID(ticketId, commentId),
    );
    return response.data;
  },
};
