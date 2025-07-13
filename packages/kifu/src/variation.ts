import { curryLast } from '@wgojs/common';
import { KifuMove } from './move';
import { KifuPointer } from './pointer';
import { SGFGameTree } from '@wgojs/sgf';

export type KifuVariation = {
  readonly name?: string;
  readonly custom?: KifuVariationCustom;
} & WithMoves;

export interface KifuVariationCustom {
  readonly [key: string]: unknown;
}

export const KifuVariation = {
  create(moves: KifuMove[], name?: string): KifuVariation {
    if (moves.length === 0) {
      throw new Error('Cannot create a variation with no moves');
    }

    if (name) {
      return { moves, name };
    }
    return { moves };
  },

  setName: curryLast((variation: KifuVariation, name: undefined | string): KifuVariation => {
    if (name) {
      return { ...variation, name };
    } else {
      const { name: _, ...rest } = variation; // Remove name if it is not provided
      return rest;
    }
  }),

  setCustom: curryLast((variation: KifuVariation, custom: KifuVariationCustom): KifuVariation => {
    return { ...variation, custom: { ...variation.custom, ...custom } };
  }),

  ...withMoves<KifuVariation>(),
};
export interface WithMoves {
  moves: ReadonlyArray<KifuMove>;
}

export function withMoves<T extends WithMoves>() {
  return {
    addMove: curryLast((container: T, move: KifuMove, pointer: KifuPointer): T => {
      if (KifuPointer.isLastMove(pointer)) {
        return {
          ...container,
          moves: [...container.moves, move],
        };
      }
      // Insert the move at the specified pointer
      const { moveIndex, variationIndex, remaining } = KifuPointer.shift(pointer);

      if (variationIndex != null) {
        return {
          ...container,
          moves: [
            ...container.moves.slice(0, moveIndex),
            KifuMove.updateVariation(
              container.moves[moveIndex],
              variationIndex,
              KifuVariation.addMove(move, remaining),
            ),
            ...container.moves.slice(moveIndex + 1),
          ],
        };
      } else {
        return {
          ...container,
          moves: [
            ...container.moves.slice(0, moveIndex),
            move,
            ...container.moves.slice(moveIndex),
          ],
        };
      }
    }),
    removeMove: curryLast((container: T, pointer: KifuPointer): T => {
      if (KifuPointer.isLastMove(pointer)) {
        return {
          ...container,
          moves: container.moves.slice(0, -1),
        };
      }
      const { moveIndex, variationIndex, remaining } = KifuPointer.shift(pointer);

      if (variationIndex != null) {
        return {
          ...container,
          moves: [
            ...container.moves.slice(0, moveIndex),
            KifuMove.updateVariation(
              container.moves[moveIndex],
              variationIndex,
              KifuVariation.removeMove(remaining),
            ),
            ...container.moves.slice(moveIndex + 1),
          ],
        };
      } else {
        return {
          ...container,
          moves: [...container.moves.slice(0, moveIndex), ...container.moves.slice(moveIndex + 1)],
        };
      }
    }),
    updateMove: curryLast(
      (container: T, updateFn: (move: KifuMove) => KifuMove, pointer: KifuPointer): T => {
        if (KifuPointer.isLastMove(pointer)) {
          return {
            ...container,
            moves: container.moves.map((move, index) =>
              index === container.moves.length - 1 ? updateFn(move) : move,
            ),
          };
        }

        const { moveIndex, variationIndex, remaining } = KifuPointer.shift(pointer);

        if (variationIndex != null) {
          return {
            ...container,
            moves: [
              ...container.moves.slice(0, moveIndex),
              KifuMove.updateVariation(
                container.moves[moveIndex],
                variationIndex,
                KifuVariation.updateMove(updateFn, remaining),
              ),
              ...container.moves.slice(moveIndex + 1),
            ],
          };
        } else {
          return {
            ...container,
            moves: container.moves.map((move, index) =>
              index === moveIndex ? updateFn(move) : move,
            ),
          };
        }
      },
    ),
  };
}

/**
 * Converts an entity with moves to SGF game tree.
 */
withMoves.toSGFGameTree = function <T extends WithMoves>(entity: T): SGFGameTree<any> {
  const gameTree: SGFGameTree<any> = {
    sequence: [],
    children: [],
  };

  return movesToSGFGameTree(gameTree, entity.moves);
};

function movesToSGFGameTree(
  gameTree: SGFGameTree<any>,
  moves: readonly KifuMove[],
): SGFGameTree<any> {
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];

    if (move.variations && move.variations.length > 0) {
      const mainChild: SGFGameTree<any> = {
        sequence: [KifuMove.toSGFProperties(move)],
        children: [],
      };
      gameTree.children.push(movesToSGFGameTree(mainChild, moves.slice(i + 1)));

      for (const variation of move.variations) {
        gameTree.children.push(withMoves.toSGFGameTree(variation));
      }

      return gameTree;
    }

    const moveProperties = KifuMove.toSGFProperties(move);
    gameTree.sequence.push(moveProperties);
  }

  return gameTree;
}
