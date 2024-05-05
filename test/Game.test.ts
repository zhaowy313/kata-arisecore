/* Test of WGo.Game class and (handling of go game) */
import { Game, BoardPosition, sgfRulesMap, NoRules } from '../src/game';
import { Color } from '../src/types';
import assert, { strictEqual, deepEqual } from 'assert';

describe('Game object', () => {
  describe('Constructor', () => {
    it('Game is correctly created.', () => {
      const game = new Game({ size: 19, rules: sgfRulesMap.Japanese, komi: 6.5, handicap: 0 });
      strictEqual(game.size, 19);
      strictEqual(game.currentState.position.cols, 19);
      strictEqual(game.currentState.position.rows, 19);
      deepEqual(game.rules, sgfRulesMap.Japanese);
      strictEqual(game.currentState.player, Color.Black);
      strictEqual(game.komi, 6.5);
      strictEqual(game.currentState.blackCaptures, 0);
      strictEqual(game.currentState.whiteCaptures, 0);
      deepEqual(game.currentState.position, new BoardPosition());
    });

    it('Rectangular board size, chines rules', () => {
      const game = new Game({
        size: { cols: 13, rows: 17 },
        rules: sgfRulesMap.Chinese,
        komi: 0.5,
      });
      deepEqual(game.size, { cols: 13, rows: 17 });
      strictEqual(game.rules, sgfRulesMap.Chinese);
      strictEqual(game.komi, 0.5);
      strictEqual(game.currentState.position.cols, 13);
      strictEqual(game.currentState.position.rows, 17);
      deepEqual(game.currentState.position, new BoardPosition(13, 17));
    });

    it('1 handicap', () => {
      const game = new Game({ size: 19, rules: sgfRulesMap.Japanese, komi: 0.5, handicap: 1 });
      strictEqual(game.handicap, 1);
      strictEqual(game.currentState.player, Color.Black);
    });

    it('2 handicaps', () => {
      const game = new Game({ size: 19, rules: sgfRulesMap.Japanese, komi: 0.5, handicap: 2 });
      strictEqual(game.handicap, 2);
      strictEqual(game.currentState.player, Color.White);
    });
  });

  describe('Method makeMove', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let game: Game;

    beforeEach(() => {
      game = new Game({ size: 19, rules: sgfRulesMap.Japanese, komi: 6.5, handicap: 0 });
    });

    it('Basic Game#makeMove() functionality.', () => {
      game.makeMove({ x: 4, y: 4, c: Color.Black });

      strictEqual(game.currentState.position.get(4, 4), Color.Black);
      strictEqual(game.currentState.player, Color.White);
      strictEqual(game.currentState.blackCaptures, 0);
      strictEqual(game.currentState.whiteCaptures, 0);
    });

    it('Capturing stones', () => {
      game.currentState.position.set(0, 0, Color.Black);
      game.currentState.position.set(0, 1, Color.Black);
      game.currentState.position.set(1, 0, Color.Black);
      game.currentState.position.set(1, 1, Color.Black);
      game.currentState.position.set(0, 2, Color.White);
      game.currentState.position.set(1, 2, Color.White);
      game.currentState.position.set(2, 0, Color.White);

      game.makeMove({ x: 2, y: 1, c: Color.White });

      strictEqual(game.currentState.position.get(0, 0), Color.Empty);
      strictEqual(game.currentState.position.get(0, 1), Color.Empty);
      strictEqual(game.currentState.position.get(1, 0), Color.Empty);
      strictEqual(game.currentState.position.get(1, 1), Color.Empty);
      strictEqual(game.currentState.position.get(2, 1), Color.White);
      strictEqual(game.currentState.blackCaptures, 0);
      strictEqual(game.currentState.whiteCaptures, 4);
    });

    it('Illegal moves can be played', () => {
      game.currentState.position.set(0, 0, Color.Black);
      game.currentState.position.set(1, 0, Color.Black);
      game.currentState.position.set(0, 1, Color.White);

      game.makeMove({ x: 1, y: 0, c: Color.White });
      strictEqual(game.currentState.blackCaptures, 0);
      strictEqual(game.currentState.whiteCaptures, 1);
      strictEqual(game.currentState.position.get(1, 0), Color.White);

      game.makeMove({ x: 0, y: 1, c: Color.Black });
      strictEqual(game.currentState.blackCaptures, 0);
      strictEqual(game.currentState.whiteCaptures, 1);
      strictEqual(game.currentState.position.get(0, 1), Color.Black);
    });
  });

  describe('Check validity', () => {
    it('Invalid moves', () => {
      const game = new Game({ size: 9, rules: sgfRulesMap.Japanese, komi: 6.5 });

      game.currentState.position.set(0, 1, Color.Black);
      game.currentState.position.set(1, 0, Color.White);

      const clonedPos = game.currentState.position.clone();

      assert(!game.isValidMove(0, 1));
      assert(!game.isValidMove(1, 0));
      assert(!game.isValidMove(0, -1));
      assert(!game.isValidMove(-1, 0));
      assert(!game.isValidMove(0, 9));
      assert(!game.isValidMove(9, 0));

      deepEqual(game.currentState.position, clonedPos);
    });

    it('Disallow suicide', () => {
      const game = new Game({ size: 19, rules: sgfRulesMap.Japanese, komi: 6.5 });

      game.currentState.position.set(0, 1, Color.White);
      game.currentState.position.set(0, 2, Color.Black);
      game.currentState.position.set(1, 0, Color.Black);
      game.currentState.position.set(1, 1, Color.Black);

      game.currentState.player = Color.White;
      assert(!game.isValidMove(0, 0));
    });

    it('Allow suicide in ING rules', () => {
      const game = new Game({ size: 19, rules: sgfRulesMap.GOE, komi: 6.5 });

      game.currentState.position.set(0, 1, Color.White);
      game.currentState.position.set(0, 2, Color.Black);
      game.currentState.position.set(1, 0, Color.Black);
      game.currentState.position.set(1, 1, Color.Black);

      game.currentState.player = Color.White;
      assert(game.isValidMove(0, 0));

      game.play(0, 0);

      strictEqual(game.currentState.blackCaptures, 2);
      strictEqual(game.currentState.whiteCaptures, 0);
      strictEqual(game.currentState.position.get(0, 0), Color.Empty);
      strictEqual(game.currentState.position.get(0, 1), Color.Empty);
    });

    it('Disallow Ko (repeating of previous position)', () => {
      const game = new Game({ size: 19, rules: sgfRulesMap.Japanese, komi: 6.5 });

      game.currentState.position.set(0, 1, Color.Black);
      game.currentState.position.set(1, 0, Color.Black);
      game.currentState.position.set(2, 1, Color.Black);
      game.currentState.position.set(0, 2, Color.White);
      game.currentState.position.set(1, 3, Color.White);
      game.currentState.position.set(2, 2, Color.White);

      game.play(1, 2); // creates KO
      game.play(1, 1); // white captures

      strictEqual(game.currentState.whiteCaptures, 1);
      strictEqual(game.currentState.blackCaptures, 0);
      strictEqual(game.currentState.position.get(1, 2), Color.Empty);
      strictEqual(game.currentState.position.get(1, 1), Color.White);

      assert(!game.isValidMove(1, 2)); // invalid capture

      game.play(5, 5); // ko threat
      game.play(6, 6); // answer

      assert(game.isValidMove(1, 2)); // black captures
    });

    it('Allow Ko in no rules', () => {
      const game = new Game({ size: 19, rules: new NoRules(), komi: 6.5 });

      game.currentState.position.set(0, 1, Color.Black);
      game.currentState.position.set(1, 0, Color.Black);
      game.currentState.position.set(2, 1, Color.Black);
      game.currentState.position.set(0, 2, Color.White);
      game.currentState.position.set(1, 3, Color.White);
      game.currentState.position.set(2, 2, Color.White);

      game.play(1, 2); // creates KO
      game.play(1, 1); // white captures

      strictEqual(game.currentState.whiteCaptures, 1);
      strictEqual(game.currentState.blackCaptures, 0);
      strictEqual(game.currentState.position.get(1, 2), Color.Empty);
      strictEqual(game.currentState.position.get(1, 1), Color.White);

      assert(game.isValidMove(1, 2));
    });

    it('Disallow Triple Ko (repeating of any position) in Chinese rules', () => {
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
      assert(!game.isValidMove(7, 1)); // white captures 3rd ko - invalid

      game.play(5, 5); // ko threat
      game.play(6, 6); // answer
      assert(game.isValidMove(7, 1)); // correct
    });

    it('Allow Triple Ko (repeating of any position) in Japanese rules', () => {
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
      assert(game.isValidMove(7, 1)); // white captures 3rd ko - valid
    });
  });
});
