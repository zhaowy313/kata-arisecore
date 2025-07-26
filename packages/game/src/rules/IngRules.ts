import { Color } from '@wgojs/common';
import { BoardPosition } from '../BoardPosition';
import { GameState } from '../GameState';
import { GameRules, Play, ValidityResult } from './GameRules';

export const IngRules = {
  validatePlay: function (state: GameState, play: Play): ValidityResult {
    if (play.x == null || play.y == null) {
      return ValidityResult.valid;
    }

    const currentField = BoardPosition.get(state.position, play.x, play.y);

    if (currentField === undefined) {
      return ValidityResult.invalid('out-of-bounds');
    }

    if (currentField !== Color.Empty) {
      return ValidityResult.invalid('occupied');
    }

    // Try to place the stone
    const { history } = GameState.applyPlay(state, play);

    // Check ko and super ko
    if (history.length > 2) {
      const currentHash = history[history.length - 1];
      for (let i = history.length - 3; i >= 0; i--) {
        if (currentHash === history[i]) {
          return ValidityResult.invalid('ko');
        }
      }
    }

    return ValidityResult.valid;
  },
} satisfies GameRules;
