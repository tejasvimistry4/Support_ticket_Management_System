import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '../Button';

export interface BreadcrumbItem {
  label: React.ReactNode;
  to?: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isCurrent?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export interface BreadcrumbItemProps extends BreadcrumbItem {
  children?: React.ReactNode;
}

export const BreadcrumbItemComponent: React.FC<BreadcrumbItemProps> = ({
  label,
  children,
  to,
  href,
  icon: Icon,
  isCurrent = false,
  className = '',
  onClick,
}) => {
  const content = (
    <span className="inline-flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
      <span>{label || children}</span>
    </span>
  );

  if (isCurrent) {
    return (
      <span
        aria-current="page"
        className={`font-semibold text-slate-800 ${className}`}
      >
        {content}
      </span>
    );
  }

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`hover:text-brand-600 transition-colors text-slate-500 hover:underline ${className}`}
      >
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={`hover:text-brand-600 transition-colors text-slate-500 hover:underline ${className}`}
      >
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <Button
        type="button"
        variant="unstyled"
        onClick={onClick}
        className={`hover:text-brand-600 transition-colors text-slate-500 hover:underline cursor-pointer ${className}`}
      >
        {content}
      </Button>
    );
  }

  return <span className={`text-slate-500 ${className}`}>{content}</span>;
};


export interface BreadcrumbSeparatorProps {
  children?: React.ReactNode;
  className?: string;
}

export const BreadcrumbSeparator: React.FC<BreadcrumbSeparatorProps> = ({
  children,
  className = '',
}) => (
  <li
    aria-hidden="true"
    className={`inline-flex items-center text-slate-300 select-none ${className}`}
  >
    {children || <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
  </li>
);

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  children?: React.ReactNode;
  separator?: React.ReactNode;
  className?: string;
  homeItem?: BreadcrumbItem;
}

export const BreadcrumbsRoot: React.FC<BreadcrumbsProps> = ({
  items,
  children,
  separator,
  className = '',
  homeItem,
}) => {
  if (items && items.length > 0) {
    const allItems = homeItem ? [homeItem, ...items] : items;

    return (
      <nav aria-label="Breadcrumb" className={`text-xs ${className}`}>
        <ol className="flex flex-wrap items-center gap-1.5 font-medium text-slate-500">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            const isItemCurrent = item.isCurrent !== undefined ? item.isCurrent : isLast;

            return (
              <React.Fragment key={index}>
                <li className="inline-flex items-center">
                  <BreadcrumbItemComponent
                    {...item}
                    isCurrent={isItemCurrent}
                  />
                </li>
                {!isLast && (
                  <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className={`text-xs ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5 font-medium text-slate-500">
        {children}
      </ol>
    </nav>
  );
};

export const Breadcrumbs = Object.assign(BreadcrumbsRoot, {
  Item: BreadcrumbItemComponent,
  Separator: BreadcrumbSeparator,
});

export default Breadcrumbs;
