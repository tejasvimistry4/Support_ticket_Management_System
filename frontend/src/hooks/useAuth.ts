import { useCallback } from 'react';
import {
  clearError,
  forceLogout,
} from '../redux/auth/authSlice';
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '../redux/auth/authThunk';
import {
  selectAuthError,
  selectAuthLoading,
  selectCurrentUser,
  selectIsAdmin,
  selectIsAuthenticated,
  selectIsSupportAgent,
  selectToken,
  selectUserRole,
} from '../redux/auth/selectors';
import { useAppDispatch, useAppSelector } from '../redux/store';
import type { LoginPayload, RegisterPayload } from '../types/auth';

export const useAuth = () => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectCurrentUser);
  const token = useAppSelector(selectToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const role = useAppSelector(selectUserRole);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isAgent = useAppSelector(selectIsSupportAgent);

  const login = useCallback(
    async (credentials: LoginPayload) => {
      return dispatch(loginUser(credentials)).unwrap();
    },
    [dispatch],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      return dispatch(registerUser(payload)).unwrap();
    },
    [dispatch],
  );

  const logout = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const refreshProfile = useCallback(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  const handleForceLogout = useCallback(() => {
    dispatch(forceLogout());
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    role,
    isAdmin,
    isAgent,
    login,
    register,
    logout,
    clearAuthError,
    refreshProfile,
    handleForceLogout,
  };
};

export default useAuth;
