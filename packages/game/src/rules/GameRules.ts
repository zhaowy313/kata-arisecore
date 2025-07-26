import { Color } from '@wgojs/common';
import { GameState } from '../GameState';

/**
 * Simple interface for a move in the game. X and Y coordinates are optional, if omitted,
 * the play is considered to be a pass.
 */
export interface Play {
  x?: number;
  y?: number;
  color: typeof Color.Black | typeof Color.White;
}

export type ValidityResult =
  | { readonly valid: true; readonly reason?: undefined }
  | { readonly valid: false; readonly reason: InvalidReason };

export type InvalidReason = 'occupied' | 'suicide' | 'ko' | 'out-of-bounds' | 'other';

export interface GameRules {
  validatePlay(state: GameState, play: Play): ValidityResult;
}

export const ValidityResult = {
  valid: { valid: true } as const,
  invalid: (reason: InvalidReason) => ({ valid: false, reason }) as const,
};
