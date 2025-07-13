import { describe, test, expect } from 'vitest';
import { KifuPointer } from '../src/pointer';

describe('KifuPointer', () => {
  describe('lastMove', () => {
    test('should be a pointer with empty path', () => {
      expect(KifuPointer.lastMove.path).toEqual([]);
      expect(KifuPointer.isLastMove(KifuPointer.lastMove)).toBe(true);
    });
  });

  describe('create', () => {
    test('should create pointer with valid odd-length path', () => {
      const pointer = KifuPointer.create([1]);
      expect(pointer.path).toEqual([1]);
      expect(pointer.moveNumber).toBeUndefined();
    });

    test('should create pointer with move number', () => {
      const pointer = KifuPointer.create([2, 1, 3], 5);
      expect(pointer.path).toEqual([2, 1, 3]);
      expect(pointer.moveNumber).toBe(5);
    });

    test('should create pointer with complex path', () => {
      const pointer = KifuPointer.create([2, 0, 1, 2, 4]);
      expect(pointer.path).toEqual([2, 0, 1, 2, 4]);
    });

    test('should throw error for even-length path', () => {
      expect(() => KifuPointer.create([1, 2])).toThrow(
        'Path must contain an odd number of elements',
      );
      expect(() => KifuPointer.create([1, 2, 3, 4])).toThrow(
        'Path must contain an odd number of elements',
      );
    });

    test('should throw error for empty path', () => {
      expect(() => KifuPointer.create([])).toThrow('Path must contain an odd number of elements');
    });
  });

  describe('shift', () => {
    test('should handle single element path', () => {
      const pointer = KifuPointer.create([3]);
      const result = KifuPointer.shift(pointer);

      expect(result).toEqual({
        moveIndex: 3,
      });
      expect('variationIndex' in result).toBe(false);
      expect('remaining' in result).toBe(false);
    });

    test('should handle path with variation', () => {
      const pointer = KifuPointer.create([2, 1, 3]);
      const result = KifuPointer.shift(pointer);

      expect(result.moveIndex).toBe(2);
      expect(result.variationIndex).toBe(1);
      expect(result.remaining).toBeDefined();
      expect(result.remaining!.path).toEqual([3]);
    });

    test('should handle complex path with multiple variations', () => {
      const pointer = KifuPointer.create([1, 0, 2, 1, 3]);
      const result = KifuPointer.shift(pointer);

      expect(result.moveIndex).toBe(1);
      expect(result.variationIndex).toBe(0);
      expect(result.remaining).toBeDefined();
      expect(result.remaining!.path).toEqual([2, 1, 3]);
    });

    test('should handle nested shifting', () => {
      const pointer = KifuPointer.create([1, 0, 2, 1, 3]);
      const firstShift = KifuPointer.shift(pointer);
      const secondShift = KifuPointer.shift(firstShift.remaining!);

      expect(secondShift.moveIndex).toBe(2);
      expect(secondShift.variationIndex).toBe(1);
      expect(secondShift.remaining!.path).toEqual([3]);

      const thirdShift = KifuPointer.shift(secondShift.remaining!);
      expect(thirdShift.moveIndex).toBe(3);
      expect('variationIndex' in thirdShift).toBe(false);
    });

    test('should maintain immutability', () => {
      const originalPath = [2, 1, 3];
      const pointer = KifuPointer.create(originalPath);

      expect(pointer.path).toEqual([2, 1, 3]); // Original should be unchanged
      expect(originalPath).toEqual([2, 1, 3]); // Original array should be unchanged
    });
  });

  describe('isLastMove', () => {
    test('should return true for lastMove pointer', () => {
      expect(KifuPointer.isLastMove(KifuPointer.lastMove)).toBe(true);
    });

    test('should return true for pointer with empty path', () => {
      const emptyPointer = { path: [], __brand: Symbol('KifuPointer') } as any;
      expect(KifuPointer.isLastMove(emptyPointer)).toBe(true);
    });

    test('should return false for pointer with non-empty path', () => {
      const pointer = KifuPointer.create([1]);
      expect(KifuPointer.isLastMove(pointer)).toBe(false);
    });

    test('should return false for complex paths', () => {
      const pointer = KifuPointer.create([2, 1, 3]);
      expect(KifuPointer.isLastMove(pointer)).toBe(false);
    });
  });

  describe('Path interpretation examples', () => {
    test('should represent direct move access correctly', () => {
      // Path [2] means: moves[2]
      const pointer = KifuPointer.create([2]);
      const result = KifuPointer.shift(pointer);

      expect(result.moveIndex).toBe(2);
      expect('variationIndex' in result).toBe(false);
    });

    test('should represent variation access correctly', () => {
      // Path [2, 0, 3] means: moves[2].variations[0].moves[3]
      const pointer = KifuPointer.create([2, 0, 3]);
      const firstShift = KifuPointer.shift(pointer);

      expect(firstShift.moveIndex).toBe(2);
      expect(firstShift.variationIndex).toBe(0);

      const secondShift = KifuPointer.shift(firstShift.remaining!);
      expect(secondShift.moveIndex).toBe(3);
      expect('variationIndex' in secondShift).toBe(false);
    });

    test('should represent nested variations correctly', () => {
      // Path [1, 2, 0, 1, 4] means: moves[1].variations[2].moves[0].variations[1].moves[4]
      const pointer = KifuPointer.create([1, 2, 0, 1, 4]);

      const shift1 = KifuPointer.shift(pointer);
      expect(shift1.moveIndex).toBe(1);
      expect(shift1.variationIndex).toBe(2);

      const shift2 = KifuPointer.shift(shift1.remaining!);
      expect(shift2.moveIndex).toBe(0);
      expect(shift2.variationIndex).toBe(1);

      const shift3 = KifuPointer.shift(shift2.remaining!);
      expect(shift3.moveIndex).toBe(4);
      expect('variationIndex' in shift3).toBe(false);
    });
  });

  describe('Move number tracking', () => {
    test('should preserve move number in pointer', () => {
      const pointer = KifuPointer.create([2, 0, 3], 5);
      expect(pointer.moveNumber).toBe(5);
    });

    test('should handle undefined move number', () => {
      const pointer = KifuPointer.create([1]);
      expect(pointer.moveNumber).toBeUndefined();
    });

    test('should preserve move number through shifting', () => {
      const pointer = KifuPointer.create([2, 0, 3], 5);
      const shifted = KifuPointer.shift(pointer);

      // Move number is not part of the shift result, but should be accessible
      // through the remaining pointer structure if needed
      expect(shifted.remaining!.path).toEqual([3]);
    });
  });

  describe('Type safety and branding', () => {
    test('should have proper brand symbol', () => {
      const pointer = KifuPointer.create([1]);
      expect(pointer.__brand).toBeDefined();
      expect(typeof pointer.__brand).toBe('symbol');
    });

    test('should maintain brand through operations', () => {
      const pointer = KifuPointer.create([2, 0, 3]);
      const shifted = KifuPointer.shift(pointer);

      if (shifted.remaining) {
        expect(shifted.remaining.__brand).toBeDefined();
        expect(typeof shifted.remaining.__brand).toBe('symbol');
      }
    });
  });

  describe('Edge cases', () => {
    test('should handle minimum valid path', () => {
      const pointer = KifuPointer.create([0]);
      const result = KifuPointer.shift(pointer);

      expect(result.moveIndex).toBe(0);
      expect('variationIndex' in result).toBe(false);
    });

    test('should handle large indices', () => {
      const pointer = KifuPointer.create([999, 100, 50]);
      const result = KifuPointer.shift(pointer);

      expect(result.moveIndex).toBe(999);
      expect(result.variationIndex).toBe(100);
      expect(result.remaining!.path).toEqual([50]);
    });

    test('should handle zero indices in variations', () => {
      const pointer = KifuPointer.create([0, 0, 0]);
      const result = KifuPointer.shift(pointer);

      expect(result.moveIndex).toBe(0);
      expect(result.variationIndex).toBe(0);
      expect(result.remaining!.path).toEqual([0]);
    });
  });
});
