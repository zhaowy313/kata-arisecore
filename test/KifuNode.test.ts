import { describe, assert, test } from 'vitest';
import { KifuNode, MarkupType } from '../src/kifu';
import { PropIdent } from '../src/sgf';
import { kifuNodeSGFPropertyDescriptors } from '../src/kifu/kifuNodeSGFPropertyDescriptors';
import { Color } from '../src/types';

describe('Correct transformation from SGF property values.', () => {
  let tests = 0;

  test('Property B', () => {
    tests++;
    const node = KifuNode.fromSGF('B[cd]');
    assert.deepEqual(node.move, { x: 2, y: 3, c: Color.B });

    // pass
    const node2 = KifuNode.fromSGF('B[]');
    assert.deepEqual(node2.move, { c: Color.B });
  });

  test('Property W', () => {
    tests++;
    const node = KifuNode.fromSGF('W[cd]');
    assert.deepEqual(node.move, { x: 2, y: 3, c: Color.W });

    // pass
    const node2 = KifuNode.fromSGF('W[]');
    assert.deepEqual(node2.move, { c: Color.W });
  });

  test('Property AB', () => {
    tests++;
    const node = KifuNode.fromSGF('AB[cd][ef][gh]');
    assert.deepEqual(node.setup, [
      { x: 2, y: 3, c: Color.B },
      { x: 4, y: 5, c: Color.B },
      { x: 6, y: 7, c: Color.B },
    ]);
  });

  test('Property AW', () => {
    tests++;
    const node = KifuNode.fromSGF('AW[cd][ef][gh]');
    assert.deepEqual(node.setup, [
      { x: 2, y: 3, c: Color.W },
      { x: 4, y: 5, c: Color.W },
      { x: 6, y: 7, c: Color.W },
    ]);
  });

  test('Property AE', () => {
    tests++;
    const node = KifuNode.fromSGF('AE[cd][ef][gh]');
    assert.deepEqual(node.setup, [
      { x: 2, y: 3, c: Color.E },
      { x: 4, y: 5, c: Color.E },
      { x: 6, y: 7, c: Color.E },
    ]);
  });

  test('Property PL', () => {
    tests++;

    const node = KifuNode.fromSGF('PL[W]');
    assert.strictEqual(node.player, Color.W);

    const node2 = KifuNode.fromSGF('PL[B]');
    assert.strictEqual(node2.player, Color.B);
  });

  test('Property VW', () => {
    tests++;
    const node = KifuNode.fromSGF('VW[cd:ef]');
    assert.deepEqual(node.boardSection, { x1: 2, y1: 3, x2: 4, y2: 5 });

    const node2 = KifuNode.fromSGF('VW[]');
    assert.strictEqual(node2.boardSection, null);
  });

  test('Property BL', () => {
    tests++;
    const node = KifuNode.fromSGF('BL[123]');
    assert.strictEqual(node.blackTimeLeft, 123);
  });

  test('Property OB', () => {
    tests++;
    const node = KifuNode.fromSGF('OB[123]');
    assert.strictEqual(node.blackStonesLeft, 123);
  });

  test('Property WL', () => {
    tests++;
    const node = KifuNode.fromSGF('WL[123]');
    assert.strictEqual(node.whiteTimeLeft, 123);
  });

  test('Property OW', () => {
    tests++;
    const node = KifuNode.fromSGF('OW[123]');
    assert.strictEqual(node.whiteStonesLeft, 123);
  });

  test('Property C', () => {
    tests++;
    const node = KifuNode.fromSGF('C[This is a comment.]');
    assert.strictEqual(node.comment, 'This is a comment.');
  });

  test('Property CR', () => {
    tests++;
    const node = KifuNode.fromSGF('CR[cd][ef][gh]');
    assert.deepEqual(node.markup, [
      { x: 2, y: 3, type: 'CR' },
      { x: 4, y: 5, type: 'CR' },
      { x: 6, y: 7, type: 'CR' },
    ]);
  });

  test('Property DD', () => {
    tests++;
    const node = KifuNode.fromSGF('DD[cd][ef:gh]');
    assert.deepEqual(node.dim, [
      { x1: 2, y1: 3, x2: 2, y2: 3 },
      { x1: 4, y1: 5, x2: 6, y2: 7 },
    ]);

    const node2 = KifuNode.fromSGF('DD[]');
    assert.deepEqual(node2.dim, []);
  });

  test('Property MA', () => {
    tests++;
    const node = KifuNode.fromSGF('MA[cd][ef][gh]');
    assert.deepEqual(node.markup, [
      { x: 2, y: 3, type: 'MA' },
      { x: 4, y: 5, type: 'MA' },
      { x: 6, y: 7, type: 'MA' },
    ]);
  });

  test('Property SL', () => {
    tests++;
    const node = KifuNode.fromSGF('SL[cd][ef][gh]');
    assert.deepEqual(node.markup, [
      { x: 2, y: 3, type: 'SL' },
      { x: 4, y: 5, type: 'SL' },
      { x: 6, y: 7, type: 'SL' },
    ]);
  });

  test('Property SQ', () => {
    tests++;
    const node = KifuNode.fromSGF('SQ[cd][ef][gh]');
    assert.deepEqual(node.markup, [
      { x: 2, y: 3, type: 'SQ' },
      { x: 4, y: 5, type: 'SQ' },
      { x: 6, y: 7, type: 'SQ' },
    ]);
  });

  test('Property TR', () => {
    tests++;
    const node = KifuNode.fromSGF('TR[cd][ef][gh]');
    assert.deepEqual(node.markup, [
      { x: 2, y: 3, type: 'TR' },
      { x: 4, y: 5, type: 'TR' },
      { x: 6, y: 7, type: 'TR' },
    ]);
  });

  test('Property AR', () => {
    tests++;
    const node = KifuNode.fromSGF('AR[cd:ef][gh:ij]');
    assert.deepEqual(node.markup, [
      { x1: 2, y1: 3, x2: 4, y2: 5, type: 'AR' },
      { x1: 6, y1: 7, x2: 8, y2: 9, type: 'AR' },
    ]);
  });

  test('Property LN', () => {
    tests++;
    const node = KifuNode.fromSGF('LN[cd:ef][gh:ij]');
    assert.deepEqual(node.markup, [
      { x1: 2, y1: 3, x2: 4, y2: 5, type: 'LN' },
      { x1: 6, y1: 7, x2: 8, y2: 9, type: 'LN' },
    ]);
  });

  test('Property LB', () => {
    tests++;
    const node = KifuNode.fromSGF('LB[ab:A][cd:B]');
    assert.deepEqual(node.markup, [
      { x: 0, y: 1, type: 'LB', text: 'A' },
      { x: 2, y: 3, type: 'LB', text: 'B' },
    ]);
  });

  test('Test of all property types', () => {
    assert.strictEqual(tests, Object.keys(kifuNodeSGFPropertyDescriptors).length);
  });

  test('Unknown property', () => {
    const node = KifuNode.fromSGF('XX[test][test2]');
    assert.deepEqual(node.properties.XX, ['test', 'test2']);
  });
});

