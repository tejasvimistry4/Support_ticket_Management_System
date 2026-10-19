import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './RouteConstants';
import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthLayout, DashboardLayout } from '../layouts';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  TicketsListPage,
  TicketDetailPage,
  CreateTicketPage,
  UnauthorizedPage,
  NotFoundPage,
} from '../pages';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.DASHBOARD} replace />} />

      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.TICKETS} element={<TicketsListPage />} />
          <Route path={ROUTES.TICKET_DETAILS} element={<TicketDetailPage />} />
          <Route
            path={ROUTES.CREATE_TICKET}
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CreateTicketPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>

      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
