import { Color, Move } from '../../types';
import { Rules, RulesContext } from './Rules';

/**
 * Chinese rules of go with positional super ko rule. Positions cannot be repeated ever.
 * It doesn't implement some special Chinese rules.
 *
 * @see https://senseis.xmp.net/?PositionalSuperko
 */
export class ChineseRules implements Rules {
  constructor(public readonly name = 'Chinese') {}

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

    if (
      gameStateHistory?.some(
        ({ position }) => position.get(move.x, move.y) === move.c && position.equals(cloned),
      )
    ) {
      return false;
    }

    return true;
  }
}