describe('Correct clear of SGF property values.', () => {
  let tests = 0;

  test('Property B', () => {
    tests++;
    const node = KifuNode.fromSGF('B[cd]');
    node.setSGFProperty(PropIdent.BlackMove, []);
    assert.strictEqual(node.move, undefined);
  });

  test('Property W', () => {
    tests++;
    const node = KifuNode.fromSGF('W[cd]');
    node.setSGFProperty(PropIdent.WhiteMove, []);
    assert.strictEqual(node.move, undefined);
  });

  test('Property AB', () => {
    tests++;
    const node = KifuNode.fromSGF('AB[ab]AW[cd]AE[ef]');
    node.setSGFProperty(PropIdent.AddBlack, []);
    assert.deepEqual(node.setup, [
      { x: 2, y: 3, c: Color.W },
      { x: 4, y: 5, c: Color.E },
    ]);
  });

  test('Property AW', () => {
    tests++;
    const node = KifuNode.fromSGF('AB[ab]AW[cd]AE[ef]');
    node.setSGFProperty(PropIdent.AddWhite, []);
    assert.deepEqual(node.setup, [
      { x: 0, y: 1, c: Color.B },
      { x: 4, y: 5, c: Color.E },
    ]);
  });

  test('Property AE', () => {
    tests++;
    const node = KifuNode.fromSGF('AB[ab]AW[cd]AE[ef]');
    node.setSGFProperty(PropIdent.ClearField, []);
    assert.deepEqual(node.setup, [
      { x: 0, y: 1, c: Color.B },
      { x: 2, y: 3, c: Color.W },
    ]);
  });

  test('Property PL', () => {
    tests++;
    const node = KifuNode.fromSGF('PL[W]');
    node.setSGFProperty(PropIdent.SetTurn, []);
    assert.strictEqual(node.player, undefined);
  });

  test('Property VW', () => {
    tests++;
    const node = KifuNode.fromSGF('VW[cd:ef]');
    node.setSGFProperty(PropIdent.BoardSection, []);
    assert.strictEqual(node.boardSection, undefined);

    node.setSGFProperty(PropIdent.BoardSection, ['']);
    assert.strictEqual(node.boardSection, null);
  });

  test('Property BL', () => {
    tests++;
    const node = KifuNode.fromSGF('BL[123]');
    node.setSGFProperty(PropIdent.BlackTimeLeft, []);
    assert.strictEqual(node.blackTimeLeft, undefined);
  });

  test('Property OB', () => {
    tests++;
    const node = KifuNode.fromSGF('OB[123]');
    node.setSGFProperty(PropIdent.BlackStonesLeft, []);
    assert.strictEqual(node.blackStonesLeft, undefined);
  });

  test('Property WL', () => {
    tests++;
    const node = KifuNode.fromSGF('WL[123]');
    node.setSGFProperty(PropIdent.WhiteTimeLeft, []);
    assert.strictEqual(node.whiteTimeLeft, undefined);
  });

  test('Property OW', () => {
    tests++;
    const node = KifuNode.fromSGF('OW[123]');
    node.setSGFProperty(PropIdent.WhiteStonesLeft, []);
    assert.strictEqual(node.whiteStonesLeft, undefined);
  });

  test('Property C', () => {
    tests++;
    const node = KifuNode.fromSGF('C[This is a comment.]');
    node.setSGFProperty(PropIdent.Comment, []);
    assert.strictEqual(node.comment, undefined);
  });

  test('Property CR', () => {
    tests++;
    const node = KifuNode.fromSGF('CR[ab][cd]TR[ef]');
    node.setSGFProperty(PropIdent.Circle, []);
    assert.deepEqual(node.markup, [{ x: 4, y: 5, type: 'TR' }]);
  });

  test('Property DD', () => {
    tests++;
    const node = KifuNode.fromSGF('DD[ab][cd]TR[ef]');
    node.setSGFProperty(PropIdent.Dim, []);
    assert.strictEqual(node.dim, undefined);

    node.setSGFProperty(PropIdent.Dim, ['']);
    assert.deepEqual(node.dim, []);
  });

  test('Property MA', () => {
    tests++;
    const node = KifuNode.fromSGF('MA[ab][cd]TR[ef]');
    node.setSGFProperty(PropIdent.XMark, []);
    assert.deepEqual(node.markup, [{ x: 4, y: 5, type: 'TR' }]);
  });

  test('Property SL', () => {
    tests++;
    const node = KifuNode.fromSGF('SL[ab][cd]TR[ef]');
    node.setSGFProperty(PropIdent.Selected, []);
    assert.deepEqual(node.markup, [{ x: 4, y: 5, type: 'TR' }]);
  });

  test('Property SQ', () => {
    tests++;
    const node = KifuNode.fromSGF('SQ[ab][cd]TR[ef]');
    node.setSGFProperty(PropIdent.Square, []);
    assert.deepEqual(node.markup, [{ x: 4, y: 5, type: 'TR' }]);
  });

  test('Property TR', () => {
    tests++;
    const node = KifuNode.fromSGF('TR[ab][cd]CR[ef]');
    node.setSGFProperty(PropIdent.Triangle, []);
    assert.deepEqual(node.markup, [{ x: 4, y: 5, type: 'CR' }]);
  });

  test('Property AR', () => {
    tests++;
    const node = KifuNode.fromSGF('AR[cd:ef][gh:ij]CR[ef]');
    node.setSGFProperty(PropIdent.Arrow, []);
    assert.deepEqual(node.markup, [{ x: 4, y: 5, type: 'CR' }]);
  });

  test('Property LN', () => {
    tests++;
    const node = KifuNode.fromSGF('LN[cd:ef][gh:ij]CR[ef]');
    node.setSGFProperty(PropIdent.Line, []);
    assert.deepEqual(node.markup, [{ x: 4, y: 5, type: 'CR' }]);
  });

  test('Property LB', () => {
    tests++;
    const node = KifuNode.fromSGF('LB[ab:A][cd:B]CR[ef]');
    node.setSGFProperty(PropIdent.Label, []);
    assert.deepEqual(node.markup, [{ x: 4, y: 5, type: 'CR' }]);
  });

  test('Test of all property types', () => {
    assert.strictEqual(tests, Object.keys(kifuNodeSGFPropertyDescriptors).length);
  });
});

