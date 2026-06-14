import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import employeeReducer from './slices/employeeSlice';
import sprintReducer from './slices/sprintSlice';
import jiraReducer from './slices/jiraSlice';
import aiUsageReducer from './slices/aiUsageSlice';
import dashboardReducer from './slices/dashboardSlice';
import themeReducer from './slices/themeSlice';
import offlineReducer from './slices/offlineSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  projects: projectReducer,
  employees: employeeReducer,
  sprints: sprintReducer,
  jira: jiraReducer,
  aiUsage: aiUsageReducer,
  dashboard: dashboardReducer,
  theme: themeReducer,
  offline: offlineReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'theme', 'offline'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
