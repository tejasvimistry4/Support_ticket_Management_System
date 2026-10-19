import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { createTicket } from '../../redux/tickets/ticketsThunk';
import { fetchUsers } from '../../redux/users/usersThunk';
import { selectAgents } from '../../redux/users/selectors';
import { Input, Select, Button, Card, Textarea } from '../../components/common';
import { ROUTES } from '../../routes/RouteConstants';
import { validateTicketTitle, validateTicketDescription } from '../../utils';
import type { TicketPriority } from '../../types/ticket';

export const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAdmin } = useAuth();
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
    if (isAdmin) {
      dispatch(fetchUsers('SUPPORT_AGENT'));
    }
  }, [isAdmin, dispatch]);

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
      const created = await dispatch(
        createTicket({
          title: title.trim(),
          description: description.trim(),
          priority,
          assignedToId: assignedToId || undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        }),
      ).unwrap();

      toast.success('Ticket created successfully');
      navigate(`/tickets/${created.id}`);
    } catch (err: any) {
      toast.error(err || 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <Link
          to={ROUTES.TICKETS}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create Support Ticket
          </h1>
          <p className="text-xs text-slate-500">
            Submit a new customer or internal support ticket and optionally assign to an agent.
          </p>
        </div>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Ticket Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="e.g. Gateway integration webhook failure"
            error={errors.title}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
              <option value="">Unassigned (Queue)</option>
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
            label="Detailed Description"
            rows={6}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description)
                setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            placeholder="Provide complete context, steps to reproduce, client details, logs or expected outcome..."
            error={errors.description}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate(ROUTES.TICKETS)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Submit Ticket
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateTicketPage;
