import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gameReducer from './slices/gameSlice';
import playerReducer from './slices/playerSlice';
import socketReducer from './slices/socketSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    game: gameReducer,
    player: playerReducer,
    socket: socketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['socket/setSocket'],
        ignoredPaths: ['socket.instance'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
