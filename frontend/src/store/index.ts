import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import projectReducer from './slices/projectSlice';
import employeeReducer from './slices/employeeSlice';
import sprintReducer from './slices/sprintSlice';
import jiraReducer from './slices/jiraSlice';
import aiUsageReducer from './slices/aiUsageSlice';
import dashboardReducer from './slices/dashboardSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  projects: projectReducer,
  employees: employeeReducer,
  sprints: sprintReducer,
  jira: jiraReducer,
  aiUsage: aiUsageReducer,
  dashboard: dashboardReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: gDM => gDM({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
