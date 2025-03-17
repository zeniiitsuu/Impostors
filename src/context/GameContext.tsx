import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export type Player = {
  id: string;
  name: string;
  isImpostor: boolean;
  isAlive: boolean;
  hasVoted: boolean;
};

export type GamePhase = 'lobby' | 'role_reveal' | 'number_input' | 'discussion' | 'voting' | 'results';

type GameState = {
  players: Player[];
  currentPhase: GamePhase;
  timeRemaining: number;
  question: string | null;
  answers: Record<string, string>;
  votes: Record<string, string>;
  roomId: string | null;
  roomName: string | null;
  playerLimit: number;
  chatMessages: Array<{playerId: string, message: string}>;
  gameMode: 'quickplay' | 'deathmatch';
  eliminatedMessage: string | null;
};

type GameAction =
  | { type: 'JOIN_GAME'; player: Player }
  | { type: 'START_GAME'; roomId: string; roomName: string; playerLimit: number; gameMode: 'quickplay' | 'deathmatch'; theme?: 'numbers' | 'colors' }
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'SET_QUESTION'; question: string }
  | { type: 'SUBMIT_ANSWER'; playerId: string; answer: string }
  | { type: 'SUBMIT_VOTE'; voterId: string; targetId: string }
  | { type: 'UPDATE_TIMER'; time: number }
  | { type: 'ELIMINATE_PLAYER'; playerId: string; message?: string }
  | { type: 'REVEAL_ANSWERS' }
  | { type: 'UPDATE_PLAYERS'; players: Player[] }
  | { type: 'SEND_MESSAGE'; playerId: string; message: string }
  | { type: 'REMOVE_PLAYER'; playerId: string }
  | { type: 'CLEAR_GAME' }
  | { type: 'CHECK_WIN_CONDITION' };

const initialState: GameState = {
  players: [],
  currentPhase: 'lobby',
  timeRemaining: 0,
  question: null,
  answers: {},
  votes: {},
  roomId: null,
  roomName: null,
  playerLimit: 10, // Default max players
  chatMessages: [],
  gameMode: 'quickplay',
  eliminatedMessage: null,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'REVEAL_ANSWERS':
      return {
        ...state,
        currentPhase: 'discussion',
        timeRemaining: getPhaseTime('discussion')
      };
    case 'JOIN_GAME':
      // Check if player with this ID already exists to prevent duplication
      const playerExists = state.players.some(player => player.id === action.player.id);
      // Check if player with this name already exists to prevent duplicate names
      const nameExists = state.players.some(player => 
        player.name.toLowerCase() === action.player.name.toLowerCase() && 
        player.id !== action.player.id
      );
      
      if (playerExists) {
        return state; // Don't add the player if they already exist
      }
      
      if (nameExists) {
        // Return current state if name already exists (will prevent joining)
        // The UI layer should handle this case and show an error message
        return state;
      }
      
      return {
        ...state,
        players: [...state.players, action.player],
      };
    case 'UPDATE_PLAYERS':
      return {
        ...state,
        players: action.players,
      };
    case 'START_GAME':
      console.log('START_GAME action received with gameMode:', action.gameMode);
      const newState = {
        ...state,
        roomId: action.roomId,
        roomName: action.roomName,
        playerLimit: action.playerLimit,
        gameMode: action.gameMode || 'quickplay',
        // Don't change the phase here, let the explicit SET_PHASE action handle that
        timeRemaining: 0,
      };
      console.log('Game state after START_GAME:', newState.gameMode);
      return newState;
    case 'SET_PHASE':
      // When transitioning to lobby, reset game state
      if (action.phase === 'lobby') {
        // Reset player states when returning to lobby
        const resetPlayers = state.players.map(player => ({
          ...player,
          isAlive: true, // Reset elimination status
          hasVoted: false
        }));
        
        return {
          ...state,
          currentPhase: action.phase,
          timeRemaining: getPhaseTime(action.phase),
          answers: {},
          votes: {},
          question: null,
          players: resetPlayers,
          eliminatedMessage: null, // Reset elimination message
          // Keep roomId, roomName, and playerLimit
        };
      }
      return {
        ...state,
        currentPhase: action.phase,
        timeRemaining: getPhaseTime(action.phase),
      };
    case 'SET_QUESTION':
      return {
        ...state,
        question: action.question,
        answers: {},
      };
    case 'SUBMIT_ANSWER':
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.playerId]: action.answer,
        },
      };
    case 'SUBMIT_VOTE':
      return {
        ...state,
        votes: {
          ...state.votes,
          [action.voterId]: action.targetId,
        },
      };
    case 'UPDATE_TIMER':
      return {
        ...state,
        timeRemaining: action.time,
      };
    case 'ELIMINATE_PLAYER':
      const eliminatedPlayer = state.players.find(player => player.id === action.playerId);
      const eliminatedMessage = action.message || null;
      
      // Check win condition for Deathmatch mode
      const updatedPlayers = state.players.map(player =>
        player.id === action.playerId
          ? { ...player, isAlive: false }
          : player
      );
      
      return {
        ...state,
        players: updatedPlayers,
        eliminatedMessage: eliminatedMessage,
      };
      
    case 'CHECK_WIN_CONDITION':
      // For Deathmatch mode
      if (state.gameMode === 'deathmatch') {
        const alivePlayers = state.players.filter(player => player.isAlive);
        const aliveImpostor = alivePlayers.find(player => player.isImpostor);
        const aliveCrewMembers = alivePlayers.filter(player => !player.isImpostor);
        
        // Game is over in these conditions:
        // 1. The impostor was eliminated (crew wins)
        // 2. Only the impostor and one crew member remain (impostor wins)
        // 3. All crew members are eliminated (impostor wins)
        const gameOver = (!aliveImpostor) || 
                        (aliveImpostor && alivePlayers.length === 2) ||
                        (aliveImpostor && aliveCrewMembers.length === 0);
        
        if (gameOver) {
          return {
            ...state,
            currentPhase: 'results',
            timeRemaining: getPhaseTime('results'),
          };
        }
      }
      
      return state;
    case 'SEND_MESSAGE':
      return {
        ...state,
        chatMessages: [...state.chatMessages, { playerId: action.playerId, message: action.message }],
      };
    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter(player => player.id !== action.playerId),
      };
    case 'CLEAR_GAME':
      return {
        ...initialState
      };
    default:
      return state;
  }
};

const getPhaseTime = (phase: GamePhase): number => {
  switch (phase) {
    case 'role_reveal':
      return 10; // 10 seconds for role reveal
    case 'number_input':
      return 30; // 30 seconds for number input
    case 'discussion':
      return 60; // 60 seconds (1 minute) for discussion
    case 'voting':
      return 30; // 30 seconds for voting
    case 'results':
      return 10; // 10 seconds to show results
    default:
      return 0;
  }
};

type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};