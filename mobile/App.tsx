import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';

import { store, persistor } from './src/store';
import { lightTheme, darkTheme } from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingSpinner from './src/components/common/LoadingSpinner';
import { useAppSelector, useAppDispatch } from './src/store/hooks';
import { setOnlineStatus } from './src/store/slices/offlineSlice';
import { fetchProjectsThunk } from './src/store/slices/projectSlice';
import { fetchSprintsThunk } from './src/store/slices/sprintSlice';

const AppContent: React.FC = () => {
  const { isDarkMode } = useAppSelector(s => s.theme);
  const { isAuthenticated } = useAppSelector(s => s.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Network listener
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch(setOnlineStatus(state.isConnected ?? true));
    });

    return () => unsubscribe();
  }, []);

  // Prefetch common data after login
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProjectsThunk({ limit: 100 }));
      dispatch(fetchSprintsThunk({ limit: 100 }));
    }
  }, [isAuthenticated]);

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#121212' : '#1976D2'}
      />
      <AppNavigator />
      <Toast />
    </PaperProvider>
  );
};

const App: React.FC = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <ReduxProvider store={store}>
      <PersistGate loading={<LoadingSpinner fullScreen />} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </ReduxProvider>
  </GestureHandlerRootView>
);

export default App;
