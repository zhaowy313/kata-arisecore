import { describe, test, expect } from 'vitest';
import { GameState } from '../src/GameState';
import { BoardPosition } from '../src';
import { Color, pipe } from '@wgojs/common';
import { PositionHash } from '../src/PositionHash';

describe('GameState', () => {
  describe('create', () => {
    test('Standard (empty) game', () => {
      const gameState = GameState.create(BoardPosition.empty19);

      expect(gameState).toBeDefined();
      expect(gameState.position).toBe(BoardPosition.empty19);
      expect(gameState.turn).toBe(Color.Black);
      expect(gameState.captured).toEqual({ black: 0, white: 0 });
      expect(gameState.history).toEqual([PositionHash.empty]);
    });

    test('Handicap game', () => {
      const handicapPosition = pipe(
        BoardPosition.empty13,
        BoardPosition.set(3, 3, Color.Black),
        BoardPosition.set(9, 9, Color.Black),
      );
      const gameState = GameState.create(handicapPosition, Color.White);
      const initialHash = PositionHash.updateHash(PositionHash.empty, [
        { x: 3, y: 3, color: Color.Black },
        { x: 9, y: 9, color: Color.Black },
      ]);

      expect(gameState).toBeDefined();
      expect(gameState.position).toBe(handicapPosition);
      expect(gameState.turn).toBe(Color.White);
      expect(gameState.captured).toEqual({ black: 0, white: 0 });
      expect(gameState.history).toEqual([initialHash]);
    });
  });

  describe('apply - basic', () => {
    test('Black plays on empty board', () => {
      const initialState = GameState.create(BoardPosition.empty19);
      const play = { x: 3, y: 3, color: Color.Black };
      const newState = GameState.applyPlay(initialState, play);

      expect(BoardPosition.get(newState.position, 3, 3)).toBe(Color.Black);
      expect(newState.turn).toBe(Color.White);
      expect(newState.captured).toEqual({ black: 0, white: 0 });
      expect(newState.history).toHaveLength(2);
    });

    test('White plays on empty board', () => {
      const initialState = GameState.create(BoardPosition.empty19);
      const play = { x: 4, y: 4, color: Color.White };
      const newState = GameState.applyPlay(initialState, play);

      expect(BoardPosition.get(newState.position, 4, 4)).toBe(Color.White);
      expect(newState.turn).toBe(Color.Black);
      expect(newState.captured).toEqual({ black: 0, white: 0 });
      expect(newState.history).toHaveLength(2);
    });

    test('Black plays on occupied field', () => {
      const initialState = GameState.create(BoardPosition.empty19);
      const play1 = { x: 3, y: 3, color: Color.Black };
      const play2 = { x: 3, y: 3, color: Color.White }; // White tries to play on the same field
      const stateAfterFirstPlay = GameState.applyPlay(initialState, play1);
      const newState = GameState.applyPlay(stateAfterFirstPlay, play2);

      expect(BoardPosition.get(newState.position, 3, 3)).toBe(Color.White);
      expect(newState.turn).toBe(Color.Black);
      expect(newState.captured).toEqual({ black: 0, white: 0 });
      expect(newState.history).toHaveLength(3);
    });

    test('Playing outside the board', () => {
      const initialState = GameState.create(BoardPosition.empty19);
      const play = { x: -1, y: 0, color: Color.Black }; // Invalid move

      expect(() => GameState.applyPlay(initialState, play)).toThrow('Invalid move');
    });

    test('Pass move', () => {
      const initialState = GameState.create(BoardPosition.empty19);
      const play = { color: Color.Black }; // Pass move
      const newState = GameState.applyPlay(initialState, play);

      expect(newState.position).toBe(initialState.position);
      expect(newState.turn).toBe(Color.White);
      expect(newState.captured).toEqual({ black: 0, white: 0 });
      expect(newState.history).toHaveLength(1);
    });

    test('Game state is immutable', () => {
      const initialState = GameState.create(BoardPosition.empty19);
      const play = { x: 3, y: 3, color: Color.Black };
      const newState = GameState.applyPlay(initialState, play);

      expect(initialState).not.toBe(newState);
      expect(initialState.position).toBe(BoardPosition.empty19);
      expect(newState.position).not.toBe(BoardPosition.empty19);
      expect(newState.history).not.toBe(initialState.history);
    });
  });

  describe('apply - capturing stones', () => {
    test('Stone in corner is captured', () => {
      const initialState = GameState.create(BoardPosition.empty19);
      const newState = pipe(
        initialState,
        GameState.applyPlay({ x: 0, y: 0, color: Color.Black }),
        GameState.applyPlay({ x: 0, y: 1, color: Color.White }),
      );

      expect(BoardPosition.get(newState.position, 0, 0)).toBe(Color.Black);

      const newStateAfterCapture = GameState.applyPlay(newState, {
        x: 1,
        y: 0,
        color: Color.White,
      });
      expect(BoardPosition.get(newStateAfterCapture.position, 0, 0)).toBe(Color.Empty);
      expect(newStateAfterCapture.captured).toEqual({ black: 0, white: 1 });
    });

    test('Stone in edge is captured', () => {
      const initialState = GameState.create(BoardPosition.empty19);
      const newState = pipe(
        initialState,
        GameState.applyPlay({ x: 0, y: 9, color: Color.White }),
        GameState.applyPlay({ x: 0, y: 10, color: Color.Black }),
        GameState.applyPlay({ x: 0, y: 8, color: Color.Black }),
      );

      expect(BoardPosition.get(newState.position, 0, 9)).toBe(Color.White);

      const newStateAfterCapture = GameState.applyPlay(newState, {
        x: 1,
        y: 9,
        color: Color.Black,
      });

      expect(BoardPosition.get(newStateAfterCapture.position, 0, 9)).toBe(Color.Empty);
      expect(newStateAfterCapture.captured).toEqual({ black: 1, white: 0 });
    });

    test('Stone in center is captured', () => {
      const initialState = GameState.create(BoardPosition.empty19);
      const newState = pipe(
        initialState,
        GameState.applyPlay({ x: 9, y: 9, color: Color.Black }),
        GameState.applyPlay({ x: 8, y: 9, color: Color.White }),
        GameState.applyPlay({ x: 10, y: 9, color: Color.White }),
        GameState.applyPlay({ x: 9, y: 8, color: Color.White }),
      );

      expect(BoardPosition.get(newState.position, 9, 9)).toBe(Color.Black);

      const newStateAfterCapture = GameState.applyPlay(newState, {
        x: 9,
        y: 10,
        color: Color.White,
      });

      expect(BoardPosition.get(newStateAfterCapture.position, 9, 9)).toBe(Color.Empty);
      expect(newStateAfterCapture.captured).toEqual({ black: 0, white: 1 });
    });

    test('Multiple connected stones are captured', () => {
      const initialState = GameState.create(BoardPosition.empty19);
      const newState = pipe(
        initialState,
        GameState.applyPlay({ x: 0, y: 0, color: Color.Black }),
        GameState.applyPlay({ x: 0, y: 1, color: Color.Black }),
        GameState.applyPlay({ x: 1, y: 1, color: Color.Black }),
        GameState.applyPlay({ x: 1, y: 0, color: Color.White }),
        GameState.applyPlay({ x: 0, y: 2, color: Color.White }),
        GameState.applyPlay({ x: 1, y: 2, color: Color.White }),
      );

      expect(BoardPosition.get(newState.position, 0, 0)).toBe(Color.Black);

      const newStateAfterCapture = GameState.applyPlay(newState, {
        x: 2,
        y: 1,
        color: Color.White,
      });

      expect(BoardPosition.get(newStateAfterCapture.position, 0, 0)).toBe(Color.Empty);
      expect(BoardPosition.get(newStateAfterCapture.position, 0, 1)).toBe(Color.Empty);
      expect(BoardPosition.get(newStateAfterCapture.position, 1, 1)).toBe(Color.Empty);
      expect(newStateAfterCapture.captured).toEqual({ black: 0, white: 3 });
    });

    test('Not connected stones are not captured', () => {
      const initialState = GameState.create(BoardPosition.empty19);
      const newState = pipe(
        initialState,
        GameState.applyPlay({ x: 0, y: 0, color: Color.Black }),
        GameState.applyPlay({ x: 1, y: 1, color: Color.Black }),
        GameState.applyPlay({ x: 0, y: 1, color: Color.White }),
        GameState.applyPlay({ x: 1, y: 0, color: Color.White }),
      );

      expect(BoardPosition.get(newState.position, 1, 1)).toBe(Color.Black);
      expect(BoardPosition.get(newState.position, 0, 1)).toBe(Color.White);
      expect(BoardPosition.get(newState.position, 1, 0)).toBe(Color.White);
    });

    test('Suicide one stone', () => {
      const initialState = GameState.create(BoardPosition.empty19);
      const newState = pipe(
        initialState,
        GameState.applyPlay({ x: 8, y: 9, color: Color.White }),
        GameState.applyPlay({ x: 10, y: 9, color: Color.White }),
        GameState.applyPlay({ x: 9, y: 8, color: Color.White }),
        GameState.applyPlay({ x: 9, y: 10, color: Color.White }),
        GameState.applyPlay({ x: 9, y: 9, color: Color.Black }),
      );

      expect(BoardPosition.get(newState.position, 9, 9)).toBe(Color.Empty);
      expect(newState.turn).toBe(Color.White);
      expect(newState.captured).toEqual({ black: 0, white: 1 });
    });

    test('Suicide several stones', () => {
      const initialState = GameState.create(BoardPosition.empty19);
      const newState = pipe(
        initialState,
        GameState.applyPlay({ x: 16, y: 18, color: Color.Black }),
        GameState.applyPlay({ x: 16, y: 17, color: Color.Black }),
        GameState.applyPlay({ x: 17, y: 16, color: Color.Black }),
        GameState.applyPlay({ x: 18, y: 17, color: Color.Black }),
        GameState.applyPlay({ x: 17, y: 18, color: Color.White }),
        GameState.applyPlay({ x: 17, y: 17, color: Color.White }),
        GameState.applyPlay({ x: 18, y: 18, color: Color.White }),
      );

      expect(BoardPosition.get(newState.position, 17, 18)).toBe(Color.Empty);
      expect(BoardPosition.get(newState.position, 17, 17)).toBe(Color.Empty);
      expect(BoardPosition.get(newState.position, 18, 18)).toBe(Color.Empty);
      expect(newState.turn).toBe(Color.Black);
      expect(newState.captured).toEqual({ black: 3, white: 0 });
    });

    test('Not suicide when capturing', () => {
      const initialState = GameState.create(BoardPosition.empty19);
      const newState = pipe(
        initialState,
        GameState.applyPlay({ x: 9, y: 9, color: Color.Black }),
        GameState.applyPlay({ x: 10, y: 8, color: Color.Black }),
        GameState.applyPlay({ x: 10, y: 10, color: Color.Black }),
        GameState.applyPlay({ x: 11, y: 9, color: Color.Black }),
        GameState.applyPlay({ x: 9, y: 8, color: Color.White }),
        GameState.applyPlay({ x: 9, y: 10, color: Color.White }),
        GameState.applyPlay({ x: 8, y: 9, color: Color.White }),
      );

      expect(BoardPosition.get(newState.position, 9, 9)).toBe(Color.Black);

      const newStateAfterCapture = GameState.applyPlay(newState, {
        x: 10,
        y: 9,
        color: Color.White,
      });

      expect(BoardPosition.get(newStateAfterCapture.position, 9, 9)).toBe(Color.Empty);
      expect(BoardPosition.get(newStateAfterCapture.position, 10, 9)).toBe(Color.White);
      expect(newStateAfterCapture.captured).toEqual({ black: 0, white: 1 });
    });

    test('Capturing multiple stones (not connected)', () => {
      const initialState = GameState.create(BoardPosition.empty19);
      const newState = pipe(
        initialState,
        GameState.applyPlay({ x: 0, y: 8, color: Color.Black }),
        GameState.applyPlay({ x: 1, y: 9, color: Color.Black }),
        GameState.applyPlay({ x: 0, y: 10, color: Color.Black }),
        GameState.applyPlay({ x: 0, y: 7, color: Color.White }),
        GameState.applyPlay({ x: 0, y: 11, color: Color.White }),
        GameState.applyPlay({ x: 1, y: 8, color: Color.White }),
        GameState.applyPlay({ x: 2, y: 9, color: Color.White }),
        GameState.applyPlay({ x: 1, y: 10, color: Color.White }),
      );

      expect(BoardPosition.get(newState.position, 0, 8)).toBe(Color.Black);
      expect(BoardPosition.get(newState.position, 1, 9)).toBe(Color.Black);
      expect(BoardPosition.get(newState.position, 0, 10)).toBe(Color.Black);

      const newStateAfterCapture = GameState.applyPlay(newState, {
        x: 0,
        y: 9,
        color: Color.White,
      });

      expect(BoardPosition.get(newStateAfterCapture.position, 0, 8)).toBe(Color.Empty);
      expect(BoardPosition.get(newStateAfterCapture.position, 1, 9)).toBe(Color.Empty);
      expect(BoardPosition.get(newStateAfterCapture.position, 0, 10)).toBe(Color.Empty);
      expect(BoardPosition.get(newStateAfterCapture.position, 0, 9)).toBe(Color.White);
      expect(newStateAfterCapture.captured).toEqual({ black: 0, white: 3 });
    });
  });
});
