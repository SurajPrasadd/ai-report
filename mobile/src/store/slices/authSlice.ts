import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import EncryptedStorage from 'react-native-encrypted-storage';
import api from '../../services/api';
import { AuthState, User } from '../../types';
import { extractApiError } from '../../utils/helpers';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: { employeeId: string; email: string; password: string; rememberMe?: boolean }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { accessToken, refreshToken, user } = response.data.data;

      await EncryptedStorage.setItem('access_token', accessToken);
      await EncryptedStorage.setItem('refresh_token', refreshToken);
      await EncryptedStorage.setItem('user_data', JSON.stringify(user));

      return { accessToken, refreshToken, user };
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;
      await api.post('/auth/logout', { refreshToken });
    } catch {} finally {
      await EncryptedStorage.clear();
    }
  }
);

export const refreshProfileThunk = createAsyncThunk(
  'auth/refreshProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/profile');
      return response.data.data as User;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const restoreSessionThunk = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const [accessToken, refreshToken, userStr] = await Promise.all([
        EncryptedStorage.getItem('access_token'),
        EncryptedStorage.getItem('refresh_token'),
        EncryptedStorage.getItem('user_data'),
      ]);

      if (!accessToken || !userStr) return null;
      const user = JSON.parse(userStr) as User;
      return { accessToken, refreshToken, user };
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setUser: (state, action: PayloadAction<User>) => { state.user = action.payload; },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    });
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logoutThunk.fulfilled, (state) => {
      Object.assign(state, initialState);
    });

    // Restore session
    builder.addCase(restoreSessionThunk.fulfilled, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken ?? null;
      }
    });

    // Refresh profile
    builder.addCase(refreshProfileThunk.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
