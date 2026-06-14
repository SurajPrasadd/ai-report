import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { AiUsageRecord, PaginationMeta } from '../../types';
import { extractApiError } from '../../utils/helpers';

interface AiUsageState {
  records: AiUsageRecord[];
  selectedRecord: AiUsageRecord | null;
  pagination: PaginationMeta | null;
  summaryStats: Record<string, unknown> | null;
  phaseBreakdown: unknown[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AiUsageState = {
  records: [], selectedRecord: null, pagination: null,
  summaryStats: null, phaseBreakdown: [],
  isLoading: false, error: null,
};

export const fetchAiUsageThunk = createAsyncThunk(
  'aiUsage/fetchAll',
  async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try {
      const r = await api.get('/ai-usage', { params });
      return r.data;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

export const fetchAiUsageByIdThunk = createAsyncThunk(
  'aiUsage/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const r = await api.get(`/ai-usage/${id}`);
      return r.data.data as AiUsageRecord;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

export const createAiUsageThunk = createAsyncThunk(
  'aiUsage/create',
  async (data: Partial<AiUsageRecord>, { rejectWithValue }) => {
    try {
      const r = await api.post('/ai-usage', data);
      return r.data.data as AiUsageRecord;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

export const updateAiUsageThunk = createAsyncThunk(
  'aiUsage/update',
  async ({ id, data }: { id: string; data: Partial<AiUsageRecord> }, { rejectWithValue }) => {
    try {
      const r = await api.put(`/ai-usage/${id}`, data);
      return r.data.data as AiUsageRecord;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

export const deleteAiUsageThunk = createAsyncThunk(
  'aiUsage/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/ai-usage/${id}`);
      return id;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

export const fetchAiSummaryStatsThunk = createAsyncThunk(
  'aiUsage/summaryStats',
  async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try {
      const r = await api.get('/ai-usage/stats/summary', { params });
      return r.data.data;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

export const fetchPhaseBreakdownThunk = createAsyncThunk(
  'aiUsage/phaseBreakdown',
  async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try {
      const r = await api.get('/ai-usage/stats/by-phase', { params });
      return r.data.data;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

const aiUsageSlice = createSlice({
  name: 'aiUsage',
  initialState,
  reducers: { clearError: (s) => { s.error = null; }, clearSelected: (s) => { s.selectedRecord = null; } },
  extraReducers: (b) => {
    b.addCase(fetchAiUsageThunk.pending, (s) => { s.isLoading = true; })
     .addCase(fetchAiUsageThunk.fulfilled, (s, a) => {
       s.isLoading = false; s.records = a.payload.data; s.pagination = a.payload.pagination ?? null;
     })
     .addCase(fetchAiUsageThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(fetchAiUsageByIdThunk.fulfilled, (s, a) => { s.selectedRecord = a.payload; })
     .addCase(createAiUsageThunk.fulfilled, (s, a) => { s.records.unshift(a.payload); })
     .addCase(updateAiUsageThunk.fulfilled, (s, a) => {
       const i = s.records.findIndex(x => x.id === a.payload.id);
       if (i !== -1) s.records[i] = a.payload;
       if (s.selectedRecord?.id === a.payload.id) s.selectedRecord = a.payload;
     })
     .addCase(deleteAiUsageThunk.fulfilled, (s, a) => { s.records = s.records.filter(x => x.id !== a.payload); })
     .addCase(fetchAiSummaryStatsThunk.fulfilled, (s, a) => { s.summaryStats = a.payload; })
     .addCase(fetchPhaseBreakdownThunk.fulfilled, (s, a) => { s.phaseBreakdown = a.payload; });
  },
});

export const { clearError, clearSelected } = aiUsageSlice.actions;
export default aiUsageSlice.reducer;
