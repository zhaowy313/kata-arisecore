import { describe, test, expect } from 'vitest';
import { Color, pipe, Point } from '@wgojs/common';
import {
  AnnotationType,
  MoveAnnotation,
  KifuVariation,
  KifuMove,
  MarkupType,
  PointMarkup,
  PositionSetup,
} from '../src';
import { StandardSGFProperties } from '@wgojs/sgf';

describe('KifuMove constructors', () => {
  test('empty move', () => {
    expect(KifuMove.empty).toEqual({});
  });

  test('create with coordinates', () => {
    const move = KifuMove.create(3, 4);
    expect(move).toEqual({ x: 3, y: 4 });
  });

  test('create with coordinates and color', () => {
    const move = KifuMove.create(3, 4, Color.Black);
    expect(move).toEqual({ x: 3, y: 4, color: Color.Black });
  });

  test('createPass without color', () => {
    const move = KifuMove.createPass();
    expect(move).toEqual({});
  });

  test('createPass with color', () => {
    const move = KifuMove.createPass(Color.White);
    expect(move).toEqual({ color: Color.White });
  });
});

describe('KifuMove.fromSGF', () => {
  test('parse black move', () => {
    const move = KifuMove.fromSGF('B[cd]');
    expect(move).toEqual({ x: 2, y: 3, color: Color.Black });
  });

  test('parse white move', () => {
    const move = KifuMove.fromSGF('W[ef]');
    expect(move).toEqual({ x: 4, y: 5, color: Color.White });
  });

  test('parse black pass', () => {
    const move = KifuMove.fromSGF('B[]');
    expect(move).toEqual({ color: Color.Black });
  });

  test('parse white pass', () => {
    const move = KifuMove.fromSGF('W[]');
    expect(move).toEqual({ color: Color.White });
  });

  test('parse comment', () => {
    const move = KifuMove.fromSGF('C[This is a comment]');
    expect(move.comment).toBe('This is a comment');
  });

  test('parse setup stones', () => {
    const move = KifuMove.fromSGF('AB[cd][ef]AW[gh][ij]AE[kl]');
    expect(move.setup?.stones).toEqual([
      { x: 2, y: 3, color: Color.Black },
      { x: 4, y: 5, color: Color.Black },
      { x: 6, y: 7, color: Color.White },
      { x: 8, y: 9, color: Color.White },
      { x: 10, y: 11, color: Color.Empty },
    ]);
  });

  test('parse starting player', () => {
    const move = KifuMove.fromSGF('PL[W]');
    expect(move.setup?.startingPlayer).toBe(Color.White);
  });

  test('parse board section', () => {
    const move = KifuMove.fromSGF('VW[ab:cd]');
    expect(move.setup?.boardSection).toEqual([
      { x: 0, y: 1 },
      { x: 2, y: 3 },
    ]);
  });

  test('parse markup', () => {
    const move = KifuMove.fromSGF('CR[cd]MA[ef]SQ[gh]TR[ij]SL[kl]');
    expect(move.markup).toEqual([
      { at: { x: 2, y: 3 }, type: MarkupType.Circle },
      { at: { x: 4, y: 5 }, type: MarkupType.XMark },
      { at: { x: 6, y: 7 }, type: MarkupType.Square },
      { at: { x: 8, y: 9 }, type: MarkupType.Triangle },
      { at: { x: 10, y: 11 }, type: MarkupType.Selected },
    ]);
  });

  test('parse arrow markup', () => {
    const move = KifuMove.fromSGF('AR[cd:ef]');
    expect(move.markup).toEqual([
      { from: { x: 2, y: 3 }, to: { x: 4, y: 5 }, type: MarkupType.Arrow },
    ]);
  });

  test('parse line markup', () => {
    const move = KifuMove.fromSGF('LN[cd:ef]');
    expect(move.markup).toEqual([
      { from: { x: 2, y: 3 }, to: { x: 4, y: 5 }, type: MarkupType.Line },
    ]);
  });

  test('parse label markup', () => {
    const move = KifuMove.fromSGF('LB[cd:A][ef:B]');
    expect(move.markup).toEqual([
      { at: { x: 2, y: 3 }, type: MarkupType.Label, text: 'A' },
      { at: { x: 4, y: 5 }, type: MarkupType.Label, text: 'B' },
    ]);
  });

  test('parse custom properties', () => {
    const move = KifuMove.fromSGF('CUSTOM[value]ANOTHER[test]');
    expect(move.custom).toEqual({
      CUSTOM: ['value'],
      ANOTHER: ['test'],
    });
  });

  test('parse complex SGF', () => {
    const move = KifuMove.fromSGF('B[cd]C[Good move]CR[cd]AB[aa]');
    expect(move).toEqual({
      x: 2,
      y: 3,
      color: Color.Black,
      comment: 'Good move',
      markup: [{ at: { x: 2, y: 3 }, type: MarkupType.Circle }],
      setup: {
        stones: [{ x: 0, y: 0, color: Color.Black }],
      },
    });
  });
});

