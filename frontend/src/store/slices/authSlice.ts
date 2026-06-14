import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';
import { AuthState, User } from '@/types';
import { extractApiError } from '@/utils/helpers';

const initialState: AuthState = {
  user: null, accessToken: null, refreshToken: null,
  isAuthenticated: false, isLoading: false, error: null,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (creds: { employeeId: string; email: string; password: string; rememberMe?: boolean }, { rejectWithValue }) => {
    try {
      const r = await api.post('/auth/login', creds);
      const { accessToken, refreshToken, user } = r.data.data;
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user_data', JSON.stringify(user));
      return { accessToken, refreshToken, user };
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async (_, { getState }) => {
  try {
    const state = getState() as { auth: AuthState };
    await api.post('/auth/logout', { refreshToken: state.auth.refreshToken });
  } catch {}
  localStorage.clear();
});

export const restoreSessionThunk = createAsyncThunk('auth/restore', async () => {
  const token = localStorage.getItem('access_token');
  const userStr = localStorage.getItem('user_data');
  const refreshToken = localStorage.getItem('refresh_token');
  if (!token || !userStr) return null;
  return { accessToken: token, refreshToken, user: JSON.parse(userStr) as User };
});

export const refreshProfileThunk = createAsyncThunk('auth/refreshProfile', async (_, { rejectWithValue }) => {
  try {
    const r = await api.get('/auth/profile');
    return r.data.data as User;
  } catch (e) { return rejectWithValue(extractApiError(e)); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: s => { s.error = null; },
    setUser: (s, a: PayloadAction<User>) => { s.user = a.payload; },
  },
  extraReducers: b => {
    b.addCase(loginThunk.pending, s => { s.isLoading = true; s.error = null; })
     .addCase(loginThunk.fulfilled, (s, a) => {
       s.isLoading = false; s.isAuthenticated = true;
       s.user = a.payload.user; s.accessToken = a.payload.accessToken;
       s.refreshToken = a.payload.refreshToken;
     })
     .addCase(loginThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(logoutThunk.fulfilled, s => { Object.assign(s, initialState); })
     .addCase(restoreSessionThunk.fulfilled, (s, a) => {
       if (a.payload) {
         s.isAuthenticated = true; s.user = a.payload.user;
         s.accessToken = a.payload.accessToken; s.refreshToken = a.payload.refreshToken;
       }
     })
     .addCase(refreshProfileThunk.fulfilled, (s, a) => { s.user = a.payload; });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
