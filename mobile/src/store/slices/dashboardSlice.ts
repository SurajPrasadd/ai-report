import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { DashboardStats, AiUsageByProject, EffortBySprint } from '../../types';
import { extractApiError } from '../../utils/helpers';

interface DashboardState {
  stats: DashboardStats | null;
  aiUsageByProject: AiUsageByProject[];
  effortBySprint: EffortBySprint[];
  resourceUtilization: unknown[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: DashboardState = {
  stats: null, aiUsageByProject: [], effortBySprint: [],
  resourceUtilization: [], isLoading: false, error: null, lastUpdated: null,
};

export const fetchDashboardStatsThunk = createAsyncThunk(
  'dashboard/fetchStats',
  async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try {
      const [statsR, projectR, sprintR, resourceR] = await Promise.all([
        api.get('/dashboard/stats', { params }),
        api.get('/dashboard/ai-usage-by-project'),
        api.get('/dashboard/effort-by-sprint'),
        api.get('/dashboard/resource-utilization'),
      ]);
      return {
        stats: statsR.data.data,
        aiUsageByProject: projectR.data.data,
        effortBySprint: sprintR.data.data,
        resourceUtilization: resourceR.data.data,
      };
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (b) => {
    b.addCase(fetchDashboardStatsThunk.pending, (s) => { s.isLoading = true; s.error = null; })
     .addCase(fetchDashboardStatsThunk.fulfilled, (s, a) => {
       s.isLoading = false;
       s.stats = a.payload.stats;
       s.aiUsageByProject = a.payload.aiUsageByProject;
       s.effortBySprint = a.payload.effortBySprint;
       s.resourceUtilization = a.payload.resourceUtilization;
       s.lastUpdated = new Date().toISOString();
     })
     .addCase(fetchDashboardStatsThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
