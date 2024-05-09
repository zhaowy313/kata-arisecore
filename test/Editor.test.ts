import { describe, test, assert, expect } from 'vitest';
import { Editor } from '../src/editor';
import { Kifu, KifuNode, MarkupType } from '../src/kifu';
import { Color } from '../src/types';
import { IngRules, NoRules, sgfRulesMap } from '../src/game';

describe('editor#newGame', () => {
  test('New game without any options', () => {
    const editor = new Editor();
    editor.newGame();
    const gameState = editor.getGameState();

    assert.strictEqual(gameState.position.cols, 19);
    assert.strictEqual(gameState.position.rows, 19);
    assert.strictEqual(editor.getRules(), editor.config.defaultRules);
    assert.strictEqual(gameState.player, Color.Black);

    assert.strictEqual(editor.kifu.info.boardSize, 19);
    assert.strictEqual(editor.kifu.info.komi, 6.5);
    assert.strictEqual(editor.kifu.info.rules, 'Japanese');

    assert.strictEqual(editor.kifu.root, editor.currentNode);
  });

  test('New game with custom size and rules', () => {
    const editor = new Editor();
    const rules = new IngRules();
    editor.newGame({ size: { cols: 9, rows: 13 }, rules, komi: 7.5 });
    const gameState = editor.getGameState();

    assert.strictEqual(gameState.position.cols, 9);
    assert.strictEqual(gameState.position.rows, 13);
    assert.strictEqual(editor.getRules(), rules);
    assert.deepStrictEqual(editor.kifu.info.boardSize, { cols: 9, rows: 13 });
    assert.strictEqual(editor.kifu.info.rules, 'GOE');
    assert.strictEqual(editor.kifu.info.komi, 7.5);

    assert.strictEqual(editor.kifu.root, editor.currentNode);
  });
});

describe('editor#loadKifu', () => {
  test('Load game from kifu', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9]RU[GOE])');
    editor.loadKifu(kifu);
    const gameState = editor.getGameState();

    assert.strictEqual(gameState.position.cols, 9);
    assert.strictEqual(gameState.position.rows, 9);
    assert.strictEqual(editor.getRules(), sgfRulesMap.GOE);
    assert.strictEqual(gameState.player, Color.Black);

    assert(editor.kifu.info.komi == null);
    assert.strictEqual(editor.kifu.info.rules, 'GOE');
    assert.strictEqual(editor.kifu.info.boardSize, 9);

    assert.strictEqual(kifu, editor.kifu);
    assert.strictEqual(editor.kifu.root, editor.currentNode);
  });

  test('Load game with setup', () => {
    const editor = new Editor();

    editor.loadKifu(Kifu.fromSGF('(;SZ[19]RU[Japanese]HA[3]KM[0]AB[ab][ba][bb])'));
    let gameState = editor.getGameState();

    assert.deepStrictEqual(gameState.position.get(0, 1), Color.Black);
    assert.deepStrictEqual(gameState.position.get(1, 0), Color.Black);
    assert.deepStrictEqual(gameState.position.get(1, 1), Color.Black);
    assert.strictEqual(gameState.player, Color.White);
    assert.strictEqual(editor.kifu.info.handicap, 3);

    editor.loadKifu(Kifu.fromSGF('(;SZ[9]RU[GOE])'));
    gameState = editor.getGameState();

    assert.strictEqual(editor.kifu.info.rules, 'GOE');
    assert.strictEqual(editor.kifu.info.boardSize, 9);
    assert.deepStrictEqual(gameState.position.get(0, 1), Color.Empty);
    assert.deepStrictEqual(gameState.position.get(1, 0), Color.Empty);
    assert.deepStrictEqual(gameState.position.get(1, 1), Color.Empty);
  });

  test('Player is correctly set, when HA property is present', () => {
    const editor = new Editor();

    editor.loadKifu(Kifu.fromSGF('(;HA[0])'));
    assert.strictEqual(editor.getGameState().player, Color.Black);

    editor.loadKifu(Kifu.fromSGF('(;HA[1]PL[W])'));
    assert.strictEqual(editor.getGameState().player, Color.White);

    editor.loadKifu(Kifu.fromSGF('(;HA[2])'));
    assert.strictEqual(editor.getGameState().player, Color.White);

    editor.loadKifu(Kifu.fromSGF('(;HA[3]PL[B])'));
    assert.strictEqual(editor.getGameState().player, Color.Black);
  });
});

describe('editor#next', () => {
  test('Simple next without params', () => {
    const editor = new Editor();
    editor.loadKifu(Kifu.fromSGF('(;SZ[9];B[aa];W[bb](;AB[ab][ac]PL[W])(;AW[ab][ac]))'));

    assert(editor.next());
    let gameState = editor.getGameState();

    assert.deepStrictEqual(editor.currentNode.move, { x: 0, y: 0, c: Color.Black });
    assert.strictEqual(gameState.position.get(0, 0), Color.Black);
    assert.strictEqual(gameState.player, Color.White);
    assert.deepStrictEqual(editor.currentPath, { moveNumber: 1, variations: [] });

    assert(editor.next());
    gameState = editor.getGameState();

    assert.deepStrictEqual(editor.currentNode.move, { x: 1, y: 1, c: Color.White });
    assert.strictEqual(gameState.position.get(0, 0), Color.Black);
    assert.strictEqual(gameState.position.get(1, 1), Color.White);
    assert.strictEqual(gameState.player, Color.Black);
    assert.deepStrictEqual(editor.currentPath, { moveNumber: 2, variations: [] });

    assert(editor.next());
    gameState = editor.getGameState();

    assert.deepStrictEqual(editor.currentNode.player, Color.White);
    assert.strictEqual(gameState.position.get(0, 0), Color.Black);
    assert.strictEqual(gameState.position.get(0, 1), Color.Black);
    assert.strictEqual(gameState.position.get(0, 2), Color.Black);
    assert.strictEqual(gameState.position.get(1, 1), Color.White);
    assert.strictEqual(gameState.player, Color.White);
    assert.deepStrictEqual(editor.currentPath, { moveNumber: 3, variations: [0] });

    assert(!editor.next());
  });

  test('Next with argument', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9];B[aa];W[bb](;AB[ab][ac]PL[W])(;AW[ab][ac]))');
    editor.loadKifu(kifu);

    assert(!editor.next(1));
    assert(editor.next(0));
    assert(!editor.next(new KifuNode()));
    assert(editor.next(kifu.root.children[0].children[0]));
    assert(editor.next(1));
    const gameState = editor.getGameState();

    assert.strictEqual(editor.currentNode, kifu.root.children[0].children[0].children[1]);
    assert.strictEqual(gameState.position.get(0, 0), Color.Black);
    assert.strictEqual(gameState.position.get(0, 1), Color.White);
    assert.strictEqual(gameState.position.get(0, 2), Color.White);
    assert.strictEqual(gameState.position.get(1, 1), Color.White);
    assert.strictEqual(gameState.player, Color.Black);
    assert.deepStrictEqual(editor.currentPath, { moveNumber: 3, variations: [1] });

    assert(!editor.next());
  });

  test('Stones are correctly captured after next', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;AB[aa][ab][ba][bb]AW[ac][bc][ca];W[cb])');
    editor.loadKifu(kifu);
    editor.next();
    const gameState = editor.getGameState();

    assert.strictEqual(gameState.position.get(0, 0), Color.Empty);
    assert.strictEqual(gameState.position.get(0, 1), Color.Empty);
    assert.strictEqual(gameState.position.get(1, 0), Color.Empty);
    assert.strictEqual(gameState.position.get(1, 1), Color.Empty);
    assert.strictEqual(gameState.position.get(0, 2), Color.White);
    assert.strictEqual(gameState.position.get(1, 2), Color.White);
    assert.strictEqual(gameState.position.get(2, 0), Color.White);
    assert.strictEqual(gameState.position.get(2, 1), Color.White);
    assert.strictEqual(gameState.blackCaptures, 0);
    assert.strictEqual(gameState.whiteCaptures, 4);
  });

  test('Suicide works', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;AB[aa][ab][ba]AW[ac][bc][ca][cb];B[bb])');
    editor.loadKifu(kifu);
    editor.next();
    const gameState = editor.getGameState();

    assert.strictEqual(gameState.position.get(0, 0), Color.Empty);
    assert.strictEqual(gameState.position.get(0, 1), Color.Empty);
    assert.strictEqual(gameState.position.get(1, 0), Color.Empty);
    assert.strictEqual(gameState.position.get(1, 1), Color.Empty);
    assert.strictEqual(gameState.position.get(0, 2), Color.White);
    assert.strictEqual(gameState.position.get(1, 2), Color.White);
    assert.strictEqual(gameState.position.get(2, 0), Color.White);
    assert.strictEqual(gameState.position.get(2, 1), Color.White);
    assert.strictEqual(gameState.blackCaptures, 0);
    assert.strictEqual(gameState.whiteCaptures, 4);
  });
});

