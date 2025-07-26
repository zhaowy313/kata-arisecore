import { describe, test, expect } from 'vitest';
import { BoardPosition } from '../src/BoardPosition';
import { Color, pipe, Point } from '@wgojs/common';

describe('BoardPosition', () => {
  describe('create', () => {
    test('should create a 19x19 board by default', () => {
      const position = BoardPosition.create(19);

      expect(position.rows).toBe(19);
      expect(position.cols).toBe(19);
    });

    test('should create a square board when only rows specified', () => {
      const position = BoardPosition.create(13);

      expect(position.rows).toBe(13);
      expect(position.cols).toBe(13);
    });

    test('should create a rectangular board when both dimensions specified', () => {
      const position = BoardPosition.create(9, 13);

      expect(position.rows).toBe(9);
      expect(position.cols).toBe(13);
    });

    test('should initialize all positions as empty', () => {
      const position = BoardPosition.create(3, 3);

      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          expect(BoardPosition.get(position, x, y)).toBe(Color.Empty);
        }
      }
    });

    test('should throw error for invalid board sizes', () => {
      expect(() => BoardPosition.create(0)).toThrow('Invalid board size.');
      expect(() => BoardPosition.create(-1)).toThrow('Invalid board size.');
      expect(() => BoardPosition.create(5, 0)).toThrow('Invalid board size.');
      expect(() => BoardPosition.create(5, -1)).toThrow('Invalid board size.');
    });
  });

  describe('get', () => {
    test('should return Color.Empty for empty positions', () => {
      const position = BoardPosition.create(19);

      expect(BoardPosition.get(position, 0, 0)).toBe(Color.Empty);
      expect(BoardPosition.get(position, 9, 9)).toBe(Color.Empty);
      expect(BoardPosition.get(position, 18, 18)).toBe(Color.Empty);
    });

    test('should return undefined for out-of-bounds coordinates', () => {
      const position = BoardPosition.create(19);

      expect(BoardPosition.get(position, -1, 0)).toBeUndefined();
      expect(BoardPosition.get(position, 0, -1)).toBeUndefined();
      expect(BoardPosition.get(position, 19, 0)).toBeUndefined();
      expect(BoardPosition.get(position, 0, 19)).toBeUndefined();
      expect(BoardPosition.get(position, 20, 20)).toBeUndefined();
    });

    test('should return correct stone colors after setting', () => {
      const position = BoardPosition.create(19);
      const withBlack = BoardPosition.set(position, 3, 3, Color.Black);
      const withWhite = BoardPosition.set(withBlack, 15, 15, Color.White);

      expect(BoardPosition.get(withWhite, 3, 3)).toBe(Color.Black);
      expect(BoardPosition.get(withWhite, 15, 15)).toBe(Color.White);
      expect(BoardPosition.get(withWhite, 9, 9)).toBe(Color.Empty);
    });
  });

  describe('set', () => {
    test('should set black stone', () => {
      const position = BoardPosition.create(19);
      const newPosition = BoardPosition.set(position, 3, 3, Color.Black);

      expect(BoardPosition.get(newPosition, 3, 3)).toBe(Color.Black);
      expect(BoardPosition.get(position, 3, 3)).toBe(Color.Empty); // Original unchanged
    });

    test('should set white stone', () => {
      const position = BoardPosition.create(19);
      const newPosition = BoardPosition.set(position, 15, 15, Color.White);

      expect(BoardPosition.get(newPosition, 15, 15)).toBe(Color.White);
    });

    test('should overwrite existing stones', () => {
      const position = BoardPosition.create(19);
      const withBlack = BoardPosition.set(position, 3, 3, Color.Black);
      const withWhite = BoardPosition.set(withBlack, 3, 3, Color.White);
      const withEmpty = BoardPosition.set(withWhite, 3, 3, Color.Empty);

      expect(BoardPosition.get(withBlack, 3, 3)).toBe(Color.Black);
      expect(BoardPosition.get(withWhite, 3, 3)).toBe(Color.White);
      expect(BoardPosition.get(withEmpty, 3, 3)).toBe(Color.Empty);
    });

    test('should throw error for out-of-bounds coordinates', () => {
      const position = BoardPosition.create(19);

      expect(() => BoardPosition.set(position, -1, 0, Color.Black)).toThrow(
        'Attempt to set field outside of position.',
      );
      expect(() => BoardPosition.set(position, 0, -1, Color.Black)).toThrow(
        'Attempt to set field outside of position.',
      );
      expect(() => BoardPosition.set(position, 19, 0, Color.Black)).toThrow(
        'Attempt to set field outside of position.',
      );
      expect(() => BoardPosition.set(position, 0, 19, Color.Black)).toThrow(
        'Attempt to set field outside of position.',
      );
    });

    test('should work with curried version', () => {
      const position = BoardPosition.create(19);
      const setBlackAt33 = BoardPosition.set(3, 3, Color.Black);
      const newPosition = setBlackAt33(position);

      expect(BoardPosition.get(newPosition, 3, 3)).toBe(Color.Black);
    });

    test('should preserve immutability', () => {
      const position = BoardPosition.create(19);
      const newPosition = BoardPosition.set(position, 9, 9, Color.Black);

      expect(position.grid).not.toBe(newPosition.grid);
      expect(BoardPosition.get(position, 9, 9)).toBe(Color.Empty);
      expect(BoardPosition.get(newPosition, 9, 9)).toBe(Color.Black);
    });
  });

  describe('isOnBoard', () => {
    test('should return true for valid coordinates', () => {
      const position = BoardPosition.create(19);

      expect(BoardPosition.isOnBoard(position, 0, 0)).toBe(true);
      expect(BoardPosition.isOnBoard(position, 9, 9)).toBe(true);
      expect(BoardPosition.isOnBoard(position, 18, 18)).toBe(true);
      expect(BoardPosition.isOnBoard(position, 0, 18)).toBe(true);
      expect(BoardPosition.isOnBoard(position, 18, 0)).toBe(true);
    });

    test('should return false for out-of-bounds coordinates', () => {
      const position = BoardPosition.create(19);

      expect(BoardPosition.isOnBoard(position, -1, 0)).toBe(false);
      expect(BoardPosition.isOnBoard(position, 0, -1)).toBe(false);
      expect(BoardPosition.isOnBoard(position, 19, 0)).toBe(false);
      expect(BoardPosition.isOnBoard(position, 0, 19)).toBe(false);
      expect(BoardPosition.isOnBoard(position, 20, 20)).toBe(false);
    });

    test('should work with rectangular boards', () => {
      const position = BoardPosition.create(9, 13);

      expect(BoardPosition.isOnBoard(position, 0, 0)).toBe(true);
      expect(BoardPosition.isOnBoard(position, 8, 12)).toBe(false); // rows is 9, so max y is 8
      expect(BoardPosition.isOnBoard(position, 12, 8)).toBe(true); // cols is 13, so max x is 12
      expect(BoardPosition.isOnBoard(position, 0, 9)).toBe(false); // rows is 9, so max y is 8
    });
  });

  describe('equals', () => {
    test('should return true for identical positions', () => {
      const position1 = BoardPosition.create(19);
      const position2 = BoardPosition.create(19);

      expect(BoardPosition.equals(position1, position2)).toBe(true);
    });

    test('should return true for positions with same stones', () => {
      const position1 = BoardPosition.create(19);
      const position2 = BoardPosition.create(19);

      const modifiedPosition1 = BoardPosition.set(
        BoardPosition.set(position1, 3, 3, Color.Black),
        15,
        15,
        Color.White,
      );
      const modifiedPosition2 = BoardPosition.set(
        BoardPosition.set(position2, 3, 3, Color.Black),
        15,
        15,
        Color.White,
      );

      expect(BoardPosition.equals(modifiedPosition1, modifiedPosition2)).toBe(true);
    });

    test('should return false for different board sizes', () => {
      const position1 = BoardPosition.create(19);
      const position2 = BoardPosition.create(13);

      expect(BoardPosition.equals(position1, position2)).toBe(false);
    });

    test('should return false for different rectangular sizes', () => {
      const position1 = BoardPosition.create(9, 13);
      const position2 = BoardPosition.create(13, 9);

      expect(BoardPosition.equals(position1, position2)).toBe(false);
    });

    test('should return false for different stone positions', () => {
      const position1 = BoardPosition.create(19);
      const position2 = BoardPosition.create(19);

      const modifiedPosition1 = BoardPosition.set(position1, 3, 3, Color.Black);
      const modifiedPosition2 = BoardPosition.set(position2, 3, 4, Color.Black);

      expect(BoardPosition.equals(modifiedPosition1, modifiedPosition2)).toBe(false);
    });

    test('should return false for different stone colors', () => {
      const position1 = BoardPosition.create(19);
      const position2 = BoardPosition.create(19);

      const modifiedPosition1 = BoardPosition.set(position1, 3, 3, Color.Black);
      const modifiedPosition2 = BoardPosition.set(position2, 3, 3, Color.White);

      expect(BoardPosition.equals(modifiedPosition1, modifiedPosition2)).toBe(false);
    });
  });

  describe('getStones', () => {
    test('should return empty array for empty position', () => {
      const position = BoardPosition.create(19);

      expect(BoardPosition.getStones(position)).toEqual([]);
    });

    test('should return correct stones by color', () => {
      let position = BoardPosition.create(19);
      position = BoardPosition.set(position, 3, 3, Color.Black);
      position = BoardPosition.set(position, 15, 15, Color.Black);
      position = BoardPosition.set(position, 9, 9, Color.White);

      const stones = BoardPosition.getStones(position);

      expect(stones).toHaveLength(3);
      expect(stones).toContainEqual({ x: 3, y: 3, color: Color.Black });
      expect(stones).toContainEqual({ x: 15, y: 15, color: Color.Black });
      expect(stones).toContainEqual({ x: 9, y: 9, color: Color.White });
    });
  });

  describe('fromArray', () => {
    test('should create position from 2D array', () => {
      const array: Color[][] = [
        [Color.Black, Color.Empty, Color.White],
        [Color.Empty, Color.Black, Color.Empty],
        [Color.White, Color.Empty, Color.Black],
      ];

      const position = BoardPosition.fromArray(array);

      expect(position.rows).toBe(3);
      expect(position.cols).toBe(3);
      expect(BoardPosition.get(position, 0, 0)).toBe(Color.Black);
      expect(BoardPosition.get(position, 2, 0)).toBe(Color.White);
      expect(BoardPosition.get(position, 1, 1)).toBe(Color.Black);
      expect(BoardPosition.get(position, 0, 2)).toBe(Color.White);
      expect(BoardPosition.get(position, 2, 2)).toBe(Color.Black);
    });

    test('should throw error for empty array', () => {
      expect(() => BoardPosition.fromArray([])).toThrow(
        'Cannot create BoardPosition from empty array.',
      );
    });

    test('should throw error for empty row', () => {
      expect(() => BoardPosition.fromArray([[]])).toThrow(
        'Cannot create BoardPosition from empty array.',
      );
    });

    test('should throw error for inconsistent row lengths', () => {
      const array: Color[][] = [
        [Color.Black, Color.Empty],
        [Color.Empty, Color.Black, Color.White], // Different length
      ];

      expect(() => BoardPosition.fromArray(array)).toThrow(
        'All rows in the array must have the same length.',
      );
    });
  });

  describe('toArray', () => {
    test('should convert position to 2D array', () => {
      let position = BoardPosition.create(3, 3);
      position = BoardPosition.set(position, 0, 0, Color.Black);
      position = BoardPosition.set(position, 2, 0, Color.White);
      position = BoardPosition.set(position, 1, 1, Color.Black);

      const array = BoardPosition.toArray(position);

      const expected: Color[][] = [
        [Color.Black, Color.Empty, Color.White],
        [Color.Empty, Color.Black, Color.Empty],
        [Color.Empty, Color.Empty, Color.Empty],
      ];

      expect(array).toEqual(expected);
    });

    test('should work with empty position', () => {
      const position = BoardPosition.create(2, 2);
      const array = BoardPosition.toArray(position);

      const expected: Color[][] = [
        [Color.Empty, Color.Empty],
        [Color.Empty, Color.Empty],
      ];

      expect(array).toEqual(expected);
    });
  });

  describe('getChain', () => {
    test('should return empty array for empty position', () => {
      const position = BoardPosition.create(19);

      expect(BoardPosition.getChain(position, 3, 3)).toEqual([]);
    });

    test('should throw error for out-of-bounds coordinates', () => {
      const position = BoardPosition.create(19);

      expect(() => BoardPosition.getChain(position, -1, 0)).toThrow(
        'Coordinates are out of bounds.',
      );
      expect(() => BoardPosition.getChain(position, 19, 0)).toThrow(
        'Coordinates are out of bounds.',
      );
    });

    test('should find single stone chain', () => {
      let position = BoardPosition.create(19);
      position = BoardPosition.set(position, 3, 3, Color.Black);

      const chain = BoardPosition.getChain(position, 3, 3);

      expect(chain).toHaveLength(1);
      expect(chain).toContainEqual({ x: 3, y: 3, color: Color.Black });
    });

    test('should find connected horizontal chain', () => {
      let position = BoardPosition.create(19);
      position = BoardPosition.set(position, 3, 3, Color.Black);
      position = BoardPosition.set(position, 4, 3, Color.Black);
      position = BoardPosition.set(position, 5, 3, Color.Black);

      const chain = BoardPosition.getChain(position, 3, 3);

      expect(chain).toHaveLength(3);
      expect(chain).toContainEqual({ x: 3, y: 3, color: Color.Black });
      expect(chain).toContainEqual({ x: 4, y: 3, color: Color.Black });
      expect(chain).toContainEqual({ x: 5, y: 3, color: Color.Black });
    });

    test('should find connected vertical chain', () => {
      let position = BoardPosition.create(19);
      position = BoardPosition.set(position, 3, 3, Color.Black);
      position = BoardPosition.set(position, 3, 4, Color.Black);
      position = BoardPosition.set(position, 3, 5, Color.Black);

      const chain = BoardPosition.getChain(position, 3, 4);

      expect(chain).toHaveLength(3);
      expect(chain).toContainEqual({ x: 3, y: 3, color: Color.Black });
      expect(chain).toContainEqual({ x: 3, y: 4, color: Color.Black });
      expect(chain).toContainEqual({ x: 3, y: 5, color: Color.Black });
    });

    test('should find L-shaped chain', () => {
      let position = BoardPosition.create(19);
      position = BoardPosition.set(position, 3, 3, Color.Black);
      position = BoardPosition.set(position, 4, 3, Color.Black);
      position = BoardPosition.set(position, 4, 4, Color.Black);

      const chain = BoardPosition.getChain(position, 3, 3);

      expect(chain).toHaveLength(3);
      expect(chain).toContainEqual({ x: 3, y: 3, color: Color.Black });
      expect(chain).toContainEqual({ x: 4, y: 3, color: Color.Black });
      expect(chain).toContainEqual({ x: 4, y: 4, color: Color.Black });
    });

    test('should not include different colored stones', () => {
      let position = BoardPosition.create(19);
      position = BoardPosition.set(position, 3, 3, Color.Black);
      position = BoardPosition.set(position, 4, 3, Color.White);
      position = BoardPosition.set(position, 5, 3, Color.Black);

      const chain = BoardPosition.getChain(position, 3, 3);

      expect(chain).toHaveLength(1);
      expect(chain).toContainEqual({ x: 3, y: 3, color: Color.Black });
    });

    test('should not include diagonally connected stones', () => {
      let position = BoardPosition.create(19);
      position = BoardPosition.set(position, 3, 3, Color.Black);
      position = BoardPosition.set(position, 4, 4, Color.Black);

      const chain = BoardPosition.getChain(position, 3, 3);

      expect(chain).toHaveLength(1);
      expect(chain).toContainEqual({ x: 3, y: 3, color: Color.Black });
    });
  });

  describe('removeStones', () => {
    test('should remove single stone', () => {
      let position = BoardPosition.create(19);
      position = BoardPosition.set(position, 3, 3, Color.Black);

      const chain = BoardPosition.getChain(position, 3, 3);
      const newPosition = BoardPosition.removeStones(position, chain);

      expect(BoardPosition.get(newPosition, 3, 3)).toBe(Color.Empty);
      expect(BoardPosition.get(position, 3, 3)).toBe(Color.Black); // Original unchanged
    });

    test('should remove connected chain', () => {
      let position = BoardPosition.create(19);
      position = BoardPosition.set(position, 3, 3, Color.Black);
      position = BoardPosition.set(position, 4, 3, Color.Black);
      position = BoardPosition.set(position, 5, 3, Color.Black);

      const chain = BoardPosition.getChain(position, 4, 3);
      const newPosition = BoardPosition.removeStones(position, chain);

      expect(BoardPosition.get(newPosition, 3, 3)).toBe(Color.Empty);
      expect(BoardPosition.get(newPosition, 4, 3)).toBe(Color.Empty);
      expect(BoardPosition.get(newPosition, 5, 3)).toBe(Color.Empty);
    });

    test('should not remove different colored stones', () => {
      let position = pipe(
        BoardPosition.create(19),
        BoardPosition.set(3, 3, Color.Black),
        BoardPosition.set(4, 3, Color.White),
        BoardPosition.set(5, 3, Color.Black),
      );

      const chain = BoardPosition.getChain(position, 3, 3);
      position = BoardPosition.removeStones(position, chain);

      expect(BoardPosition.get(position, 3, 3)).toBe(Color.Empty);
      expect(BoardPosition.get(position, 4, 3)).toBe(Color.White); // Different color preserved
      expect(BoardPosition.get(position, 5, 3)).toBe(Color.Black); // Not connected preserved
    });

    test('should do nothing for empty position', () => {
      const position = BoardPosition.create(19);

      const chain = BoardPosition.getChain(position, 3, 3);
      const newPosition = BoardPosition.removeStones(position, chain);

      expect(BoardPosition.equals(position, newPosition)).toBe(true);
    });

    test('should work with curried version', () => {
      let position = BoardPosition.create(19);
      position = BoardPosition.set(position, 3, 3, Color.Black);

      const chain = BoardPosition.getChain(position, 3, 3);
      const removeStones = BoardPosition.removeStones(chain);
      const newPosition = removeStones(position);

      expect(BoardPosition.get(newPosition, 3, 3)).toBe(Color.Empty);
    });
  });

  describe('hasLiberties', () => {
    test('should throw error for out-of-bounds coordinates', () => {
      const position = BoardPosition.create(19);

      expect(() => BoardPosition.hasLiberties(position, -1, 0)).toThrow(
        'Coordinates are out of bounds.',
      );
      expect(() => BoardPosition.hasLiberties(position, 19, 0)).toThrow(
        'Coordinates are out of bounds.',
      );
      expect(() => BoardPosition.hasLiberties(position, 0, -1)).toThrow(
        'Coordinates are out of bounds.',
      );
      expect(() => BoardPosition.hasLiberties(position, 0, 19)).toThrow(
        'Coordinates are out of bounds.',
      );
    });

    test('should throw error for empty position', () => {
      const position = BoardPosition.create(19);

      expect(() => BoardPosition.hasLiberties(position, 3, 3)).toThrow(
        'No stone at the specified coordinates.',
      );
    });

    test('should return true for single stone with liberties', () => {
      let position = BoardPosition.create(19);
      position = BoardPosition.set(position, 3, 3, Color.Black);

      expect(BoardPosition.hasLiberties(position, 3, 3)).toBe(true);
    });

    test('should return true for stone on edge with liberties', () => {
      let position = BoardPosition.create(19);
      position = BoardPosition.set(position, 0, 0, Color.Black);

      expect(BoardPosition.hasLiberties(position, 0, 0)).toBe(true);
    });

    test('should return false for surrounded single stone', () => {
      let position = BoardPosition.create(19);
      position = BoardPosition.set(position, 3, 3, Color.Black);
      position = BoardPosition.set(position, 2, 3, Color.White);
      position = BoardPosition.set(position, 4, 3, Color.White);
      position = BoardPosition.set(position, 3, 2, Color.White);
      position = BoardPosition.set(position, 3, 4, Color.White);

      expect(BoardPosition.hasLiberties(position, 3, 3)).toBe(false);
    });

    test('should return true for chain with liberties', () => {
      let position = BoardPosition.create(19);
      position = BoardPosition.set(position, 3, 3, Color.Black);
      position = BoardPosition.set(position, 4, 3, Color.Black);
      // Chain has liberties at (2,3), (3,2), (3,4), (5,3), (4,2), (4,4)

      expect(BoardPosition.hasLiberties(position, 3, 3)).toBe(true);
      expect(BoardPosition.hasLiberties(position, 4, 3)).toBe(true);
    });

    test('should return false for surrounded chain', () => {
      let position = BoardPosition.create(19);
      // Create a surrounded 2-stone chain
      position = BoardPosition.set(position, 3, 3, Color.Black);
      position = BoardPosition.set(position, 4, 3, Color.Black);
      // Surround with white stones
      position = BoardPosition.set(position, 2, 3, Color.White);
      position = BoardPosition.set(position, 5, 3, Color.White);
      position = BoardPosition.set(position, 3, 2, Color.White);
      position = BoardPosition.set(position, 3, 4, Color.White);
      position = BoardPosition.set(position, 4, 2, Color.White);
      position = BoardPosition.set(position, 4, 4, Color.White);

      expect(BoardPosition.hasLiberties(position, 3, 3)).toBe(false);
      expect(BoardPosition.hasLiberties(position, 4, 3)).toBe(false);
    });

    test('should handle corner positions', () => {
      let position = BoardPosition.create(19);
      position = BoardPosition.set(position, 0, 0, Color.Black);
      position = BoardPosition.set(position, 1, 0, Color.White);
      position = BoardPosition.set(position, 0, 1, Color.White);

      expect(BoardPosition.hasLiberties(position, 0, 0)).toBe(false);
    });

    test('should handle edge positions', () => {
      let position = BoardPosition.create(19);
      position = BoardPosition.set(position, 0, 5, Color.Black);
      position = BoardPosition.set(position, 0, 4, Color.White);
      position = BoardPosition.set(position, 0, 6, Color.White);
      position = BoardPosition.set(position, 1, 5, Color.White);

      expect(BoardPosition.hasLiberties(position, 0, 5)).toBe(false);
    });
  });

  describe('Round-trip conversions', () => {
    test('should maintain position through fromArray/toArray round-trip', () => {
      let position = BoardPosition.create(5, 5);
      position = BoardPosition.set(position, 1, 1, Color.Black);
      position = BoardPosition.set(position, 2, 2, Color.White);
      position = BoardPosition.set(position, 3, 3, Color.Black);

      const array = BoardPosition.toArray(position);
      const newPosition = BoardPosition.fromArray(array);

      expect(BoardPosition.equals(position, newPosition)).toBe(true);
    });
  });

  describe('Complex scenarios', () => {
    test('should handle capture scenario', () => {
      let position = BoardPosition.create(19);

      // Create a white stone surrounded by black
      position = BoardPosition.set(position, 3, 3, Color.White);
      position = BoardPosition.set(position, 2, 3, Color.Black);
      position = BoardPosition.set(position, 4, 3, Color.Black);
      position = BoardPosition.set(position, 3, 2, Color.Black);
      position = BoardPosition.set(position, 3, 4, Color.Black);

      // White stone should have no liberties
      expect(BoardPosition.hasLiberties(position, 3, 3)).toBe(false);

      // Remove the captured white stone
      const chain = BoardPosition.getChain(position, 3, 3);
      const afterCapture = BoardPosition.removeStones(position, chain);
      expect(BoardPosition.get(afterCapture, 3, 3)).toBe(Color.Empty);

      // Black stones should still be there
      expect(BoardPosition.get(afterCapture, 2, 3)).toBe(Color.Black);
      expect(BoardPosition.get(afterCapture, 4, 3)).toBe(Color.Black);
      expect(BoardPosition.get(afterCapture, 3, 2)).toBe(Color.Black);
      expect(BoardPosition.get(afterCapture, 3, 4)).toBe(Color.Black);
    });

    test('should handle large chain formation and removal', () => {
      let position = BoardPosition.create(19);

      // Create a large connected chain
      const chainPoints: Point[] = [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 7, y: 5 },
        { x: 5, y: 6 },
        { x: 6, y: 6 },
        { x: 7, y: 6 },
        { x: 5, y: 7 },
        { x: 6, y: 7 },
        { x: 7, y: 7 },
      ];

      chainPoints.forEach((point) => {
        position = BoardPosition.set(position, point.x, point.y, Color.Black);
      });

      const chain = BoardPosition.getChain(position, 5, 5);
      expect(chain).toHaveLength(9);

      const afterRemoval = BoardPosition.removeStones(position, chain);
      chainPoints.forEach((point) => {
        expect(BoardPosition.get(afterRemoval, point.x, point.y)).toBe(Color.Empty);
      });
    });
  });

  describe('Performance and edge cases', () => {
    test('should handle minimal board size', () => {
      const position = BoardPosition.create(1, 1);

      expect(position.rows).toBe(1);
      expect(position.cols).toBe(1);
      expect(BoardPosition.get(position, 0, 0)).toBe(Color.Empty);

      const withStone = BoardPosition.set(position, 0, 0, Color.Black);
      expect(BoardPosition.get(withStone, 0, 0)).toBe(Color.Black);
      expect(BoardPosition.hasLiberties(withStone, 0, 0)).toBe(false);
    });

    test('should handle large board efficiently', () => {
      const startTime = performance.now();

      let position = BoardPosition.create(361, 361); // Very large board
      position = BoardPosition.set(position, 180, 180, Color.Black);
      const stones = BoardPosition.getStones(position);

      const endTime = performance.now();

      expect(stones).toHaveLength(1);
      expect(stones[0]).toEqual({ x: 180, y: 180, color: Color.Black });
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