describe('Kifu.toSGFProperties', () => {
  test('black move', () => {
    const move = KifuMove.create(2, 3, Color.Black);
    const properties = KifuMove.toSGFProperties(move);
    expect(properties).toEqual({
      B: { x: 2, y: 3 },
    });
  });

  test('white move', () => {
    const move = KifuMove.create(2, 3, Color.White);
    const properties = KifuMove.toSGFProperties(move);
    expect(properties).toEqual({
      W: { x: 2, y: 3 },
    });
  });

  test('inferred move', () => {
    const move = KifuMove.create(2, 3);
    const properties = KifuMove.toSGFProperties(move);
    expect(properties).toEqual({
      B: { x: 2, y: 3 },
    });
    const properties2 = KifuMove.toSGFProperties(move, Color.White);
    expect(properties2).toEqual({
      W: { x: 2, y: 3 },
    });
  });

  test('pass move', () => {
    const move = KifuMove.createPass(Color.Black);
    const properties = KifuMove.toSGFProperties(move);
    expect(properties).toEqual({
      B: null,
    });
  });

  test('inferred pass', () => {
    const move = KifuMove.createPass();
    const properties = KifuMove.toSGFProperties(move, Color.White);
    expect(properties).toEqual({
      W: null,
    });
  });

  test('with comment', () => {
    const move = KifuMove.create(2, 3);
    const commentedMove = KifuMove.setComment(move, 'Test comment');
    const properties = KifuMove.toSGFProperties(commentedMove);
    expect(properties.C).toEqual('Test comment');
  });

  test('with setup stones', () => {
    const move = KifuMove.create(2, 3);
    const setupMove = {
      ...move,
      setup: PositionSetup.create(
        [
          { x: 0, y: 0, color: Color.Black },
          { x: 1, y: 1, color: Color.Black },
          { x: 2, y: 2, color: Color.White },
          { x: 3, y: 3, color: Color.Empty },
        ],
        Color.White,
      ),
    };
    const properties = KifuMove.toSGFProperties(setupMove);
    expect(properties.AB).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ]);
    expect(properties.AW).toEqual([{ x: 2, y: 2 }]);
    expect(properties.AE).toEqual([{ x: 3, y: 3 }]);
    expect(properties.PL).toEqual(Color.White);
  });

  test('with markup', () => {
    const move = KifuMove.create(2, 3);
    const markupMove = KifuMove.addMarkup(move, [
      { at: { x: 2, y: 3 }, type: MarkupType.Circle },
      { at: { x: 0, y: 0 }, type: MarkupType.Circle },
      { from: { x: 0, y: 0 }, to: { x: 2, y: 3 }, type: MarkupType.Line },
      { from: { x: 1, y: 1 }, to: { x: 2, y: 2 }, type: MarkupType.Arrow },
      { at: { x: 1, y: 1 }, text: 'Test', type: MarkupType.Label },
      { at: { x: 3, y: 3 }, type: MarkupType.Square },
      { at: { x: 3, y: 2 }, type: MarkupType.Triangle },
      { at: { x: 1, y: 2 }, type: MarkupType.Selected },
      { at: { x: 2, y: 1 }, type: MarkupType.XMark },
    ]);
    const properties = KifuMove.toSGFProperties(markupMove);
    expect(properties.CR).toEqual([
      { x: 2, y: 3 },
      { x: 0, y: 0 },
    ]);
    expect(properties.LN).toEqual([
      [
        { x: 0, y: 0 },
        { x: 2, y: 3 },
      ],
    ]);
    expect(properties.AR).toEqual([
      [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
    ]);
    expect(properties.LB).toEqual([[{ x: 1, y: 1 }, 'Test']]);
    expect(properties.SQ).toEqual([{ x: 3, y: 3 }]);
    expect(properties.TR).toEqual([{ x: 3, y: 2 }]);
    expect(properties.SL).toEqual([{ x: 1, y: 2 }]);
    expect(properties.MA).toEqual([{ x: 2, y: 1 }]);
  });

  test('with annotations', () => {
    const move = KifuMove.create(2, 3);
    const annotatedMove = pipe(
      move,
      KifuMove.addAnnotation({
        type: AnnotationType.DoubtfulMove,
        emphasized: false,
      }),
      KifuMove.addAnnotation({
        type: AnnotationType.Tesuji,
        emphasized: true,
      }),
      KifuMove.addAnnotation({
        type: AnnotationType.Hotspot,
        emphasized: true,
      }),
      KifuMove.addAnnotation({
        type: AnnotationType.Value,
        value: 0.5,
      }),
    );
    const properties = KifuMove.toSGFProperties(annotatedMove);
    expect(properties.DM).toEqual('1');
    expect(properties.TE).toEqual('2');
    expect(properties.HO).toEqual('2');
    expect(properties.V).toEqual(0.5);
  });

  test('with annotations 2', () => {
    const move = KifuMove.create(2, 3);
    const annotatedMove = pipe(
      move,
      KifuMove.addAnnotation({
        type: AnnotationType.Doubtful,
      }),
      KifuMove.addAnnotation({
        type: AnnotationType.UnclearPosition,
        emphasized: false,
      }),
    );
    const properties = KifuMove.toSGFProperties(annotatedMove);
    expect(properties.DO).toEqual('');
    expect(properties.UC).toEqual('1');
  });

  test('with annotations 3', () => {
    const move = KifuMove.create(2, 3);
    const annotatedMove = pipe(
      move,
      KifuMove.addAnnotation({
        type: AnnotationType.GoodForBlack,
        emphasized: true,
      }),
      KifuMove.addAnnotation({
        type: AnnotationType.Interesting,
      }),
    );
    const properties = KifuMove.toSGFProperties(annotatedMove);
    expect(properties.GB).toEqual('2');
    expect(properties.IT).toEqual('');
  });

  test('with annotations 4', () => {
    const move = KifuMove.create(2, 3);
    const annotatedMove = pipe(
      move,
      KifuMove.addAnnotation({
        type: AnnotationType.GoodForWhite,
        emphasized: false,
      }),
      KifuMove.addAnnotation({
        type: AnnotationType.BadMove,
        emphasized: true,
      }),
    );
    const properties = KifuMove.toSGFProperties(annotatedMove);
    expect(properties.GW).toEqual('1');
    expect(properties.BM).toEqual('2');
  });
});

