import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  Clock,
  User as UserIcon,
  LifeBuoy,
  AlertCircle,
  Inbox,
  Filter,
  Lock,
  RefreshCw,
  Layers,
  Archive,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import {
  deleteTicket,
  fetchTickets,
  fetchTicketStats,
} from '../../redux/tickets/ticketsThunk';
import {
  selectTickets,
  selectTicketsError,
  selectTicketsFilters,
  selectTicketsLoading,
  selectTicketsPagination,
  selectTicketStats,
} from '../../redux/tickets/selectors';
import {
  resetFilters,
  setFilters,
  setPage,
} from '../../redux/tickets/ticketsSlice';
import {
  Button,
  Loader,
  Modal,
  Pagination,
  TicketStatusBadge,
  TicketPriorityBadge,
  StatCard,
  Alert,
} from '../../components/common';
import {
  TicketFilterBar,
  CreateTicketModal,
  EditTicketModal,
} from '../../features/tickets';
import { formatDate, formatTicketId, getInitials, isTicketOverdue } from '../../utils';
import type { Ticket, TicketFilterParams, TicketPriority, TicketStatus } from '../../types/ticket';

export const TicketsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { user, isAdmin } = useAuth();

  const tickets = useAppSelector(selectTickets);
  const pagination = useAppSelector(selectTicketsPagination);
  const filters = useAppSelector(selectTicketsFilters);
  const stats = useAppSelector(selectTicketStats);
  const isLoading = useAppSelector(selectTicketsLoading);
  const error = useAppSelector(selectTicketsError);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicketForEdit, setSelectedTicketForEdit] = useState<Ticket | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const debouncedSearch = useDebounce(filters.search || '', 350);

  useEffect(() => {
    const statusParam = (searchParams.get('status') as TicketFilterParams['status']) || '';
    const priorityParam = (searchParams.get('priority') as TicketFilterParams['priority']) || '';
    const assignedToIdParam = searchParams.get('assignedToId') || undefined;
    const searchParam = searchParams.get('search') || '';

    const statusDiff = filters.status !== statusParam;
    const priorityDiff = filters.priority !== priorityParam;
    const assignedDiff = filters.assignedToId !== assignedToIdParam;
    const searchDiff = (filters.search || '') !== searchParam;

    if (statusDiff || priorityDiff || assignedDiff || searchDiff) {
      dispatch(
        setFilters({
          status: statusParam,
          priority: priorityParam,
          assignedToId: assignedToIdParam,
          search: searchParam,
          page: 1,
        }),
      );
    }
  }, [
    searchParams,
    dispatch,
    filters.status,
    filters.priority,
    filters.assignedToId,
    filters.search,
  ]);

  const loadTickets = useCallback(() => {
    dispatch(
      fetchTickets({
        ...filters,
        search: debouncedSearch,
      }),
    );
    dispatch(fetchTicketStats());
  }, [
    dispatch,
    filters.status,
    filters.priority,
    filters.assignedToId,
    filters.page,
    filters.limit,
    filters.sortBy,
    filters.sortOrder,
    debouncedSearch,
  ]);


  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        dispatch(
          fetchTickets({
            ...filters,
            search: debouncedSearch,
          }),
        ).unwrap(),
        dispatch(fetchTicketStats()).unwrap(),
      ]);
      toast.success('Ticket queue refreshed');
    } catch {
      toast.error('Failed to refresh tickets');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<TicketFilterParams>) => {
    const updated = { ...filters, ...newFilters };
    const params: Record<string, string> = {};
    if (updated.status) params.status = updated.status;
    if (updated.priority) params.priority = updated.priority;
    if (updated.search) params.search = updated.search;
    if (updated.assignedToId) params.assignedToId = updated.assignedToId;
    setSearchParams(params);
    dispatch(setFilters(newFilters));
  };

  const handleResetFilters = () => {
    setSearchParams({});
    dispatch(resetFilters());
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteTicket(ticketToDelete.id)).unwrap();
      toast.success('Ticket deleted successfully');
      setTicketToDelete(null);
      loadTickets();
    } catch (err: any) {
      toast.error(err || 'Failed to delete ticket');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {isAdmin ? 'My Created Tickets' : 'My Assigned Tickets'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? 'Manage and track tickets created by you'
              : 'Review and update tickets assigned to you'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            leftIcon={
              <RefreshCw
                className={`h-4 w-4 text-slate-500 ${isRefreshing || isLoading ? 'animate-spin text-brand-600' : ''
                  }`}
              />
            }
          >
            {isRefreshing || isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>

          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              New Ticket
            </Button>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <StatCard
            title="Total Tickets"
            value={stats.total}
            icon={Layers}
            variant="brand"
            isPrimary={true}
            onClick={() => handleFilterChange({ status: undefined })}
          />

          <StatCard
            title="Open"
            value={stats.open}
            icon={Inbox}
            variant="emerald"
            onClick={() => handleFilterChange({ status: 'OPEN' })}
          />

          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={Clock}
            variant="amber"
            onClick={() => handleFilterChange({ status: 'IN_PROGRESS' })}
          />

          <StatCard
            title="Resolved"
            value={stats.resolved}
            icon={LifeBuoy}
            variant="teal"
            onClick={() => handleFilterChange({ status: 'RESOLVED' })}
          />

          <StatCard
            title="Closed"
            value={stats.closed}
            icon={Archive}
            variant="slate"
            onClick={() => handleFilterChange({ status: 'CLOSED' })}
          />
        </div>
      )}

      {filters.assignedToId && (
        <Alert
          variant="info"
          className="border-purple-200 bg-purple-50/70 text-purple-900 shadow-xs"
          icon={<span className="flex h-2 w-2 rounded-full bg-purple-600 animate-pulse mt-1" />}
          action={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchParams({});
                handleFilterChange({ assignedToId: undefined });
              }}
              className="font-semibold text-purple-700 hover:text-purple-900 underline transition self-start sm:self-auto p-0 h-auto hover:bg-transparent"
            >
              Clear agent filter
            </Button>
          }
        >
          <span>
            Filtering tickets assigned to team member ID:{' '}
            <code className="font-mono bg-white px-2 py-0.5 rounded border border-purple-200 font-semibold">
              {filters.assignedToId}
            </code>
          </span>
        </Alert>
      )}

      <TicketFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {isLoading && tickets.length === 0 ? (
          <div className="py-20 text-center">
            <Loader size="lg" label="Loading support tickets..." />
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
              <Inbox className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No support tickets found
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {filters.status || filters.priority || filters.search
                ? 'No tickets match the current filter criteria. Try clearing filters or refining your search.'
                : isAdmin
                  ? 'Get started by creating your first customer support ticket.'
                  : 'You have no support tickets assigned to you at this moment.'}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {(filters.status || filters.priority || filters.search) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                >
                  Clear Filters
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Create Ticket
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    Ticket Details
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Assignee
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Created By
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >

                    <td className="px-6 py-4 max-w-md">
                      <div
                        onClick={() => navigate(`/tickets/${t.id}`)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                            {t.title}
                          </p>
                          {isTicketOverdue(t) && (
                            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              Overdue
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                          {t.description}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <TicketStatusBadge status={t.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TicketPriorityBadge priority={t.priority} size="sm" />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {t.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                            {getInitials(t.assignedTo.name)}
                          </div>
                          <span className="text-xs font-medium text-slate-800">
                            {t.assignedTo.name}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                          {getInitials(t.createdBy.name)}
                        </div>
                        <span className="text-xs text-slate-700">
                          {t.createdBy.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      <div>{formatDate(t.createdAt)}</div>
                      {t.dueDate && (
                        <div
                          className={`text-[11px] font-mono mt-0.5 ${isTicketOverdue(t) ? 'text-rose-600 font-semibold' : 'text-slate-400'
                            }`}
                        >
                          Due: {formatDate(t.dueDate)}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/tickets/${t.id}`)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200/60 border border-transparent transition-all shadow-none hover:shadow-xs active:scale-95"
                          title="View ticket"
                          aria-label="View ticket"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>


                        {!isAdmin && t.status === 'CLOSED' ? (
                          <span
                            className="rounded-lg p-2 text-slate-300 bg-slate-50/80 border border-slate-100 cursor-not-allowed inline-flex items-center"
                            title="Closed ticket (Locked)"
                            aria-label="Closed ticket cannot be edited"
                          >
                            <Lock className="h-4 w-4" />
                          </span>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTicketForEdit(t)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200/60 border border-transparent transition-all shadow-none hover:shadow-xs active:scale-95"
                            title="Edit ticket"
                            aria-label="Edit ticket"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}


                        {isAdmin && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setTicketToDelete(t)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200/60 border border-transparent transition-all shadow-none hover:shadow-xs active:scale-95"
                            title="Delete ticket"
                            aria-label="Delete ticket"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        {pagination.total > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>


      {isAdmin && (
        <CreateTicketModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={loadTickets}
        />
      )}


      <EditTicketModal
        isOpen={Boolean(selectedTicketForEdit)}
        ticket={selectedTicketForEdit}
        onClose={() => setSelectedTicketForEdit(null)}
        onSuccess={loadTickets}
      />


      <Modal
        isOpen={Boolean(ticketToDelete)}
        onClose={() => setTicketToDelete(null)}
        title="Confirm Ticket Deletion"
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <Alert
            variant="error"
            title="Permanently delete this ticket?"
            icon={
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
                <AlertCircle className="h-5 w-5" />
              </div>
            }
          >
            This action is irreversible. All activity, status history, and comments associated with this ticket will be permanently removed from the system.
          </Alert>

          {ticketToDelete && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-700">
              <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">Ticket to be deleted:</p>
              <p className="font-bold text-slate-900 mt-0.5 text-sm">
                {ticketToDelete.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-[11px] text-slate-500">
                  ID: {formatTicketId(ticketToDelete.id)}
                </span>
                <span className="text-slate-300">&bull;</span>
                <TicketStatusBadge status={ticketToDelete.status} size="sm" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTicketToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDeleteTicket}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            >
              Delete ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TicketsListPage;
