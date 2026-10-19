import React, { useState, useRef } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';
import { Button, Textarea } from '../../../components/common';

export interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  onTyping,
  isSubmitting = false,
  disabled = false,
}) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (onTyping) {
      onTyping(e.target.value.trim().length > 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting || disabled) return;

    const trimmed = content.trim();
    await onSubmit(trimmed);
    setContent('');
    if (onTyping) {
      onTyping(false);
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs transition-all focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
        <Textarea
          ref={textareaRef}
          rows={2}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSubmitting}
          placeholder="Leave an internal comment or status note... (Ctrl + Enter to send)"
          maxLength={3000}
          className="w-full resize-none border-none bg-transparent p-1 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none leading-normal"
        />

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-slate-400">
              <CornerDownLeft className="h-2.5 w-2.5" />
              Ctrl + Enter to send
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-mono">
              {content.length}/3000
            </span>

            <Button
              type="submit"
              size="sm"
              disabled={!content.trim() || disabled || isSubmitting}
              isLoading={isSubmitting}
              leftIcon={<Send className="h-3 w-3" />}
              className="rounded-lg px-2.5 py-1 text-xs"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
