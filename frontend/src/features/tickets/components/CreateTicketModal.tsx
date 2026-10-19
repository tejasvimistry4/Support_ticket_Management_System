import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { createTicket } from '../../../redux/tickets/ticketsThunk';
import { fetchUsers } from '../../../redux/users/usersThunk';
import { selectAgents } from '../../../redux/users/selectors';
import { Button, Input, Modal, Select, Textarea } from '../../../components/common';
import { validateTicketTitle, validateTicketDescription } from '../../../utils';
import type { TicketPriority } from '../../../types/ticket';

export interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const agents = useAppSelector(selectAgents);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [assignedToId, setAssignedToId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchUsers('SUPPORT_AGENT'));
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setAssignedToId('');
      setDueDate('');
      setErrors({});
    }
  }, [isOpen, dispatch]);

  const validate = () => {
    const newErrors: { title?: string; description?: string } = {};

    const titleError = validateTicketTitle(title);
    if (titleError) newErrors.title = titleError;

    const descError = validateTicketDescription(description);
    if (descError) newErrors.description = descError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        createTicket({
          title: title.trim(),
          description: description.trim(),
          priority,
          assignedToId: assignedToId ? assignedToId : undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        }),
      ).unwrap();

      toast.success('Ticket created successfully');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err || 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Support Ticket"
      description="Fill in the details below to log a new ticket and optionally assign it to an agent."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Ticket Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          placeholder="Brief summary of the issue (e.g. Invoicing calculation bug)"
          error={errors.title}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <Select
            label="Assign To Agent"
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
        </div>

        <Input
          type="datetime-local"
          label="Due Date (Target Resolution Deadline)"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          helperText="Optional. Leave blank to automatically apply the standard priority SLA deadline."
        />

        <Textarea
          label="Issue Description"
          rows={4}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description)
              setErrors((prev) => ({ ...prev, description: undefined }));
          }}
          placeholder="Detailed description of the issue, steps to reproduce, impact, or requirements..."
          error={errors.description}
          required
        />

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
          >
            Create Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTicketModal;