describe('editor#previous', () => {
  test('Simple previous works', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9];B[aa];W[bb](;AB[ab][ac]PL[W])(;AW[ab][ac]))');

    editor.loadKifu(kifu);
    editor.next();
    editor.next();
    editor.next();

    assert(editor.previous());
    let gameState = editor.getGameState();

    assert.deepStrictEqual(editor.currentNode.move, { x: 1, y: 1, c: Color.White });
    assert.strictEqual(gameState.position.get(0, 0), Color.Black);
    assert.strictEqual(gameState.position.get(1, 1), Color.White);
    assert.strictEqual(gameState.player, Color.Black);
    assert.deepStrictEqual(editor.currentPath, { moveNumber: 2, variations: [] });
    assert.strictEqual(gameState.position.get(0, 1), Color.Empty);
    assert.strictEqual(gameState.position.get(0, 2), Color.Empty);

    assert(editor.previous());
    gameState = editor.getGameState();

    assert.deepStrictEqual(editor.currentNode.move, { x: 0, y: 0, c: Color.Black });
    assert.strictEqual(gameState.position.get(0, 0), Color.Black);
    assert.strictEqual(gameState.player, Color.White);
    assert.deepStrictEqual(editor.currentPath, { moveNumber: 1, variations: [] });
    assert.strictEqual(gameState.position.get(1, 1), Color.Empty);

    assert(editor.previous());
    gameState = editor.getGameState();

    assert.strictEqual(editor.currentNode, kifu.root);
    assert.strictEqual(gameState.player, Color.Black);
    assert.strictEqual(gameState.position.get(0, 0), Color.Empty);
    assert.deepStrictEqual(editor.currentPath, { moveNumber: 0, variations: [] });

    assert(!editor.previous());
  });

  test('Capturing works with previous', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;AB[aa][ab][ba][bb]AW[ac][bc][ca];W[cb])');
    editor.loadKifu(kifu);
    editor.next();
    editor.previous();

    const gameState = editor.getGameState();

    assert.strictEqual(gameState.position.get(0, 0), Color.Black);
    assert.strictEqual(gameState.position.get(0, 1), Color.Black);
    assert.strictEqual(gameState.position.get(1, 0), Color.Black);
    assert.strictEqual(gameState.position.get(1, 1), Color.Black);
    assert.strictEqual(gameState.position.get(0, 2), Color.White);
    assert.strictEqual(gameState.position.get(1, 2), Color.White);
    assert.strictEqual(gameState.position.get(2, 0), Color.White);
    assert.strictEqual(gameState.position.get(2, 1), Color.Empty);
    assert.strictEqual(gameState.blackCaptures, 0);
    assert.strictEqual(gameState.whiteCaptures, 0);
  });
});

describe('editor#last', () => {
  test('Go to last node', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9](;B[aa];W[bb](;B[ab])(;B[ba]))(;B[bb];W[aa]))');
    editor.loadKifu(kifu);

    assert(editor.last());
    const gameState = editor.getGameState();

    assert.deepStrictEqual(editor.currentNode.move, { c: Color.Black, x: 0, y: 1 });
    assert.deepStrictEqual(editor.currentPath, { moveNumber: 3, variations: [0, 0] });
    assert.strictEqual(gameState.position.get(0, 0), Color.Black);
    assert.strictEqual(gameState.position.get(1, 1), Color.White);
    assert.strictEqual(gameState.position.get(0, 1), Color.Black);
    assert.strictEqual(gameState.position.get(1, 0), Color.Empty);
    assert.strictEqual(gameState.player, Color.White);

    assert(!editor.last());
  });

  test('Go to last node, remembering previous variations', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9](;B[aa];W[bb](;B[ab])(;B[ba]))(;B[bb];W[aa]))');
    editor.loadKifu(kifu);
    editor.next();
    editor.next();
    editor.next(1);
    editor.previous();
    editor.previous();
    editor.previous();

    assert(editor.last());
    const gameState = editor.getGameState();

    assert.deepStrictEqual(editor.currentNode.move, { c: Color.Black, x: 1, y: 0 });
    assert.deepStrictEqual(editor.currentPath, { moveNumber: 3, variations: [0, 1] });
    assert.strictEqual(gameState.position.get(0, 0), Color.Black);
    assert.strictEqual(gameState.position.get(1, 1), Color.White);
    assert.strictEqual(gameState.position.get(1, 0), Color.Black);
    assert.strictEqual(gameState.position.get(0, 1), Color.Empty);
    assert.strictEqual(gameState.player, Color.White);

    assert(!editor.last());
  });
});

describe('editor#first', () => {
  test('Go to first node', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9](;B[aa];W[bb](;B[ab])(;B[ba]))(;B[bb];W[aa]))');
    editor.loadKifu(kifu);
    editor.last();

    assert(editor.first());
    const gameState = editor.getGameState();

    assert.strictEqual(editor.currentNode, editor.kifu.root);
    assert.deepStrictEqual(editor.currentPath, { moveNumber: 0, variations: [] });
    assert.strictEqual(gameState.position.get(0, 0), Color.Empty);
    assert.strictEqual(gameState.position.get(1, 1), Color.Empty);
    assert.strictEqual(gameState.position.get(1, 0), Color.Empty);
    assert.strictEqual(gameState.position.get(0, 1), Color.Empty);
    assert.strictEqual(gameState.player, Color.Black);
    assert(!editor.first());
  });
});

