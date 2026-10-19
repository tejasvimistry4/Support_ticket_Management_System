import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { updateTicket } from '../../../redux/tickets/ticketsThunk';
import { fetchUsers } from '../../../redux/users/usersThunk';
import { selectAgents } from '../../../redux/users/selectors';
import { Button, Input, Modal, Select, Textarea, Alert, Badge } from '../../../components/common';
import { formatForDateTimeLocal } from '../../../utils';
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
  UpdateTicketPayload,
} from '../../../types/ticket';

export interface EditTicketModalProps {
  isOpen: boolean;
  ticket: Ticket | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditTicketModal: React.FC<EditTicketModalProps> = ({
  isOpen,
  ticket,
  onClose,
  onSuccess,
}) => {
  const { isAdmin } = useAuth();
  const dispatch = useAppDispatch();
  const agents = useAppSelector(selectAgents);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TicketStatus>('OPEN');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [assignedToId, setAssignedToId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && ticket) {
      if (isAdmin) {
        dispatch(fetchUsers('SUPPORT_AGENT'));
      }
      setTitle(ticket.title);
      setDescription(ticket.description);
      setStatus(ticket.status);
      setPriority(ticket.priority);
      setAssignedToId(ticket.assignedToId || '');
      setDueDate(ticket.dueDate ? formatForDateTimeLocal(ticket.dueDate) : '');
    }
  }, [isOpen, ticket, isAdmin, dispatch]);

  if (!ticket) return null;

  const isAgentBlockedFromClosed = !isAdmin && ticket.status === 'CLOSED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAgentBlockedFromClosed) {
      toast.error('Support Agents cannot edit closed tickets');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: UpdateTicketPayload = {};

      if (isAdmin) {
        payload.title = title.trim();
        payload.description = description.trim();
        payload.status = status;
        payload.priority = priority;
        payload.assignedToId = assignedToId ? assignedToId : null;
        payload.dueDate = dueDate ? new Date(dueDate).toISOString() : null;
      } else {
        payload.status = status;
      }

      await dispatch(
        updateTicket({
          id: ticket.id,
          payload,
        }),
      ).unwrap();

      toast.success(
        isAdmin && assignedToId !== (ticket.assignedToId || '')
          ? 'Ticket updated and reassigned successfully'
          : 'Ticket updated successfully',
      );
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err || 'Failed to update ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAdmin ? 'Edit & Reassign Support Ticket' : 'Update Ticket Status'}
      description={
        isAdmin
          ? 'Modify ticket metadata, assign or reassign agents, or adjust priority and status.'
          : 'Update the processing status for your assigned ticket.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isAgentBlockedFromClosed && (
          <Alert
            variant="error"
            title="Closed Ticket (Locked)"
            icon={<Lock className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />}
          >
            This ticket is marked as CLOSED and cannot be modified by Support Agents. Only administrators can modify or reopen closed tickets.
          </Alert>
        )}
        {isAdmin ? (
          <Input
            label="Ticket Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        ) : (
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ticket
            </p>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">
              {ticket.title}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Ticket Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TicketStatus)}
            disabled={isAgentBlockedFromClosed || isSubmitting}
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </Select>

          {isAdmin ? (
            <Select
              label="Priority Level"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </Select>
          ) : (
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Current Priority
              </label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-600 flex items-center gap-2">
                <Badge.Priority priority={ticket.priority} size="sm" />
                <span className="text-xs text-slate-500">(Admin Managed)</span>
              </div>
            </div>
          )}
        </div>

        {isAdmin && (
          <Select
            label="Assigned Agent"
            value={assignedToId}
            onChange={(e) => setAssignedToId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </Select>
        )}

        {isAdmin ? (
          <Input
            type="datetime-local"
            label="Due Date (Target Resolution Deadline)"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            helperText="Clear to automatically apply standard priority SLA duration."
          />
        ) : ticket.dueDate ? (
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Target Due Date
            </label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-600">
              {new Date(ticket.dueDate).toLocaleString()}
            </div>
          </div>
        ) : null}

        {isAdmin && (
          <Textarea
            label="Description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isSubmitting}
            disabled={isAgentBlockedFromClosed || isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTicketModal;
