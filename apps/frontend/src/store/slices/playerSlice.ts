import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Captain {
  name: string;
  stats: {
    cunning: number;
    bravery: number;
    charisma: number;
    seamanship: number;
  };
  specialization: string;
}

interface Ship {
  id: string;
  name: string;
  stats: {
    baseSpeed: number;
    durability: { current: number; max: number };
    cannons: number;
    masts: { count: number; condition: number[] };
    cargoCapacity: number;
    crewCapacity: number;
  };
  crew: {
    current: number;
    morale: number;
    specialists: any[];
  };
  cargo: any[];
  condition: Record<string, any>;
}

export interface PlayerState {
  id: string | null;
  userId: string | null;
  gameId: string | null;
  captain: Captain | null;
  ship: Ship | null;
  reputation: {
    military: number;
    trading: number;
    pirate: number;
  };
  gold: number;
  position: { x: number; y: number; region: number } | null;
  actionPoints: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: PlayerState = {
  id: null,
  userId: null,
  gameId: null,
  captain: null,
  ship: null,
  reputation: {
    military: 0,
    trading: 0,
    pirate: 0,
  },
  gold: 150,
  position: null,
  actionPoints: 3,
  isLoading: false,
  error: null,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlayer: (state, action: PayloadAction<Partial<PlayerState>>) => {
      Object.assign(state, action.payload);
    },
    setPlayerLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setPlayerError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateGold: (state, action: PayloadAction<number>) => {
      state.gold = action.payload;
    },
    updatePosition: (state, action: PayloadAction<{ x: number; y: number; region: number }>) => {
      state.position = action.payload;
    },
    updateReputation: (state, action: PayloadAction<{ type: keyof PlayerState['reputation']; value: number }>) => {
      if (state.reputation) {
        state.reputation[action.payload.type] = action.payload.value;
      }
    },
    updateActionPoints: (state, action: PayloadAction<number>) => {
      state.actionPoints = action.payload;
    },
    updateShip: (state, action: PayloadAction<Partial<Ship>>) => {
      if (state.ship) {
        Object.assign(state.ship, action.payload);
      }
    },
    resetPlayer: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setPlayer,
  setPlayerLoading,
  setPlayerError,
  updateGold,
  updatePosition,
  updateReputation,
  updateActionPoints,
  updateShip,
  resetPlayer,
} = playerSlice.actions;

export default playerSlice.reducer;
