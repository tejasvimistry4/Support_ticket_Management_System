import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  Inbox,
  Plus,
  Users,
  ShieldCheck,
  Headphones,
} from 'lucide-react';
import { Button } from '../Button/Button';
import { TicketStatusBadge, TicketPriorityBadge } from '../Badge/Badge';
import { Search as SearchInput } from '../Search/Search';
import { useDebounce } from '../../../hooks/useDebounce';
import { usePagination } from '../../../hooks/usePagination';
import { formatDate, formatTicketId, getInitials } from '../../../utils';
import { ROUTES } from '../../../routes/RouteConstants';
import type { Ticket, TicketStatus } from '../../../types/ticket';
import type { User } from '../../../types/auth';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children?: React.ReactNode;
  containerClassName?: string;
  striped?: boolean;
  hoverable?: boolean;
}

export const TableHeader: React.FC<
  React.HTMLAttributes<HTMLTableSectionElement>
> = ({ children, className = '', ...props }) => (
  <thead
    className={`border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${className}`}
    {...props}
  >
    {children}
  </thead>
);

export const TableBody: React.FC<
  React.HTMLAttributes<HTMLTableSectionElement>
> = ({ children, className = '', ...props }) => (
  <tbody className={`divide-y divide-slate-100 ${className}`} {...props}>
    {children}
  </tbody>
);

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  clickable?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  className = '',
  clickable,
  onClick,
  ...props
}) => {
  const isClickable = clickable || !!onClick;
  return (
    <tr
      onClick={onClick}
      className={`transition-colors ${isClickable ? 'cursor-pointer hover:bg-slate-50/70' : 'hover:bg-slate-50/50'
        } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<
  React.ThHTMLAttributes<HTMLTableCellElement>
> = ({ children, className = '', ...props }) => (
  <th scope="col" className={`px-6 py-3.5 ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<
  React.TdHTMLAttributes<HTMLTableCellElement>
> = ({ children, className = '', ...props }) => (
  <td className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </td>
);

export interface TableEmptyProps {
  colSpan?: number;
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}

export const TableEmpty: React.FC<TableEmptyProps> = ({
  colSpan = 6,
  title = 'No records found',
  description,
  icon: Icon = Inbox,
  action,
  className = '',
}) => (
  <tr>
    <td colSpan={colSpan} className={`px-6 py-12 text-center ${className}`}>
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-3">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-bold text-slate-800">{title}</p>
      {description && (
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </td>
  </tr>
);

export interface TableSkeletonProps {
  rows?: number;
  colSpan?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 3,
  colSpan = 5,
  className = '',
}) => (
  <>
    {Array.from({ length: rows }).map((_, idx) => (
      <tr key={idx} className={`animate-pulse ${className}`}>
        <td colSpan={colSpan} className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-1/3 rounded bg-slate-200" />
              <div className="h-2.5 w-1/4 rounded bg-slate-100" />
            </div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

export const TableRoot: React.FC<TableProps> = ({
  children,
  className = '',
  containerClassName = '',
  striped = false,
  hoverable = true,
  ...props
}) => {
  return (
    <div
      className={`overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs text-left ${containerClassName}`}
    >
      <table
        className={`w-full text-left text-sm text-slate-700 ${striped ? '[&_tbody_tr:nth-child(even)]:bg-slate-50/40' : ''
          } ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export interface RecentTicketsTableProps {
  tickets: Ticket[];
  isLoading: boolean;
  isAdmin: boolean;
  onOpenCreateModal?: () => void;
}

export const RecentTicketsTable: React.FC<RecentTicketsTableProps> = ({
  tickets,
  isLoading,
  isAdmin,
  onOpenCreateModal,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ALL' | TicketStatus>('ALL');

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === 'ALL') return true;
    return t.status === activeTab;
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs text-left">
      <div className="flex flex-col gap-3.5 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-500/20">
            <Layers className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Recent Tickets
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {tickets.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAdmin
                ? 'Latest support requests logged into the operations queue'
                : 'Recent tickets currently assigned to your queue'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <div className="inline-flex rounded-xl bg-slate-100/90 p-1 text-xs font-medium text-slate-600">
            <Button
              type="button"
              variant="unstyled"
              onClick={() => setActiveTab('ALL')}
              className={`rounded-lg px-2.5 py-1 text-[11px] transition cursor-pointer ${activeTab === 'ALL'
                  ? 'bg-white font-semibold text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
                }`}
            >
              All
            </Button>
            <Button
              type="button"
              variant="unstyled"
              onClick={() => setActiveTab('OPEN')}
              className={`rounded-lg px-2.5 py-1 text-[11px] transition cursor-pointer ${activeTab === 'OPEN'
                  ? 'bg-white font-semibold text-brand-700 shadow-xs'
                  : 'hover:text-slate-900'
                }`}
            >
              Open
            </Button>
            <Button
              type="button"
              variant="unstyled"
              onClick={() => setActiveTab('IN_PROGRESS')}
              className={`rounded-lg px-2.5 py-1 text-[11px] transition cursor-pointer ${activeTab === 'IN_PROGRESS'
                  ? 'bg-white font-semibold text-amber-700 shadow-xs'
                  : 'hover:text-slate-900'
                }`}
            >
              In Progress
            </Button>
            <Button
              type="button"
              variant="unstyled"
              onClick={() => setActiveTab('RESOLVED')}
              className={`rounded-lg px-2.5 py-1 text-[11px] transition cursor-pointer ${activeTab === 'RESOLVED'
                  ? 'bg-white font-semibold text-emerald-700 shadow-xs'
                  : 'hover:text-slate-900'
                }`}
            >
              Resolved
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-6 py-3.5 w-auto sm:w-[42%]">
                Ticket
              </th>
              <th scope="col" className="px-4 py-3.5 w-[14%] whitespace-nowrap">
                Status
              </th>
              <th scope="col" className="px-4 py-3.5 w-[14%] whitespace-nowrap">
                Priority
              </th>
              <th scope="col" className="px-4 py-3.5 w-[18%] whitespace-nowrap">
                Assignee
              </th>
              <th scope="col" className="px-6 py-3.5 w-[12%] text-right whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              [1, 2, 3, 4].map((idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 w-52 rounded bg-slate-200 mb-2" />
                    <div className="h-3 w-28 rounded bg-slate-100" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-6 w-18 rounded-full bg-slate-100" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-6 w-18 rounded-full bg-slate-100" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-6 w-24 rounded bg-slate-100" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="h-4 w-12 rounded bg-slate-100 ml-auto" />
                  </td>
                </tr>
              ))
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-3">
                    <Inbox className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    No tickets found
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {activeTab === 'ALL'
                      ? 'No tickets are currently logged into the system.'
                      : `No recent tickets currently marked as ${activeTab.replace('_', ' ').toLowerCase()}.`}
                  </p>
                  {isAdmin && onOpenCreateModal && (
                    <div className="mt-4">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={onOpenCreateModal}
                        leftIcon={<Plus className="h-3.5 w-3.5" />}
                      >
                        Create Ticket
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filteredTickets.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/tickets/${t.id}`)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-1 text-xs sm:text-sm">
                      {t.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                      <span>{formatTicketId(t.id)}</span>
                      <span>•</span>
                      <span>{formatDate(t.createdAt)}</span>
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <TicketStatusBadge status={t.status} size="sm" />
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <TicketPriorityBadge priority={t.priority} size="sm" />
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-600">
                    {t.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] ring-1 ring-slate-200">
                          {getInitials(t.assignedTo.name)}
                        </div>
                        <span className="truncate max-w-[130px] font-medium text-slate-800 text-xs">
                          {t.assignedTo.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">
                        Unassigned
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-brand-700 transition-colors">
                      <span>View</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && filteredTickets.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/40 px-6 py-3 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-700 font-semibold">{filteredTickets.length}</strong> of{' '}
            {tickets.length} recent tickets
          </span>
          <Link
            to={ROUTES.TICKETS}
            className="font-medium text-brand-700 hover:text-brand-800 hover:underline"
          >
            Explore all tickets backlog &rarr;
          </Link>
        </div>
      )}
    </div>
  );
};

export interface TeamDirectoryTableProps {
  users: User[];
  isLoading: boolean;
}

export const TeamDirectoryTable: React.FC<TeamDirectoryTableProps> = ({
  users,
  isLoading,
}) => {
  const [filterRole, setFilterRole] = useState<'ALL' | 'ADMIN' | 'SUPPORT_AGENT'>('ALL');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesSearch =
      debouncedSearch.trim() === '' ||
      u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const pagination = usePagination({
    totalItems: filteredUsers.length,
    pageSize: 5,
  });

  const paginatedUsers = filteredUsers.slice(
    pagination.startIndex,
    pagination.endIndex,
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs text-left">
      <div className="flex flex-col gap-3.5 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-700 ring-1 ring-forest-500/20">
            <Users className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Team Directory
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {users.length} members
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Support agents and assigned workload distribution
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <SearchInput
            placeholder="Search member..."
            value={search}
            onChange={setSearch}
            size="sm"
            containerClassName="w-36 sm:w-44"
          />

          <div className="inline-flex rounded-xl bg-slate-100/90 p-1 text-xs font-medium text-slate-600">
            <Button
              type="button"
              variant="unstyled"
              onClick={() => setFilterRole('ALL')}
              className={`rounded-lg px-2.5 py-1 text-[11px] transition cursor-pointer ${filterRole === 'ALL'
                  ? 'bg-white font-semibold text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
                }`}
            >
              All
            </Button>
            <Button
              type="button"
              variant="unstyled"
              onClick={() => setFilterRole('ADMIN')}
              className={`rounded-lg px-2.5 py-1 text-[11px] transition cursor-pointer ${filterRole === 'ADMIN'
                  ? 'bg-white font-semibold text-purple-700 shadow-xs'
                  : 'hover:text-slate-900'
                }`}
            >
              Admins
            </Button>
            <Button
              type="button"
              variant="unstyled"
              onClick={() => setFilterRole('SUPPORT_AGENT')}
              className={`rounded-lg px-2.5 py-1 text-[11px] transition cursor-pointer ${filterRole === 'SUPPORT_AGENT'
                  ? 'bg-white font-semibold text-brand-700 shadow-xs'
                  : 'hover:text-slate-900'
                }`}
            >
              Agents
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-6 py-3.5 w-auto sm:w-[36%]">
                Member
              </th>
              <th scope="col" className="px-4 py-3.5 w-[14%] whitespace-nowrap">
                Role
              </th>
              <th scope="col" className="px-4 py-3.5 w-[14%] text-center whitespace-nowrap">
                Assigned
              </th>
              <th scope="col" className="px-4 py-3.5 w-[14%] text-center whitespace-nowrap">
                In Progress
              </th>
              <th scope="col" className="px-4 py-3.5 w-[12%] whitespace-nowrap">
                Joined
              </th>
              <th scope="col" className="px-6 py-3.5 w-[10%] text-right whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-200" />
                      <div>
                        <div className="h-4 w-32 rounded bg-slate-200 mb-1.5" />
                        <div className="h-3 w-40 rounded bg-slate-100" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-6 w-20 rounded-full bg-slate-100" />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="h-6 w-8 rounded bg-slate-100 mx-auto" />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="h-6 w-8 rounded bg-slate-100 mx-auto" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-3 w-20 rounded bg-slate-100" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="h-4 w-16 rounded bg-slate-100 ml-auto" />
                  </td>
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-500">
                  No team members found matching your search criteria.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => {
                const assignedCount = u.assignedTicketCount ?? 0;
                const inProgressCount = u.inProgressTicketCount ?? 0;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-xs text-slate-700 ring-1 ring-slate-200">
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {u.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700 ring-1 ring-inset ring-purple-600/20">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700 ring-1 ring-inset ring-brand-600/20">
                          <Headphones className="h-3.5 w-3.5" />
                          Agent
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 min-w-[32px]">
                        {assignedCount}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center justify-center rounded-lg px-2.5 py-0.5 text-xs font-bold min-w-[32px] ${inProgressCount > 0
                            ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20'
                            : 'bg-slate-100 text-slate-500'
                          }`}
                      >
                        {inProgressCount}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-500">
                      {formatDate(u.createdAt)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {u.role === 'SUPPORT_AGENT' || assignedCount > 0 ? (
                        <Link
                          to={`${ROUTES.TICKETS}?assignedToId=${u.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 transition group"
                        >
                          <span>Queue</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-300">&mdash;</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && filteredUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/40 px-6 py-3 text-xs text-slate-500">
          <span>
            Displaying <strong className="text-slate-700 font-semibold">{pagination.startIndex + 1}-{Math.min(pagination.endIndex, filteredUsers.length)}</strong> of{' '}
            {filteredUsers.length} members
          </span>

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={pagination.prevPage}
                className="px-2.5 py-1 text-xs"
              >
                Previous
              </Button>
              <span className="px-2 font-medium text-slate-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={pagination.nextPage}
                className="px-2.5 py-1 text-xs"
              >
                Next
              </Button>
            </div>
          )}

          <span className="text-slate-400 hidden sm:inline">Team permissions &amp; assignment directory</span>
        </div>
      )}
    </div>
  );
};

export const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
  Empty: TableEmpty,
  Skeleton: TableSkeleton,
  RecentTickets: RecentTicketsTable,
  TeamDirectory: TeamDirectoryTable,
});

export default Table;
