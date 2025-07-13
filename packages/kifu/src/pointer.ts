const __brand = Symbol('KifuPointer');

/**
 * KifuPointer represents a pointer to a specific move in a moves container (may be Kifu or KifuVariant).
 */
export type KifuPointer = {
  /**
   * The path leading to move in moves container. Odd indexes represents move numbers, even
   * indexes represents variation indexes. Path should always contain odd number of elements, so it points to move.
   *
   * For example, [2, 0, 3] point to fourth move of first variation of third move or programmatically
   * `container.moves[2].variation[0].moves[3]`.
   */
  readonly path: number[];

  /**
   * The move number in the current path. For example, if path is [2, 0, 3], then moveNumber is 5.
   * It is not used for locating the move, but rather for displaying the move number in UI.
   */
  readonly moveNumber?: number;

  readonly __brand: typeof __brand;
};

type ShiftResult =
  | {
      moveIndex: number;
      variationIndex?: undefined;
      remaining?: undefined;
    }
  | {
      moveIndex: number;
      variationIndex: number;
      remaining: KifuPointer;
    };

export const KifuPointer = {
  /**
   * This is a pointer to the last move in the kifu. It is used to indicate that there is no move selected.
   */
  lastMove: { path: [], __brand } as KifuPointer,

  create(path: number[], moveNumber?: number): KifuPointer {
    if (path.length % 2 === 0) {
      throw new Error('Path must contain an odd number of elements');
    }
    return { path, moveNumber, __brand };
  },

  shift: (pointer: KifuPointer): ShiftResult => {
    const path = [...pointer.path];
    const moveIndex = path.shift()!;
    const variationIndex = path.shift();

    return variationIndex != null
      ? {
          moveIndex,
          variationIndex,
          remaining: KifuPointer.create(path),
        }
      : {
          moveIndex,
        };
  },

  isLastMove(pointer: KifuPointer): boolean {
    return pointer.path.length === 0;
  },
};
