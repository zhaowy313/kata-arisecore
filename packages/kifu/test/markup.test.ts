import { describe, test, expect } from 'vitest';
import {
  Markup,
  MarkupType,
  PointMarkup,
  LineMarkup,
  LabelMarkup,
  withMarkup,
} from '../src/markup';
import { Point } from '@wgojs/common';

describe('MarkupType enum', () => {
  test('should contain all expected markup types', () => {
    expect(MarkupType.Arrow).toBe('AR');
    expect(MarkupType.Circle).toBe('CR');
    expect(MarkupType.Label).toBe('LB');
    expect(MarkupType.Line).toBe('LN');
    expect(MarkupType.XMark).toBe('MA');
    expect(MarkupType.Selected).toBe('SL');
    expect(MarkupType.Square).toBe('SQ');
    expect(MarkupType.Triangle).toBe('TR');
  });
});

describe('Markup factory methods', () => {
  describe('createPoint', () => {
    test('should create point markup', () => {
      const markup = Markup.createPoint(MarkupType.Circle, { x: 3, y: 4 });
      expect(markup).toEqual({
        type: MarkupType.Circle,
        at: { x: 3, y: 4 },
      });
    });

    test('should work with custom markup types', () => {
      const markup = Markup.createPoint('CUSTOM', { x: 0, y: 0 });
      expect(markup).toEqual({
        type: 'CUSTOM',
        at: { x: 0, y: 0 },
      });
    });
  });

  describe('createLine', () => {
    test('should create line markup', () => {
      const from = { x: 0, y: 0 };
      const to = { x: 3, y: 3 };
      const markup = Markup.createLine(MarkupType.Arrow, from, to);

      expect(markup).toEqual({
        type: MarkupType.Arrow,
        from,
        to,
      });
    });

    test('should work with custom markup types', () => {
      const from = { x: 1, y: 2 };
      const to = { x: 4, y: 5 };
      const markup = Markup.createLine('CUSTOM_LINE', from, to);

      expect(markup).toEqual({
        type: 'CUSTOM_LINE',
        from,
        to,
      });
    });
  });

  describe('createLabel', () => {
    test('should create label markup', () => {
      const at = { x: 5, y: 6 };
      const markup = Markup.createLabel(MarkupType.Label, at, 'A');

      expect(markup).toEqual({
        type: MarkupType.Label,
        at,
        text: 'A',
      });
    });

    test('should work with custom markup types', () => {
      const at = { x: 0, y: 0 };
      const markup = Markup.createLabel('CUSTOM_LABEL', at, '1');

      expect(markup).toEqual({
        type: 'CUSTOM_LABEL',
        at,
        text: '1',
      });
    });
  });
});

describe('Markup shorthand methods', () => {
  test('circle should create circle markup', () => {
    const at = { x: 3, y: 4 };
    const markup = Markup.circle(at);

    expect(markup).toEqual({
      type: MarkupType.Circle,
      at,
    });
  });

  test('selected should create selected markup', () => {
    const at = { x: 2, y: 3 };
    const markup = Markup.selected(at);

    expect(markup).toEqual({
      type: MarkupType.Selected,
      at,
    });
  });

  test('square should create square markup', () => {
    const at = { x: 1, y: 2 };
    const markup = Markup.square(at);

    expect(markup).toEqual({
      type: MarkupType.Square,
      at,
    });
  });

  test('triangle should create triangle markup', () => {
    const at = { x: 4, y: 5 };
    const markup = Markup.triangle(at);

    expect(markup).toEqual({
      type: MarkupType.Triangle,
      at,
    });
  });

  test('xMark should create X mark markup', () => {
    const at = { x: 0, y: 1 };
    const markup = Markup.xMark(at);

    expect(markup).toEqual({
      type: MarkupType.XMark,
      at,
    });
  });

  test('arrow should create arrow markup', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 1, y: 1 };
    const markup = Markup.arrow(from, to);

    expect(markup).toEqual({
      type: MarkupType.Arrow,
      from,
      to,
    });
  });

  test('line should create line markup', () => {
    const from = { x: 2, y: 3 };
    const to = { x: 4, y: 5 };
    const markup = Markup.line(from, to);

    expect(markup).toEqual({
      type: MarkupType.Line,
      from,
      to,
    });
  });

  test('label should create label markup', () => {
    const at = { x: 3, y: 3 };
    const markup = Markup.label(at, 'B');

    expect(markup).toEqual({
      type: MarkupType.Label,
      at,
      text: 'B',
    });
  });
});

