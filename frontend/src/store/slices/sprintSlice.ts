import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';
import { Sprint, PaginationMeta } from '@/types';
import { extractApiError } from '@/utils/helpers';

interface State { sprints: Sprint[]; selected: Sprint | null; pagination: PaginationMeta | null; isLoading: boolean; error: string | null; }
const init: State = { sprints: [], selected: null, pagination: null, isLoading: false, error: null };

export const fetchSprintsThunk = createAsyncThunk('sprints/fetchAll',
  async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try { return (await api.get('/sprints', { params })).data; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

export const createSprintThunk = createAsyncThunk('sprints/create',
  async (data: Partial<Sprint>, { rejectWithValue }) => {
    try { return (await api.post('/sprints', data)).data.data as Sprint; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

export const updateSprintThunk = createAsyncThunk('sprints/update',
  async ({ id, data }: { id: string; data: Partial<Sprint> }, { rejectWithValue }) => {
    try { return (await api.put(`/sprints/${id}`, data)).data.data as Sprint; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

export const deleteSprintThunk = createAsyncThunk('sprints/delete',
  async (id: string, { rejectWithValue }) => {
    try { await api.delete(`/sprints/${id}`); return id; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

const slice = createSlice({
  name: 'sprints', initialState: init,
  reducers: { clearError: s => { s.error = null; }, clearSelected: s => { s.selected = null; } },
  extraReducers: b => {
    b.addCase(fetchSprintsThunk.pending, s => { s.isLoading = true; })
     .addCase(fetchSprintsThunk.fulfilled, (s, a) => { s.isLoading = false; s.sprints = a.payload.data; s.pagination = a.payload.pagination ?? null; })
     .addCase(fetchSprintsThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(createSprintThunk.fulfilled, (s, a) => { s.sprints.unshift(a.payload); })
     .addCase(updateSprintThunk.fulfilled, (s, a) => { const i = s.sprints.findIndex(x => x.id === a.payload.id); if (i !== -1) s.sprints[i] = a.payload; })
     .addCase(deleteSprintThunk.fulfilled, (s, a) => { s.sprints = s.sprints.filter(x => x.id !== a.payload); });
  },
});
export const { clearError, clearSelected } = slice.actions;
export default slice.reducer;
