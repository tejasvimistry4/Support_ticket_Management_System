import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from '../Button';

export interface AlertProps {
  variant?: 'error' | 'warning' | 'info' | 'success' | 'neutral';
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  action,
  onClose,
  className = '',
}) => {
  const variantStyles = {
    error: 'border-rose-200 bg-rose-50 text-rose-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    neutral: 'border-slate-200 bg-slate-50/80 text-slate-700',
  };

  const defaultIcons = {
    error: <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />,
    info: <Info className="h-4 w-4 text-blue-600 shrink-0" />,
    success: <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />,
    neutral: <Info className="h-4 w-4 text-slate-500 shrink-0" />,
  };

  const resolvedIcon = icon !== undefined ? icon : defaultIcons[variant];

  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border text-xs sm:text-sm animate-fadeIn ${variantStyles[variant]} ${className}`}
    >
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        {resolvedIcon && <div className="mt-0.5">{resolvedIcon}</div>}
        <div className="flex-1 min-w-0">
          {title && <h5 className="font-semibold mb-0.5 leading-snug">{title}</h5>}
          <div className="leading-relaxed break-words">{children}</div>
        </div>
      </div>

      {(action || onClose) && (
        <div className="flex items-center gap-2 shrink-0 self-center">
          {action}
          {onClose && (
            <Button
              type="button"
              variant="unstyled"
              onClick={onClose}
              className="p-1 rounded-md hover:bg-black/5 transition text-current opacity-70 hover:opacity-100 cursor-pointer"
              aria-label="Close alert"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Alert;