describe('Markup.fromSGFProperty', () => {
  test('should parse point markups', () => {
    const point = { x: 3, y: 3 };

    expect(Markup.fromSGFProperty(MarkupType.Circle, [point])).toEqual([
      {
        type: MarkupType.Circle,
        at: point,
      },
    ]);

    expect(Markup.fromSGFProperty(MarkupType.Selected, [point])).toEqual([
      {
        type: MarkupType.Selected,
        at: point,
      },
    ]);

    expect(Markup.fromSGFProperty(MarkupType.Square, [point])).toEqual([
      {
        type: MarkupType.Square,
        at: point,
      },
    ]);

    expect(Markup.fromSGFProperty(MarkupType.Triangle, [point])).toEqual([
      {
        type: MarkupType.Triangle,
        at: point,
      },
    ]);

    expect(Markup.fromSGFProperty(MarkupType.XMark, [point])).toEqual([
      {
        type: MarkupType.XMark,
        at: point,
      },
    ]);
  });

  test('should parse line markups', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 3, y: 3 };
    const lineArg = [from, to] as [Point, Point];

    expect(Markup.fromSGFProperty(MarkupType.Arrow, [lineArg])).toEqual([
      {
        type: MarkupType.Arrow,
        from,
        to,
      },
    ]);

    expect(Markup.fromSGFProperty(MarkupType.Line, [lineArg])).toEqual([
      {
        type: MarkupType.Line,
        from,
        to,
      },
    ]);
  });

  test('should parse label markup', () => {
    const at = { x: 5, y: 5 };
    const labelArg = [at, 'A'] as [Point, string];

    expect(Markup.fromSGFProperty(MarkupType.Label, [labelArg])).toEqual([
      {
        type: MarkupType.Label,
        at,
        text: 'A',
      },
    ]);
  });

  test('should throw for unknown markup types', () => {
    // @ts-expect-error Testing unknown type
    expect(() => Markup.fromSGFProperty('UNKNOWN' as any, [{}])).toThrowError();
  });

  test('should parse multiple markups', () => {
    const point = { x: 3, y: 3 };
    const point2 = { x: 4, y: 4 };

    expect(Markup.fromSGFProperty(MarkupType.Circle, [point, point2])).toEqual([
      {
        type: MarkupType.Circle,
        at: point,
      },
      {
        type: MarkupType.Circle,
        at: point2,
      },
    ]);
  });
});

describe('Markup.equals', () => {
  test('should return false for different types', () => {
    const circle = Markup.circle({ x: 0, y: 0 });
    const square = Markup.square({ x: 0, y: 0 });

    expect(Markup.equals(circle, square)).toBe(false);
  });

  test('should compare point markups correctly', () => {
    const circle1 = Markup.circle({ x: 3, y: 4 });
    const circle2 = Markup.circle({ x: 3, y: 4 });
    const circle3 = Markup.circle({ x: 3, y: 5 });

    expect(Markup.equals(circle1, circle2)).toBe(true);
    expect(Markup.equals(circle1, circle3)).toBe(false);
  });

  test('should compare line markups correctly', () => {
    const arrow1 = Markup.arrow({ x: 0, y: 0 }, { x: 1, y: 1 });
    const arrow2 = Markup.arrow({ x: 0, y: 0 }, { x: 1, y: 1 });
    const arrow3 = Markup.arrow({ x: 0, y: 0 }, { x: 2, y: 2 });

    expect(Markup.equals(arrow1, arrow2)).toBe(true);
    expect(Markup.equals(arrow1, arrow3)).toBe(false);
  });

  test('should compare label markups correctly', () => {
    const label1 = Markup.label({ x: 2, y: 3 }, 'A');
    const label2 = Markup.label({ x: 2, y: 3 }, 'A');
    const label3 = Markup.label({ x: 2, y: 3 }, 'B');
    const label4 = Markup.label({ x: 2, y: 4 }, 'A');

    expect(Markup.equals(label1, label2)).toBe(true);
    expect(Markup.equals(label1, label3)).toBe(false);
    expect(Markup.equals(label1, label4)).toBe(false);
  });
});

describe('Markup.isAt', () => {
  test('should return true for point markups at specified point', () => {
    const point = { x: 3, y: 4 };
    const circle = Markup.circle(point);
    const label = Markup.label(point, 'A');

    expect(Markup.isAt(circle, point)).toBe(true);
    expect(Markup.isAt(label, point)).toBe(true);
  });

  test('should return false for point markups at different point', () => {
    const circle = Markup.circle({ x: 3, y: 4 });
    const differentPoint = { x: 3, y: 5 };

    expect(Markup.isAt(circle, differentPoint)).toBe(false);
  });

  test('should return false for line markups', () => {
    const arrow = Markup.arrow({ x: 0, y: 0 }, { x: 1, y: 1 });
    const point = { x: 0, y: 0 };

    expect(Markup.isAt(arrow, point)).toBe(false);
  });
});

