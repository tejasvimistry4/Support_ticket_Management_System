import { createAsyncThunk } from '@reduxjs/toolkit';
import { usersApi } from '../../api/users.api';
import type { Role, User } from '../../types/auth';

export const fetchUsers = createAsyncThunk<
  User[],
  Role | undefined,
  { rejectValue: string }
>('users/fetchUsers', async (role, { rejectWithValue }) => {
  try {
    return await usersApi.getUsers(role);
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || 'Failed to load team members',
    );
  }
});