describe('Correct transformation to SGF property values.', () => {
  let tests = 0;

  test('Property B', () => {
    tests++;
    const node = KifuNode.fromJS({ move: { x: 2, y: 3, c: Color.B } });
    assert.strictEqual(node.getSGFProperties(), 'B[cd]');

    // pass
    const node2 = KifuNode.fromJS({ move: { c: Color.B } });
    assert.strictEqual(node2.getSGFProperties(), 'B[]');
  });

  test('Property W', () => {
    tests++;
    const node = KifuNode.fromJS({ move: { x: 2, y: 3, c: Color.W } });
    assert.strictEqual(node.getSGFProperties(), 'W[cd]');

    // pass
    const node2 = KifuNode.fromJS({ move: { c: Color.W } });
    assert.strictEqual(node2.getSGFProperties(), 'W[]');
  });

  test('Property AB', () => {
    tests++;
    const node = KifuNode.fromJS({
      setup: [
        { x: 2, y: 3, c: Color.B },
        { x: 4, y: 5, c: Color.B },
        { x: 6, y: 7, c: Color.B },
      ],
    });
    assert.strictEqual(node.getSGFProperties(), 'AB[cd][ef][gh]');
  });

  test('Property AW', () => {
    tests++;
    const node = KifuNode.fromJS({
      setup: [
        { x: 2, y: 3, c: Color.W },
        { x: 4, y: 5, c: Color.W },
        { x: 6, y: 7, c: Color.W },
      ],
    });
    assert.strictEqual(node.getSGFProperties(), 'AW[cd][ef][gh]');
  });

  test('Property AE', () => {
    tests++;
    const node = KifuNode.fromJS({
      setup: [
        { x: 2, y: 3, c: Color.E },
        { x: 4, y: 5, c: Color.E },
        { x: 6, y: 7, c: Color.E },
      ],
    });
    assert.strictEqual(node.getSGFProperties(), 'AE[cd][ef][gh]');
  });

  test('Property PL', () => {
    tests++;

    const node = KifuNode.fromJS({ player: Color.W });
    assert.strictEqual(node.getSGFProperties(), 'PL[W]');

    const node2 = KifuNode.fromJS({ player: Color.W });
    assert.strictEqual(node2.getSGFProperties(), 'PL[W]');
  });

  test('Property VW', () => {
    tests++;
    const node = KifuNode.fromJS({ boardSection: { x1: 2, y1: 3, x2: 4, y2: 5 } });
    assert.strictEqual(node.getSGFProperties(), 'VW[cd:ef]');

    const node2 = KifuNode.fromJS({ boardSection: null });
    assert.strictEqual(node2.getSGFProperties(), 'VW[]');
  });

  test('Property BL', () => {
    tests++;
    const node = KifuNode.fromJS({ blackTimeLeft: 123 });
    assert.strictEqual(node.getSGFProperties(), 'BL[123]');
  });

  test('Property OB', () => {
    tests++;
    const node = KifuNode.fromJS({ blackStonesLeft: 123 });
    assert.strictEqual(node.getSGFProperties(), 'OB[123]');
  });

  test('Property WL', () => {
    tests++;
    const node = KifuNode.fromJS({ whiteTimeLeft: 123 });
    assert.strictEqual(node.getSGFProperties(), 'WL[123]');
  });

  test('Property OW', () => {
    tests++;
    const node = KifuNode.fromJS({ whiteStonesLeft: 123 });
    assert.strictEqual(node.getSGFProperties(), 'OW[123]');
  });

  test('Property C', () => {
    tests++;
    const node = KifuNode.fromJS({ comment: 'This is a comment.' });
    assert.strictEqual(node.getSGFProperties(), 'C[This is a comment.]');
  });

  test('Property CR', () => {
    tests++;
    const node = KifuNode.fromJS({
      markup: [
        { x: 2, y: 3, type: MarkupType.Circle },
        { x: 4, y: 5, type: MarkupType.Circle },
        { x: 6, y: 7, type: MarkupType.Circle },
      ],
    });

    assert.strictEqual(node.getSGFProperties(), 'CR[cd][ef][gh]');
  });

  test('Property DD', () => {
    tests++;
    const node = KifuNode.fromJS({
      dim: [
        { x1: 2, y1: 3, x2: 2, y2: 3 },
        { x1: 4, y1: 5, x2: 6, y2: 7 },
      ],
    });

    assert.strictEqual(node.getSGFProperties(), 'DD[cd][ef:gh]');

    const node2 = KifuNode.fromJS({
      dim: [],
    });

    assert.strictEqual(node2.getSGFProperties(), 'DD[]');
  });

  test('Property MA', () => {
    tests++;
    const node = KifuNode.fromJS({
      markup: [
        { x: 2, y: 3, type: MarkupType.XMark },
        { x: 4, y: 5, type: MarkupType.XMark },
        { x: 6, y: 7, type: MarkupType.XMark },
      ],
    });

    assert.strictEqual(node.getSGFProperties(), 'MA[cd][ef][gh]');
  });

  test('Property SL', () => {
    tests++;
    const node = KifuNode.fromJS({
      markup: [
        { x: 2, y: 3, type: MarkupType.Selected },
        { x: 4, y: 5, type: MarkupType.Selected },
        { x: 6, y: 7, type: MarkupType.Selected },
      ],
    });

    assert.strictEqual(node.getSGFProperties(), 'SL[cd][ef][gh]');
  });

  test('Property SQ', () => {
    tests++;
    const node = KifuNode.fromJS({
      markup: [
        { x: 2, y: 3, type: MarkupType.Square },
        { x: 4, y: 5, type: MarkupType.Square },
        { x: 6, y: 7, type: MarkupType.Square },
      ],
    });

    assert.strictEqual(node.getSGFProperties(), 'SQ[cd][ef][gh]');
  });

  test('Property TR', () => {
    tests++;
    const node = KifuNode.fromJS({
      markup: [
        { x: 2, y: 3, type: MarkupType.Triangle },
        { x: 4, y: 5, type: MarkupType.Triangle },
        { x: 6, y: 7, type: MarkupType.Triangle },
      ],
    });

    assert.strictEqual(node.getSGFProperties(), 'TR[cd][ef][gh]');
  });

  test('Property AR', () => {
    tests++;
    const node = KifuNode.fromJS({
      markup: [
        { x1: 2, y1: 3, x2: 4, y2: 5, type: MarkupType.Arrow },
        { x1: 6, y1: 7, x2: 8, y2: 9, type: MarkupType.Arrow },
      ],
    });

    assert.strictEqual(node.getSGFProperties(), 'AR[cd:ef][gh:ij]');
  });

  test('Property LN', () => {
    tests++;
    const node = KifuNode.fromJS({
      markup: [
        { x1: 2, y1: 3, x2: 4, y2: 5, type: MarkupType.Line },
        { x1: 6, y1: 7, x2: 8, y2: 9, type: MarkupType.Line },
      ],
    });

    assert.strictEqual(node.getSGFProperties(), 'LN[cd:ef][gh:ij]');
  });

  test('Property LB', () => {
    tests++;
    const node = KifuNode.fromJS({
      markup: [
        { x: 0, y: 1, type: MarkupType.Label, text: 'A' },
        { x: 2, y: 3, type: MarkupType.Label, text: 'B' },
      ],
    });

    assert.strictEqual(node.getSGFProperties(), 'LB[ab:A][cd:B]');
  });

  test('Test of all property types', () => {
    assert.strictEqual(tests, Object.keys(kifuNodeSGFPropertyDescriptors).length);
  });
});

