import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Socket } from 'socket.io-client';

export interface SocketState {
  instance: Socket | null;
  connected: boolean;
  connectionError: string | null;
  lastMessage: any;
}

const initialState: SocketState = {
  instance: null,
  connected: false,
  connectionError: null,
  lastMessage: null,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setSocket: (state, action: PayloadAction<Socket | null>) => {
      // Use return to avoid immer issues with non-serializable data
      return {
        ...state,
        instance: action.payload,
      };
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
      if (action.payload) {
        state.connectionError = null;
      }
    },
    setConnectionError: (state, action: PayloadAction<string | null>) => {
      state.connectionError = action.payload;
    },
    setLastMessage: (state, action: PayloadAction<any>) => {
      state.lastMessage = action.payload;
    },
    resetSocket: () => {
      return initialState;
    },
  },
});

export const {
  setSocket,
  setConnected,
  setConnectionError,
  setLastMessage,
  resetSocket,
} = socketSlice.actions;

export default socketSlice.reducer;
