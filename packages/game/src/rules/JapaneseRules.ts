import { Color } from '@wgojs/common';
import { BoardPosition } from '../BoardPosition';
import { GameState } from '../GameState';
import { GameRules, Play, ValidityResult } from './GameRules';

export const JapaneseRules = {
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
    const { position, history } = GameState.applyPlay(state, play);

    if (BoardPosition.get(position, play.x, play.y) !== play.color) {
      // If the stone was not placed, we have suicide
      return ValidityResult.invalid('suicide');
    }

    // Check ko
    if (history.length > 2 && history[history.length - 1] === history[history.length - 3]) {
      return ValidityResult.invalid('ko');
    }

    return ValidityResult.valid;
  },
} satisfies GameRules;
