/**
 * 遊戲狀態類型定義
 */
export interface GameState {
  players: Player[];
  cards: Card[];
  // currentTurn: string;
  gamePhase: GamePhase;
  // 可以根據實際需求擴展更多屬性
}

export type GamePhase = 'waiting' | 'playing' ;

export interface Player {
  id: string;
  name: string;
  chips: number;
  cards?: Card[];
  isActive: boolean;
  position: number; // 玩家在牌桌上的位置
  // 其他玩家相關屬性
}

export interface Card {
  id: string;
  suit?: string;
  value?: string;
  isVisible: boolean;
  ownerId?: string; // 擁有此牌的玩家ID
  position?: { x: number, y: number }; // 牌在桌面上的位置
}

/**
 * 玩家操作類型定義
 */
export interface PlayerAction {
  type: ActionType;
  playerId: string;
  gameId: string;
  data?: any; // 根據不同操作類型可能包含不同的數據
}

export type ActionType = 'bet' | 'fold' | 'check' | 'call' | 'raise' | 'all-in' | 'ready';