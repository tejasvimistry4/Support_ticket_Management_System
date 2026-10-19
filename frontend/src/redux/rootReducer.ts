import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import commentsReducer from './comments/commentsSlice';
import ticketsReducer from './tickets/ticketsSlice';
import usersReducer from './users/usersSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  tickets: ticketsReducer,
  users: usersReducer,
  comments: commentsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