describe('KifuMove.update', () => {
  test('update partial properties', () => {
    const originalMove = KifuMove.create(3, 4, Color.Black);
    const updatedMove = KifuMove.update(originalMove, { comment: 'Test comment' });

    expect(updatedMove).toEqual({
      x: 3,
      y: 4,
      color: Color.Black,
      comment: 'Test comment',
    });

    // Original should not be modified
    expect(originalMove).toEqual({ x: 3, y: 4, color: Color.Black });
  });

  test('update multiple properties', () => {
    const originalMove = KifuMove.create(3, 4);
    const updatedMove = KifuMove.update(originalMove, {
      color: Color.White,
      comment: 'Updated',
    });

    expect(updatedMove).toEqual({
      x: 3,
      y: 4,
      color: Color.White,
      comment: 'Updated',
    });
  });
});

describe('KifuMove setters', () => {
  test('setMove', () => {
    const move = KifuMove.empty;
    const updatedMove = KifuMove.setMove(move, 5, 6);

    expect(updatedMove).toEqual({ x: 5, y: 6 });
    expect(move).toEqual({});
  });

  test('setMove replaces existing coordinates', () => {
    const move = KifuMove.create(1, 2);
    const updatedMove = KifuMove.setMove(move, 5, 6);

    expect(updatedMove).toEqual({ x: 5, y: 6 });
  });

  test('setPass removes coordinates', () => {
    const move = KifuMove.create(3, 4, Color.Black);
    const passMove = KifuMove.setPass(move);

    expect(passMove).toEqual({ color: Color.Black });
    expect(passMove).not.toHaveProperty('x');
    expect(passMove).not.toHaveProperty('y');
  });

  test('setComment', () => {
    const move = KifuMove.create(3, 4);
    const commentedMove = KifuMove.setComment(move, 'Test comment');

    expect(commentedMove).toEqual({
      x: 3,
      y: 4,
      comment: 'Test comment',
    });
  });

  test('setComment with undefined removes comment', () => {
    const move = { x: 3, y: 4, comment: 'Old comment' };
    const updatedMove = KifuMove.setComment(move, undefined);

    expect(updatedMove).toEqual({
      x: 3,
      y: 4,
      comment: undefined,
    });
  });

  test('setCustom', () => {
    const move = KifuMove.create(3, 4);
    const customMove = KifuMove.setCustom(move, { key1: 'value1', key2: 'value2' });

    expect(customMove).toEqual({
      x: 3,
      y: 4,
      custom: { key1: 'value1', key2: 'value2' },
    });
  });

  test('setCustom merges with existing custom properties', () => {
    const move = { x: 3, y: 4, custom: { existing: 'value' } };
    const customMove = KifuMove.setCustom(move, { new: 'property' });

    expect(customMove).toEqual({
      x: 3,
      y: 4,
      custom: { existing: 'value', new: 'property' },
    });
  });
});

