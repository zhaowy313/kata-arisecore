import { describe, test, expect } from 'vitest';
import { KifuVariation, withMoves } from '../src/variation';
import { KifuMove } from '../src/move';
import { KifuPointer } from '../src/pointer';
import { Color } from '@wgojs/common';

describe('KifuVariation', () => {
  describe('create', () => {
    test('should create variation with moves', () => {
      const moves = [KifuMove.create(3, 3, Color.Black), KifuMove.create(4, 4, Color.White)];
      const variation = KifuVariation.create(moves);

      expect(variation.moves).toEqual(moves);
      expect(variation.name).toBeUndefined();
      expect(variation.custom).toBeUndefined();
    });

    test('should create variation with moves and name', () => {
      const moves = [KifuMove.create(3, 3, Color.Black)];
      const variation = KifuVariation.create(moves, 'Good move');

      expect(variation.moves).toEqual(moves);
      expect(variation.name).toBe('Good move');
    });

    test('should throw error when creating variation with empty moves array', () => {
      expect(() => KifuVariation.create([])).toThrow('Cannot create a variation with no moves');
    });
  });

  describe('setName', () => {
    test('should set name when provided', () => {
      const moves = [KifuMove.create(3, 3, Color.Black)];
      const variation = KifuVariation.create(moves);
      const namedVariation = KifuVariation.setName(variation, 'Good variation');

      expect(namedVariation.name).toBe('Good variation');
      expect(namedVariation.moves).toEqual(moves);
    });

    test('should remove name when undefined is provided', () => {
      const moves = [KifuMove.create(3, 3, Color.Black)];
      const variation = KifuVariation.create(moves, 'Original name');
      const unnamedVariation = KifuVariation.setName(variation, undefined);

      expect(unnamedVariation.name).toBeUndefined();
      expect(unnamedVariation.moves).toEqual(moves);
    });

    test('should work with curried function', () => {
      const moves = [KifuMove.create(3, 3, Color.Black)];
      const variation = KifuVariation.create(moves);
      const setNameTo = KifuVariation.setName('Test name');
      const result = setNameTo(variation);

      expect(result.name).toBe('Test name');
    });
  });

  describe('setCustom', () => {
    test('should set custom properties', () => {
      const moves = [KifuMove.create(3, 3, Color.Black)];
      const variation = KifuVariation.create(moves);
      const customProps = { difficulty: 'hard', type: 'joseki' };
      const customVariation = KifuVariation.setCustom(variation, customProps);

      expect(customVariation.custom).toEqual(customProps);
      expect(customVariation.moves).toEqual(moves);
    });

    test('should merge with existing custom properties', () => {
      const moves = [KifuMove.create(3, 3, Color.Black)];
      const variation = KifuVariation.create(moves);
      const variation1 = KifuVariation.setCustom(variation, { prop1: 'value1', prop2: 'old' });
      const variation2 = KifuVariation.setCustom(variation1, { prop2: 'new', prop3: 'value3' });

      expect(variation2.custom).toEqual({
        prop1: 'value1',
        prop2: 'new',
        prop3: 'value3',
      });
    });

    test('should work with curried function', () => {
      const moves = [KifuMove.create(3, 3, Color.Black)];
      const variation = KifuVariation.create(moves);
      const setCustomTo = KifuVariation.setCustom({ test: true });
      const result = setCustomTo(variation);

      expect(result.custom).toEqual({ test: true });
    });
  });
});