describe('editor#goTo', () => {
  test('Go to specified move number', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9](;B[aa];W[bb](;B[ab])(;B[ba]))(;B[bb];W[aa]))');
    editor.loadKifu(kifu);

    assert(editor.goTo(2));
    let gameState = editor.getGameState();

    assert.deepStrictEqual(editor.currentNode.move, { c: Color.White, x: 1, y: 1 });
    assert.deepStrictEqual(editor.currentPath, { moveNumber: 2, variations: [0] });
    assert.strictEqual(gameState.position.get(0, 0), Color.Black);
    assert.strictEqual(gameState.position.get(1, 1), Color.White);
    assert.strictEqual(gameState.player, Color.Black);

    assert(editor.goTo(1));
    gameState = editor.getGameState();

    assert.deepStrictEqual(editor.currentNode.move, { c: Color.Black, x: 0, y: 0 });
    assert.deepStrictEqual(editor.currentPath, { moveNumber: 1, variations: [0] });
    assert.strictEqual(gameState.position.get(0, 0), Color.Black);
    assert.strictEqual(gameState.position.get(1, 1), Color.Empty);
    assert.strictEqual(gameState.player, Color.White);
    assert(!editor.goTo(4));
  });

  test('Go to specified path', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9](;B[aa];W[bb](;B[ab])(;B[ba]))(;B[bb];W[aa]))');
    editor.loadKifu(kifu);

    assert(editor.goTo({ moveNumber: 2, variations: [1] }));
    const gameState = editor.getGameState();

    assert.deepStrictEqual(editor.currentNode.move, { c: Color.White, x: 0, y: 0 });
    assert.deepStrictEqual(editor.currentPath, { moveNumber: 2, variations: [1] });
    assert.strictEqual(gameState.position.get(1, 1), Color.Black);
    assert.strictEqual(gameState.position.get(0, 0), Color.White);
    assert.strictEqual(gameState.player, Color.Black);
    assert(!editor.goTo({ moveNumber: 3, variations: [1] }));
  });

  test('Go to specified kifu node', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9](;B[aa];W[bb](;B[ab])(;B[ba]))(;B[bb];W[aa]))');
    editor.loadKifu(kifu);

    assert(editor.goTo(kifu.root.children[0].children[0].children[1]));
    assert.deepStrictEqual(editor.currentNode.move, { c: Color.Black, x: 1, y: 0 });
    assert.deepStrictEqual(editor.currentPath, { moveNumber: 3, variations: [0, 1] });
    const gameState = editor.getGameState();
    assert.strictEqual(gameState.position.get(0, 0), Color.Black);
    assert.strictEqual(gameState.position.get(1, 1), Color.White);
    assert.strictEqual(gameState.position.get(1, 0), Color.Black);
    assert(!editor.goTo(new KifuNode()));
  });

  test('Go to method, remembering previous variations', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9](;B[aa];W[bb](;B[ab])(;B[ba]))(;B[bb];W[aa]))');
    editor.loadKifu(kifu);

    editor.goTo({ moveNumber: 1, variations: [1] });
    editor.goTo(0);

    assert(!editor.goTo(3));
    assert.deepStrictEqual(editor.currentNode.move, { c: Color.White, x: 0, y: 0 });
    assert.deepStrictEqual(editor.currentPath, { moveNumber: 2, variations: [1] });
    const gameState = editor.getGameState();
    assert.strictEqual(gameState.position.get(1, 1), Color.Black);
    assert.strictEqual(gameState.position.get(0, 0), Color.White);
    assert.strictEqual(gameState.player, Color.Black);
    assert(!editor.last());
  });
});

describe('editor#nextMatch', () => {
  test('Next match method', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9](;B[aa];W[bb]C[bar](;B[ab]C[foo])(;B[ba]))(;B[bb];W[aa]))');
    editor.loadKifu(kifu);

    assert(editor.nextMatch((node) => !!node.comment));
    assert.strictEqual(editor.currentNode.comment, 'bar');
    assert(editor.nextMatch((node) => !!node.comment));
    assert.strictEqual(editor.currentNode.comment, 'foo');
    assert.deepStrictEqual(editor.currentNode.move, { c: Color.Black, x: 0, y: 1 });
    assert.deepStrictEqual(editor.currentPath, { moveNumber: 3, variations: [0, 0] });
    const gameState = editor.getGameState();
    assert.strictEqual(gameState.position.get(0, 0), Color.Black);
    assert.strictEqual(gameState.position.get(1, 1), Color.White);
    assert.strictEqual(gameState.position.get(0, 1), Color.Black);
    assert.strictEqual(gameState.position.get(1, 0), Color.Empty);
    assert.strictEqual(gameState.player, Color.White);

    const node = editor.currentNode;
    assert(!editor.nextMatch((node) => !!node.comment));
    assert.strictEqual(node, editor.currentNode);
  });

  test('Next match method remembering last visited nodes', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9](;B[aa];W[bb](;B[ab]C[foo])(;B[ba]))(;B[bb];W[aa]))');
    editor.loadKifu(kifu);

    editor.next();
    editor.next();
    editor.next(1);
    editor.previous();
    editor.previous();
    editor.previous();

    const node = editor.currentNode;
    assert(!editor.nextMatch((node) => !!node.comment));
    assert.strictEqual(node, editor.currentNode);

    assert(
      editor.nextMatch((node) =>
        node.move && 'x' in node.move ? node.move.x === 1 && node.move.y === 0 : false,
      ),
    );
    assert.deepStrictEqual(editor.currentNode.move, { c: Color.Black, x: 1, y: 0 });
  });
});

describe('editor#previousMatch', () => {
  test('Previous match method', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF(
      '(;SZ[9]C[bar](;B[aa]C[baz];W[bb](;B[ab]C[foo])(;B[ba]))(;B[bb];W[aa]))',
    );
    editor.loadKifu(kifu);
    editor.last();

    assert(editor.previousMatch((node) => !!node.comment));
    const gameState = editor.getGameState();

    assert.strictEqual(editor.currentNode.comment, 'baz');
    assert.deepStrictEqual(editor.currentNode.move, { c: Color.Black, x: 0, y: 0 });
    assert.deepStrictEqual(editor.currentPath, { moveNumber: 1, variations: [0] });
    assert.strictEqual(gameState.position.get(0, 0), Color.Black);
    assert.strictEqual(gameState.position.get(1, 1), Color.Empty);
    assert.strictEqual(gameState.position.get(0, 1), Color.Empty);
    assert.strictEqual(gameState.player, Color.White);

    assert(editor.previousMatch((node) => !!node.comment));

    assert.strictEqual(editor.currentNode, editor.kifu.root);
    assert.strictEqual(editor.currentNode.comment, 'bar');

    assert(!editor.previousMatch((node) => !!node.comment));
    assert.strictEqual(editor.currentNode, editor.kifu.root);
  });
});

describe('editor#isValidMove', () => {
  test('Simple checking of move validity', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9];B[ab];W[ba])');
    editor.loadKifu(kifu);
    editor.last();

    assert(!editor.isValidMove(0, 1));
    assert(!editor.isValidMove(1, 0));
    assert(!editor.isValidMove(0, -1));
    assert(!editor.isValidMove(-1, 0));
    assert(!editor.isValidMove(0, 9));
    assert(!editor.isValidMove(9, 0));
    assert(editor.isValidMove(0, 0));
    assert.strictEqual(editor.getGameState().position.get(0, 0), Color.Empty);
  });

  test('Validation of ko works', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9]AB[ab][ba][cb]AW[ac][bd][cc];B[bc];W[bb];B[ff];W[gg])');
    editor.loadKifu(kifu);
    editor.next();
    editor.next();

    assert(!editor.isValidMove(1, 2)); // invalid capture

    // ko threat
    editor.next();
    editor.next();

    assert(editor.isValidMove(1, 2)); // black captures
  });

  test('Suicide impossible in Japanese rules, but allowed in Ing rules', () => {
    const editor = new Editor();

    editor.loadKifu(Kifu.fromSGF('(;SZ[9]AB[ab]AW[ac][ba][bb])'));
    assert(!editor.isValidMove(0, 0));

    editor.loadKifu(Kifu.fromSGF('(;SZ[9]RU[GOE]AB[ab]AW[ac][ba][bb])'));
    assert(editor.isValidMove(0, 0));
  });
});

describe('editor#isFirst', () => {
  test('Checking current node is root', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9];B[ab];W[ba])');
    editor.loadKifu(kifu);

    assert(editor.isFirst());
    editor.next();
    assert(!editor.isFirst());
    editor.previous();
    assert(editor.isFirst());
  });
});

describe('editor#isLast', () => {
  test('Checking current node is leaf', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9];B[ab];W[ba])');
    editor.loadKifu(kifu);

    assert(!editor.isLast());
    editor.next();
    assert(!editor.isLast());
    editor.next();
    assert(editor.isLast());
    editor.previous();
    assert(!editor.isLast());
  });
});