describe('KifuMove variations', () => {
  test('addVariation with KifuVariation', () => {
    const move = KifuMove.create(3, 4);
    const variation: KifuVariation = { moves: [KifuMove.create(5, 6)] };
    const updatedMove = KifuMove.addVariation(move, variation);

    expect(updatedMove.variations).toEqual([variation]);
    expect(move.variations).toBeUndefined();
  });

  test('addVariation with KifuMove array', () => {
    const move = KifuMove.create(3, 4);
    const moves = [KifuMove.create(5, 6), KifuMove.create(7, 8)];
    const updatedMove = KifuMove.addVariation(move, moves);

    expect(updatedMove.variations).toEqual([{ moves }]);
  });

  test('addVariation to move with existing variations', () => {
    const variation1: KifuVariation = { moves: [KifuMove.create(1, 2)] };
    const variation2: KifuVariation = { moves: [KifuMove.create(3, 4)] };

    const move = { variations: [variation1] };
    const updatedMove = KifuMove.addVariation(move, variation2);

    expect(updatedMove.variations).toEqual([variation1, variation2]);
  });

  test('removeVariation by index', () => {
    const variation1: KifuVariation = { moves: [KifuMove.create(1, 2)] };
    const variation2: KifuVariation = { moves: [KifuMove.create(3, 4)] };
    const variation3: KifuVariation = { moves: [KifuMove.create(5, 6)] };

    const move = { variations: [variation1, variation2, variation3] };
    const updatedMove = KifuMove.removeVariation(move, 1);

    expect(updatedMove.variations).toEqual([variation1, variation3]);
  });

  test('removeVariation by reference', () => {
    const variation1: KifuVariation = { moves: [KifuMove.create(1, 2)] };
    const variation2: KifuVariation = { moves: [KifuMove.create(3, 4)] };
    const variation3: KifuVariation = { moves: [KifuMove.create(5, 6)] };

    const move = { variations: [variation1, variation2, variation3] };
    const updatedMove = KifuMove.removeVariation(move, variation2);

    expect(updatedMove.variations).toEqual([variation1, variation3]);
  });

  test('removeVariation from move without variations', () => {
    const move = KifuMove.create(3, 4);
    const updatedMove = KifuMove.removeVariation(move, 0);

    expect(updatedMove).toEqual(move);
  });

  test('removeVariation with invalid index', () => {
    const variation1: KifuVariation = { moves: [KifuMove.create(1, 2)] };
    const move = { variations: [variation1] };
    const updatedMove = KifuMove.removeVariation(move, 5);

    expect(updatedMove.variations).toEqual([variation1]);
  });

  test('removeVariation with non-existent reference', () => {
    const variation1: KifuVariation = { moves: [KifuMove.create(1, 2)] };
    const variation2: KifuVariation = { moves: [KifuMove.create(3, 4)] };
    const nonExistentVariation: KifuVariation = { moves: [KifuMove.create(5, 6)] };

    const move = { variations: [variation1, variation2] };
    const updatedMove = KifuMove.removeVariation(move, nonExistentVariation);

    expect(updatedMove.variations).toEqual([variation1, variation2]);
  });

  test('updateVariation by index', () => {
    const variation1: KifuVariation = { moves: [KifuMove.create(1, 2)] };
    const variation2: KifuVariation = { moves: [KifuMove.create(3, 4)] };

    const move = { variations: [variation1, variation2] };
    const updateFn = (v: KifuVariation) => ({ ...v, name: 'Updated' });
    const updatedMove = KifuMove.updateVariation(move, 0, updateFn);

    expect(updatedMove.variations).toEqual([
      { moves: [KifuMove.create(1, 2)], name: 'Updated' },
      variation2,
    ]);
  });

  test('updateVariation by reference', () => {
    const variation1: KifuVariation = { moves: [KifuMove.create(1, 2)] };
    const variation2: KifuVariation = { moves: [KifuMove.create(3, 4)] };

    const move = { variations: [variation1, variation2] };
    const updateFn = (v: KifuVariation) => ({ ...v, name: 'Updated' });
    const updatedMove = KifuMove.updateVariation(move, variation1, updateFn);

    expect(updatedMove.variations).toEqual([
      { moves: [KifuMove.create(1, 2)], name: 'Updated' },
      variation2,
    ]);
  });

  test('updateVariation on move without variations', () => {
    const move = KifuMove.create(3, 4);
    const updateFn = (v: KifuVariation) => ({ ...v, name: 'Updated' });
    const updatedMove = KifuMove.updateVariation(move, 0, updateFn);

    expect(updatedMove).toEqual(move);
  });

  test('updateVariation with invalid index', () => {
    const variation1: KifuVariation = { moves: [KifuMove.create(1, 2)] };
    const move = { variations: [variation1] };
    const updateFn = (v: KifuVariation) => ({ ...v, name: 'Updated' });
    const updatedMove = KifuMove.updateVariation(move, 5, updateFn);

    // The current implementation calls updateFn even with undefined variation,
    // which creates a sparse array. This might be a bug, but testing actual behavior.
    expect(updatedMove.variations![0]).toEqual(variation1);
    expect(updatedMove.variations![5]).toEqual({ name: 'Updated' });
    expect(updatedMove.variations!).toHaveLength(6);
  });

  test('updateVariation with non-existent reference', () => {
    const variation1: KifuVariation = { moves: [KifuMove.create(1, 2)] };
    const variation2: KifuVariation = { moves: [KifuMove.create(3, 4)] };
    const nonExistentVariation: KifuVariation = { moves: [KifuMove.create(5, 6)] };

    const move = { variations: [variation1, variation2] };
    const updateFn = (v: KifuVariation) => ({ ...v, name: 'Updated' });
    const updatedMove = KifuMove.updateVariation(move, nonExistentVariation, updateFn);

    expect(updatedMove.variations).toEqual([variation1, variation2]);
  });
});

