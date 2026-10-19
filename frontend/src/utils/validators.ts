
export * from '../validations/auth.schema';

export const validateTicketTitle = (title: string): string | null => {
  if (!title || !title.trim()) {
    return 'Title is required';
  }
  if (title.trim().length < 3) {
    return 'Title must be at least 3 characters';
  }
  if (title.trim().length > 150) {
    return 'Title cannot exceed 150 characters';
  }
  return null;
};

export const validateTicketDescription = (description: string): string | null => {
  if (!description || !description.trim()) {
    return 'Description is required';
  }
  if (description.trim().length < 10) {
    return 'Description must be at least 10 characters';
  }
  return null;
};
