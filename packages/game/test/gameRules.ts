import { pipe, Color } from '@wgojs/common';
import { test, expect } from 'vitest';
import { BoardPosition, GameRules, GameState, ValidityResult } from '../src';

export function setupKo() {
  return pipe(
    GameState.create(BoardPosition.empty19),
    GameState.applyPlay({ x: 0, y: 0, color: Color.Black }),
    GameState.applyPlay({ x: 2, y: 1, color: Color.White }),
    GameState.applyPlay({ x: 1, y: 1, color: Color.Black }),
    GameState.applyPlay({ x: 3, y: 0, color: Color.White }),
    GameState.applyPlay({ x: 2, y: 0, color: Color.Black }),
  );
}

export function commonValidMoveTests(rules: GameRules) {
  const state = setupKo();

  test('Standard moves', () => {
    const result = rules.validatePlay(state, { x: 3, y: 3, color: Color.Black });
    expect(result).toBe(ValidityResult.valid);

    const result2 = rules.validatePlay(state, { x: 3, y: 3, color: Color.White });
    expect(result2).toBe(ValidityResult.valid);
  });

  test('Pass move', () => {
    const result = rules.validatePlay(state, { color: Color.Black });
    expect(result).toBe(ValidityResult.valid);

    const result2 = rules.validatePlay(state, { color: Color.White });
    expect(result2).toBe(ValidityResult.valid);
  });

  test('Capturing in suicide allowed', () => {
    const result = rules.validatePlay(state, { x: 1, y: 0, color: Color.White });
    expect(result).toBe(ValidityResult.valid);
  });
}

export function commonInvalidMoveTests(rules: GameRules) {
  const state = setupKo();

  test('Out of bounds', () => {
    const result = rules.validatePlay(state, { x: 19, y: 19, color: Color.White });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('out-of-bounds');
  });

  test('Occupied field', () => {
    const result = rules.validatePlay(state, { x: 0, y: 0, color: Color.White });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('occupied');
  });

  test('Ko', () => {
    const newState = GameState.applyPlay(state, { x: 1, y: 0, color: Color.White });
    const result = rules.validatePlay(newState, { x: 2, y: 0, color: Color.Black });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('ko');
  });
}

export function suicideTests(rules: GameRules) {
  const state = setupKo();

  test('Suicide', () => {
    const newState = GameState.applyPlay(state, { x: 0, y: 2, color: Color.Black });
    const result = rules.validatePlay(newState, { x: 0, y: 1, color: Color.White });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('suicide');
  });
}

export function setupSuperKo() {
  // creates a super ko situation - black play at 4:0 will repeat position
  return pipe(
    setupKo(),
    // preparing super (triple) ko
    pipe(
      GameState.applyPlay({ x: 4, y: 1, color: Color.White }),
      GameState.applyPlay({ x: 4, y: 0, color: Color.Black }),
      GameState.applyPlay({ x: 7, y: 0, color: Color.White }),
      GameState.applyPlay({ x: 5, y: 1, color: Color.Black }),
      GameState.applyPlay({ x: 8, y: 1, color: Color.White }),
      GameState.applyPlay({ x: 6, y: 0, color: Color.Black }),
      GameState.applyPlay({ x: 9, y: 0, color: Color.White }),
      GameState.applyPlay({ x: 7, y: 1, color: Color.Black }),
    ),
    // start playing super ko
    pipe(
      GameState.applyPlay({ x: 1, y: 0, color: Color.White }),
      GameState.applyPlay({ x: 8, y: 0, color: Color.Black }),
      GameState.applyPlay({ x: 5, y: 0, color: Color.White }),
      GameState.applyPlay({ x: 2, y: 0, color: Color.Black }),
      GameState.applyPlay({ x: 7, y: 0, color: Color.White }),
    ),
  );
}
