import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { authApi } from '../../api/auth.api';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../../types/auth';
import {
  clearStoredAuth,
  setStoredToken,
  setStoredUser,
} from '../../utils/localStorage';

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as { message?: string | string[] };
    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }
    if (typeof data.message === 'string') {
      return data.message;
    }
  }
  return fallback;
};

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginPayload,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const data = await authApi.login(credentials);
    setStoredToken(data.accessToken);
    setStoredUser(data.user);
    return data;
  } catch (err) {
    return rejectWithValue(
      extractErrorMessage(err, 'Invalid email or password. Please try again.'),
    );
  }
});

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterPayload,
  { rejectValue: string }
>('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const data = await authApi.register(payload);
    setStoredToken(data.accessToken);
    setStoredUser(data.user);
    return data;
  } catch (err) {
    return rejectWithValue(
      extractErrorMessage(err, 'Registration failed. Please check your details.'),
    );
  }
});

export const fetchCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const user = await authApi.getProfile();
    setStoredUser(user);
    return user;
  } catch (err) {
    clearStoredAuth();
    return rejectWithValue(
      extractErrorMessage(err, 'Session expired. Please log in again.'),
    );
  }
});

export const logoutUser = createAsyncThunk<void, void>(
  'auth/logout',
  async () => {
    clearStoredAuth();
  },
);
