/* Test of WGo.Game class and (handling of go game) */
import { Game, BoardPosition, sgfRulesMap, NoRules } from '../src/game';
import { Color } from '../src/types';
import { describe, test, expect, beforeEach } from 'vitest';

describe('Constructor', () => {
  test('Game is correctly created.', () => {
    const game = new Game({ size: 19, rules: sgfRulesMap.Japanese, komi: 6.5, handicap: 0 });

    expect(game.size).toBe(19);
    expect(game.currentState.position.cols).toBe(19);
    expect(game.currentState.position.rows).toBe(19);
    expect(game.rules).toEqual(sgfRulesMap.Japanese);
    expect(game.currentState.player).toBe(Color.Black);
    expect(game.komi).toBe(6.5);
    expect(game.currentState.blackCaptures).toBe(0);
    expect(game.currentState.whiteCaptures).toBe(0);
    expect(game.currentState.position).toEqual(new BoardPosition());
  });

  test('Rectangular board size, chines rules', () => {
    const game = new Game({
      size: { cols: 13, rows: 17 },
      rules: sgfRulesMap.Chinese,
      komi: 0.5,
    });

    expect(game.size).toEqual({ cols: 13, rows: 17 });
    expect(game.rules).toEqual(sgfRulesMap.Chinese);
    expect(game.komi).toBe(0.5);
    expect(game.currentState.position.cols).toBe(13);
    expect(game.currentState.position.rows).toBe(17);
    expect(game.currentState.position).toEqual(new BoardPosition(13, 17));
  });

  test('1 handicap', () => {
    const game = new Game({ size: 19, rules: sgfRulesMap.Japanese, komi: 0.5, handicap: 1 });

    expect(game.handicap).toBe(1);
    expect(game.currentState.player).toBe(Color.Black);
  });

  test('2 handicaps', () => {
    const game = new Game({ size: 19, rules: sgfRulesMap.Japanese, komi: 0.5, handicap: 2 });

    expect(game.handicap).toBe(2);
    expect(game.currentState.player).toBe(Color.White);
  });
});

describe('Method makeMove', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let game: Game;

  beforeEach(() => {
    game = new Game({ size: 19, rules: sgfRulesMap.Japanese, komi: 6.5, handicap: 0 });
  });

  test('Basic Game#makeMove() functionality.', () => {
    game.makeMove({ x: 4, y: 4, c: Color.Black });

    expect(game.currentState.position.get(4, 4)).toBe(Color.Black);
    expect(game.currentState.player).toBe(Color.White);
    expect(game.currentState.blackCaptures).toBe(0);
    expect(game.currentState.whiteCaptures).toBe(0);
  });

  test('Capturing stones', () => {
    game.currentState.position.set(0, 0, Color.Black);
    game.currentState.position.set(0, 1, Color.Black);
    game.currentState.position.set(1, 0, Color.Black);
    game.currentState.position.set(1, 1, Color.Black);
    game.currentState.position.set(0, 2, Color.White);
    game.currentState.position.set(1, 2, Color.White);
    game.currentState.position.set(2, 0, Color.White);

    game.makeMove({ x: 2, y: 1, c: Color.White });

    expect(game.currentState.position.get(0, 0)).toBe(Color.Empty);
    expect(game.currentState.position.get(0, 1)).toBe(Color.Empty);
    expect(game.currentState.position.get(1, 0)).toBe(Color.Empty);
    expect(game.currentState.position.get(1, 1)).toBe(Color.Empty);
    expect(game.currentState.position.get(2, 1)).toBe(Color.White);
    expect(game.currentState.blackCaptures).toBe(0);
    expect(game.currentState.whiteCaptures).toBe(4);
  });

  test('Illegal moves can be played', () => {
    game.currentState.position.set(0, 0, Color.Black);
    game.currentState.position.set(1, 0, Color.Black);
    game.currentState.position.set(0, 1, Color.White);

    game.makeMove({ x: 1, y: 0, c: Color.White });
    expect(game.currentState.blackCaptures).toBe(0);
    expect(game.currentState.whiteCaptures).toBe(1);
    expect(game.currentState.position.get(1, 0)).toBe(Color.White);

    game.makeMove({ x: 0, y: 1, c: Color.Black });
    expect(game.currentState.blackCaptures).toBe(0);
    expect(game.currentState.whiteCaptures).toBe(1);
    expect(game.currentState.position.get(0, 1)).toBe(Color.Black);
  });
});

