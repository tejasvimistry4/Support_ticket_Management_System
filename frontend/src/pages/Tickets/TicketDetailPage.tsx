import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  User as UserIcon,
  CheckCircle2,
  Activity,
  Layers,
  ChevronRight,
  RefreshCw,
  Edit2,
  Trash2,
  AlertCircle,
  MoreVertical,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { deleteTicket, fetchTicketById, updateTicket } from '../../redux/tickets/ticketsThunk';
import { fetchUsers } from '../../redux/users/usersThunk';
import { selectAgents } from '../../redux/users/selectors';
import { clearCurrentTicket } from '../../redux/tickets/ticketsSlice';
import {
  selectCurrentTicket,
  selectTicketDetailLoading,
  selectTicketsError,
} from '../../redux/tickets/selectors';
import {
  Button,
  Loader,
  TicketStatusBadge,
  TicketPriorityBadge,
  Breadcrumbs,
  Modal,
  Dropdown,
  Alert,
  Select,
  Badge,
} from '../../components/common';
import toast from 'react-hot-toast';
import { ROUTES } from '../../routes/RouteConstants';
import { formatDateTime, formatTicketId, getInitials, isTicketOverdue } from '../../utils';
import type { TicketPriority, TicketStatus } from '../../types/ticket';
import { CommentsSection } from '../../features/comments';
import { EditTicketModal } from '../../features/tickets';

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAdmin } = useAuth();

  const ticket = useAppSelector(selectCurrentTicket);
  const isLoading = useAppSelector(selectTicketDetailLoading);
  const error = useAppSelector(selectTicketsError);
  const agents = useAppSelector(selectAgents);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    if (!id) return;
    dispatch(fetchTicketById(id));

    return () => {
      dispatch(clearCurrentTicket());
    };
  }, [id, dispatch]);


  const handleDeleteTicket = async () => {
    if (!ticket) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteTicket(ticket.id)).unwrap();
      toast.success('Ticket deleted successfully');
      setIsDeleteModalOpen(false);
      navigate(ROUTES.TICKETS);
    } catch (err: any) {
      toast.error(err || 'Failed to delete ticket');
    } finally {
      setIsDeleting(false);
    }
  };


  const handleEditSuccess = () => {
    if (id) {
      dispatch(fetchTicketById(id));
    }
  };


  const handleRefresh = async () => {
    if (!id) return;
    setIsRefreshing(true);
    try {
      await dispatch(fetchTicketById(id)).unwrap();
      toast.success('Ticket details refreshed');
    } catch {
      toast.error('Failed to refresh ticket details');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchUsers('SUPPORT_AGENT'));
    }
  }, [isAdmin, dispatch]);


  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket || ticket.status === newStatus) return;
    if (!isAdmin && ticket.status === 'CLOSED') {
      toast.error('Closed tickets cannot be modified by Support Agents');
      return;
    }
    try {
      await dispatch(
        updateTicket({
          id: ticket.id,
          payload: { status: newStatus },
        }),
      ).unwrap();
      toast.success(`Status changed to ${newStatus.replace('_', ' ')}`);
      dispatch(fetchTicketById(ticket.id));
    } catch (err: any) {
      toast.error(err || 'Failed to update ticket status');
    }
  };

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    if (!ticket || !isAdmin || ticket.priority === newPriority) return;
    try {
      await dispatch(
        updateTicket({
          id: ticket.id,
          payload: { priority: newPriority },
        }),
      ).unwrap();
      toast.success(`Priority updated to ${newPriority}`);
      dispatch(fetchTicketById(ticket.id));
    } catch (err: any) {
      toast.error(err || 'Failed to update priority');
    }
  };

  const handleAssigneeChange = async (newAgentId: string) => {
    if (!ticket || !isAdmin) return;
    try {
      await dispatch(
        updateTicket({
          id: ticket.id,
          payload: { assignedToId: newAgentId ? newAgentId : null },
        }),
      ).unwrap();
      toast.success(newAgentId ? 'Ticket reassigned' : 'Ticket unassigned');
      dispatch(fetchTicketById(ticket.id));
    } catch (err: any) {
      toast.error(err || 'Failed to reassign agent');
    }
  };

  if (isLoading && !ticket) {
    return (
      <div className="py-24 text-center">
        <Loader size="xl" label="Loading ticket details..." />
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center max-w-lg mx-auto my-12 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="mt-1 text-sm text-slate-600">{error}</p>
        <div className="mt-6">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(ROUTES.TICKETS)}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Ticket List
          </Button>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const workflowSteps: { key: TicketStatus; label: string }[] = [
    { key: 'OPEN', label: 'Open' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' },
    { key: 'CLOSED', label: 'Closed' },
  ];

  const currentStepIndex = workflowSteps.findIndex((s) => s.key === ticket.status);

  return (
    <div className="space-y-6 text-left">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <Breadcrumbs
            items={[
              { label: 'Tickets Queue', to: ROUTES.TICKETS, icon: Layers },
              {
                label: formatTicketId(ticket.id),
                isCurrent: true,
                className: 'font-mono',
              },
            ]}
          />

          <div className="flex items-center gap-2">
            <Link to={ROUTES.TICKETS}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
                className="text-xs text-slate-700"
              >
                Back to Queue
              </Button>
            </Link>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              leftIcon={
                <RefreshCw
                  className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing || isLoading ? 'animate-spin text-brand-600' : ''
                    }`}
                />
              }
              className="text-xs"
            >
              {isRefreshing || isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>

            {isAdmin && (
              <Dropdown
                align="right"
                trigger={({ isOpen }) => (
                  <Button
                    variant="outline"
                    size="sm"
                    className={`inline-flex items-center justify-center h-[31px] w-[31px] p-0 rounded-xl border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 transition-all duration-200 focus:outline-none cursor-pointer ${isOpen
                      ? 'border-brand-500 bg-brand-50/50 text-brand-700 ring-2 ring-brand-500/20'
                      : ''
                      }`}
                    title="More actions"
                    aria-label="More actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                )}
              >
                <Dropdown.Header>Ticket Actions</Dropdown.Header>
                <Dropdown.Item
                  icon={Edit2}
                  label="Edit Ticket"
                  onClick={() => setIsEditModalOpen(true)}
                />
                <Dropdown.Divider />
                <Dropdown.Item
                  icon={Trash2}
                  label="Delete Ticket"
                  variant="danger"
                  onClick={() => setIsDeleteModalOpen(true)}
                />
              </Dropdown>
            )}
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
              {ticket.title}
            </h1>
            {isTicketOverdue(ticket) && (
              <Badge className="bg-rose-100 text-rose-700 border border-rose-200 font-bold" size="sm">
                <AlertTriangle className="h-3 w-3 text-rose-600" />
                Overdue
              </Badge>
            )}
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-2">
            <span>
              Opened by <strong className="text-slate-700">{ticket.createdBy.name}</strong>
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
              <Calendar className="h-3 w-3" />
              {formatDateTime(ticket.createdAt)}
            </span>
          </p>

          {!isAdmin && ticket.status === 'CLOSED' && (
            <Alert
              variant="neutral"
              icon={<Lock className="h-4 w-4 text-slate-500 shrink-0" />}
              className="mt-3"
            >
              <span>
                <strong>Read-only:</strong> This ticket is marked as <strong>Closed</strong>. Support agents cannot edit closed tickets.
              </span>
            </Alert>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-600" />
                Issue Description
              </h2>
            </div>

            <div className="rounded-xl bg-slate-50/60 border border-slate-100 p-4 sm:p-5 text-sm text-slate-800 whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed font-normal">
              {ticket.description}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Activity className="h-4 w-4 text-brand-600" />
                Lifecycle Audit Timeline
              </h2>

            </div>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div className="relative">
                <div className="absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100" />
                <div className="text-xs">
                  <p className="font-semibold text-slate-900">Ticket Created</p>
                  <p className="text-slate-500 mt-0.5">
                    Submitted by <strong className="text-slate-700">{ticket.createdBy.name}</strong> ({ticket.createdBy.email})
                  </p>
                  <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                    {formatDateTime(ticket.createdAt)}
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className={`absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-white ${ticket.assignedTo ? 'bg-emerald-600 ring-2 ring-emerald-100' : 'bg-slate-400'}`} />
                <div className="text-xs">
                  <p className="font-semibold text-slate-900">
                    {ticket.assignedTo ? 'Assigned to Agent' : 'Routing Status'}
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    {ticket.assignedTo ? (
                      <>
                        Designated to <strong className="text-slate-700">{ticket.assignedTo.name}</strong> for resolution.
                      </>
                    ) : (
                      'Ticket is currently unassigned in the operational queue.'
                    )}
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-white bg-brand-600 ring-2 ring-brand-100" />
                <div className="text-xs">
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <span>Current Stage:</span>
                    <TicketStatusBadge status={ticket.status} size="sm" />
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Last activity recorded at {formatDateTime(ticket.updatedAt)}.
                  </p>
                </div>
              </div>
            </div>
          </div>

       
          <CommentsSection ticketId={ticket.id} />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
           
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Status Workflow
                </h3>
                <Badge variant="success" size="sm" className="text-[10px] font-semibold">
                  Active Stage
                </Badge>
              </div>


              <div className="space-y-2">
                {workflowSteps.map((step, idx) => {
                  const isCompleted = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const isLocked = !isAdmin && ticket.status === 'CLOSED';

                  return (
                    <Button
                      key={step.key}
                      type="button"
                      variant="unstyled"
                      disabled={isLocked || isCurrent}
                      onClick={() => handleStatusChange(step.key)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${isCurrent
                        ? 'border-brand-500 bg-brand-50/70 text-brand-900 font-bold ring-1 ring-brand-500/20 shadow-xs'
                        : isCompleted
                          ? 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-brand-300 hover:bg-slate-100 cursor-pointer'
                          : 'border-slate-100 bg-white text-slate-400 hover:border-brand-300 hover:text-slate-700 hover:bg-slate-50 cursor-pointer'
                        } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${isCurrent
                            ? 'bg-brand-600 text-white'
                            : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-500'
                            }`}
                        >
                          {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : idx + 1}
                        </span>
                        <span>{step.label}</span>
                      </div>

                      {isCurrent ? (
                        <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wide">
                          Current
                        </span>
                      ) : !isLocked ? (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Click to set
                        </span>
                      ) : null}
                    </Button>
                  );
                })}
              </div>


              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                {ticket.status === 'OPEN' && (
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full text-xs"
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                  >
                    Start Working (In Progress)
                  </Button>
                )}
                {ticket.status === 'IN_PROGRESS' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleStatusChange('RESOLVED')}
                  >
                    Mark as Resolved
                  </Button>
                )}
                {ticket.status === 'RESOLVED' && (
                  <div className="flex w-full gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handleStatusChange('OPEN')}
                    >
                      Reopen
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="flex-1 text-xs"
                      onClick={() => handleStatusChange('CLOSED')}
                    >
                      Close Ticket
                    </Button>
                  </div>
                )}
                {ticket.status === 'CLOSED' && isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => handleStatusChange('OPEN')}
                  >
                    Reopen Closed Ticket
                  </Button>
                )}
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Priority Level
                </label>
                {isAdmin && (
                  <span className="text-[10px] text-brand-600 font-medium">Admin Editable</span>
                )}
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                <TicketPriorityBadge priority={ticket.priority} size="sm" />
                {isAdmin ? (
                  <div className="w-32">
                    <Select
                      size="sm"
                      value={ticket.priority}
                      onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </Select>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">
                    {ticket.priority === 'URGENT'
                      ? 'Urgent SLA Response'
                      : ticket.priority === 'HIGH'
                        ? 'High Priority Handling'
                        : 'Standard Priority'}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Assigned Support Agent
                </label>
                {isAdmin && (
                  <span className="text-[10px] text-brand-600 font-medium">Admin Editable</span>
                )}
              </div>
              {ticket.assignedTo ? (
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                    {getInitials(ticket.assignedTo.name)}
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="font-semibold text-slate-900 truncate">
                      {ticket.assignedTo.name}
                    </p>
                    <p className="text-slate-400 font-mono text-[11px] truncate">
                      {ticket.assignedTo.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 text-xs text-slate-400 italic">
                  Unassigned in queue
                </div>
              )}
              {isAdmin && (
                <div className="mt-2.5">
                  <Select
                    size="sm"
                    value={ticket.assignedToId || ''}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        Reassign to: {agent.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </div>

            <div className="pt-5 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Created By
              </label>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                  {getInitials(ticket.createdBy.name)}
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-semibold text-slate-900 truncate">
                    {ticket.createdBy.name}
                  </p>
                  <p className="text-slate-400 font-mono text-[11px] truncate">
                    {ticket.createdBy.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Target Due Date:
                </span>
                {ticket.dueDate ? (
                  <span className="font-mono text-[11px] text-slate-800 font-medium">
                    {formatDateTime(ticket.dueDate)}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">
                    Standard Priority SLA
                  </span>
                )}
              </div>

              {isTicketOverdue(ticket) && (
                <Alert
                  variant="error"
                  className="mt-2 text-xs font-semibold py-2 px-2.5"
                  icon={<AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />}
                >
                  Overdue (Target Resolution Deadline Exceeded)
                </Alert>
              )}
            </div>

            <div className="pt-5 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Created:
                </span>
                <span className="font-mono text-[11px] text-slate-700">
                  {formatDateTime(ticket.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Last Updated:
                </span>
                <span className="font-mono text-[11px] text-slate-700">
                  {formatDateTime(ticket.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditTicketModal
        isOpen={isEditModalOpen}
        ticket={ticket}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />

      {isAdmin && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Permanent Deletion"
          maxWidth="md"
        >
          <div className="space-y-4 text-left">
            <Alert
              variant="error"
              title="Permanently delete this ticket record?"
              icon={
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
                  <AlertCircle className="h-5 w-5" />
                </div>
              }
            >
              This operation is irreversible. All communication history, lifecycle state transitions, and associated audit records will be permanently expunged from the system.
            </Alert>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-700">
              <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">
                Ticket to be deleted:
              </p>
              <p className="font-bold text-slate-900 mt-0.5 text-sm">
                {ticket.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-[11px] text-slate-500">
                  ID: {formatTicketId(ticket.id)}
                </span>
                <span className="text-slate-300">&bull;</span>
                <TicketStatusBadge status={ticket.status} size="sm" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
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
      )}
    </div>
  );
};

export default TicketDetailPage;
