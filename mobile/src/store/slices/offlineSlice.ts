import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OfflineAction {
  id: string;
  type: string;
  endpoint: string;
  method: string;
  data: unknown;
  timestamp: string;
}

interface OfflineState {
  isOnline: boolean;
  pendingActions: OfflineAction[];
}

const initialState: OfflineState = { isOnline: true, pendingActions: [] };

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    addPendingAction: (state, action: PayloadAction<OfflineAction>) => {
      state.pendingActions.push(action.payload);
    },
    removePendingAction: (state, action: PayloadAction<string>) => {
      state.pendingActions = state.pendingActions.filter(a => a.id !== action.payload);
    },
    clearPendingActions: (state) => { state.pendingActions = []; },
  },
});

export const { setOnlineStatus, addPendingAction, removePendingAction, clearPendingActions } = offlineSlice.actions;
export default offlineSlice.reducer;
