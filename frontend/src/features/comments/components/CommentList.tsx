import React, { useEffect, useRef } from 'react';
import { MessageSquare, Wifi, WifiOff } from 'lucide-react';
import type { Comment, TypingUser } from '../../../types/comment';
import { CommentItem } from './CommentItem';

export interface CommentListProps {
  comments: Comment[];
  typingUsers?: TypingUser[];
  isConnected?: boolean;
  isLoading?: boolean;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  typingUsers = [],
  isConnected = false,
  isLoading = false,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (comments.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length]);

  return (
    <div className="space-y-2.5">
      {comments.length === 0 && !isLoading ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center">
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400 mb-2">
            <MessageSquare className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold text-slate-700">No comments logged yet</p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5">
            Start the internal discussion or add ticket updates below.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[175px] overflow-y-auto pr-2 custom-scrollbar overscroll-contain">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-500 italic animate-fadeIn py-1">
          <div className="flex space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce" />
            <span
              className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce"
              style={{ animationDelay: '0.15s' }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce"
              style={{ animationDelay: '0.3s' }}
            />
          </div>
          <span>
            {typingUsers.map((u) => u.name).join(', ')}{' '}
            {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </span>
        </div>
      )}
    </div>
  );
};
export default CommentList;
