import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { JiraStory, PaginationMeta } from '../../types';
import { extractApiError } from '../../utils/helpers';

interface JiraState {
  stories: JiraStory[];
  selectedStory: JiraStory | null;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
}

const initialState: JiraState = {
  stories: [], selectedStory: null, pagination: null, isLoading: false, isSyncing: false, error: null,
};

export const fetchJiraStoriesThunk = createAsyncThunk(
  'jira/fetchAll',
  async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try {
      const r = await api.get('/jira', { params });
      return r.data;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

export const fetchJiraByIdThunk = createAsyncThunk(
  'jira/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const r = await api.get(`/jira/${id}`);
      return r.data.data as JiraStory;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

export const createJiraStoryThunk = createAsyncThunk(
  'jira/create',
  async (data: Partial<JiraStory>, { rejectWithValue }) => {
    try {
      const r = await api.post('/jira', data);
      return r.data.data as JiraStory;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

export const updateJiraStoryThunk = createAsyncThunk(
  'jira/update',
  async ({ id, data }: { id: string; data: Partial<JiraStory> }, { rejectWithValue }) => {
    try {
      const r = await api.put(`/jira/${id}`, data);
      return r.data.data as JiraStory;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

export const syncJiraStoriesThunk = createAsyncThunk(
  'jira/sync',
  async (payload: { projectId: string; jiraProjectKey: string }, { rejectWithValue }) => {
    try {
      const r = await api.post('/jira/sync', payload);
      return r.data.data;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

const jiraSlice = createSlice({
  name: 'jira',
  initialState,
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (b) => {
    b.addCase(fetchJiraStoriesThunk.pending, (s) => { s.isLoading = true; })
     .addCase(fetchJiraStoriesThunk.fulfilled, (s, a) => {
       s.isLoading = false; s.stories = a.payload.data; s.pagination = a.payload.pagination ?? null;
     })
     .addCase(fetchJiraStoriesThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(fetchJiraByIdThunk.fulfilled, (s, a) => { s.selectedStory = a.payload; })
     .addCase(createJiraStoryThunk.fulfilled, (s, a) => { s.stories.unshift(a.payload); })
     .addCase(updateJiraStoryThunk.fulfilled, (s, a) => {
       const i = s.stories.findIndex(x => x.id === a.payload.id);
       if (i !== -1) s.stories[i] = a.payload;
     })
     .addCase(syncJiraStoriesThunk.pending, (s) => { s.isSyncing = true; })
     .addCase(syncJiraStoriesThunk.fulfilled, (s) => { s.isSyncing = false; })
     .addCase(syncJiraStoriesThunk.rejected, (s, a) => { s.isSyncing = false; s.error = a.payload as string; });
  },
});

export const { clearError } = jiraSlice.actions;
export default jiraSlice.reducer;