describe('Check validity', () => {
  test('Invalid moves', () => {
    const game = new Game({ size: 9, rules: sgfRulesMap.Japanese, komi: 6.5 });

    game.currentState.position.set(0, 1, Color.Black);
    game.currentState.position.set(1, 0, Color.White);

    const clonedPos = game.currentState.position.clone();

    expect(game.isValidMove(0, 1)).toBe(false);
    expect(game.isValidMove(1, 0)).toBe(false);
    expect(game.isValidMove(0, -1)).toBe(false);
    expect(game.isValidMove(-1, 0)).toBe(false);
    expect(game.isValidMove(0, 9)).toBe(false);
    expect(game.isValidMove(9, 0)).toBe(false);

    expect(game.currentState.position).toEqual(clonedPos);
  });

  test('Disallow suicide', () => {
    const game = new Game({ size: 19, rules: sgfRulesMap.Japanese, komi: 6.5 });

    game.currentState.position.set(0, 1, Color.White);
    game.currentState.position.set(0, 2, Color.Black);
    game.currentState.position.set(1, 0, Color.Black);
    game.currentState.position.set(1, 1, Color.Black);

    game.currentState.player = Color.White;
    expect(game.isValidMove(0, 0)).toBe(false);
  });

  test('Allow suicide in ING rules', () => {
    const game = new Game({ size: 19, rules: sgfRulesMap.GOE, komi: 6.5 });

    game.currentState.position.set(0, 1, Color.White);
    game.currentState.position.set(0, 2, Color.Black);
    game.currentState.position.set(1, 0, Color.Black);
    game.currentState.position.set(1, 1, Color.Black);

    game.currentState.player = Color.White;
    expect(game.isValidMove(0, 0)).toBe(true);

    game.play(0, 0);

    expect(game.currentState.blackCaptures).toBe(2);
    expect(game.currentState.whiteCaptures).toBe(0);
    expect(game.currentState.position.get(0, 0)).toBe(Color.Empty);
    expect(game.currentState.position.get(0, 1)).toBe(Color.Empty);
  });

  test('Disallow Ko (repeating of previous position)', () => {
    const game = new Game({ size: 19, rules: sgfRulesMap.Japanese, komi: 6.5 });

    game.currentState.position.set(0, 1, Color.Black);
    game.currentState.position.set(1, 0, Color.Black);
    game.currentState.position.set(2, 1, Color.Black);
    game.currentState.position.set(0, 2, Color.White);
    game.currentState.position.set(1, 3, Color.White);
    game.currentState.position.set(2, 2, Color.White);

    game.play(1, 2); // creates KO
    game.play(1, 1); // white captures

    expect(game.currentState.whiteCaptures).toBe(1);
    expect(game.currentState.blackCaptures).toBe(0);
    expect(game.currentState.position.get(1, 2)).toBe(Color.Empty);
    expect(game.currentState.position.get(1, 1)).toBe(Color.White);

    expect(game.isValidMove(1, 2)).toBe(false); // invalid capture

    game.play(5, 5); // ko threat
    game.play(6, 6); // answer

    expect(game.isValidMove(1, 2)).toBe(true); // black captures
  });

  test('Allow Ko in no rules', () => {
    const game = new Game({ size: 19, rules: new NoRules(), komi: 6.5 });

    game.currentState.position.set(0, 1, Color.Black);
    game.currentState.position.set(1, 0, Color.Black);
    game.currentState.position.set(2, 1, Color.Black);
    game.currentState.position.set(0, 2, Color.White);
    game.currentState.position.set(1, 3, Color.White);
    game.currentState.position.set(2, 2, Color.White);

    game.play(1, 2); // creates KO
    game.play(1, 1); // white captures

    expect(game.currentState.whiteCaptures).toBe(1);
    expect(game.currentState.blackCaptures).toBe(0);
    expect(game.currentState.position.get(1, 2)).toBe(Color.Empty);
    expect(game.currentState.position.get(1, 1)).toBe(Color.White);

    expect(game.isValidMove(1, 2)).toBe(true);
  });

  test('Disallow Triple Ko (repeating of any position) in Chinese rules', () => {
    const game = new Game({ size: 19, rules: sgfRulesMap.Chinese, komi: 6.5 });

    game.currentState.position.set(0, 1, Color.Black);
    game.currentState.position.set(1, 0, Color.Black);
    game.currentState.position.set(2, 1, Color.Black);
    game.currentState.position.set(0, 2, Color.White);
    game.currentState.position.set(1, 3, Color.White);
    game.currentState.position.set(2, 2, Color.White);
    game.currentState.position.set(1, 2, Color.Black);

    game.currentState.position.set(3, 1, Color.Black);
    game.currentState.position.set(4, 0, Color.Black);
    game.currentState.position.set(5, 1, Color.Black);
    game.currentState.position.set(3, 2, Color.White);
    game.currentState.position.set(4, 3, Color.White);
    game.currentState.position.set(5, 2, Color.White);
    game.currentState.position.set(4, 1, Color.White);

    game.currentState.position.set(6, 1, Color.Black);
    game.currentState.position.set(7, 0, Color.Black);
    game.currentState.position.set(8, 1, Color.Black);
    game.currentState.position.set(6, 2, Color.White);
    game.currentState.position.set(7, 3, Color.White);
    game.currentState.position.set(8, 2, Color.White);
    game.currentState.position.set(7, 1, Color.White);

    game.play(4, 2); // black captures 2nd ko
    game.play(1, 1); // white captures 1st ko
    game.play(7, 2); // black captures 3rd ko
    game.play(4, 1); // white captures 2nd ko
    game.play(1, 2); // black captures 1st ko
    expect(game.isValidMove(7, 1)).toBe(false); // white captures 3rd ko - invalid

    game.play(5, 5); // ko threat
    game.play(6, 6); // answer
    expect(game.isValidMove(7, 1)).toBe(true); // correct
  });

  test('Allow Triple Ko (repeating of any position) in Japanese rules', () => {
    const game = new Game({ size: 19, rules: sgfRulesMap.Japanese, komi: 6.5 });

    game.currentState.position.set(0, 1, Color.Black);
    game.currentState.position.set(1, 0, Color.Black);
    game.currentState.position.set(2, 1, Color.Black);
    game.currentState.position.set(0, 2, Color.White);
    game.currentState.position.set(1, 3, Color.White);
    game.currentState.position.set(2, 2, Color.White);
    game.currentState.position.set(1, 2, Color.Black);

    game.currentState.position.set(3, 1, Color.Black);
    game.currentState.position.set(4, 0, Color.Black);
    game.currentState.position.set(5, 1, Color.Black);
    game.currentState.position.set(3, 2, Color.White);
    game.currentState.position.set(4, 3, Color.White);
    game.currentState.position.set(5, 2, Color.White);
    game.currentState.position.set(4, 1, Color.White);

    game.currentState.position.set(6, 1, Color.Black);
    game.currentState.position.set(7, 0, Color.Black);
    game.currentState.position.set(8, 1, Color.Black);
    game.currentState.position.set(6, 2, Color.White);
    game.currentState.position.set(7, 3, Color.White);
    game.currentState.position.set(8, 2, Color.White);
    game.currentState.position.set(7, 1, Color.White);

    game.play(4, 2); // black captures 2nd ko
    game.play(1, 1); // white captures 1st ko
    game.play(7, 2); // black captures 3rd ko
    game.play(4, 1); // white captures 2nd ko
    game.play(1, 2); // black captures 1st ko
    expect(game.isValidMove(7, 1)).toBe(true); // white captures 3rd ko - valid
  });
});
