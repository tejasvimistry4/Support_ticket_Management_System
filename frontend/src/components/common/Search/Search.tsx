import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { Button } from '../Button';
import { useDebounce } from '../../../hooks/useDebounce';

export type SearchSize = 'sm' | 'md' | 'lg';
export type SearchVariant = 'default' | 'filled' | 'minimal';

export interface SearchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onDebouncedChange?: (debouncedValue: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  size?: SearchSize;
  variant?: SearchVariant;
  showClear?: boolean;
  isLoading?: boolean;
  containerClassName?: string;
}

export const Search: React.FC<SearchProps> = ({
  value: controlledValue,
  defaultValue = '',
  onChange,
  onDebouncedChange,
  onSearch,
  onClear,
  debounceMs = 300,
  size = 'md',
  variant = 'default',
  showClear = true,
  isLoading = false,
  placeholder = 'Search...',
  disabled = false,
  className = '',
  containerClassName = '',
  onKeyDown,
  ...props
}) => {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentValue = isControlled ? controlledValue : internalValue;
  const debouncedValue = useDebounce(currentValue, debounceMs);

  useEffect(() => {
    if (isControlled) {
      setInternalValue(controlledValue);
    }
  }, [isControlled, controlledValue]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (onDebouncedChange) {
      onDebouncedChange(debouncedValue);
    }
  }, [debouncedValue, onDebouncedChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    if (!isControlled) {
      setInternalValue(newVal);
    }
    onChange?.(newVal);
  };

  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue('');
    }
    onChange?.('');
    onClear?.();
    inputRef.current?.focus();
  }, [isControlled, onChange, onClear]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && currentValue) {
      e.preventDefault();
      handleClear();
    } else if (e.key === 'Enter') {
      onSearch?.(currentValue);
    }
    onKeyDown?.(e);
  };

  const sizeStyles: Record<
    SearchSize,
    { height: string; text: string; iconSize: string; iconLeft: string; clearRight: string; padding: string }
  > = {
    sm: {
      height: 'h-8',
      text: 'text-xs',
      iconSize: 'h-3.5 w-3.5',
      iconLeft: 'left-2.5',
      clearRight: 'right-2',
      padding: 'pl-8 pr-7',
    },
    md: {
      height: 'h-9',
      text: 'text-xs sm:text-sm',
      iconSize: 'h-4 w-4',
      iconLeft: 'left-3',
      clearRight: 'right-2.5',
      padding: 'pl-9 pr-8',
    },
    lg: {
      height: 'h-11',
      text: 'text-sm sm:text-base',
      iconSize: 'h-4.5 w-4.5',
      iconLeft: 'left-3.5',
      clearRight: 'right-3',
      padding: 'pl-11 pr-9',
    },
  };

  const variantStyles: Record<SearchVariant, string> = {
    default:
      'border border-slate-200/90 bg-white shadow-xs focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
    filled:
      'border border-transparent bg-slate-100 hover:bg-slate-100/80 focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
    minimal:
      'border-b border-slate-200 bg-transparent rounded-none focus:border-brand-500 focus:ring-0',
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  return (
    <div
      className={`relative inline-flex items-center w-full ${containerClassName}`}
    >
      <div
        className={`pointer-events-none absolute ${currentSize.iconLeft} top-1/2 -translate-y-1/2 flex items-center text-slate-400`}
      >
        {isLoading ? (
          <Loader2 className={`animate-spin ${currentSize.iconSize} text-brand-600`} />
        ) : (
          <SearchIcon className={currentSize.iconSize} />
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={props['aria-label'] || placeholder}
        className={`w-full rounded-xl text-slate-900 placeholder-slate-400 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${currentSize.height} ${currentSize.text} ${currentSize.padding} ${currentVariant} ${className}`}
        {...props}
      />

      {showClear && currentValue && !disabled && (
        <Button
          type="button"
          variant="unstyled"
          onClick={handleClear}
          aria-label="Clear search query"
          className={`absolute ${currentSize.clearRight} top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer focus:outline-none`}
        >
          <X className={currentSize.iconSize} />
        </Button>
      )}
    </div>
  );
};

export default Search;
