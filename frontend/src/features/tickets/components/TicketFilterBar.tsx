import React, { useState, useEffect } from 'react';
import { RotateCcw, Filter } from 'lucide-react';
import { useDebounce } from '../../../hooks/useDebounce';
import type {
  TicketFilterParams,
  TicketPriority,
  TicketStatus,
} from '../../../types/ticket';
import { Button, Search, Select } from '../../../components/common';

export interface TicketFilterBarProps {
  filters: TicketFilterParams;
  onFilterChange: (filters: Partial<TicketFilterParams>) => void;
  onReset: () => void;
}

export const TicketFilterBar: React.FC<TicketFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchTerm, 350);

  useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    if (debouncedSearch !== (filters.search || '')) {
      onFilterChange({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  const hasActiveFilters = Boolean(
    filters.status || filters.priority || filters.search,
  );

  const handleClearSearch = () => {
    setSearchTerm('');
    onFilterChange({ search: '' });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
      <Search
        value={searchTerm}
        onChange={setSearchTerm}
        onClear={handleClearSearch}
        placeholder="Search by title or description..."
        className="bg-slate-50/50 focus:bg-white"
        containerClassName="flex-1"
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="min-w-[130px]">
          <Select
            size="sm"
            value={filters.status || ''}
            onChange={(e) =>
              onFilterChange({
                status: (e.target.value as TicketStatus) || '',
              })
            }
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </Select>
        </div>

        <div className="min-w-[130px]">
          <Select
            size="sm"
            value={filters.priority || ''}
            onChange={(e) =>
              onFilterChange({
                priority: (e.target.value as TicketPriority) || '',
              })
            }
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            leftIcon={<RotateCcw className="h-3.5 w-3.5 text-slate-500" />}
            className="text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50/50"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default TicketFilterBar;