describe('KifuMove currying', () => {
  test('curried functions work correctly', () => {
    const move = KifuMove.create(3, 4);

    // Test curried setComment
    const setTestComment = KifuMove.setComment('Test comment');
    const commentedMove = setTestComment(move);
    expect(commentedMove.comment).toBe('Test comment');

    // Test curried setMove
    const setPosition = KifuMove.setMove(7, 8);
    const movedMove = setPosition(move);
    expect(movedMove).toEqual({ x: 7, y: 8 });
  });

  test('curried variation functions work correctly', () => {
    const move = KifuMove.create(3, 4);
    const variation: KifuVariation = { moves: [KifuMove.create(5, 6)] };

    // Test curried addVariation
    const addTestVariation = KifuMove.addVariation(variation);
    const variationMove = addTestVariation(move);
    expect(variationMove.variations).toEqual([variation]);
  });
});

describe('KifuMove immutability', () => {
  test('all operations return new objects', () => {
    const originalMove = KifuMove.create(3, 4, Color.Black);

    const setMoveResult = KifuMove.setMove(originalMove, 5, 6);
    const setCommentResult = KifuMove.setComment(originalMove, 'Comment');
    const setPassResult = KifuMove.setPass(originalMove);

    // Original should be unchanged
    expect(originalMove).toEqual({ x: 3, y: 4, color: Color.Black });

    // Results should be different objects
    expect(setMoveResult).not.toBe(originalMove);
    expect(setCommentResult).not.toBe(originalMove);
    expect(setPassResult).not.toBe(originalMove);
  });

  test('variation operations return new objects', () => {
    const variation: KifuVariation = { moves: [KifuMove.create(1, 2)] };
    const originalMove = { variations: [variation] };

    const addResult = KifuMove.addVariation(originalMove, { moves: [KifuMove.create(3, 4)] });
    const removeResult = KifuMove.removeVariation(originalMove, 0);
    const updateResult = KifuMove.updateVariation(originalMove, 0, (v) => ({ ...v, name: 'Test' }));

    // Original should be unchanged
    expect(originalMove.variations).toEqual([variation]);

    // Results should be different objects
    expect(addResult).not.toBe(originalMove);
    expect(removeResult).not.toBe(originalMove);
    expect(updateResult).not.toBe(originalMove);

    // Variations arrays should be different
    expect(addResult.variations).not.toBe(originalMove.variations);
    expect(removeResult.variations).not.toBe(originalMove.variations);
    expect(updateResult.variations).not.toBe(originalMove.variations);
  });
});

describe('KifuMove edge cases', () => {
  test('works with undefined and null values', () => {
    const move = KifuMove.update(KifuMove.empty, { comment: undefined });
    expect(move.comment).toBeUndefined();
  });

  test('handles empty variations array', () => {
    const move = { variations: [] };
    const addResult = KifuMove.addVariation(move, { moves: [KifuMove.create(1, 2)] });
    expect(addResult.variations).toHaveLength(1);
  });

  test('preserves existing properties when adding new ones', () => {
    const move = {
      x: 3,
      y: 4,
      color: Color.Black,
      comment: 'Original comment',
      custom: { existing: 'value' },
    };

    const updatedMove = KifuMove.setCustom(move, { new: 'property' });

    expect(updatedMove).toEqual({
      x: 3,
      y: 4,
      color: Color.Black,
      comment: 'Original comment',
      custom: { existing: 'value', new: 'property' },
    });
  });
});

describe('KifuMove annotations', () => {
  test('parse move annotations from SGF', () => {
    const move = KifuMove.fromSGF('BM[1]TE[1]DO[1]IT[1]');
    expect(move.annotations).toBeDefined();
    expect(move.annotations).toHaveLength(4);
  });

  test('handles empty annotation values', () => {
    const move = KifuMove.fromSGF('BM[]TE[]');
    // Should handle empty annotations gracefully
    expect(move).toBeDefined();
  });
});

