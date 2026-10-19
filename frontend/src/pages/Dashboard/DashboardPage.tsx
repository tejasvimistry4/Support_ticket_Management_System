import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth, usePermission } from '../../hooks';
import {
  AdminDashboardView,
  AgentDashboardView,
} from '../../features/dashboard';
import { ROUTES } from '../../routes/RouteConstants';
import { useAppDispatch } from '../../redux/store';
import { setFilters, resetFilters } from '../../redux/tickets/ticketsSlice';
import { authService, dashboardService, ticketsService } from '../../services';
import type { User } from '../../types/auth';
import type {
  AnalyticsQueryParams,
  DashboardAnalyticsResponse,
} from '../../types/dashboard';
import type { Ticket, TicketPriority, TicketStatus } from '../../types/ticket';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { isAdmin } = usePermission();

  const [userList, setUserList] = useState<User[]>([]);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalyticsResponse | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const defaultFilters: AnalyticsQueryParams = {
    timeRange: '7d',
    groupBy: 'day',
  };

  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadAnalytics = useCallback(async (silent = false) => {
    if (!silent) setIsLoadingAnalytics(true);
    try {
      setAnalyticsError(null);
      const [analyticsData, ticketsData] = await Promise.all([
        dashboardService.getAnalytics(defaultFilters),
        ticketsService.getTickets({ limit: 10, page: 1 }),
      ]);
      setAnalytics(analyticsData);
      setRecentTickets(ticketsData.items);
    } catch (err) {
      console.error('Failed to load dashboard analytics:', err);
      setAnalyticsError('Unable to fetch live analytics from database.');
      if (!silent) toast.error('Failed to load dashboard metrics');
    } finally {
      if (!silent) setIsLoadingAnalytics(false);
    }
  }, []);

  const loadAllUsers = useCallback(
    async (silent = false) => {
      if (!isAdmin) return;
      if (!silent) setIsLoadingUsers(true);
      try {
        const users = await authService.getAllUsers();
        setUserList(users);
      } catch (err) {
        console.error('Failed to fetch user list:', err);
        if (!silent) toast.error('Failed to load team directory');
      } finally {
        if (!silent) setIsLoadingUsers(false);
      }
    },
    [isAdmin],
  );

  const loadDashboardData = useCallback(
    async (silent = false) => {
      await Promise.all([
        loadAnalytics(silent),
        isAdmin ? loadAllUsers(silent) : Promise.resolve(),
      ]);
    },
    [loadAnalytics, loadAllUsers, isAdmin],
  );


  useEffect(() => {
    loadDashboardData(false);
  }, [loadDashboardData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadDashboardData(false);
      toast.success('Dashboard metrics refreshed');
    } catch {
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleNavigateWithFilters = (params: {
    status?: string;
    priority?: string;
    assignedToId?: string;
  }) => {
    if (!params.status && !params.priority && !params.assignedToId) {
      dispatch(resetFilters());
      navigate(ROUTES.TICKETS);
      return;
    }

    dispatch(
      setFilters({
        status: (params.status as TicketStatus) || '',
        priority: (params.priority as TicketPriority) || '',
        assignedToId: params.assignedToId || undefined,
        search: '',
        page: 1,
      }),
    );

    const queryParts: string[] = [];
    if (params.status) queryParts.push(`status=${params.status}`);
    if (params.priority) queryParts.push(`priority=${params.priority}`);
    if (params.assignedToId) queryParts.push(`assignedToId=${params.assignedToId}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    navigate(`${ROUTES.TICKETS}${queryString}`);
  };

  return (
    <>
      {isAdmin ? (
        <AdminDashboardView
          user={user}
          analytics={analytics}
          recentTickets={recentTickets}
          userList={userList}
          isLoadingAnalytics={isLoadingAnalytics}
          isLoadingUsers={isLoadingUsers}
          isRefreshing={isRefreshing}
          analyticsError={analyticsError}
          isCreateModalOpen={isCreateModalOpen}
          setIsCreateModalOpen={setIsCreateModalOpen}
          onRefresh={handleRefresh}
          onTicketCreated={() => loadDashboardData(false)}
          onNavigateWithFilters={handleNavigateWithFilters}
        />
      ) : (
        <AgentDashboardView
          user={user}
          analytics={analytics}
          tickets={recentTickets}
          isLoading={isLoadingAnalytics}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          onNavigateWithFilters={handleNavigateWithFilters}
        />
      )}
    </>
  );
};

export default DashboardPage;