describe('Correct handling conflicting properties.', () => {
  test('Last color move is set', () => {
    const node = KifuNode.fromSGF('B[cd]W[ef]');
    assert.deepEqual(node.move, { x: 4, y: 5, c: Color.W });
  });

  test('Last setup on the same field', () => {
    const node = KifuNode.fromSGF('AB[ab][cd]AW[ab][ef]AE[ab][gh][ab]');
    assert.deepEqual(node.setup, [
      { x: 2, y: 3, c: Color.B },
      { x: 4, y: 5, c: Color.W },
      { x: 6, y: 7, c: Color.E },
      { x: 0, y: 1, c: Color.E },
    ]);
  });

  test('Only one same markup of type', () => {
    const node = KifuNode.fromSGF('CR[ab][cd][cd]TR[cd]');
    assert.deepEqual(node.markup, [
      { x: 0, y: 1, type: 'CR' },
      { x: 2, y: 3, type: 'CR' },
      { x: 2, y: 3, type: 'TR' },
    ]);
  });
});

describe('Unknown properties.', () => {
  test('Properties which are handled by KifuInfo are ignored', () => {
    const node = KifuNode.fromSGF('SZ[19]HA[9]PB[Black]PW[White]RE[B+R]');
    assert.deepEqual(node.properties, {});
  });

  test('Custom properties are stored as they are', () => {
    const node = KifuNode.fromSGF('FOO[foo]BAR[bar][baz]');
    assert.deepEqual(node.properties, { FOO: ['foo'], BAR: ['bar', 'baz'] });
  });
});

