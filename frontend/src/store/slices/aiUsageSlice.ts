import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';
import { AiUsageRecord, PaginationMeta } from '@/types';
import { extractApiError } from '@/utils/helpers';

interface State {
  records: AiUsageRecord[]; selected: AiUsageRecord | null;
  pagination: PaginationMeta | null; summaryStats: Record<string, unknown> | null;
  phaseBreakdown: unknown[]; isLoading: boolean; error: string | null;
}
const init: State = { records: [], selected: null, pagination: null, summaryStats: null, phaseBreakdown: [], isLoading: false, error: null };

export const fetchAiUsageThunk = createAsyncThunk('aiUsage/fetchAll',
  async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try { return (await api.get('/ai-usage', { params })).data; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

export const fetchAiUsageByIdThunk = createAsyncThunk('aiUsage/fetchById',
  async (id: string, { rejectWithValue }) => {
    try { return (await api.get(`/ai-usage/${id}`)).data.data as AiUsageRecord; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

export const createAiUsageThunk = createAsyncThunk('aiUsage/create',
  async (data: Partial<AiUsageRecord>, { rejectWithValue }) => {
    try { return (await api.post('/ai-usage', data)).data.data as AiUsageRecord; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

export const updateAiUsageThunk = createAsyncThunk('aiUsage/update',
  async ({ id, data }: { id: string; data: Partial<AiUsageRecord> }, { rejectWithValue }) => {
    try { return (await api.put(`/ai-usage/${id}`, data)).data.data as AiUsageRecord; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

export const deleteAiUsageThunk = createAsyncThunk('aiUsage/delete',
  async (id: string, { rejectWithValue }) => {
    try { await api.delete(`/ai-usage/${id}`); return id; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

export const fetchAiSummaryThunk = createAsyncThunk('aiUsage/summary',
  async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try { return (await api.get('/ai-usage/stats/summary', { params })).data.data; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

export const fetchPhaseBreakdownThunk = createAsyncThunk('aiUsage/phases',
  async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try { return (await api.get('/ai-usage/stats/by-phase', { params })).data.data; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

const slice = createSlice({
  name: 'aiUsage', initialState: init,
  reducers: { clearError: s => { s.error = null; }, clearSelected: s => { s.selected = null; } },
  extraReducers: b => {
    b.addCase(fetchAiUsageThunk.pending, s => { s.isLoading = true; })
     .addCase(fetchAiUsageThunk.fulfilled, (s, a) => { s.isLoading = false; s.records = a.payload.data; s.pagination = a.payload.pagination ?? null; })
     .addCase(fetchAiUsageThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(fetchAiUsageByIdThunk.fulfilled, (s, a) => { s.selected = a.payload; })
     .addCase(createAiUsageThunk.fulfilled, (s, a) => { s.records.unshift(a.payload); })
     .addCase(updateAiUsageThunk.fulfilled, (s, a) => { const i = s.records.findIndex(x => x.id === a.payload.id); if (i !== -1) s.records[i] = a.payload; if (s.selected?.id === a.payload.id) s.selected = a.payload; })
     .addCase(deleteAiUsageThunk.fulfilled, (s, a) => { s.records = s.records.filter(x => x.id !== a.payload); })
     .addCase(fetchAiSummaryThunk.fulfilled, (s, a) => { s.summaryStats = a.payload; })
     .addCase(fetchPhaseBreakdownThunk.fulfilled, (s, a) => { s.phaseBreakdown = a.payload; });
  },
});
export const { clearError, clearSelected } = slice.actions;
export default slice.reducer;
