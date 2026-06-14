import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';
import { JiraStory, PaginationMeta } from '@/types';
import { extractApiError } from '@/utils/helpers';

interface State { stories: JiraStory[]; selected: JiraStory | null; pagination: PaginationMeta | null; isLoading: boolean; isSyncing: boolean; error: string | null; }
const init: State = { stories: [], selected: null, pagination: null, isLoading: false, isSyncing: false, error: null };

export const fetchJiraStoriesThunk = createAsyncThunk('jira/fetchAll',
  async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try { return (await api.get('/jira', { params })).data; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

export const fetchJiraByIdThunk = createAsyncThunk('jira/fetchById',
  async (id: string, { rejectWithValue }) => {
    try { return (await api.get(`/jira/${id}`)).data.data as JiraStory; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

export const createJiraStoryThunk = createAsyncThunk('jira/create',
  async (data: Partial<JiraStory>, { rejectWithValue }) => {
    try { return (await api.post('/jira', data)).data.data as JiraStory; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

export const updateJiraStoryThunk = createAsyncThunk('jira/update',
  async ({ id, data }: { id: string; data: Partial<JiraStory> }, { rejectWithValue }) => {
    try { return (await api.put(`/jira/${id}`, data)).data.data as JiraStory; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

export const syncJiraThunk = createAsyncThunk('jira/sync',
  async (payload: { projectId: string; jiraProjectKey: string }, { rejectWithValue }) => {
    try { return (await api.post('/jira/sync', payload)).data.data; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

const slice = createSlice({
  name: 'jira', initialState: init,
  reducers: { clearError: s => { s.error = null; }, clearSelected: s => { s.selected = null; } },
  extraReducers: b => {
    b.addCase(fetchJiraStoriesThunk.pending, s => { s.isLoading = true; })
     .addCase(fetchJiraStoriesThunk.fulfilled, (s, a) => { s.isLoading = false; s.stories = a.payload.data; s.pagination = a.payload.pagination ?? null; })
     .addCase(fetchJiraStoriesThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(fetchJiraByIdThunk.fulfilled, (s, a) => { s.selected = a.payload; })
     .addCase(createJiraStoryThunk.fulfilled, (s, a) => { s.stories.unshift(a.payload); })
     .addCase(updateJiraStoryThunk.fulfilled, (s, a) => { const i = s.stories.findIndex(x => x.id === a.payload.id); if (i !== -1) s.stories[i] = a.payload; })
     .addCase(syncJiraThunk.pending, s => { s.isSyncing = true; })
     .addCase(syncJiraThunk.fulfilled, s => { s.isSyncing = false; })
     .addCase(syncJiraThunk.rejected, (s, a) => { s.isSyncing = false; s.error = a.payload as string; });
  },
});
export const { clearError, clearSelected } = slice.actions;
export default slice.reducer;
