import { Color, Move } from '../../types';
import { Rules, RulesContext } from './Rules';

/**
 * Japanese rules of go with classical ko rule. Position can be repeated in triple ko and draw is possible.
 */
export class JapaneseRules implements Rules {
  constructor(public readonly name = 'Japanese') {}

  isValidMove(
    move: Move,
    { gameState, previousGameStates: gameStateHistory }: RulesContext,
  ): boolean {
    if (!('x' in move)) {
      // Allow pass always for simplicity.
      return true;
    }

    if (gameState.position.get(move.x, move.y) !== Color.Empty) {
      return false;
    }

    const cloned = gameState.position.clone();
    const captures = cloned.makeMove(move.x, move.y, move.c);

    if (captures < 0) {
      return false;
    }

    if (gameStateHistory?.length) {
      const lastPosition = gameStateHistory[gameStateHistory.length - 1].position;
      if (lastPosition.get(move.x, move.y) === move.c && lastPosition.equals(cloned)) {
        return false;
      }
    }

    return true;
  }
}
