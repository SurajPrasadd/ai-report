import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Project, PaginationMeta } from '../../types';
import { extractApiError } from '../../utils/helpers';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  filters: { search?: string; status?: string; page: number; limit: number };
}

const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  pagination: null,
  isLoading: false,
  error: null,
  filters: { page: 1, limit: 10 },
};

export const fetchProjectsThunk = createAsyncThunk(
  'projects/fetchAll',
  async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/projects', { params });
      return response.data;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

export const fetchProjectByIdThunk = createAsyncThunk(
  'projects/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data.data as Project;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

export const createProjectThunk = createAsyncThunk(
  'projects/create',
  async (data: Partial<Project>, { rejectWithValue }) => {
    try {
      const response = await api.post('/projects', data);
      return response.data.data as Project;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

export const updateProjectThunk = createAsyncThunk(
  'projects/update',
  async ({ id, data }: { id: string; data: Partial<Project> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${id}`, data);
      return response.data.data as Project;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

export const deleteProjectThunk = createAsyncThunk(
  'projects/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${id}`);
      return id;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setFilters: (state, action: PayloadAction<Partial<ProjectState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedProject: (state) => { state.selectedProject = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectsThunk.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchProjectsThunk.fulfilled, (s, a) => {
        s.isLoading = false;
        s.projects = a.payload.data;
        s.pagination = a.payload.pagination ?? null;
      })
      .addCase(fetchProjectsThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })

      .addCase(fetchProjectByIdThunk.fulfilled, (s, a) => { s.selectedProject = a.payload; })

      .addCase(createProjectThunk.fulfilled, (s, a) => { s.projects.unshift(a.payload); })

      .addCase(updateProjectThunk.fulfilled, (s, a) => {
        const idx = s.projects.findIndex(p => p.id === a.payload.id);
        if (idx !== -1) s.projects[idx] = a.payload;
        if (s.selectedProject?.id === a.payload.id) s.selectedProject = a.payload;
      })

      .addCase(deleteProjectThunk.fulfilled, (s, a) => {
        s.projects = s.projects.filter(p => p.id !== a.payload);
      });
  },
});

export const { clearError, setFilters, clearSelectedProject } = projectSlice.actions;
export default projectSlice.reducer;