describe('editor#getVariations', () => {
  test('Getting variations - basic', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9]C[bar](;B[aa]C[baz];W[bb](;C[foo])(;B[ba]))(;B[bb];W[aa]))');
    editor.loadKifu(kifu);

    assert.deepStrictEqual(editor.getVariations(), kifu.root.children);

    editor.next();
    assert.deepStrictEqual(editor.getVariations(), kifu.root.children[0].children);

    editor.next();
    assert.deepStrictEqual(editor.getVariations(), [kifu.root.children[0].children[0].children[1]]);

    editor.next();
    assert.deepStrictEqual(editor.getVariations(), []);
  });

  test('Getting variations - current', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF(
      '(;SZ[9]C[bar]ST[1](;B[aa]C[baz];W[bb](;C[foo])(;B[ba]))(;B[bb];W[aa]))',
    );
    editor.loadKifu(kifu);

    assert.deepStrictEqual(editor.getVariations(), []);

    editor.next();
    assert.deepStrictEqual(editor.getVariations(), kifu.root.children);

    editor.next();
    assert.deepStrictEqual(editor.getVariations(), kifu.root.children[0].children);

    editor.next();
    assert.deepStrictEqual(editor.getVariations(), [kifu.root.children[0].children[0].children[1]]);
  });
});

describe('editor#getGameState', () => {
  test('Getting game state', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9];B[ab];W[aa];B[ba])');
    editor.loadKifu(kifu);

    let gameState = editor.getGameState();
    assert.strictEqual(gameState.position.cols, 9);
    assert.strictEqual(gameState.position.rows, 9);
    assert.strictEqual(gameState.blackCaptures, 0);
    assert.strictEqual(gameState.whiteCaptures, 0);
    assert.strictEqual(gameState.player, Color.Black);
    editor.last();
    gameState = editor.getGameState();
    assert.strictEqual(gameState.blackCaptures, 1);
    assert.strictEqual(gameState.whiteCaptures, 0);
    assert.strictEqual(gameState.player, Color.White);
    editor.previous();
    gameState = editor.getGameState();
    assert.strictEqual(gameState.blackCaptures, 0);
    assert.strictEqual(gameState.whiteCaptures, 0);
    assert.strictEqual(gameState.player, Color.Black);
  });

  test('Viewport is stored', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9];VW[ab:cd]B[ab];W[aa];B[ba])');
    editor.loadKifu(kifu);

    let gameState = editor.getGameState();
    assert.strictEqual(gameState.properties.boardSection, undefined);
    editor.next();
    gameState = editor.getGameState();
    assert.deepStrictEqual(gameState.properties.boardSection, { x1: 0, y1: 1, x2: 2, y2: 3 });
    editor.next();
    gameState = editor.getGameState();
    assert.deepStrictEqual(gameState.properties.boardSection, { x1: 0, y1: 1, x2: 2, y2: 3 });
    editor.previous();
    editor.previous();
    gameState = editor.getGameState();
    assert.deepStrictEqual(gameState.properties.boardSection, undefined);
  });

  test('Dim is stored', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9];DD[ab:cd]B[ab];W[aa];B[ba])');
    editor.loadKifu(kifu);

    let gameState = editor.getGameState();
    assert.strictEqual(gameState.properties.dim, undefined);
    editor.next();
    gameState = editor.getGameState();
    assert.deepStrictEqual(gameState.properties.dim, [{ x1: 0, y1: 1, x2: 2, y2: 3 }]);
    editor.next();
    gameState = editor.getGameState();
    assert.deepStrictEqual(gameState.properties.dim, [{ x1: 0, y1: 1, x2: 2, y2: 3 }]);
    editor.previous();
    editor.previous();
    gameState = editor.getGameState();
    assert.deepStrictEqual(gameState.properties.dim, undefined);
  });
});

describe('editor#getRules', () => {
  test('Rules are correctly set and get', () => {
    const editor = new Editor();
    editor.newGame();
    assert.strictEqual(editor.getRules(), editor.config.defaultRules);

    const noRules = new NoRules();
    editor.newGame({ rules: noRules });
    assert.strictEqual(editor.getRules(), noRules);
  });

  test('Rules are correctly set and get from kifu', () => {
    const editor = new Editor();

    editor.loadKifu(Kifu.fromSGF('(;SZ[9]RU[GOE])'));
    assert.strictEqual(editor.getRules(), sgfRulesMap.GOE);

    editor.loadKifu(Kifu.fromSGF('(;SZ[9]RU[Japanese])'));
    assert.strictEqual(editor.getRules(), sgfRulesMap.Japanese);

    editor.loadKifu(Kifu.fromSGF('(;SZ[9]RU[NZ])'));
    assert.strictEqual(editor.getRules(), sgfRulesMap.NZ);

    editor.loadKifu(Kifu.fromSGF('(;SZ[9]RU[Chinese])'));
    assert.strictEqual(editor.getRules(), sgfRulesMap.Chinese);

    editor.loadKifu(Kifu.fromSGF('(;SZ[9]RU[AGA])'));
    assert.strictEqual(editor.getRules(), sgfRulesMap.AGA);
  });
});

describe('editor#getMarkup', () => {
  test('Getting markup', () => {
    // probably WIP
    const editor = new Editor();
    editor.newGame();
    assert.strictEqual(editor.currentNode.markup, editor.getMarkup());
  });
});

describe('editor#play', () => {
  test('Play method works', () => {
    const editor = new Editor();
    editor.newGame();
    editor.play(0, 1);
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.Black);
    assert.deepStrictEqual(editor.currentNode.move, { x: 0, y: 1, c: Color.Black });
    editor.play(0, 0);
    assert.strictEqual(editor.getGameState().position.get(0, 0), Color.White);
    assert.deepStrictEqual(editor.currentNode.move, { x: 0, y: 0, c: Color.White });
    editor.play(1, 0);
    assert.strictEqual(editor.getGameState().position.get(0, 0), Color.Empty);
    assert.strictEqual(editor.getGameState().blackCaptures, 1);
  });

  test('Invalid moves can be played', () => {
    const editor = new Editor();
    editor.newGame();
    editor.play(0, 1);
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.Black);
    assert.deepStrictEqual(editor.currentNode.move, { x: 0, y: 1, c: Color.Black });
    editor.play(0, 1);
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.White);
    assert.deepStrictEqual(editor.currentNode.move, { x: 0, y: 1, c: Color.White });
    editor.previous();
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.Black);
    assert.deepStrictEqual(editor.currentNode.move, { x: 0, y: 1, c: Color.Black });
  });

  test('Variations are created', () => {
    const editor = new Editor();
    editor.newGame();
    editor.play(0, 1);
    editor.previous();
    editor.play(1, 0);
    editor.previous();
    assert.strictEqual(editor.currentNode.children.length, 2);
    assert.deepStrictEqual(editor.currentNode.children[0].move, { x: 0, y: 1, c: Color.Black });
    assert.deepStrictEqual(editor.currentNode.children[1].move, { x: 1, y: 0, c: Color.Black });
  });
});

describe('editor#pass', () => {
  test('Pass method works', () => {
    const editor = new Editor();
    editor.newGame();
    editor.pass();
    assert.deepStrictEqual(editor.currentNode.move, { c: Color.Black });
    assert.strictEqual(editor.getGameState().player, Color.White);
    editor.pass();
    assert.deepStrictEqual(editor.currentNode.move, { c: Color.White });
    assert.strictEqual(editor.getGameState().player, Color.Black);
  });

  test('Variations are created', () => {
    const editor = new Editor();
    editor.newGame();
    editor.pass();
    editor.previous();
    editor.pass();
    editor.previous();
    assert.strictEqual(editor.currentNode.children.length, 2);
    assert.deepStrictEqual(editor.currentNode.children[0].move, { c: Color.Black });
    assert.deepStrictEqual(editor.currentNode.children[1].move, { c: Color.Black });
  });
});