describe('Methods for setting SGF properties.', () => {
  test('setSGFProperty', () => {
    const node = new KifuNode();
    node.setSGFProperty(PropIdent.BlackMove, ['cd']);
    assert.deepEqual(node.move, { x: 2, y: 3, c: Color.B });
  });

  test('setSGFProperties', () => {
    const node = new KifuNode();
    node.setSGFProperties({
      [PropIdent.AddBlack]: ['cd', 'ef'],
      [PropIdent.Circle]: ['cd', 'ef'],
    });
    assert.deepEqual(node.setup, [
      { x: 2, y: 3, c: Color.B },
      { x: 4, y: 5, c: Color.B },
    ]);
    assert.deepEqual(node.markup, [
      { x: 2, y: 3, type: MarkupType.Circle },
      { x: 4, y: 5, type: MarkupType.Circle },
    ]);
  });

  test('setSGFProperties string argument', () => {
    const node = new KifuNode();
    node.setSGFProperties('AB[cd]CR[cd]');
    assert.deepEqual(node.setup, [{ x: 2, y: 3, c: Color.B }]);
    assert.deepEqual(node.markup, [{ x: 2, y: 3, type: MarkupType.Circle }]);
  });

  test('Overriding of setSGFProperty setup', () => {
    const node = new KifuNode();
    node.setSGFProperty(PropIdent.AddBlack, ['cd', 'ef']);
    node.setSGFProperty(PropIdent.AddWhite, ['cd']);
    node.setSGFProperty(PropIdent.AddBlack, ['ab']);
    assert.deepEqual(node.setup, [
      { x: 2, y: 3, c: Color.W },
      { x: 0, y: 1, c: Color.B },
    ]);
  });

  test('Overriding of setSGFProperty markup', () => {
    const node = new KifuNode();
    node.setSGFProperty(PropIdent.Circle, ['cd', 'ef']);
    node.setSGFProperty(PropIdent.Triangle, ['cd']);
    node.setSGFProperty(PropIdent.Circle, ['ab']);
    assert.deepEqual(node.markup, [
      { x: 2, y: 3, type: MarkupType.Triangle },
      { x: 0, y: 1, type: MarkupType.Circle },
    ]);
  });
});

