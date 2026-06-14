import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';
import { DashboardStats, AiUsageByProject, EffortBySprint, ResourceUtilization } from '@/types';
import { extractApiError } from '@/utils/helpers';

interface State {
  stats: DashboardStats | null; aiByProject: AiUsageByProject[];
  effortBySprint: EffortBySprint[]; resourceUtil: ResourceUtilization[];
  isLoading: boolean; error: string | null; lastUpdated: string | null;
}
const init: State = { stats: null, aiByProject: [], effortBySprint: [], resourceUtil: [], isLoading: false, error: null, lastUpdated: null };

export const fetchDashboardThunk = createAsyncThunk('dashboard/fetchAll',
  async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try {
      const [s, p, sp, r] = await Promise.all([
        api.get('/dashboard/stats', { params }),
        api.get('/dashboard/ai-usage-by-project'),
        api.get('/dashboard/effort-by-sprint'),
        api.get('/dashboard/resource-utilization'),
      ]);
      return { stats: s.data.data, aiByProject: p.data.data, effortBySprint: sp.data.data, resourceUtil: r.data.data };
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  });

const slice = createSlice({
  name: 'dashboard', initialState: init,
  reducers: { clearError: s => { s.error = null; } },
  extraReducers: b => {
    b.addCase(fetchDashboardThunk.pending, s => { s.isLoading = true; s.error = null; })
     .addCase(fetchDashboardThunk.fulfilled, (s, a) => {
       s.isLoading = false; s.stats = a.payload.stats; s.aiByProject = a.payload.aiByProject;
       s.effortBySprint = a.payload.effortBySprint; s.resourceUtil = a.payload.resourceUtil;
       s.lastUpdated = new Date().toISOString();
     })
     .addCase(fetchDashboardThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
  },
});
export const { clearError } = slice.actions;
export default slice.reducer;