describe('editor#setMove', () => {
  test('Setting move works in root node', () => {
    const editor = new Editor();
    editor.newGame();
    editor.setMove(0, 1, Color.Black);
    assert.deepStrictEqual(editor.currentNode.move, { x: 0, y: 1, c: Color.Black });
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.Black);
    editor.setMove(1, 0, Color.White);
    assert.deepStrictEqual(editor.currentNode.move, { x: 1, y: 0, c: Color.White });
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.Empty);
    assert.strictEqual(editor.getGameState().position.get(1, 0), Color.White);
  });

  test('Setting move works in other nodes', () => {
    const editor = new Editor();
    editor.newGame();
    editor.play(1, 0);
    editor.play(0, 1);
    editor.setMove(0, 1, Color.Black);
    assert.deepStrictEqual(editor.currentNode.move, { x: 0, y: 1, c: Color.Black });
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.Black);
    assert.strictEqual(editor.getGameState().position.get(1, 0), Color.Black);
    editor.setMove(1, 0, Color.White);
    assert.deepStrictEqual(editor.currentNode.move, { x: 1, y: 0, c: Color.White });
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.Empty);
    assert.strictEqual(editor.getGameState().position.get(1, 0), Color.White);
    editor.setMove(0, 1, Color.White);
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.White);
    assert.strictEqual(editor.getGameState().position.get(1, 0), Color.Black);
  });
});

describe('editor#setPlayer', () => {
  test('Setting of player to move work', () => {
    const editor = new Editor();
    editor.newGame();
    assert.strictEqual(editor.getGameState().player, Color.Black);
    editor.setPlayer(Color.White);
    assert.strictEqual(editor.getGameState().player, Color.White);
    assert.strictEqual(editor.currentNode.player, Color.White);
    editor.play(0, 1);
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.White);
    assert.deepStrictEqual(editor.currentNode.move, { x: 0, y: 1, c: Color.White });
    assert.strictEqual(editor.currentNode.player, undefined);
    editor.setPlayer(Color.Black);
    assert.strictEqual(editor.currentNode.player, Color.Black);
  });
});

describe('editor#addNode', () => {
  test('Add new empty node', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9];DD[ab:cd]B[ab];W[aa];B[ba])');
    editor.loadKifu(kifu);

    editor.addNode();
    assert.strictEqual(editor.currentNode.move, undefined);
    assert.strictEqual(editor.currentNode, editor.kifu.root.children[1]);
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.Empty);
    editor.previous();
    assert.strictEqual(editor.currentNode.children.length, 2);
  });

  test('Add specified node', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9];DD[ab:cd]B[ab];W[aa];B[ba])');
    editor.loadKifu(kifu);

    const node = KifuNode.fromJS({ move: { x: 0, y: 1, c: Color.White } });

    editor.addNode(node);
    assert.strictEqual(editor.currentNode, node);
    assert.strictEqual(editor.currentNode, editor.kifu.root.children[1]);
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.White);
  });

  test('Add node to specified index', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9];DD[ab:cd]B[ab];W[aa];B[ba])');
    editor.loadKifu(kifu);

    const node = KifuNode.fromJS({ move: { x: 0, y: 1, c: Color.White } });

    editor.addNode(node, 0);
    assert.strictEqual(editor.currentNode, node);
    assert.strictEqual(editor.currentNode, editor.kifu.root.children[0]);
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.White);
  });
});

describe('editor#removeNode', () => {
  test('Remove node at specified index', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9](;B[ab])(;B[ba]))');
    editor.loadKifu(kifu);

    assert.strictEqual(editor.currentNode.children.length, 2);
    assert.deepStrictEqual(editor.currentNode.children[0].move, { x: 0, y: 1, c: Color.Black });
    assert.deepStrictEqual(editor.currentNode.children[1].move, { x: 1, y: 0, c: Color.Black });
    editor.removeNode(0);
    assert.strictEqual(editor.currentNode.children.length, 1);
    assert.deepStrictEqual(editor.currentNode.children[0].move, { x: 1, y: 0, c: Color.Black });
  });

  test('Remove specified node', () => {
    const editor = new Editor();
    const kifu = Kifu.fromSGF('(;SZ[9](;B[ab])(;B[ba]))');
    editor.loadKifu(kifu);

    assert.strictEqual(editor.currentNode.children.length, 2);
    assert.deepStrictEqual(editor.currentNode.children[0].move, { x: 0, y: 1, c: Color.Black });
    assert.deepStrictEqual(editor.currentNode.children[1].move, { x: 1, y: 0, c: Color.Black });
    editor.removeNode(editor.currentNode.children[0]);
    assert.strictEqual(editor.currentNode.children.length, 1);
    assert.deepStrictEqual(editor.currentNode.children[0].move, { x: 1, y: 0, c: Color.Black });
  });
});

describe('editor#shiftNode', () => {
  test('Shift nodes works', () => {
    const editor = new Editor();
    editor.newGame();

    const node1 = new KifuNode();
    const node2 = new KifuNode();
    const node3 = new KifuNode();

    editor.addNode(node1);
    editor.previous();
    editor.addNode(node2);
    editor.previous();
    editor.addNode(node3);
    editor.previous();

    assert.strictEqual(editor.currentNode.children.length, 3);
    assert.strictEqual(editor.currentNode.children[0], node1);
    editor.shiftNode(node1, 1);
    assert.strictEqual(editor.currentNode.children[0], node2);
    assert.strictEqual(editor.currentNode.children[1], node1);
    assert.strictEqual(editor.currentNode.children.length, 3);
    editor.shiftNode(node1, 2);
    assert.strictEqual(editor.currentNode.children[0], node2);
    assert.strictEqual(editor.currentNode.children[1], node3);
    assert.strictEqual(editor.currentNode.children[2], node1);
    assert.strictEqual(editor.currentNode.children.length, 3);
    editor.shiftNode(node1, 0);
    assert.strictEqual(editor.currentNode.children[0], node1);
    assert.strictEqual(editor.currentNode.children[1], node2);
    assert.strictEqual(editor.currentNode.children[2], node3);
    assert.strictEqual(editor.currentNode.children.length, 3);
  });
});

describe('editor#addSetup', () => {
  test('Add setup in root', () => {
    const editor = new Editor();
    editor.newGame();
    editor.addSetup({ x: 0, y: 1, c: Color.Black });
    editor.addSetup({ x: 1, y: 0, c: Color.White });
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.Black);
    assert.strictEqual(editor.getGameState().position.get(1, 0), Color.White);
    assert.deepStrictEqual(editor.currentNode.setup, [
      { x: 0, y: 1, c: Color.Black },
      { x: 1, y: 0, c: Color.White },
    ]);
    editor.addSetup({ x: 1, y: 0, c: Color.Empty });
    assert.strictEqual(editor.getGameState().position.get(1, 0), Color.Empty);
    assert.deepStrictEqual(editor.currentNode.setup, [
      { x: 0, y: 1, c: Color.Black },
      { x: 1, y: 0, c: Color.Empty },
    ]);

    editor.play(0, 0);
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.Black);
    editor.previous();
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.Black);
  });

  test('Add setup in other nodes', () => {
    const editor = new Editor();
    editor.newGame();
    editor.play(0, 1);
    editor.play(1, 0);
    editor.addSetup({ x: 0, y: 1, c: Color.White });
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.White);
    assert.deepStrictEqual(editor.currentNode.setup, [{ x: 0, y: 1, c: Color.White }]);
    editor.previous();
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.Black);
  });
});

