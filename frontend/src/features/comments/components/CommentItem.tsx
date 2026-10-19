import React, { useState } from 'react';
import {
  Clock,
  Pencil,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Alert, Badge, Button, Textarea } from '../../../components/common';
import type { Comment } from '../../../types/comment';
import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../redux/store';
import {
  updateComment,
  deleteComment,
} from '../../../redux/comments/commentsThunk';

export interface CommentItemProps {
  comment: Comment;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  const isCurrentUser = user?.id === comment.author.id;
  const isAdmin = comment.author.role === 'ADMIN';
  const canModify = isCurrentUser;

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formattedDate = new Date(comment.createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isEdited =
    new Date(comment.updatedAt).getTime() -
    new Date(comment.createdAt).getTime() >
    2000;

  const handleStartEdit = () => {
    setEditContent(comment.content);
    setIsEditing(true);
    setShowDeleteConfirm(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed) {
      toast.error('Comment content cannot be empty');
      return;
    }
    if (trimmed === comment.content.trim()) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await dispatch(
        updateComment({
          ticketId: comment.ticketId,
          commentId: comment.id,
          payload: { content: trimmed },
        }),
      ).unwrap();
      toast.success('Comment updated');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err || 'Failed to update comment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(
        deleteComment({
          ticketId: comment.ticketId,
          commentId: comment.id,
        }),
      ).unwrap();
      toast.success('Comment deleted');
    } catch (err: any) {
      toast.error(err || 'Failed to delete comment');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <div
      className={`group relative flex gap-3 p-3 rounded-xl transition-all ${isCurrentUser
          ? 'bg-blue-50/50 border border-blue-100 hover:border-blue-200'
          : 'bg-white border border-slate-200 hover:border-slate-300'
        } shadow-2xs`}
    >
   
      <div className="shrink-0">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs ring-1.5 ${isAdmin
              ? 'bg-purple-100 text-purple-700 ring-purple-200'
              : 'bg-emerald-100 text-emerald-700 ring-emerald-200'
            }`}
        >
          {comment.author.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>


      <div className="flex-1 min-w-0 space-y-1 text-left">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">
              {comment.author.name}
            </span>

        
            <Badge role={comment.author.role} size="sm">
              {isAdmin ? 'Admin' : 'Agent'}
            </Badge>

            {isCurrentUser && (
              <span className="text-[10px] font-medium text-brand-600 bg-brand-50 px-1.5 py-0.2 rounded-sm">
                You
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="h-3 w-3" />
              <span>{formattedDate}</span>
              {isEdited && (
                <span className="italic text-[10px] text-slate-400 font-normal">
                  (edited)
                </span>
              )}
            </div>

          
            {canModify && !isEditing && !showDeleteConfirm && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleStartEdit}
                  className="p-1 h-auto rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100"
                  title="Edit comment"
                  aria-label="Edit comment"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1 h-auto rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                  title="Delete comment"
                  aria-label="Delete comment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>

     
        {showDeleteConfirm && (
          <Alert
            variant="error"
            className="my-2 p-3 text-xs"
            action={
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  isLoading={isDeleting}
                  disabled={isDeleting}
                  leftIcon={<Trash2 className="h-3 w-3" />}
                >
                  Delete
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>
            }
          >
            <span className="font-medium text-rose-700">Delete this comment permanently?</span>
          </Alert>
        )}

      
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              rows={3}
              className="w-full rounded-xl border border-brand-300 bg-white p-2.5 text-sm text-slate-900 shadow-inner focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none transition-all"
              placeholder="Edit your comment..."
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Press <kbd className="font-semibold text-slate-500">Ctrl+Enter</kbd> to save, <kbd className="font-semibold text-slate-500">Esc</kbd> to cancel
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  leftIcon={<X className="h-3 w-3" />}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={handleSaveEdit}
                  isLoading={isSaving}
                  disabled={isSaving || !editContent.trim()}
                  leftIcon={<Check className="h-3 w-3" />}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed break-words">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