describe('Markup.connects', () => {
  test('should return true for line markups connecting specified points', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 3, y: 3 };
    const arrow = Markup.arrow(from, to);

    expect(Markup.connects(arrow, from, to)).toBe(true);
    expect(Markup.connects(arrow, to, from)).toBe(true); // Order should not matter
  });

  test('should return false for line markups not connecting specified points', () => {
    const arrow = Markup.arrow({ x: 0, y: 0 }, { x: 3, y: 3 });
    const otherPoint1 = { x: 1, y: 1 };
    const otherPoint2 = { x: 2, y: 2 };

    expect(Markup.connects(arrow, otherPoint1, otherPoint2)).toBe(false);
  });

  test('should return false for point markups', () => {
    const circle = Markup.circle({ x: 0, y: 0 });
    const point1 = { x: 0, y: 0 };
    const point2 = { x: 1, y: 1 };

    expect(Markup.connects(circle, point1, point2)).toBe(false);
  });
});

describe('Markup.conflicts', () => {
  test('should return true for point markups at same location', () => {
    const point = { x: 3, y: 3 };
    const circle = Markup.circle(point);
    const square = Markup.square(point);

    expect(Markup.conflicts(circle, square)).toBe(true);
  });

  test('should return false for point markups at different locations', () => {
    const circle = Markup.circle({ x: 3, y: 3 });
    const square = Markup.square({ x: 3, y: 4 });

    expect(Markup.conflicts(circle, square)).toBe(false);
  });

  test('should return true for line markups connecting same points', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 1, y: 1 };
    const arrow = Markup.arrow(from, to);
    const line = Markup.line(from, to);

    expect(Markup.conflicts(arrow, line)).toBe(true);
  });

  test('should return false for line markups connecting different points', () => {
    const arrow = Markup.arrow({ x: 0, y: 0 }, { x: 1, y: 1 });
    const line = Markup.line({ x: 0, y: 0 }, { x: 2, y: 2 });

    expect(Markup.conflicts(arrow, line)).toBe(false);
  });

  test('should return false for point and line markups', () => {
    const circle = Markup.circle({ x: 0, y: 0 });
    const arrow = Markup.arrow({ x: 0, y: 0 }, { x: 1, y: 1 });

    expect(Markup.conflicts(circle, arrow)).toBe(false);
  });
});

describe('Markup type guards', () => {
  test('isPointMarkup should identify point markups correctly', () => {
    const circle = Markup.circle({ x: 0, y: 0 });
    const label = Markup.label({ x: 0, y: 0 }, 'A');
    const arrow = Markup.arrow({ x: 0, y: 0 }, { x: 1, y: 1 });

    expect(Markup.isPointMarkup(circle)).toBe(true);
    expect(Markup.isPointMarkup(label)).toBe(true);
    expect(Markup.isPointMarkup(arrow)).toBe(false);
  });

  test('isLineMarkup should identify line markups correctly', () => {
    const arrow = Markup.arrow({ x: 0, y: 0 }, { x: 1, y: 1 });
    const line = Markup.line({ x: 0, y: 0 }, { x: 1, y: 1 });
    const circle = Markup.circle({ x: 0, y: 0 });

    expect(Markup.isLineMarkup(arrow)).toBe(true);
    expect(Markup.isLineMarkup(line)).toBe(true);
    expect(Markup.isLineMarkup(circle)).toBe(false);
  });

  test('isLabelMarkup should identify label markups correctly', () => {
    const label = Markup.label({ x: 0, y: 0 }, 'A');
    const circle = Markup.circle({ x: 0, y: 0 });
    const arrow = Markup.arrow({ x: 0, y: 0 }, { x: 1, y: 1 });

    expect(Markup.isLabelMarkup(label)).toBe(true);
    expect(Markup.isLabelMarkup(circle)).toBe(false);
    expect(Markup.isLabelMarkup(arrow)).toBe(false);
  });
});