describe('KifuNode common methods.', () => {
  test('addSetup()', () => {
    const node = new KifuNode();

    node.addSetup({ x: 2, y: 3, c: Color.B });
    node.addSetup({ x: 3, y: 4, c: Color.W });

    node.addSetup([
      { x: 5, y: 6, c: Color.B },
      { x: 5, y: 6, c: Color.W },
      { x: 5, y: 6, c: Color.E },
      { x: 5, y: 6, c: Color.E },
    ]);

    assert.deepEqual(node.setup, [
      { x: 2, y: 3, c: Color.B },
      { x: 3, y: 4, c: Color.W },
      { x: 5, y: 6, c: Color.E },
    ]);
  });

  test('removeSetupAt()', () => {
    const node = new KifuNode();
    node.setup = [
      { x: 2, y: 3, c: Color.B },
      { x: 4, y: 5, c: Color.W },
      { x: 6, y: 7, c: Color.W },
      { x: 8, y: 9, c: Color.W },
    ];
    node.removeSetupAt({ x: 2, y: 3 });
    node.removeSetupAt([
      { x: 2, y: 3 },
      { x: 6, y: 7 },
      { x: 8, y: 9 },
    ]);
    assert.deepEqual(node.setup, [{ x: 4, y: 5, c: Color.W }]);
  });

  test('addMarkup()', () => {
    const node = new KifuNode();

    node.addMarkup({ type: MarkupType.Circle, x: 2, y: 3 });
    node.addMarkup([
      { type: MarkupType.Label, text: 'X', x: 2, y: 3 },
      { type: MarkupType.Arrow, x1: 2, y1: 3, x2: 4, y2: 5 },
      { type: MarkupType.Arrow, x1: 2, y1: 3, x2: 4, y2: 5 },
    ]);

    assert.deepEqual(node.markup, [
      { type: MarkupType.Circle, x: 2, y: 3 },
      { type: MarkupType.Label, text: 'X', x: 2, y: 3 },
      { type: MarkupType.Arrow, x1: 2, y1: 3, x2: 4, y2: 5 },
    ]);
  });

  test('removeMarkupAt()', () => {
    const node = new KifuNode();

    node.addMarkup({ type: MarkupType.Circle, x: 2, y: 3 });
    node.addMarkup({ type: MarkupType.Triangle, x: 2, y: 3 });
    node.addMarkup({ type: MarkupType.Label, text: 'X', x: 2, y: 3 });
    node.addMarkup({ type: MarkupType.Arrow, x1: 2, y1: 3, x2: 4, y2: 5 });
    node.addMarkup({ type: MarkupType.Square, x: 4, y: 5 });

    node.removeMarkupAt({ x: 2, y: 3 });

    assert.deepEqual(node.markup, [
      { type: MarkupType.Arrow, x1: 2, y1: 3, x2: 4, y2: 5 },
      { type: MarkupType.Square, x: 4, y: 5 },
    ]);
  });

  test('removeMarkup()', () => {
    const node = new KifuNode();

    node.addMarkup({ type: MarkupType.Circle, x: 2, y: 3 });
    node.addMarkup({ type: MarkupType.Label, text: 'X', x: 2, y: 3 });
    node.addMarkup({ type: MarkupType.Arrow, x1: 2, y1: 3, x2: 4, y2: 5 });
    node.addMarkup({ type: MarkupType.Square, x: 4, y: 5 });

    node.removeMarkup({ type: MarkupType.Circle, x: 2, y: 3 });
    node.removeMarkup([
      { type: MarkupType.Arrow, x1: 2, y1: 3, x2: 4, y2: 5 },
      { type: MarkupType.Label, text: 'X', x: 2, y: 3 },
    ]);

    assert.deepEqual(node.markup, [{ type: MarkupType.Square, x: 4, y: 5 }]);
  });
});

