import { describe, test, expect } from 'vitest';
import { PositionSetup } from '../src/setup';
import { Color, Point } from '@wgojs/common';

describe('PositionSetup', () => {
  describe('empty', () => {
    test('should be an empty setup object', () => {
      expect(PositionSetup.empty).toEqual({});
    });
  });

  describe('create', () => {
    test('should create setup with stones only', () => {
      const stones = [
        { x: 3, y: 3, color: Color.Black },
        { x: 15, y: 15, color: Color.White },
      ];
      const setup = PositionSetup.create(stones);

      expect(setup).toEqual({
        stones,
        startingPlayer: undefined,
      });
    });

    test('should create setup with stones and starting player', () => {
      const stones = [{ x: 3, y: 3, color: Color.Black }];
      const setup = PositionSetup.create(stones, Color.White);

      expect(setup).toEqual({
        stones,
        startingPlayer: Color.White,
      });
    });

    test('should create setup with empty stones array', () => {
      const setup = PositionSetup.create();

      expect(setup).toEqual({
        stones: [],
        startingPlayer: undefined,
      });
    });

    test('should create setup with starting player but no stones', () => {
      const setup = PositionSetup.create([], Color.Black);

      expect(setup).toEqual({
        stones: [],
        startingPlayer: Color.Black,
      });
    });
  });

  describe('addStone', () => {
    test('should add stone to empty setup', () => {
      const stone = { x: 3, y: 3, color: Color.Black };
      const result = PositionSetup.addStone({}, stone);

      expect(result).toEqual({
        stones: [stone],
      });
    });

    test('should add stone to existing setup', () => {
      const existingStone = { x: 3, y: 3, color: Color.Black };
      const newStone = { x: 15, y: 15, color: Color.White };
      const setup = { stones: [existingStone] };

      const result = PositionSetup.addStone(setup, newStone);

      expect(result).toEqual({
        stones: [existingStone, newStone],
      });
    });

    test('should replace stone at same position', () => {
      const originalStone = { x: 3, y: 3, color: Color.Black };
      const replacementStone = { x: 3, y: 3, color: Color.White };
      const setup = { stones: [originalStone] };

      const result = PositionSetup.addStone(setup, replacementStone);

      expect(result).toEqual({
        stones: [replacementStone],
      });
    });

    test('should add multiple stones at once', () => {
      const stones = [
        { x: 3, y: 3, color: Color.Black },
        { x: 15, y: 15, color: Color.White },
      ];

      const result = PositionSetup.addStone({}, stones);

      expect(result).toEqual({
        stones,
      });
    });

    test('should handle multiple stones with conflicts', () => {
      const existingStone = { x: 3, y: 3, color: Color.Black };
      const newStones = [
        { x: 3, y: 3, color: Color.White }, // Conflicts with existing
        { x: 15, y: 15, color: Color.Black },
      ];
      const setup = { stones: [existingStone] };

      const result = PositionSetup.addStone(setup, newStones);

      expect(result).toEqual({
        stones: [
          { x: 3, y: 3, color: Color.White },
          { x: 15, y: 15, color: Color.Black },
        ],
      });
    });

    test('should preserve other setup properties', () => {
      const setup = {
        stones: [{ x: 0, y: 0, color: Color.Black }],
        startingPlayer: Color.White,
        boardSection: [
          { x: 0, y: 0 },
          { x: 9, y: 9 },
        ] as [Point, Point],
      };
      const newStone = { x: 1, y: 1, color: Color.White };

      const result = PositionSetup.addStone(setup, newStone);

      expect(result.startingPlayer).toBe(Color.White);
      expect(result.boardSection).toEqual([
        { x: 0, y: 0 },
        { x: 9, y: 9 },
      ]);
    });

    test('should work with curried version', () => {
      const stone = { x: 3, y: 3, color: Color.Black };
      const addBlackStone = PositionSetup.addStone(stone);
      const result = addBlackStone({});

      expect(result).toEqual({
        stones: [stone],
      });
    });
  });

  describe('containsStone', () => {
    test('should return true when stone exists', () => {
      const stone = { x: 3, y: 3, color: Color.Black };
      const setup = { stones: [stone] };

      expect(PositionSetup.containsStone(setup, stone)).toBe(true);
    });

    test('should return false when stone does not exist', () => {
      const existingStone = { x: 3, y: 3, color: Color.Black };
      const queryStone = { x: 15, y: 15, color: Color.White };
      const setup = { stones: [existingStone] };

      expect(PositionSetup.containsStone(setup, queryStone)).toBe(false);
    });

    test('should return false when setup has no stones', () => {
      const stone = { x: 3, y: 3, color: Color.Black };
      const setup = {};

      expect(PositionSetup.containsStone(setup, stone)).toBe(false);
    });

    test('should distinguish stones by position and color', () => {
      const blackStone = { x: 3, y: 3, color: Color.Black };
      const whiteStone = { x: 3, y: 3, color: Color.White }; // Same position, different color
      const setup = { stones: [blackStone] };

      expect(PositionSetup.containsStone(setup, blackStone)).toBe(true);
      expect(PositionSetup.containsStone(setup, whiteStone)).toBe(false);
    });
  });

  describe('removeStone', () => {
    test('should remove existing stone', () => {
      const stone1 = { x: 3, y: 3, color: Color.Black };
      const stone2 = { x: 15, y: 15, color: Color.White };
      const setup = { stones: [stone1, stone2] };

      const result = PositionSetup.removeStone(setup, stone1);

      expect(result).toEqual({
        stones: [stone2],
      });
    });

    test('should handle removing non-existent stone', () => {
      const existingStone = { x: 3, y: 3, color: Color.Black };
      const nonExistentStone = { x: 15, y: 15, color: Color.White };
      const setup = { stones: [existingStone] };

      const result = PositionSetup.removeStone(setup, nonExistentStone);

      expect(result).toEqual({
        stones: [existingStone],
      });
    });

    test('should remove multiple stones at once', () => {
      const stone1 = { x: 3, y: 3, color: Color.Black };
      const stone2 = { x: 15, y: 15, color: Color.White };
      const stone3 = { x: 9, y: 9, color: Color.Black };
      const setup = { stones: [stone1, stone2, stone3] };

      const result = PositionSetup.removeStone(setup, [stone1, stone3]);

      expect(result).toEqual({
        stones: [stone2],
      });
    });

    test('should handle empty stones array', () => {
      const stone = { x: 3, y: 3, color: Color.Black };
      const setup = {};

      const result = PositionSetup.removeStone(setup, stone);

      expect(result).toEqual({
        stones: [],
      });
    });

    test('should preserve other setup properties', () => {
      const stone = { x: 3, y: 3, color: Color.Black };
      const setup = {
        stones: [stone],
        startingPlayer: Color.White,
        boardSection: [
          { x: 0, y: 0 },
          { x: 9, y: 9 },
        ] as [Point, Point],
      };

      const result = PositionSetup.removeStone(setup, stone);

      expect(result.startingPlayer).toBe(Color.White);
      expect(result.boardSection).toEqual([
        { x: 0, y: 0 },
        { x: 9, y: 9 },
      ]);
    });

    test('should work with curried version', () => {
      const stone = { x: 3, y: 3, color: Color.Black };
      const setup = { stones: [stone] };
      const removeStone = PositionSetup.removeStone(stone);
      const result = removeStone(setup);

      expect(result).toEqual({
        stones: [],
      });
    });
  });

  describe('setStartingPlayer', () => {
    test('should set starting player', () => {
      const setup = {};
      const result = PositionSetup.setStartingPlayer(setup, Color.Black);

      expect(result).toEqual({
        startingPlayer: Color.Black,
      });
    });

    test('should update existing starting player', () => {
      const setup = { startingPlayer: Color.Black };
      const result = PositionSetup.setStartingPlayer(setup, Color.White);

      expect(result).toEqual({
        startingPlayer: Color.White,
      });
    });

    test('should clear starting player when undefined', () => {
      const setup = { startingPlayer: Color.Black };
      const result = PositionSetup.setStartingPlayer(setup, undefined);

      expect(result).toEqual({
        startingPlayer: undefined,
      });
    });

    test('should preserve other setup properties', () => {
      const stone = { x: 3, y: 3, color: Color.Black };
      const setup = {
        stones: [stone],
        boardSection: [
          { x: 0, y: 0 },
          { x: 9, y: 9 },
        ] as [Point, Point],
      };

      const result = PositionSetup.setStartingPlayer(setup, Color.White);

      expect(result.stones).toEqual([stone]);
      expect(result.boardSection).toEqual([
        { x: 0, y: 0 },
        { x: 9, y: 9 },
      ]);
      expect(result.startingPlayer).toBe(Color.White);
    });

    test('should work with curried version', () => {
      const setup = {};
      const setWhite = PositionSetup.setStartingPlayer(Color.White);
      const result = setWhite(setup);

      expect(result).toEqual({
        startingPlayer: Color.White,
      });
    });
  });

  describe('setBoardSection', () => {
    test('should set board section', () => {
      const setup = {};
      const boardSection: [Point, Point] = [
        { x: 0, y: 0 },
        { x: 9, y: 9 },
      ];
      const result = PositionSetup.setBoardSection(setup, boardSection);

      expect(result).toEqual({
        boardSection,
      });
    });

    test('should update existing board section', () => {
      const oldSection: [Point, Point] = [
        { x: 0, y: 0 },
        { x: 9, y: 9 },
      ];
      const newSection: [Point, Point] = [
        { x: 3, y: 3 },
        { x: 15, y: 15 },
      ];
      const setup = { boardSection: oldSection };

      const result = PositionSetup.setBoardSection(setup, newSection);

      expect(result).toEqual({
        boardSection: newSection,
      });
    });

    test('should clear board section when undefined', () => {
      const boardSection: [Point, Point] = [
        { x: 0, y: 0 },
        { x: 9, y: 9 },
      ];
      const setup = { boardSection };

      const result = PositionSetup.setBoardSection(setup, undefined);

      expect(result).toEqual({
        boardSection: undefined,
      });
    });

    test('should preserve other setup properties', () => {
      const stone = { x: 3, y: 3, color: Color.Black };
      const setup = {
        stones: [stone],
        startingPlayer: Color.Black,
      };
      const boardSection: [Point, Point] = [
        { x: 0, y: 0 },
        { x: 9, y: 9 },
      ];

      const result = PositionSetup.setBoardSection(setup, boardSection);

      expect(result.stones).toEqual([stone]);
      expect(result.startingPlayer).toBe(Color.Black);
      expect(result.boardSection).toEqual(boardSection);
    });

    test('should work with curried version', () => {
      const setup = {};
      const boardSection: [Point, Point] = [
        { x: 0, y: 0 },
        { x: 9, y: 9 },
      ];
      const setBoardSection = PositionSetup.setBoardSection(boardSection);
      const result = setBoardSection(setup);

      expect(result).toEqual({
        boardSection,
      });
    });
  });

  describe('Complex scenarios', () => {
    test('should handle handicap game setup', () => {
      const handicapStones = [
        { x: 3, y: 3, color: Color.Black },
        { x: 15, y: 15, color: Color.Black },
        { x: 3, y: 15, color: Color.Black },
        { x: 15, y: 3, color: Color.Black },
      ];

      let setup = PositionSetup.create();
      setup = PositionSetup.addStone(setup, handicapStones);
      setup = PositionSetup.setStartingPlayer(setup, Color.White);

      expect(setup).toEqual({
        stones: handicapStones,
        startingPlayer: Color.White,
      });
    });

    test('should handle board section for problems', () => {
      const problemStones = [
        { x: 0, y: 0, color: Color.Black },
        { x: 1, y: 1, color: Color.White },
      ];
      const boardSection: [Point, Point] = [
        { x: 0, y: 0 },
        { x: 4, y: 4 },
      ];

      let setup = PositionSetup.create(problemStones);
      setup = PositionSetup.setBoardSection(setup, boardSection);

      expect(setup).toEqual({
        stones: problemStones,
        startingPlayer: undefined,
        boardSection,
      });
    });

    test('should maintain immutability throughout operations', () => {
      const originalSetup = PositionSetup.create();
      const stone = { x: 3, y: 3, color: Color.Black };

      const withStone = PositionSetup.addStone(originalSetup, stone);
      const withPlayer = PositionSetup.setStartingPlayer(withStone, Color.White);

      // Original should be unchanged
      expect(originalSetup).toEqual({
        stones: [],
        startingPlayer: undefined,
      });

      // Intermediate should only have stone
      expect(withStone).toEqual({
        stones: [stone],
        startingPlayer: undefined,
      });

      // Final should have both
      expect(withPlayer).toEqual({
        stones: [stone],
        startingPlayer: Color.White,
      });
    });
  });

  describe('Type definitions', () => {
    test('PositionSetup should accept all valid properties', () => {
      const setup: PositionSetup = {
        stones: [
          { x: 3, y: 3, color: Color.Black },
          { x: 15, y: 15, color: Color.White },
        ],
        startingPlayer: Color.Black,
        boardSection: [
          { x: 0, y: 0 },
          { x: 18, y: 18 },
        ],
      };

      expect(setup.stones).toHaveLength(2);
      expect(setup.startingPlayer).toBe(Color.Black);
      expect(setup.boardSection).toEqual([
        { x: 0, y: 0 },
        { x: 18, y: 18 },
      ]);
    });

    test('PositionSetup should accept minimal setup', () => {
      const setup: PositionSetup = {};

      expect(setup.stones).toBeUndefined();
      expect(setup.startingPlayer).toBeUndefined();
      expect(setup.boardSection).toBeUndefined();
    });
  });
});