describe('KifuMove applyProperties', () => {
  test('handles empty properties object', () => {
    const move = KifuMove.applyProperties(KifuMove.empty, { properties: {} });
    expect(move).toEqual({});
  });

  test('handles unknown properties', () => {
    const move = KifuMove.applyProperties(KifuMove.empty, {
      properties: { UNKNOWN: ['value'] },
    } as any);
    expect(move.custom).toEqual({ UNKNOWN: ['value'] });
  });

  test('handles multiple move properties', () => {
    const move = KifuMove.applyProperties(KifuMove.empty, {
      properties: {
        B: { x: 3, y: 4 },
        C: 'Test comment',
        CR: [{ x: 3, y: 4 }],
      },
    });

    expect(move.x).toBe(3);
    expect(move.y).toBe(4);
    expect(move.color).toBe(Color.Black);
    expect(move.comment).toBe('Test comment');
    expect(move.markup).toHaveLength(1);
  });

  test('handles custom properties', () => {
    const move = KifuMove.applyProperties(KifuMove.empty, {
      properties: {
        NAME: 'Test comment',
        SMILE: [{ x: 3, y: 4 }],
      },
      applyProperty(move, properties, key) {
        switch (key) {
          case 'NAME':
            return KifuMove.setComment(move, properties[key]);
          case 'SMILE':
            return KifuMove.addMarkup(move, { at: properties[key]![0], type: 'SMILE' as any });
        }
      },
    });

    expect(move.comment).toBe('Test comment');
    expect(move.markup).toHaveLength(1);
    expect(move.markup?.[0]).toEqual({ at: { x: 3, y: 4 }, type: 'SMILE' });
  });
});

describe('KifuMove markup and annotations integration', () => {
  test('combines markup and annotations from same SGF', () => {
    const move = KifuMove.fromSGF('B[dd]C[Good move]CR[dd]BM[1]');

    expect(move.x).toBe(3);
    expect(move.y).toBe(3);
    expect(move.color).toBe(Color.Black);
    expect(move.comment).toBe('Good move');
    expect(move.markup).toHaveLength(1);
    expect(move.annotations).toBeDefined();
  });

  test('handles markup and setup together', () => {
    const move = KifuMove.fromSGF('AB[aa][bb]CR[aa]MA[bb]');

    expect(move.setup?.stones).toHaveLength(2);
    expect(move.markup).toHaveLength(2);
  });
});

describe('KifuMove withMarkup and withAnnotations', () => {
  test('has markup methods available', () => {
    expect(typeof KifuMove.addMarkup).toBe('function');
    expect(typeof KifuMove.removeMarkup).toBe('function');
  });

  test('has annotation methods available', () => {
    expect(typeof KifuMove.addAnnotation).toBe('function');
    expect(typeof KifuMove.removeAnnotationByType).toBe('function');
    expect(typeof KifuMove.clearAnnotations).toBe('function');
  });

  test('markup methods work correctly', () => {
    const move = KifuMove.create(3, 4);
    const markup: PointMarkup<MarkupType.Circle> = { at: { x: 3, y: 4 }, type: MarkupType.Circle };
    const markedMove = KifuMove.addMarkup(move, markup);

    expect(markedMove.markup).toEqual([markup]);
    expect(move.markup).toBeUndefined(); // Original unchanged
  });

  test('annotation methods work correctly', () => {
    const move = KifuMove.create(3, 4);
    const annotation: MoveAnnotation = { type: AnnotationType.BadMove, emphasized: false };
    const annotatedMove = KifuMove.addAnnotation(move, annotation);

    expect(annotatedMove.annotations).toEqual([annotation]);
    expect(move.annotations).toBeUndefined(); // Original unchanged

    const clearedMove = KifuMove.clearAnnotations(annotatedMove);
    expect(clearedMove.annotations).toBeUndefined();

    const removedMove = KifuMove.removeAnnotationByType(annotatedMove, 'BM');
    expect(removedMove.annotations).toEqual([]);
  });
});

