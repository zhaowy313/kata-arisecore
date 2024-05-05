import { Color, Move } from '../../types';
import { Rules, RulesContext } from './Rules';

/**
 * Ing rules of go with situational super ko rule. Positions cannot be repeated ever.
 * Suicide is allowed.
 *
 * @see https://senseis.xmp.net/?SituationalSuperKo
 */
export class IngRules implements Rules {
  constructor(public readonly name = 'GOE') {}

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

    if (
      gameStateHistory?.some(
        ({ position, player }) =>
          player === -move.c && position.get(move.x, move.y) === move.c && position.equals(cloned),
      )
    ) {
      return false;
    }

    return true;
  }
}
