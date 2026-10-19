import type { RootState } from '../store';

export const selectAuth = (state: RootState) => state.auth;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectUserRole = (state: RootState) => state.auth.user?.role ?? null;
export const selectIsAdmin = (state: RootState) => state.auth.user?.role === 'ADMIN';
export const selectIsSupportAgent = (state: RootState) =>
  state.auth.user?.role === 'SUPPORT_AGENT';
