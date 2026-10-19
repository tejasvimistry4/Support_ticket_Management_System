import { createSlice } from '@reduxjs/toolkit';
import type { User } from '../../types/auth';
import { fetchUsers } from './usersThunk';

export interface UsersState {
  users: User[];
  agents: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  agents: [],
  isLoading: false,
  error: null,
};

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
        state.agents = action.payload.filter((u) => u.role === 'SUPPORT_AGENT');
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch users';
      });
  },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;