describe('withMarkup helper functions', () => {
  interface TestEntity {
    id: number;
    markup?: ReadonlyArray<Markup>;
  }

  const testEntity: TestEntity = { id: 1 };
  const markupHelpers = withMarkup<TestEntity>();

  describe('addMarkup', () => {
    test('should add markup to entity without existing markup', () => {
      const circle = Markup.circle({ x: 0, y: 0 });
      const result = markupHelpers.addMarkup(testEntity, circle);

      expect(result).toEqual({
        id: 1,
        markup: [circle],
      });
      expect(result).not.toBe(testEntity); // Should be a new object
    });

    test('should add markup to entity with existing markup', () => {
      const circle = Markup.circle({ x: 0, y: 0 });
      const square = Markup.square({ x: 1, y: 1 });
      const entityWithMarkup = { id: 1, markup: [circle] };

      const result = markupHelpers.addMarkup(entityWithMarkup, square);

      expect(result).toEqual({
        id: 1,
        markup: [circle, square],
      });
    });

    test('should replace conflicting markup', () => {
      const circle = Markup.circle({ x: 0, y: 0 });
      const square = Markup.square({ x: 0, y: 0 }); // Same position
      const entityWithMarkup = { id: 1, markup: [circle] };

      const result = markupHelpers.addMarkup(entityWithMarkup, square);

      expect(result).toEqual({
        id: 1,
        markup: [square],
      });
    });

    test('should add multiple markups at once', () => {
      const circle = Markup.circle({ x: 0, y: 0 });
      const square = Markup.square({ x: 1, y: 1 });
      const markups = [circle, square];

      const result = markupHelpers.addMarkup(testEntity, markups);

      expect(result).toEqual({
        id: 1,
        markup: [circle, square],
      });
    });

    test('should work with curried version', () => {
      const circle = Markup.circle({ x: 0, y: 0 });
      const addCircle = markupHelpers.addMarkup(circle);
      const result = addCircle(testEntity);

      expect(result).toEqual({
        id: 1,
        markup: [circle],
      });
    });
  });

  describe('containsMarkup', () => {
    test('should return true when markup exists', () => {
      const circle = Markup.circle({ x: 0, y: 0 });
      const entityWithMarkup = { id: 1, markup: [circle] };

      expect(markupHelpers.containsMarkup(entityWithMarkup, circle)).toBe(true);
    });

    test('should return false when markup does not exist', () => {
      const circle = Markup.circle({ x: 0, y: 0 });
      const square = Markup.square({ x: 1, y: 1 });
      const entityWithMarkup = { id: 1, markup: [circle] };

      expect(markupHelpers.containsMarkup(entityWithMarkup, square)).toBe(false);
    });

    test('should return false when entity has no markup', () => {
      const circle = Markup.circle({ x: 0, y: 0 });

      expect(markupHelpers.containsMarkup(testEntity, circle)).toBe(false);
    });
  });

  describe('removeMarkup', () => {
    test('should remove specific markup', () => {
      const circle = Markup.circle({ x: 0, y: 0 });
      const square = Markup.square({ x: 1, y: 1 });
      const entityWithMarkup = { id: 1, markup: [circle, square] };

      const result = markupHelpers.removeMarkup(entityWithMarkup, circle);

      expect(result).toEqual({
        id: 1,
        markup: [square],
      });
    });

    test('should remove multiple markups at once', () => {
      const circle = Markup.circle({ x: 0, y: 0 });
      const square = Markup.square({ x: 1, y: 1 });
      const triangle = Markup.triangle({ x: 2, y: 2 });
      const entityWithMarkup = { id: 1, markup: [circle, square, triangle] };

      const result = markupHelpers.removeMarkup(entityWithMarkup, [circle, triangle]);

      expect(result).toEqual({
        id: 1,
        markup: [square],
      });
    });

    test('should handle removing non-existent markup', () => {
      const circle = Markup.circle({ x: 0, y: 0 });
      const square = Markup.square({ x: 1, y: 1 });
      const entityWithMarkup = { id: 1, markup: [circle] };

      const result = markupHelpers.removeMarkup(entityWithMarkup, square);

      expect(result).toEqual({
        id: 1,
        markup: [circle],
      });
    });
  });
});

describe('Type definitions', () => {
  test('PointMarkup should accept valid point markup types', () => {
    const circle: PointMarkup = {
      type: MarkupType.Circle,
      at: { x: 0, y: 0 },
    };

    expect(circle.type).toBe(MarkupType.Circle);
    expect(circle.at).toEqual({ x: 0, y: 0 });
  });

  test('LineMarkup should accept valid line markup types', () => {
    const arrow: LineMarkup = {
      type: MarkupType.Arrow,
      from: { x: 0, y: 0 },
      to: { x: 1, y: 1 },
    };

    expect(arrow.type).toBe(MarkupType.Arrow);
    expect(arrow.from).toEqual({ x: 0, y: 0 });
    expect(arrow.to).toEqual({ x: 1, y: 1 });
  });

  test('LabelMarkup should accept valid label markup', () => {
    const label: LabelMarkup = {
      type: MarkupType.Label,
      at: { x: 0, y: 0 },
      text: 'A',
    };

    expect(label.type).toBe(MarkupType.Label);
    expect(label.at).toEqual({ x: 0, y: 0 });
    expect(label.text).toBe('A');
  });
});