describe('editor#addMarkup', () => {
  test('Add markup works', () => {
    const editor = new Editor();
    editor.newGame();
    editor.addMarkup({ x: 0, y: 1, type: MarkupType.Circle });
    editor.addMarkup({ x: 1, y: 0, type: MarkupType.Square });
    assert.deepStrictEqual(editor.currentNode.markup, [
      { x: 0, y: 1, type: MarkupType.Circle },
      { x: 1, y: 0, type: MarkupType.Square },
    ]);
    editor.addMarkup({ x: 0, y: 1, type: MarkupType.Triangle });
    assert.deepStrictEqual(editor.currentNode.markup, [
      { x: 1, y: 0, type: MarkupType.Square },
      { x: 0, y: 1, type: MarkupType.Triangle },
    ]);
  });

  test('Labels will override markup, lines not', () => {
    const editor = new Editor();
    editor.newGame();
    editor.addMarkup({ x: 0, y: 1, type: MarkupType.Circle });
    editor.addMarkup({ x: 0, y: 1, type: MarkupType.Label, text: 'foo' });
    assert.deepStrictEqual(editor.currentNode.markup, [
      { x: 0, y: 1, type: MarkupType.Label, text: 'foo' },
    ]);
    editor.addMarkup({ x: 0, y: 1, type: MarkupType.Triangle });
    assert.deepStrictEqual(editor.currentNode.markup, [{ x: 0, y: 1, type: MarkupType.Triangle }]);
    editor.addMarkup({ x1: 0, y1: 1, x2: 1, y2: 0, type: MarkupType.Line });
    assert.deepStrictEqual(editor.currentNode.markup, [
      { x: 0, y: 1, type: MarkupType.Triangle },
      {
        x1: 0,
        y1: 1,
        x2: 1,
        y2: 0,
        type: MarkupType.Line,
      },
    ]);
  });
});

describe('editor#removeMarkupAt', () => {
  test('Removing markup at specified coordinates works', () => {
    const editor = new Editor();
    editor.newGame();
    editor.addMarkup({ x: 0, y: 1, type: MarkupType.Circle });
    editor.addMarkup({ x1: 0, y1: 1, x2: 1, y2: 0, type: MarkupType.Line });
    editor.removeMarkupAt({ x: 0, y: 1 });
    assert.deepStrictEqual(editor.currentNode.markup, [
      { x1: 0, y1: 1, x2: 1, y2: 0, type: MarkupType.Line },
    ]);
  });

  test('Removing markup at specified line works', () => {
    const editor = new Editor();
    editor.newGame();
    editor.addMarkup({ x: 0, y: 1, type: MarkupType.Circle });
    editor.addMarkup({ x1: 0, y1: 1, x2: 1, y2: 0, type: MarkupType.Line });
    editor.removeMarkupAt({ x1: 0, y1: 1, x2: 1, y2: 0 });
    assert.deepStrictEqual(editor.currentNode.markup, [{ x: 0, y: 1, type: MarkupType.Circle }]);
  });

  test('Removing multiple markup from SGF', () => {
    const editor = new Editor();
    editor.loadKifu(Kifu.fromSGF('(;TR[ab]SQ[ab]CR[ba])'));
    assert.deepStrictEqual(editor.currentNode.markup, [
      { x: 0, y: 1, type: MarkupType.Triangle },
      { x: 0, y: 1, type: MarkupType.Square },
      { x: 1, y: 0, type: MarkupType.Circle },
    ]);
    editor.removeMarkupAt({ x: 0, y: 1 });
    assert.deepStrictEqual(editor.currentNode.markup, [{ x: 1, y: 0, type: MarkupType.Circle }]);
  });
});

describe('editor#updateCurrentNode', () => {
  test('Update on root', () => {
    const editor = new Editor();
    editor.newGame();
    editor.updateCurrentNode({
      move: { x: 0, y: 1, c: Color.Black },
      setup: [{ x: 1, y: 0, c: Color.White }],
    });

    assert.deepStrictEqual(editor.currentNode.move, { x: 0, y: 1, c: Color.Black });
    assert.deepStrictEqual(editor.currentNode.setup, [{ x: 1, y: 0, c: Color.White }]);
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.Black);
    assert.strictEqual(editor.getGameState().position.get(1, 0), Color.White);
  });

  test('Update on other nodes', () => {
    const editor = new Editor();
    editor.loadKifu(Kifu.fromSGF('(;SZ[9];AB[ab][ba]B[aa])'));

    editor.next();
    assert.strictEqual(editor.getGameState().position.get(0, 0), Color.Black);
    assert.strictEqual(editor.getGameState().player, Color.White);
    editor.updateCurrentNode({
      move: undefined,
    });
    assert.strictEqual(editor.getGameState().position.get(0, 0), Color.Empty);
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.Black);
    assert.strictEqual(editor.getGameState().position.get(1, 0), Color.Black);
    assert.strictEqual(editor.getGameState().player, Color.Black);
    editor.updateCurrentNode({
      setup: [],
    });
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.Empty);
    assert.strictEqual(editor.getGameState().position.get(1, 0), Color.Empty);
  });

  test('Update with updater function', () => {
    const editor = new Editor();
    editor.loadKifu(Kifu.fromSGF('(;SZ[9];AB[ab][ba]AW[aa])'));
    editor.next();
    editor.updateCurrentNode((kifuNode) => {
      kifuNode.setup = kifuNode.setup.filter((s) => s.c !== Color.Black);
    });

    assert.strictEqual(editor.getGameState().position.get(0, 0), Color.White);
    assert.strictEqual(editor.getGameState().position.get(0, 1), Color.Empty);
    assert.strictEqual(editor.getGameState().position.get(1, 0), Color.Empty);
    assert.deepStrictEqual(editor.currentNode.setup, [{ x: 0, y: 0, c: Color.White }]);
  });
});

describe('editor#updateGameInfo', () => {
  test('Update game info', () => {
    const editor = new Editor();
    editor.loadKifu(Kifu.fromSGF('(;SZ[9];AB[ab][ba]AW[aa])'));

    assert.strictEqual(editor.kifu.info.boardSize, 9);
    editor.updateGameInfo({ boardSize: 13, komi: 6.5 });
    assert.strictEqual(editor.kifu.info.boardSize, 13);
    assert.strictEqual(editor.kifu.info.komi, 6.5);
    editor.updateGameInfo({ komi: undefined });
    assert.strictEqual(editor.kifu.info.komi, undefined);
  });

  test('Update game info with updater', () => {
    const editor = new Editor();
    editor.loadKifu(Kifu.fromSGF('(;KM[6];AB[ab][ba]AW[aa])'));

    editor.updateGameInfo((kifuInfo) => {
      kifuInfo.komi! *= 3;
    });
    assert.strictEqual(editor.kifu.info.komi, 18);
  });
});

describe('editor#on("gameLoad")', () => {
  test('Event is emitted when kifu is loaded', () => {
    const editor = new Editor();
    let called = 0;

    editor.on('gameLoad', () => {
      assert(editor.kifu);
      assert(editor.currentNode);
      assert(editor.currentPath);
      called++;
    });

    editor.loadKifu(Kifu.fromSGF('(;SZ[9];B[aa];W[bb])'));
    editor.newGame();
    expect(called).toBe(2);
  });
});

describe('editor#on("gameInfoChange")', () => {
  test('Event is emitted when game info changes', () => {
    const editor = new Editor();
    editor.loadKifu(Kifu.fromSGF('(;SZ[9];B[aa];W[bb])'));

    editor.on('gameInfoChange', ({ gameInfo }) => {
      expect(gameInfo.boardSize).toBe(13);
    });

    editor.updateGameInfo({ boardSize: 13 });
  });
});