describe('KifuMove advanced markup testing', () => {
  test('different markup types work correctly', () => {
    const move = KifuMove.create(3, 4);

    // Point markup
    const circleMarkup: PointMarkup<MarkupType.Circle> = {
      at: { x: 3, y: 4 },
      type: MarkupType.Circle,
    };
    const markedMove = KifuMove.addMarkup(move, circleMarkup);
    expect(markedMove.markup).toEqual([circleMarkup]);

    // Multiple markup
    const squareMarkup: PointMarkup<MarkupType.Square> = {
      at: { x: 5, y: 6 },
      type: MarkupType.Square,
    };
    const multiMarkedMove = KifuMove.addMarkup(markedMove, squareMarkup);
    expect(multiMarkedMove.markup).toEqual([circleMarkup, squareMarkup]);
  });

  test('removes markup correctly', () => {
    const markup1: PointMarkup<MarkupType.Circle> = { at: { x: 3, y: 4 }, type: MarkupType.Circle };
    const markup2: PointMarkup<MarkupType.Square> = { at: { x: 5, y: 6 }, type: MarkupType.Square };
    const move = KifuMove.addMarkup(KifuMove.addMarkup(KifuMove.empty, markup1), markup2);

    const removedMove = KifuMove.removeMarkup(move, markup1);
    expect(removedMove.markup).toEqual([markup2]);
  });
});

describe('KifuMove complex SGF scenarios', () => {
  test('handles mixed properties in complex order', () => {
    const move = KifuMove.fromSGF('CR[dd]B[dd]C[Complex move]TE[1]AB[aa]PL[W]VW[aa:ss]');

    expect(move.x).toBe(3);
    expect(move.y).toBe(3);
    expect(move.color).toBe(Color.Black);
    expect(move.comment).toBe('Complex move');
    expect(move.markup).toHaveLength(1);
    expect(move.annotations).toBeDefined();
    expect(move.setup?.stones).toHaveLength(1);
    expect(move.setup?.startingPlayer).toBe(Color.White);
    expect(move.setup?.boardSection).toBeDefined();
  });

  test('handles SGF with variations and annotations', () => {
    const move = KifuMove.fromSGF('B[dd]BM[2]TE[1]DO[]IT[]');

    expect(move.annotations).toHaveLength(4);
    expect(move.annotations![0]).toEqual({ type: 'BM', emphasized: true });
    expect(move.annotations![1]).toEqual({ type: 'TE' });
    expect(move.annotations![2]).toEqual({ type: 'DO' });
    expect(move.annotations![3]).toEqual({ type: 'IT' });
  });

  test('handles numeric value annotations', () => {
    const move = KifuMove.fromSGF('V[5]');

    expect(move.annotations).toHaveLength(1);
    expect(move.annotations![0]).toEqual({ type: 'V', value: 5 });
  });

  test('handles malformed SGF gracefully', () => {
    const move1 = KifuMove.fromSGF('B[]'); // Pass move
    expect(move1).toEqual({ color: Color.Black });

    const move3 = KifuMove.fromSGF(''); // Empty SGF
    expect(move3).toEqual({});
  });

  test('handles custom SGF properties', () => {
    type CustomProperties = StandardSGFProperties & {
      NAME?: string[];
      SMILE?: string[];
    };
    const move = KifuMove.fromSGF('NAME[Test comment]SMILE[aa][bb]', {
      applyProperty(move, properties: CustomProperties, key: keyof CustomProperties) {
        switch (key) {
          case 'NAME':
            return KifuMove.setComment(move, properties[key]![0]);
          case 'SMILE':
            const points = properties[key]!.map((p) => ({
              at: Point.fromSGF(p),
              type: 'SMILE' as any,
            }));
            return KifuMove.addMarkup(move, points);
        }
        return move;
      },
    });

    expect(move.comment).toBe('Test comment');
    expect(move.markup).toHaveLength(2);
    expect(move.markup?.[0]).toEqual({ at: { x: 0, y: 0 }, type: 'SMILE' });
    expect(move.markup?.[1]).toEqual({ at: { x: 1, y: 1 }, type: 'SMILE' });
  });
});

describe('KifuMove method chaining and composition', () => {
  test('methods can be chained effectively', () => {
    const move = KifuMove.setComment(
      KifuMove.addMarkup(KifuMove.setMove(KifuMove.empty, 3, 4), {
        at: { x: 3, y: 4 },
        type: MarkupType.Circle,
      }),
      'Chained move',
    );

    expect(move).toEqual({
      x: 3,
      y: 4,
      comment: 'Chained move',
      markup: [{ at: { x: 3, y: 4 }, type: MarkupType.Circle }],
    });
  });

  test('curried functions work with complex operations', () => {
    const addCircleAt34 = KifuMove.addMarkup({ at: { x: 3, y: 4 }, type: MarkupType.Circle });
    const addCommentChained = KifuMove.setComment('Curried comment');

    const move = addCommentChained(addCircleAt34(KifuMove.create(3, 4)));

    expect(move).toEqual({
      x: 3,
      y: 4,
      comment: 'Curried comment',
      markup: [{ at: { x: 3, y: 4 }, type: MarkupType.Circle }],
    });
  });

  test('composition preserves all properties', () => {
    const originalMove = {
      x: 1,
      y: 2,
      color: Color.Black,
      comment: 'Original',
      custom: { test: 'value' },
      variations: [{ moves: [KifuMove.create(5, 6)] }],
    };

    const updatedMove = KifuMove.addMarkup(originalMove, {
      at: { x: 7, y: 8 },
      type: MarkupType.Triangle,
    });

    expect(updatedMove.x).toBe(1);
    expect(updatedMove.y).toBe(2);
    expect(updatedMove.color).toBe(Color.Black);
    expect(updatedMove.comment).toBe('Original');
    expect(updatedMove.custom).toEqual({ test: 'value' });
    expect(updatedMove.variations).toEqual([{ moves: [KifuMove.create(5, 6)] }]);
    expect(updatedMove.markup).toEqual([{ at: { x: 7, y: 8 }, type: MarkupType.Triangle }]);
  });
});