describe('withMoves functionality', () => {
  interface TestContainer {
    moves: ReadonlyArray<KifuMove>;
    name?: string;
  }

  const createTestContainer = (moves: KifuMove[], name?: string): TestContainer => ({
    moves,
    ...(name && { name }),
  });

  const moveMethods = withMoves<TestContainer>();

  describe('addMove', () => {
    test('should add move to end when using lastMove pointer', () => {
      const container = createTestContainer([
        KifuMove.create(3, 3, Color.Black),
        KifuMove.create(4, 4, Color.White),
      ]);
      const newMove = KifuMove.create(5, 5, Color.Black);
      const result = moveMethods.addMove(container, newMove, KifuPointer.lastMove);

      expect(result.moves).toHaveLength(3);
      expect(result.moves[2]).toEqual(newMove);
    });

    test('should insert move at specified position', () => {
      const container = createTestContainer([
        KifuMove.create(3, 3, Color.Black),
        KifuMove.create(4, 4, Color.White),
        KifuMove.create(5, 5, Color.Black),
      ]);
      const newMove = KifuMove.create(6, 6, Color.White);
      const pointer = KifuPointer.create([1]); // Insert at position 1
      const result = moveMethods.addMove(container, newMove, pointer);

      expect(result.moves).toHaveLength(4);
      expect(result.moves[1]).toEqual(newMove);
      expect(result.moves[2]).toEqual(KifuMove.create(4, 4, Color.White));
    });

    test('should add move to variation when pointer specifies variation', () => {
      const variation = KifuVariation.create([KifuMove.create(6, 6, Color.White)]);
      const moveWithVariation = KifuMove.addVariation(
        KifuMove.create(4, 4, Color.White),
        variation,
      );
      const container = createTestContainer([
        KifuMove.create(3, 3, Color.Black),
        moveWithVariation,
      ]);

      const newMove = KifuMove.create(7, 7, Color.Black);
      const pointer = KifuPointer.create([1, 0, 0]); // Variation 0, move 0
      const result = moveMethods.addMove(container, newMove, pointer);

      expect(result.moves).toHaveLength(2);
      expect(result.moves[1].variations).toHaveLength(1);
      expect(result.moves[1].variations![0].moves).toHaveLength(2);
      expect(result.moves[1].variations![0].moves[0]).toEqual(newMove);
    });

    test('should work with curried function', () => {
      const container = createTestContainer([KifuMove.create(3, 3, Color.Black)]);
      const newMove = KifuMove.create(4, 4, Color.White);
      const addMoveWith = moveMethods.addMove(newMove, KifuPointer.lastMove);
      const result = addMoveWith(container);

      expect(result.moves).toHaveLength(2);
      expect(result.moves[1]).toEqual(newMove);
    });
  });

  describe('removeMove', () => {
    test('should remove last move when using lastMove pointer', () => {
      const container = createTestContainer([
        KifuMove.create(3, 3, Color.Black),
        KifuMove.create(4, 4, Color.White),
        KifuMove.create(5, 5, Color.Black),
      ]);
      const result = moveMethods.removeMove(container, KifuPointer.lastMove);

      expect(result.moves).toHaveLength(2);
      expect(result.moves[0]).toEqual(KifuMove.create(3, 3, Color.Black));
      expect(result.moves[1]).toEqual(KifuMove.create(4, 4, Color.White));
    });

    test('should remove move at specified position', () => {
      const container = createTestContainer([
        KifuMove.create(3, 3, Color.Black),
        KifuMove.create(4, 4, Color.White),
        KifuMove.create(5, 5, Color.Black),
      ]);
      const pointer = KifuPointer.create([1]); // Remove move at position 1
      const result = moveMethods.removeMove(container, pointer);

      expect(result.moves).toHaveLength(2);
      expect(result.moves[0]).toEqual(KifuMove.create(3, 3, Color.Black));
      expect(result.moves[1]).toEqual(KifuMove.create(5, 5, Color.Black));
    });

    test('should remove move from variation when pointer specifies variation', () => {
      const variation = KifuVariation.create([
        KifuMove.create(6, 6, Color.White),
        KifuMove.create(7, 7, Color.Black),
      ]);
      const moveWithVariation = KifuMove.addVariation(
        KifuMove.create(4, 4, Color.White),
        variation,
      );
      const container = createTestContainer([
        KifuMove.create(3, 3, Color.Black),
        moveWithVariation,
      ]);

      const pointer = KifuPointer.create([1, 0, 0]); // Variation 0, move 0
      const result = moveMethods.removeMove(container, pointer);

      expect(result.moves).toHaveLength(2);
      expect(result.moves[1].variations).toHaveLength(1);
      expect(result.moves[1].variations![0].moves).toHaveLength(1);
      expect(result.moves[1].variations![0].moves[0]).toEqual(KifuMove.create(7, 7, Color.Black));
    });

    test('should work with curried function', () => {
      const container = createTestContainer([
        KifuMove.create(3, 3, Color.Black),
        KifuMove.create(4, 4, Color.White),
      ]);
      const removeLastMove = moveMethods.removeMove(KifuPointer.lastMove);
      const result = removeLastMove(container);

      expect(result.moves).toHaveLength(1);
      expect(result.moves[0]).toEqual(KifuMove.create(3, 3, Color.Black));
    });
  });

  describe('updateMove', () => {
    test('should update last move when using lastMove pointer', () => {
      const container = createTestContainer([
        KifuMove.create(3, 3, Color.Black),
        KifuMove.create(4, 4, Color.White),
      ]);
      const updateFn = (move: KifuMove) => KifuMove.setComment(move, 'Good move');
      const result = moveMethods.updateMove(container, updateFn, KifuPointer.lastMove);

      expect(result.moves).toHaveLength(2);
      expect(result.moves[0]).toEqual(KifuMove.create(3, 3, Color.Black));
      expect(result.moves[1].comment).toBe('Good move');
    });

    test('should update move at specified position', () => {
      const container = createTestContainer([
        KifuMove.create(3, 3, Color.Black),
        KifuMove.create(4, 4, Color.White),
        KifuMove.create(5, 5, Color.Black),
      ]);
      const updateFn = (move: KifuMove) => KifuMove.setComment(move, 'Updated');
      const pointer = KifuPointer.create([1]); // Update move at position 1
      const result = moveMethods.updateMove(container, updateFn, pointer);

      expect(result.moves).toHaveLength(3);
      expect(result.moves[1].comment).toBe('Updated');
      expect(result.moves[0].comment).toBeUndefined();
      expect(result.moves[2].comment).toBeUndefined();
    });

    test('should update move in variation when pointer specifies variation', () => {
      const variation = KifuVariation.create([
        KifuMove.create(6, 6, Color.White),
        KifuMove.create(7, 7, Color.Black),
      ]);
      const moveWithVariation = KifuMove.addVariation(
        KifuMove.create(4, 4, Color.White),
        variation,
      );
      const container = createTestContainer([
        KifuMove.create(3, 3, Color.Black),
        moveWithVariation,
      ]);

      const updateFn = (move: KifuMove) => KifuMove.setComment(move, 'Variation move');
      const pointer = KifuPointer.create([1, 0, 1]); // Variation 0, move 1
      const result = moveMethods.updateMove(container, updateFn, pointer);

      expect(result.moves).toHaveLength(2);
      expect(result.moves[1].variations![0].moves[1].comment).toBe('Variation move');
      expect(result.moves[1].variations![0].moves[0].comment).toBeUndefined();
    });

    test('should work with curried function', () => {
      const container = createTestContainer([KifuMove.create(3, 3, Color.Black)]);
      const updateFn = (move: KifuMove) => KifuMove.setComment(move, 'Test comment');
      const updateLastMove = moveMethods.updateMove(updateFn, KifuPointer.lastMove);
      const result = updateLastMove(container);

      expect(result.moves[0].comment).toBe('Test comment');
    });

    test('should preserve other move properties when updating', () => {
      const originalMove = KifuMove.create(3, 3, Color.Black);
      const container = createTestContainer([originalMove]);
      const updateFn = (move: KifuMove) => KifuMove.setComment(move, 'Added comment');
      const result = moveMethods.updateMove(container, updateFn, KifuPointer.lastMove);

      expect(result.moves[0].x).toBe(3);
      expect(result.moves[0].y).toBe(3);
      expect(result.moves[0].color).toBe(Color.Black);
      expect(result.moves[0].comment).toBe('Added comment');
    });
  });

  describe('complex scenarios', () => {
    test('should handle nested variations correctly', () => {
      // Create a move with nested variations
      const innerVariation = KifuVariation.create([KifuMove.create(8, 8, Color.Black)]);
      const moveWithInnerVariation = KifuMove.addVariation(
        KifuMove.create(7, 7, Color.White),
        innerVariation,
      );
      const outerVariation = KifuVariation.create([
        KifuMove.create(6, 6, Color.White),
        moveWithInnerVariation,
      ]);
      const mainMove = KifuMove.addVariation(KifuMove.create(5, 5, Color.Black), outerVariation);
      const container = createTestContainer([KifuMove.create(3, 3, Color.Black), mainMove]);

      // Add move to inner variation
      const newMove = KifuMove.create(9, 9, Color.White);
      const pointer = KifuPointer.create([1, 0, 1, 0, 0]); // Outer variation, second move, inner variation, first move
      const result = moveMethods.addMove(container, newMove, pointer);

      expect(result.moves[1].variations![0].moves[1].variations![0].moves).toHaveLength(2);
      expect(result.moves[1].variations![0].moves[1].variations![0].moves[0]).toEqual(newMove);
    });

    test('should maintain immutability', () => {
      const originalMove = KifuMove.create(3, 3, Color.Black);
      const container = createTestContainer([originalMove]);
      const newMove = KifuMove.create(4, 4, Color.White);

      const result = moveMethods.addMove(container, newMove, KifuPointer.lastMove);

      // Original container should be unchanged
      expect(container.moves).toHaveLength(1);
      expect(container.moves[0]).toBe(originalMove);

      // Result should be new instance
      expect(result).not.toBe(container);
      expect(result.moves).not.toBe(container.moves);
      expect(result.moves).toHaveLength(2);
    });

    test('should preserve other container properties', () => {
      const container = createTestContainer([KifuMove.create(3, 3, Color.Black)], 'Test Container');
      const newMove = KifuMove.create(4, 4, Color.White);
      const result = moveMethods.addMove(container, newMove, KifuPointer.lastMove);

      expect(result.name).toBe('Test Container');
    });
  });

  describe('edge cases', () => {
    test('should handle empty moves array when removing', () => {
      const container = createTestContainer([]);
      // This should not throw, but return unchanged container
      const result = moveMethods.removeMove(container, KifuPointer.lastMove);
      expect(result.moves).toEqual([]);
    });

    test('should handle invalid pointer gracefully', () => {
      const container = createTestContainer([KifuMove.create(3, 3, Color.Black)]);
      const invalidPointer = KifuPointer.create([5]); // Index out of bounds

      // Should not throw and should handle gracefully
      const result = moveMethods.addMove(
        container,
        KifuMove.create(4, 4, Color.White),
        invalidPointer,
      );
      expect(result.moves).toHaveLength(2);
    });
  });
});