describe('editor#on("nodeChange")', () => {
  const editor = new Editor();
  let event: any = undefined;
  let called = 0;
  editor.on('nodeChange', (e) => {
    called++;
    event = e;
  });

  test('Event is emitted once during basic traversing', () => {
    editor.loadKifu(Kifu.fromSGF('(;SZ[9];B[ab];W[ba])'));
    called = 0;

    event = undefined;
    editor.next();
    expect(event?.node.move).toEqual({ x: 0, y: 1, c: Color.Black });
    expect(called).toBe(1);

    event = undefined;
    editor.previous();
    expect(event?.node).toBe(editor.kifu.root);
    expect(called).toBe(2);

    event = undefined;
    editor.last();
    expect(event?.node.move).toEqual({ x: 1, y: 0, c: Color.White });
    expect(called).toBe(3);

    event = undefined;
    editor.next();
    expect(event).toBeUndefined();

    event = undefined;
    editor.first();
    expect(event?.node).toBe(editor.kifu.root);
    expect(called).toBe(4);

    event = undefined;
    editor.previous();
    expect(event).toBeUndefined();
  });

  test('Event is emitted once during nextFork/previousFork', () => {
    editor.loadKifu(Kifu.fromSGF('(;SZ[9];B[ab](;W[ba];B[aa])(;W[ba];B[bb]))'));
    called = 0;

    event = undefined;
    editor.nextFork();
    expect(event?.node.move).toEqual({ x: 0, y: 1, c: Color.Black });
    expect(called).toBe(1);

    event = undefined;
    editor.last();

    event = undefined;
    editor.previousFork();
    expect(event?.node.move).toEqual({ x: 0, y: 1, c: Color.Black });
    expect(called).toBe(3);
  });

  test('Event is emitted once during nextMatch/previousMatch', () => {
    editor.loadKifu(Kifu.fromSGF('(;SZ[9];B[ab]TR[ab];W[ba];B[aa]TR[aa])'));
    called = 0;

    event = undefined;
    editor.nextMatch((node) => node.markup.length > 0);
    expect(event?.node.markup).toEqual([{ x: 0, y: 1, type: MarkupType.Triangle }]);
    expect(called).toBe(1);

    event = undefined;
    editor.nextMatch((node) => node.markup.length > 0);
    expect(event?.node.markup).toEqual([{ x: 0, y: 0, type: MarkupType.Triangle }]);
    expect(called).toBe(2);

    event = undefined;
    editor.previousMatch((node) => node.markup.length > 0);
    expect(event?.node.markup).toEqual([{ x: 0, y: 1, type: MarkupType.Triangle }]);
    expect(called).toBe(3);
  });

  test('Event is emitted once during goTo', () => {
    editor.loadKifu(Kifu.fromSGF('(;SZ[9];B[ab](;W[ba];B[aa])(;W[ba];B[bb]))'));
    called = 0;

    event = undefined;
    editor.goTo({ moveNumber: 3, variations: [1] });
    expect(event?.node.move).toEqual({ x: 1, y: 1, c: Color.Black });
    expect(called).toBe(1);

    event = undefined;
    editor.goTo({ moveNumber: 0, variations: [] });
    expect(event?.node).toBe(editor.kifu.root);
    expect(called).toBe(2);
  });

  test('Event is emitted once during play/pass', () => {
    editor.newGame();
    called = 0;

    event = undefined;
    editor.play(0, 1);
    expect(event?.node.move).toEqual({ x: 0, y: 1, c: Color.Black });
    expect(called).toBe(1);

    event = undefined;
    editor.pass();
    expect(event?.node.move).toEqual({ c: Color.White });
    expect(called).toBe(2);
  });

  test('Event is emitted once during setMove/setPlayer', () => {
    editor.loadKifu(Kifu.fromSGF('(;SZ[9];B[ab])'));
    editor.next();
    called = 0;

    event = undefined;
    editor.setMove(0, 1, Color.White);
    expect(event?.node.move).toEqual({ x: 0, y: 1, c: Color.White });
    expect(called).toBe(1);

    event = undefined;
    editor.setPlayer(Color.Black);
    expect(event?.node.player).toBe(Color.Black);
    expect(called).toBe(2);
  });

  test('Event is emitted once during addNode/removeNode/shiftNode', () => {
    editor.loadKifu(Kifu.fromSGF('(;SZ[9];B[ab])'));
    called = 0;

    event = undefined;
    const node = KifuNode.fromJS({ comment: 'foo' });
    editor.addNode(node);
    expect(event?.node).toBe(node);
    expect(called).toBe(1);

    editor.previous();

    event = undefined;
    editor.shiftNode(node, 0);
    expect(event?.node.children[0]).toBe(node);
    expect(called).toBe(3);

    event = undefined;
    editor.removeNode(node);
    expect(event?.node.children[0].move).toEqual({ x: 0, y: 1, c: Color.Black });
    expect(called).toBe(4);
  });

  test('Event is emitted once during addSetup', () => {
    editor.newGame();
    called = 0;

    event = undefined;
    editor.addSetup({ x: 0, y: 1, c: Color.Black });
    expect(event?.node.setup).toEqual([{ x: 0, y: 1, c: Color.Black }]);
    expect(called).toBe(1);

    editor.addNode();

    event = undefined;
    editor.addSetup({ x: 0, y: 1, c: Color.Empty });
    expect(event?.node.setup).toEqual([{ x: 0, y: 1, c: Color.Empty }]);
    expect(called).toBe(3);
  });

  test('Event is emitted once during addMarkup/removeMarkupAt', () => {
    editor.newGame();
    called = 0;

    event = undefined;
    editor.addMarkup({ x: 0, y: 1, type: MarkupType.Circle });
    expect(event?.node.markup).toEqual([{ x: 0, y: 1, type: MarkupType.Circle }]);
    expect(called).toBe(1);

    event = undefined;
    editor.removeMarkupAt({ x: 0, y: 1 });
    expect(event?.node.markup).toEqual([]);
    expect(called).toBe(2);
  });

  test('Event is emitted once during updateCurrentNode', () => {
    editor.loadKifu(Kifu.fromSGF('(;SZ[9];B[ab])'));
    called = 0;

    event = undefined;
    editor.updateCurrentNode({ comment: 'foo' });
    expect(event?.node.comment).toBe('foo');
    expect(called).toBe(1);

    editor.next();

    event = undefined;
    editor.updateCurrentNode({ comment: 'bar' });
    expect(event?.node.comment).toBe('bar');
    expect(called).toBe(3);
  });
});

