import { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../redux/store';
import {
  commentDeleted,
  commentReceived,
  commentUpdated,
  setTypingStatus,
} from '../redux/comments/commentsSlice';
import {
  getCommentsSocket,
} from '../services/socket.service';
import type { Comment, TypingUser } from '../types/comment';

export interface UseTicketCommentsSocketReturn {
  isConnected: boolean;
  isJoined: boolean;
  connectionError: string | null;
  emitTyping: (isTyping: boolean) => void;
  sendCommentViaSocket: (content: string) => Promise<Comment>;
}

export const useTicketCommentsSocket = (
  ticketId: string,
): UseTicketCommentsSocketReturn => {
  const dispatch = useAppDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingStateRef = useRef<boolean>(false);

  useEffect(() => {
    if (!ticketId) return;

    const socket = getCommentsSocket();

    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
      socket.emit('join_ticket', { ticketId });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setIsJoined(false);
    };

    const handleConnectError = (err: any) => {
      setIsConnected(false);
      setIsJoined(false);
      setConnectionError(err?.message || 'Connection failed');
    };

    const handleJoinedTicket = (data: { ticketId: string; success: boolean }) => {
      if (data.ticketId === ticketId && data.success) {
        setIsJoined(true);
      }
    };

    const handleNewComment = (comment: Comment) => {
      if (comment.ticketId === ticketId) {
        dispatch(commentReceived(comment));
      }
    };

    const handleUpdatedComment = (comment: Comment) => {
      if (comment.ticketId === ticketId) {
        dispatch(commentUpdated(comment));
      }
    };

    const handleDeletedComment = (data: {
      ticketId: string;
      commentId: string;
    }) => {
      if (data.ticketId === ticketId) {
        dispatch(commentDeleted(data));
      }
    };

    const handleUserTyping = (data: {
      ticketId: string;
      user: TypingUser;
      isTyping: boolean;
    }) => {
      if (data.ticketId === ticketId) {
        dispatch(
          setTypingStatus({
            ticketId,
            user: data.user,
            isTyping: data.isTyping,
          }),
        );
      }
    };

    const handleError = (data: { message: string }) => {
      setConnectionError(data?.message || 'Socket error');
      if (data?.message?.includes('denied')) {
        toast.error(data.message);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('joined_ticket', handleJoinedTicket);
    socket.on('new_comment', handleNewComment);
    socket.on('comment_updated', handleUpdatedComment);
    socket.on('comment_deleted', handleDeletedComment);
    socket.on('user_typing', handleUserTyping);
    socket.on('error', handleError);

    if (socket.connected) {
      setIsConnected(true);
      socket.emit('join_ticket', { ticketId });
    }

    return () => {
      if (socket.connected) {
        socket.emit('leave_ticket', { ticketId });
      }
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('joined_ticket', handleJoinedTicket);
      socket.off('new_comment', handleNewComment);
      socket.off('comment_updated', handleUpdatedComment);
      socket.off('comment_deleted', handleDeletedComment);
      socket.off('user_typing', handleUserTyping);
      socket.off('error', handleError);
    };
  }, [ticketId, dispatch]);

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      const socket = getCommentsSocket();
      if (!socket.connected || !ticketId) return;

      if (lastTypingStateRef.current === isTyping) return;
      lastTypingStateRef.current = isTyping;

      socket.emit('typing', { ticketId, isTyping });

      if (isTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          lastTypingStateRef.current = false;
          socket.emit('typing', { ticketId, isTyping: false });
        }, 3000);
      }
    },
    [ticketId],
  );

  const sendCommentViaSocket = useCallback(
    (content: string): Promise<Comment> => {
      return new Promise((resolve, reject) => {
        const socket = getCommentsSocket();
        if (!socket.connected) {
          reject(new Error('Socket is not connected'));
          return;
        }

        socket.emit(
          'send_comment',
          { ticketId, content },
          (response: { success: boolean; data?: Comment; error?: string }) => {
            if (response?.success && response.data) {
              resolve(response.data);
            } else {
              reject(new Error(response?.error || 'Failed to send comment'));
            }
          },
        );
      });
    },
    [ticketId],
  );

  return {
    isConnected,
    isJoined,
    connectionError,
    emitTyping,
    sendCommentViaSocket,
  };
};

export default useTicketCommentsSocket;
