import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { restoreSessionThunk } from './store/slices/authSlice';
import { setDark } from './store/slices/themeSlice';
import { fetchProjectsThunk } from './store/slices/projectSlice';
import { fetchSprintsThunk } from './store/slices/sprintSlice';
import AppRouter from './router/AppRouter';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(s => s.auth);
  const { isDark } = useAppSelector(s => s.theme);

  useEffect(() => {
    dispatch(restoreSessionThunk());
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) dispatch(setDark(savedTheme === 'dark'));
    document.documentElement.setAttribute('data-theme', savedTheme === 'dark' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProjectsThunk({ limit: 100 }));
      dispatch(fetchSprintsThunk({ limit: 100 }));
    }
  }, [isAuthenticated]);

  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.875rem' },
          success: { iconTheme: { primary: '#2e7d32', secondary: '#fff' } },
          error: { iconTheme: { primary: '#c62828', secondary: '#fff' } },
        }}
      />
    </>
  );
};

const App: React.FC = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
);

export default App;