describe('editor#on("gameStateChange")', () => {
  const editor = new Editor();
  let event: any = undefined;
  let called = 0;
  editor.on('gameStateChange', (e) => {
    called++;
    event = e;
  });

  test('Event is emitted once during basic traversing', () => {
    editor.loadKifu(Kifu.fromSGF('(;SZ[9];B[ab];W[ba])'));
    called = 0;

    event = undefined;
    editor.next();
    expect(event?.gameState.position.get(0, 1)).toBe(Color.Black);
    expect(called).toBe(1);

    event = undefined;
    editor.previous();
    expect(event?.gameState.position.get(0, 0)).toBe(Color.Empty);
    expect(called).toBe(2);

    event = undefined;
    editor.last();
    expect(event?.gameState.position.get(1, 0)).toBe(Color.White);
    expect(called).toBe(3);

    event = undefined;
    editor.next();
    expect(event).toBeUndefined();

    event = undefined;
    editor.first();
    expect(event?.gameState.position.get(1, 0)).toBe(Color.Empty);
    expect(called).toBe(4);

    event = undefined;
    editor.previous();
    expect(event).toBeUndefined();
  });

  test('Event is emitted once during nextFork/previousFork', () => {
    editor.loadKifu(Kifu.fromSGF('(;SZ[9];B[ab](;W[ba])(;W[ba]))'));
    called = 0;

    event = undefined;
    editor.nextFork();
    expect(event?.gameState.position.get(0, 1)).toBe(Color.Black);
    expect(called).toBe(1);

    event = undefined;
    editor.last();

    event = undefined;
    editor.previousFork();
    expect(event?.gameState.player).toBe(Color.White);
    expect(called).toBe(3);
  });

  test('Event is emitted once during nextMatch/previousMatch', () => {
    editor.loadKifu(Kifu.fromSGF('(;SZ[9];B[ab]TR[ab];W[ba];B[aa]TR[aa])'));
    called = 0;

    event = undefined;
    editor.nextMatch((node) => node.markup.length > 0);
    expect(event?.gameState.position.get(0, 1)).toBe(Color.Black);
    expect(called).toBe(1);

    event = undefined;
    editor.nextMatch((node) => node.markup.length > 0);
    expect(event?.gameState.position.get(0, 0)).toBe(Color.Black);
    expect(called).toBe(2);

    event = undefined;
    editor.previousMatch((node) => node.markup.length > 0);
    expect(event?.gameState.position.get(0, 0)).toBe(Color.Empty);
    expect(called).toBe(3);
  });

  test('Event is emitted once during goTo', () => {
    editor.loadKifu(Kifu.fromSGF('(;SZ[9];B[ab](;W[ba];B[aa])(;W[ba];B[bb]))'));
    called = 0;

    event = undefined;
    editor.goTo({ moveNumber: 3, variations: [1] });
    expect(event?.gameState.position.get(1, 1)).toBe(Color.Black);
    expect(called).toBe(1);

    event = undefined;
    editor.goTo({ moveNumber: 0, variations: [] });
    expect(event?.gameState.position.get(1, 1)).toBe(Color.Empty);
    expect(called).toBe(2);
  });

  test('Event is emitted once during play/pass', () => {
    editor.newGame();
    called = 0;

    event = undefined;
    editor.play(0, 1);
    expect(event?.gameState.position.get(0, 1)).toBe(Color.Black);
    expect(event?.gameState.player).toBe(Color.White);
    expect(called).toBe(1);

    event = undefined;
    editor.pass();
    expect(event?.gameState.position.get(0, 1)).toBe(Color.Black);
    expect(event?.gameState.player).toBe(Color.Black);
    expect(called).toBe(2);
  });

  test('Event is emitted once during setMove/setPlayer', () => {
    editor.loadKifu(Kifu.fromSGF('(;SZ[9];B[ab])'));
    editor.next();
    called = 0;

    event = undefined;
    editor.setMove(0, 1, Color.White);
    expect(event?.gameState.position.get(0, 1)).toBe(Color.White);
    expect(event?.gameState.player).toBe(Color.Black);
    expect(called).toBe(1);

    event = undefined;
    editor.setPlayer(Color.White);
    expect(event?.gameState.player).toBe(Color.White);
    expect(called).toBe(2);
  });

  test('Event is emitted once during addSetup', () => {
    editor.newGame();
    called = 0;

    event = undefined;
    editor.addSetup({ x: 0, y: 1, c: Color.Black });
    expect(event?.gameState.position.get(0, 1)).toBe(Color.Black);
    expect(called).toBe(1);

    editor.addNode();

    event = undefined;
    editor.addSetup({ x: 0, y: 1, c: Color.Empty });
    expect(event?.gameState.position.get(0, 1)).toBe(Color.Empty);
    expect(called).toBe(3);
  });

  test('Event is emitted once during updateCurrentNode', () => {
    editor.loadKifu(Kifu.fromSGF('(;SZ[9]AW[ba];B[ab])'));
    called = 0;

    event = undefined;
    editor.updateCurrentNode({ setup: [] });
    expect(event?.gameState.position.get(1, 0)).toBe(Color.Empty);
    expect(called).toBe(1);

    editor.next();

    event = undefined;
    editor.updateCurrentNode({ move: undefined });
    expect(event?.gameState.position.get(0, 1)).toBe(Color.Empty);
    expect(called).toBe(3);
  });
});

describe('editor#on("positionChange")', () => {
  const editor = new Editor();
  let called: number;
  let event: any = undefined;

  editor.on('positionChange', (e) => {
    event = e;
    called++;
  });

  test('Event is triggered when iterating', () => {
    editor.loadKifu(Kifu.fromSGF('(;SZ[9];B[aa];W[bb];AB[ab];AW[ba];B[])'));
    called = 0;

    event = undefined;
    editor.next();
    expect(event?.position.get(0, 0)).toBe(Color.Black);
    expect(called).toBe(1);

    event = undefined;
    editor.next();
    expect(event?.position.get(1, 1)).toBe(Color.White);
    expect(called).toBe(2);

    event = undefined;
    editor.next();
    expect(event?.position.get(0, 1)).toBe(Color.Black);
    expect(called).toBe(3);

    event = undefined;
    editor.next();
    expect(event?.position.get(1, 0)).toBe(Color.White);
    expect(called).toBe(4);

    event = undefined;
    editor.last();
    expect(event).toBeUndefined();

    event = undefined;
    editor.previous();
    expect(event).toBeUndefined();

    event = undefined;
    editor.previous();
    expect(event?.position.get(1, 0)).toBe(Color.Empty);
    expect(called).toBe(5);

    event = undefined;
    editor.previous();
    expect(event?.position.get(0, 1)).toBe(Color.Empty);
    expect(called).toBe(6);

    event = undefined;
    editor.first();
    expect(event?.position.get(0, 0)).toBe(Color.Empty);
    expect(event?.position.get(0, 0)).toBe(Color.Empty);
    expect(called).toBe(7);
  });

  test('Event is triggered when playing and setting move', () => {
    editor.newGame();
    called = 0;

    editor.play(0, 1);
    expect(event?.position.get(0, 1)).toBe(Color.Black);
    expect(called).toBe(1);

    event = undefined;
    editor.pass();
    expect(event).toBeUndefined();

    event = undefined;
    editor.setMove(0, 1, Color.White);
    expect(event?.position.get(0, 1)).toBe(Color.White);
    expect(called).toBe(2);
  });

  test('Event is triggered when node is manually updated', () => {
    editor.loadKifu(Kifu.fromSGF('(;AB[ab];B[ba])'));
    called = 0;

    event = undefined;
    editor.updateCurrentNode({ setup: [] });
    expect(event?.position.get(0, 1)).toBe(Color.Empty);
    expect(called).toBe(1);

    event = undefined;
    editor.next();

    event = undefined;
    editor.updateCurrentNode({ move: undefined });
    expect(event?.position.get(1, 0)).toBe(Color.Empty);
    expect(called).toBe(3);
  });

  test('Event is triggered when setting up position', () => {
    editor.newGame();
    called = 0;

    event = undefined;
    editor.addNode();
    expect(event).toBeUndefined();

    event = undefined;
    editor.addSetup({ x: 0, y: 1, c: Color.Black });
    expect(event?.position.get(0, 1)).toBe(Color.Black);
    expect(called).toBe(1);

    event = undefined;
    editor.addSetup({ x: 0, y: 1, c: Color.White });
    expect(event?.position.get(0, 1)).toBe(Color.White);
    expect(called).toBe(2);

    event = undefined;
    editor.addSetup({ x: 0, y: 1, c: Color.Empty });
    expect(event?.position.get(0, 1)).toBe(Color.Empty);
    expect(called).toBe(3);
  });
});

describe('editor#on("viewportChange")', () => {
  test('Event is emitted when viewport is changed', () => {
    const editor = new Editor();
    let event: any;
    let called = 0;

    editor.on('viewportChange', (e) => {
      event = e;
      called++;
    });

    editor.loadKifu(Kifu.fromSGF('(;SZ[9];B[aa]VW[ab:cd];W[bb])'));

    event = undefined;
    editor.next();
    expect(event.boardSection).toEqual({ x1: 0, y1: 1, x2: 2, y2: 3 });
    expect(called).toBe(1);

    event = undefined;
    editor.next();
    expect(event).toBeUndefined();

    event = undefined;
    editor.previous();
    expect(event).toBeUndefined();

    event = undefined;
    editor.previous();
    expect(event.boardSection).toBeNull();
    expect(called).toBe(2);
  });
});