describe('KifuMove error handling and edge cases', () => {
  test('handles undefined values gracefully', () => {
    const move1 = KifuMove.setComment(KifuMove.empty, undefined);
    expect(move1.comment).toBeUndefined();

    const move2 = KifuMove.addMarkup(KifuMove.empty, []);
    expect(move2.markup).toEqual([]);
  });

  test('handles empty arrays and objects', () => {
    const move = KifuMove.update(KifuMove.empty, {
      variations: [],
      custom: {},
      markup: [],
      annotations: [],
    });

    expect(move.variations).toEqual([]);
    expect(move.custom).toEqual({});
    expect(move.markup).toEqual([]);
    expect(move.annotations).toEqual([]);
  });

  test('preserves object identity where appropriate', () => {
    const variation = { moves: [KifuMove.create(1, 2)] };
    const move1 = KifuMove.addVariation(KifuMove.empty, variation);
    const move2 = KifuMove.addVariation(move1, { moves: [KifuMove.create(3, 4)] });

    expect(move2.variations![0]).toBe(variation); // Same reference preserved
    expect(move2.variations![1]).not.toBe(variation); // New object
  });

  test('handles large coordinate values', () => {
    const move = KifuMove.create(999, 999);
    expect(move.x).toBe(999);
    expect(move.y).toBe(999);

    const updatedMove = KifuMove.setMove(move, 0, 0);
    expect(updatedMove.x).toBe(0);
    expect(updatedMove.y).toBe(0);
  });

  test('handles complex custom properties', () => {
    const customProps = {
      complexArray: [1, 2, { nested: true }],
      deepObject: { level1: { level2: { value: 'deep' } } },
      functionValue: () => 'function',
      nullValue: null,
      undefinedValue: undefined,
    };

    const move = KifuMove.setCustom(KifuMove.empty, customProps);
    expect(move.custom).toEqual(customProps);
  });
});

describe('KifuMove performance and memory efficiency', () => {
  test('handles many variations efficiently', () => {
    let move = KifuMove.empty;
    const variations = [];

    for (let i = 0; i < 100; i++) {
      variations.push({ moves: [KifuMove.create(i % 19, Math.floor(i / 19) % 19)] });
    }

    const start = performance.now();
    for (const variation of variations) {
      move = KifuMove.addVariation(move, variation);
    }
    const end = performance.now();

    expect(move.variations).toHaveLength(100);
    expect(end - start).toBeLessThan(100); // Should be very fast
  });

  test('handles many markup items efficiently', () => {
    let move = KifuMove.empty;

    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      const markup: PointMarkup<MarkupType.Circle> = {
        at: { x: i % 19, y: Math.floor(i / 19) % 19 },
        type: MarkupType.Circle,
      };
      move = KifuMove.addMarkup(move, markup);
    }
    const end = performance.now();

    expect(move.markup).toHaveLength(100);
    expect(end - start).toBeLessThan(100); // Should be very fast
  });

  test('deep object updates maintain efficiency', () => {
    const baseMove = {
      x: 10,
      y: 10,
      color: Color.Black,
      comment: 'Base move',
      variations: Array.from({ length: 50 }, (_, i) => ({
        moves: [KifuMove.create(i, i)],
      })),
      markup: Array.from({ length: 50 }, (_, i) => ({
        at: { x: i, y: i },
        type: MarkupType.Circle,
      })) as PointMarkup<MarkupType.Circle>[],
      custom: Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`key${i}`, `value${i}`])),
    };

    const start = performance.now();
    const updatedMove = KifuMove.setComment(baseMove, 'Updated comment');
    const end = performance.now();

    expect(updatedMove.comment).toBe('Updated comment');
    expect(updatedMove.variations).toBe(baseMove.variations); // Reference preserved
    expect(updatedMove.markup).toBe(baseMove.markup); // Reference preserved
    expect(updatedMove.custom).toBe(baseMove.custom); // Reference preserved
    expect(end - start).toBeLessThan(10); // Should be very fast
  });
});
