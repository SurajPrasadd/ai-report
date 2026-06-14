import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';
import { Project, PaginationMeta } from '@/types';
import { extractApiError } from '@/utils/helpers';

interface ProjectState {
  projects: Project[]; selected: Project | null;
  pagination: PaginationMeta | null; isLoading: boolean; error: string | null;
}
const init: ProjectState = { projects: [], selected: null, pagination: null, isLoading: false, error: null };

export const fetchProjectsThunk = createAsyncThunk('projects/fetchAll',
  async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try { return (await api.get('/projects', { params })).data; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

export const fetchProjectByIdThunk = createAsyncThunk('projects/fetchById',
  async (id: string, { rejectWithValue }) => {
    try { return (await api.get(`/projects/${id}`)).data.data as Project; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

export const createProjectThunk = createAsyncThunk('projects/create',
  async (data: Partial<Project>, { rejectWithValue }) => {
    try { return (await api.post('/projects', data)).data.data as Project; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

export const updateProjectThunk = createAsyncThunk('projects/update',
  async ({ id, data }: { id: string; data: Partial<Project> }, { rejectWithValue }) => {
    try { return (await api.put(`/projects/${id}`, data)).data.data as Project; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

export const deleteProjectThunk = createAsyncThunk('projects/delete',
  async (id: string, { rejectWithValue }) => {
    try { await api.delete(`/projects/${id}`); return id; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

const slice = createSlice({
  name: 'projects', initialState: init,
  reducers: { clearError: s => { s.error = null; }, clearSelected: s => { s.selected = null; } },
  extraReducers: b => {
    b.addCase(fetchProjectsThunk.pending, s => { s.isLoading = true; s.error = null; })
     .addCase(fetchProjectsThunk.fulfilled, (s, a) => { s.isLoading = false; s.projects = a.payload.data; s.pagination = a.payload.pagination ?? null; })
     .addCase(fetchProjectsThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(fetchProjectByIdThunk.fulfilled, (s, a) => { s.selected = a.payload; })
     .addCase(createProjectThunk.fulfilled, (s, a) => { s.projects.unshift(a.payload); })
     .addCase(updateProjectThunk.fulfilled, (s, a) => {
       const i = s.projects.findIndex(p => p.id === a.payload.id);
       if (i !== -1) s.projects[i] = a.payload;
       if (s.selected?.id === a.payload.id) s.selected = a.payload;
     })
     .addCase(deleteProjectThunk.fulfilled, (s, a) => { s.projects = s.projects.filter(p => p.id !== a.payload); });
  },
});
export const { clearError, clearSelected } = slice.actions;
export default slice.reducer;
