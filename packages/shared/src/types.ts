// Game Types
export interface Game {
  id: string;
  name: string;
  gmId: string;
  status: 'SETUP' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  currentRound: number;
  currentPhase: 'WIND' | 'PLANNING' | 'MOVEMENT' | 'ACTION' | 'MAINTENANCE';
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Player Types
export interface Player {
  id: string;
  gameId: string;
  userId: string;
  captainName: string;
  captainStats: CaptainStats;
  reputation: Reputation;
  gold: number;
  position: Position;
  createdAt: Date;
}

export interface CaptainStats {
  cunning: number;
  bravery: number;
  charisma: number;
  seamanship: number;
}

export interface Reputation {
  military: number;
  trading: number;
  pirate: number;
}

export interface Position {
  x: number;
  y: number;
  region: number;
}

// Ship Types
export interface Ship {
  id: string;
  playerId: string;
  name: string;
  stats: ShipStats;
  cargo: CargoItem[];
  crew: CrewInfo;
  condition: ShipCondition;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipStats {
  baseSpeed: number;
  durability: { current: number; max: number };
  cannons: number;
  masts: { count: number; condition: number[] };
  cargoCapacity: number;
  crewCapacity: number;
}

export interface CargoItem {
  type: string;
  quantity: number;
}

export interface CrewInfo {
  current: number;
  morale: number;
  specialists: CrewSpecialist[];
}

export interface CrewSpecialist {
  type: string;
  experience: 'novice' | 'veteran' | 'expert';
}

export interface ShipCondition {
  hull: number; // 0-100
  sails: number; // 0-100
  [key: string]: any;
}

// Market Types
export interface Market {
  id: string;
  gameId: string;
  locationId: string;
  goodsPrices: Record<string, number>;
  supplyLevels: Record<string, 'low' | 'normal' | 'high'>;
  updatedAt: Date;
}

// Mission Types
export interface Mission {
  id: string;
  gameId: string;
  title: string;
  description: string;
  requirements: MissionRequirements;
  rewards: MissionRewards;
  status: 'AVAILABLE' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  assignedToId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MissionRequirements {
  minReputation?: Partial<Reputation>;
  timeLimit?: number;
  startLocation?: string;
  [key: string]: any;
}

export interface MissionRewards {
  gold?: number;
  reputation?: Partial<Reputation>;
  special?: any;
}

// Socket Event Types
export interface SocketEvents {
  // Client to Server
  'join-game': { gameId: string; playerId: string };
  'submit-action': { action: GameAction };
  'roll-dice': { rollRequest: DiceRoll };
  'update-position': { position: Position };
  test: { message: string };
  
  // Server to Client
  'game-update': { gameState: Partial<Game> };
  'player-update': { playerState: Partial<Player> };
  'action-result': { result: ActionResult };
  'dice-result': { result: DiceResult };
  'test-response': { message: string; data: any };
}

// Game Action Types
export interface GameAction {
  type: 'move' | 'trade' | 'combat' | 'explore' | 'repair';
  playerId: string;
  data: any;
  timestamp: Date;
}

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

// Dice Types
export interface DiceRoll {
  type: 'navigation' | 'combat' | 'trade' | 'custom';
  modifiers: Record<string, number>;
  reason: string;
}

export interface DiceResult {
  roll: number | number[];
  modifiers: Record<string, number>;
  total: number;
  success: boolean;
  timestamp: Date;
}