describe('Correct handling of special characters', () => {
  test('Escaping of characters', () => {
    const node = new KifuNode();
    node.setSGFProperties({
      C: ['AB[hm][fk]\\'],
    });
    assert.strictEqual(node.comment, 'AB[hm][fk]\\');
    assert.strictEqual(node.getSGFProperties(), 'C[AB[hm\\][fk\\]\\\\]');
  });
});

describe('Configuring of Kifu node', () => {
  test('Adding custom markup', () => {
    KifuNode.defineProperties({
      FOO: KifuNode.createPointMarkupDescriptor('FOO' as any),
      BAR: KifuNode.createLineMarkupDescriptor('BAR' as any),
    });
    const node = KifuNode.fromSGF('B[ab]FOO[ab]BAR[cd:ef]TR[ef]');

    assert.deepEqual(node.move, { x: 0, y: 1, c: Color.B });
    assert.deepEqual(node.markup, [
      { x: 0, y: 1, type: 'FOO' },
      { x1: 2, y1: 3, x2: 4, y2: 5, type: 'BAR' },
      { x: 4, y: 5, type: 'TR' },
    ]);

    assert(node.getSGFProperties().indexOf('B[ab]') !== -1);
    assert(node.getSGFProperties().indexOf('FOO[ab]') !== -1);
    assert(node.getSGFProperties().indexOf('BAR[cd:ef]') !== -1);
    assert(node.getSGFProperties().indexOf('TR[ef]') !== -1);
  });
});
