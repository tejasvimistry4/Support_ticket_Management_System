import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  leftIcon?: React.ReactNode;
  size?: 'sm' | 'md';
  variant?: 'default' | 'unstyled';
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      leftIcon,
      size = 'md',
      variant = 'default',
      containerClassName = '',
      id,
      className = '',
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const selectId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs pr-8',
      md: 'px-3.5 py-2.5 text-sm pr-10',
    };

    const iconSizes = {
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
    };

    if (variant === 'unstyled') {
      return (
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={className}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
      );
    }

    return (
      <div className={`w-full space-y-1.5 text-left ${containerClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            {label}
          </label>
        )}

        <div className="relative rounded-xl shadow-sm">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {leftIcon}
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`w-full appearance-none rounded-xl border bg-white text-slate-900 transition-all duration-200 outline-none
              ${leftIcon ? (size === 'sm' ? 'pl-8' : 'pl-10') : ''}
              ${sizeStyles[size]}
              ${
                error
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                  : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
              }
              ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}
              ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
            <svg
              className={iconSizes[size]}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {error ? (
          <p className="text-xs text-rose-600 animate-fadeIn font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
