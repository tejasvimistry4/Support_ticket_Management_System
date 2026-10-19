import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../Button';

export type DropdownAlign = 'left' | 'right';

export interface DropdownItemProps {
  children?: React.ReactNode;
  label?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  danger?: boolean;
  variant?: 'default' | 'danger' | 'brand';
  className?: string;
}

export interface DropdownHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface DropdownDividerProps {
  className?: string;
}

export interface DropdownProps {
  trigger: React.ReactNode | ((props: { isOpen: boolean; toggle: () => void }) => React.ReactNode);
  children?: React.ReactNode;
  align?: DropdownAlign;
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnItemClick?: boolean;
}

export const DropdownHeader: React.FC<DropdownHeaderProps> = ({
  children,
  className = '',
}) => (
  <div
    className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 ${className}`}
  >
    {children}
  </div>
);

export const DropdownDivider: React.FC<DropdownDividerProps> = ({
  className = '',
}) => <div className={`my-1 border-t border-slate-100 ${className}`} />;

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  label,
  icon: Icon,
  onClick,
  disabled = false,
  danger = false,
  variant = 'default',
  className = '',
}) => {
  const isDanger = danger || variant === 'danger';
  const isBrand = variant === 'brand';

  let colorClasses = 'text-slate-700 hover:bg-slate-50 hover:text-slate-900';
  if (isDanger) {
    colorClasses = 'text-rose-600 hover:bg-rose-50 hover:text-rose-700';
  } else if (isBrand) {
    colorClasses = 'text-brand-700 hover:bg-brand-50 hover:text-brand-800';
  }

  return (
    <Button
      type="button"
      variant="unstyled"
      role="menuitem"
      disabled={disabled}
      onClick={(e) => {
        if (!disabled && onClick) {
          onClick(e);
        }
      }}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left transition-colors rounded-lg ${disabled ? 'opacity-40 cursor-not-allowed text-slate-400' : 'cursor-pointer'
        } ${colorClasses} ${className}`}
    >
      {Icon && (
        <Icon
          className={`h-4 w-4 shrink-0 ${isDanger ? 'text-rose-500' : isBrand ? 'text-brand-600' : 'text-slate-400'
            }`}
        />
      )}
      <span className="flex-1 truncate">{label || children}</span>
    </Button>
  );
};

export const DropdownMenu: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`p-1 space-y-0.5 ${className}`}>{children}</div>
);

export const DropdownRoot: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'left',
  className = '',
  menuClassName = '',
  disabled = false,
  isOpen: controlledIsOpen,
  onOpenChange,
  closeOnItemClick = true,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const setIsOpen = useCallback(
    (newVal: boolean) => {
      if (!isControlled) {
        setInternalIsOpen(newVal);
      }
      onOpenChange?.(newVal);
    },
    [isControlled, onOpenChange]
  );

  const toggle = useCallback(() => {
    if (disabled) return;
    setIsOpen(!isOpen);
  }, [disabled, isOpen, setIsOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, setIsOpen]);

  const handleMenuClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (closeOnItemClick && target.closest('button, a')) {
      setIsOpen(false);
    }
  };

  const alignStyles = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className}`}
    >
      <div
        onClick={toggle}
        className={disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
      >
        {typeof trigger === 'function' ? trigger({ isOpen, toggle }) : trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          onClick={handleMenuClick}
          className={`absolute mt-1.5 z-50 min-w-[180px] rounded-xl border border-slate-200/90 bg-white p-1 shadow-lg shadow-slate-200/50 focus:outline-none transition-all ${alignStyles[align]
            } ${menuClassName}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const Dropdown = Object.assign(DropdownRoot, {
  Item: DropdownItem,
  Header: DropdownHeader,
  Divider: DropdownDivider,
  Menu: DropdownMenu,
});

export default Dropdown;
