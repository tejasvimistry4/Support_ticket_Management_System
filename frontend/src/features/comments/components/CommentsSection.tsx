import React, { useEffect, useCallback, useState } from 'react';
import { MessageSquare, MessageCircle, Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import {
  addComment,
  fetchComments,
} from '../../../redux/comments/commentsThunk';
import {
  selectCommentsByTicket,
  selectCommentsLoading,
  selectCommentSubmitting,
  selectTypingUsers,
} from '../../../redux/comments/selectors';
import { useTicketCommentsSocket } from '../../../hooks';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';
import { Button } from '../../../components/common';

export interface CommentsSectionProps {
  ticketId: string;
}
export const CommentsSection: React.FC<CommentsSectionProps> = ({
  ticketId,
}) => {
  const dispatch = useAppDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { isConnected, emitTyping, sendCommentViaSocket } =
    useTicketCommentsSocket(ticketId);

  const comments = useAppSelector(selectCommentsByTicket(ticketId));
  const isLoading = useAppSelector(selectCommentsLoading);
  const isSubmitting = useAppSelector(selectCommentSubmitting);
  const typingUsers = useAppSelector(selectTypingUsers(ticketId));

  useEffect(() => {
    if (ticketId) {
      dispatch(fetchComments(ticketId));
    }
  }, [ticketId, dispatch]);

  const handleRefreshComments = useCallback(async () => {
    if (!ticketId) return;
    setIsRefreshing(true);
    try {
      await dispatch(fetchComments(ticketId)).unwrap();
      toast.success('Comments refreshed');
    } catch {
      toast.error('Failed to refresh comments');
    } finally {
      setIsRefreshing(false);
    }
  }, [ticketId, dispatch]);

  const handleSubmit = useCallback(
    async (content: string) => {
      try {
        await dispatch(
          addComment({
            ticketId,
            payload: { content },
          }),
        ).unwrap();
        toast.success('Comment added');
      } catch (err: any) {
        toast.error(err || 'Failed to post comment');
      }
    },
    [ticketId, dispatch],
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4 text-left">

      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <MessageSquare className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Ticket Discussion & Notes
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 text-[10px] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefreshComments}
            disabled={isRefreshing || isLoading}
            isLoading={isRefreshing || isLoading}
            className="px-2 py-0.5 text-[11px]"
            leftIcon={
              <RefreshCw
                className={`h-2.5 w-2.5 text-slate-500 ${
                  isRefreshing || isLoading ? 'animate-spin text-brand-600' : ''
                }`}
              />
            }
          >
            Refresh
          </Button>

          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {comments.length}
          </span>
        </div>
      </div>

      <CommentList
        comments={comments}
        typingUsers={typingUsers}
        isConnected={isConnected}
        isLoading={isLoading}
      />

      <div className="pt-2 border-t border-slate-100">
        <CommentForm
          onSubmit={handleSubmit}
          onTyping={emitTyping}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default CommentsSection;
