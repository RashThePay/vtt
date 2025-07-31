import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface GameState {
  id: string | null;
  name: string;
  status: 'SETUP' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  currentRound: number;
  currentPhase: 'WIND' | 'PLANNING' | 'MOVEMENT' | 'ACTION' | 'MAINTENANCE';
  settings: Record<string, any>;
  players: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GameState = {
  id: null,
  name: '',
  status: 'SETUP',
  currentRound: 1,
  currentPhase: 'WIND',
  settings: {},
  players: [],
  isLoading: false,
  error: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGame: (state, action: PayloadAction<Partial<GameState>>) => {
      Object.assign(state, action.payload);
    },
    setGameLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setGameError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateGamePhase: (state, action: PayloadAction<GameState['currentPhase']>) => {
      state.currentPhase = action.payload;
    },
    updateGameRound: (state, action: PayloadAction<number>) => {
      state.currentRound = action.payload;
    },
    addPlayer: (state, action: PayloadAction<any>) => {
      state.players.push(action.payload);
    },
    removePlayer: (state, action: PayloadAction<string>) => {
      state.players = state.players.filter(player => player.id !== action.payload);
    },
    resetGame: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setGame,
  setGameLoading,
  setGameError,
  updateGamePhase,
  updateGameRound,
  addPlayer,
  removePlayer,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;
