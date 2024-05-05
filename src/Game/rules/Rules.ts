import { Move } from '../../types';
import { GameState } from '../GameState';

export interface RulesContext {
  /**
   * Current game state.
   */
  gameState: GameState;

  /**
   * Previous game states.
   */
  previousGameStates?: GameState[];

  /**
   * Komi value for scoring.
   */
  komi?: number;
}

export interface Rules {
  /**
   * Name of the rules. If specified it can be used in SGF.
   */
  readonly name?: string;

  /**
   * Check if the move is valid according to the rules in the specified context (usually current game position
   * and previous positions for KO detection).
   */
  isValidMove(move: Move, context: RulesContext): boolean;

  // TODO: in future add method for scoring. And maybe handle draws somehow.
}
