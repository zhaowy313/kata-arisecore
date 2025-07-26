import { describe, test, expect } from 'vitest';
import { PositionHash } from '../src/PositionHash';
import { Color, Stone } from '@wgojs/common';

describe('PositionHash', () => {
  describe('empty', () => {
    test('should be 0n', () => {
      expect(PositionHash.empty).toBe(0n);
    });

    test('should be of type bigint', () => {
      expect(typeof PositionHash.empty).toBe('bigint');
    });
  });

  describe('updateHash', () => {
    describe('single stone', () => {
      test('should create non-zero hash for black stone', () => {
        const stone: Stone = { x: 3, y: 3, color: Color.Black };
        const hash = PositionHash.updateHash(PositionHash.empty, stone);

        expect(hash).not.toBe(0n);
        expect(typeof hash).toBe('bigint');
      });

      test('should create non-zero hash for white stone', () => {
        const stone: Stone = { x: 3, y: 3, color: Color.White };
        const hash = PositionHash.updateHash(PositionHash.empty, stone);

        expect(hash).not.toBe(0n);
        expect(typeof hash).toBe('bigint');
      });

      test('should return empty hash for empty color stone', () => {
        const stone: Stone = { x: 3, y: 3, color: Color.Empty };
        const hash = PositionHash.updateHash(PositionHash.empty, stone);

        expect(hash).not.toBe(0n);
        expect(typeof hash).toBe('bigint');
      });

      test('should create different hashes for different positions', () => {
        const stone1: Stone = { x: 3, y: 3, color: Color.Black };
        const stone2: Stone = { x: 4, y: 4, color: Color.Black };

        const hash1 = PositionHash.updateHash(PositionHash.empty, stone1);
        const hash2 = PositionHash.updateHash(PositionHash.empty, stone2);

        expect(hash1).not.toBe(hash2);
      });

      test('should create different hashes for different colors at same position', () => {
        const blackStone: Stone = { x: 3, y: 3, color: Color.Black };
        const whiteStone: Stone = { x: 3, y: 3, color: Color.White };

        const blackHash = PositionHash.updateHash(PositionHash.empty, blackStone);
        const whiteHash = PositionHash.updateHash(PositionHash.empty, whiteStone);

        expect(blackHash).not.toBe(whiteHash);
      });

      test('should return to original hash when applied twice (XOR property)', () => {
        const stone: Stone = { x: 3, y: 3, color: Color.Black };
        const originalHash = PositionHash.empty;

        const afterFirstUpdate = PositionHash.updateHash(originalHash, stone);
        const afterSecondUpdate = PositionHash.updateHash(afterFirstUpdate, stone);

        expect(afterSecondUpdate).toBe(originalHash);
      });
    });

    describe('multiple stones (array)', () => {
      test('should handle empty array', () => {
        const stones: Stone[] = [];
        const hash = PositionHash.updateHash(PositionHash.empty, stones);

        expect(hash).toBe(PositionHash.empty);
      });

      test('should create hash for multiple stones', () => {
        const stones: Stone[] = [
          { x: 3, y: 3, color: Color.Black },
          { x: 4, y: 4, color: Color.White },
          { x: 5, y: 5, color: Color.Black },
        ];

        const hash = PositionHash.updateHash(PositionHash.empty, stones);

        expect(hash).not.toBe(0n);
        expect(typeof hash).toBe('bigint');
      });

      test('should be order-independent (commutative)', () => {
        const stones1: Stone[] = [
          { x: 3, y: 3, color: Color.Black },
          { x: 4, y: 4, color: Color.White },
        ];
        const stones2: Stone[] = [
          { x: 4, y: 4, color: Color.White },
          { x: 3, y: 3, color: Color.Black },
        ];

        const hash1 = PositionHash.updateHash(PositionHash.empty, stones1);
        const hash2 = PositionHash.updateHash(PositionHash.empty, stones2);

        expect(hash1).toBe(hash2);
      });

      test('should equal sequential single stone updates', () => {
        const stones: Stone[] = [
          { x: 3, y: 3, color: Color.Black },
          { x: 4, y: 4, color: Color.White },
          { x: 5, y: 5, color: Color.Black },
        ];

        const hashFromArray = PositionHash.updateHash(PositionHash.empty, stones);

        let hashFromSequential = PositionHash.empty;
        for (const stone of stones) {
          hashFromSequential = PositionHash.updateHash(hashFromSequential, stone);
        }

        expect(hashFromArray).toBe(hashFromSequential);
      });

      test('should return to original hash when applied twice with same array', () => {
        const stones: Stone[] = [
          { x: 3, y: 3, color: Color.Black },
          { x: 4, y: 4, color: Color.White },
        ];

        const originalHash = PositionHash.empty;
        const afterFirstUpdate = PositionHash.updateHash(originalHash, stones);
        const afterSecondUpdate = PositionHash.updateHash(afterFirstUpdate, stones);

        expect(afterSecondUpdate).toBe(originalHash);
      });
    });

    describe('curried version', () => {
      test('should work with single stone', () => {
        const stone: Stone = { x: 3, y: 3, color: Color.Black };
        const updateWithStone = PositionHash.updateHash(stone);
        const hash = updateWithStone(PositionHash.empty);

        expect(hash).not.toBe(0n);
        expect(typeof hash).toBe('bigint');
      });

      test('should work with multiple stones', () => {
        const stones: Stone[] = [
          { x: 3, y: 3, color: Color.Black },
          { x: 4, y: 4, color: Color.White },
        ];
        const updateWithStones = PositionHash.updateHash(stones);
        const hash = updateWithStones(PositionHash.empty);

        expect(hash).not.toBe(0n);
        expect(typeof hash).toBe('bigint');
      });

      test('should produce same result as non-curried version', () => {
        const stone: Stone = { x: 3, y: 3, color: Color.Black };

        const directHash = PositionHash.updateHash(PositionHash.empty, stone);
        const curriedHash = PositionHash.updateHash(stone)(PositionHash.empty);

        expect(directHash).toBe(curriedHash);
      });
    });

    describe('zobrist hashing properties', () => {
      test('should be consistent for same position', () => {
        const stone: Stone = { x: 3, y: 3, color: Color.Black };

        const hash1 = PositionHash.updateHash(PositionHash.empty, stone);
        const hash2 = PositionHash.updateHash(PositionHash.empty, stone);

        expect(hash1).toBe(hash2);
      });

      test('should handle large coordinates', () => {
        const stone: Stone = { x: 18, y: 18, color: Color.Black };
        const hash = PositionHash.updateHash(PositionHash.empty, stone);

        expect(hash).not.toBe(0n);
        expect(typeof hash).toBe('bigint');
      });

      test('should handle edge case coordinates', () => {
        const stones: Stone[] = [
          { x: 0, y: 0, color: Color.Black },
          { x: 100, y: 100, color: Color.White },
        ];

        const hash = PositionHash.updateHash(PositionHash.empty, stones);

        expect(hash).not.toBe(0n);
        expect(typeof hash).toBe('bigint');
      });
    });

    describe('position simulation', () => {
      test('should handle typical game scenario', () => {
        let hash = PositionHash.empty;

        // Add black stone at 3,3
        const blackStone: Stone = { x: 3, y: 3, color: Color.Black };
        hash = PositionHash.updateHash(hash, blackStone);
        expect(hash).not.toBe(0n);

        // Add white stone at 15,15
        const whiteStone: Stone = { x: 15, y: 15, color: Color.White };
        hash = PositionHash.updateHash(hash, whiteStone);
        expect(hash).not.toBe(0n);

        // Remove black stone (add same stone again due to XOR)
        hash = PositionHash.updateHash(hash, blackStone);

        // Should equal hash with only white stone
        const expectedHash = PositionHash.updateHash(PositionHash.empty, whiteStone);
        expect(hash).toBe(expectedHash);
      });

      test('should handle stone replacement', () => {
        // Place black stone
        const position = { x: 10, y: 10 };
        const blackStone: Stone = { ...position, color: Color.Black };
        let hash = PositionHash.updateHash(PositionHash.empty, blackStone);

        // Replace with white stone (remove black, add white)
        const whiteStone: Stone = { ...position, color: Color.White };
        hash = PositionHash.updateHash(hash, blackStone); // Remove black
        hash = PositionHash.updateHash(hash, whiteStone); // Add white

        // Should equal hash with only white stone
        const expectedHash = PositionHash.updateHash(PositionHash.empty, whiteStone);
        expect(hash).toBe(expectedHash);
      });

      test('should handle capture scenario', () => {
        // Initial position with multiple stones
        const initialStones: Stone[] = [
          { x: 3, y: 3, color: Color.Black },
          { x: 4, y: 3, color: Color.White },
          { x: 3, y: 4, color: Color.White },
          { x: 4, y: 4, color: Color.Black },
        ];

        let hash = PositionHash.updateHash(PositionHash.empty, initialStones);

        // Capture white stones
        const capturedStones: Stone[] = [
          { x: 4, y: 3, color: Color.White },
          { x: 3, y: 4, color: Color.White },
        ];

        hash = PositionHash.updateHash(hash, capturedStones);

        // Should equal hash with only black stones
        const remainingStones: Stone[] = [
          { x: 3, y: 3, color: Color.Black },
          { x: 4, y: 4, color: Color.Black },
        ];
        const expectedHash = PositionHash.updateHash(PositionHash.empty, remainingStones);
        expect(hash).toBe(expectedHash);
      });
    });

    describe('performance characteristics', () => {
      test('should handle many stones efficiently', () => {
        const manyStones: Stone[] = [];

        // Create 100 stones
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            manyStones.push({
              x: i,
              y: j,
              color: (i + j) % 2 === 0 ? Color.Black : Color.White,
            });
          }
        }

        const startTime = performance.now();
        const hash = PositionHash.updateHash(PositionHash.empty, manyStones);
        const endTime = performance.now();

        expect(hash).not.toBe(0n);
        expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
      });
    });
  });
});
