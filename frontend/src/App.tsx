import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store, useAppDispatch } from './redux';
import { fetchCurrentUser, logoutUser } from './redux/auth';
import { getStoredToken } from './utils';
import { AppRoutes } from './routes';

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      dispatch(fetchCurrentUser());
    }

    const handleUnauthorized = () => {
      dispatch(logoutUser());
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [dispatch]);

  return <>{children}</>;
};

export default function App() {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                fontSize: '13px',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#0f172a',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f43f5e',
                  secondary: '#0f172a',
                },
              },
            }}
          />
          <AppRoutes />
        </BrowserRouter>
      </AuthInitializer>
    </Provider>
  );
}
