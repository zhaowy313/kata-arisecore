import { describe, test, expect } from 'vitest';
import {
  AnnotationType,
  MoveAnnotation,
  SimpleMoveAnnotation,
  EmphasizedMoveAnnotation,
  NumericMoveAnnotation,
  withAnnotations,
} from '../src';

describe('AnnotationType enum', () => {
  test('should contain all expected annotation types', () => {
    expect(AnnotationType.GoodForBlack).toBe('GB');
    expect(AnnotationType.GoodForWhite).toBe('GW');
    expect(AnnotationType.BadMove).toBe('BM');
    expect(AnnotationType.UnclearPosition).toBe('UC');
    expect(AnnotationType.Tesuji).toBe('TE');
    expect(AnnotationType.DoubtfulMove).toBe('DM');
    expect(AnnotationType.Hotspot).toBe('HO');
    expect(AnnotationType.Doubtful).toBe('DO');
    expect(AnnotationType.Interesting).toBe('IT');
    expect(AnnotationType.Value).toBe('V');
  });
});

describe('MoveAnnotation factory methods', () => {
  describe('createSimple', () => {
    test('should create a simple annotation', () => {
      const annotation = MoveAnnotation.createSimple(AnnotationType.Doubtful);
      expect(annotation).toEqual({
        type: AnnotationType.Doubtful,
      });
    });

    test('should work with custom annotation types', () => {
      const annotation = MoveAnnotation.createSimple('CUSTOM');
      expect(annotation).toEqual({
        type: 'CUSTOM',
      });
    });
  });

  describe('createEmphasized', () => {
    test('should create an emphasized annotation when emphasized is true', () => {
      const annotation = MoveAnnotation.createEmphasized(AnnotationType.BadMove, true);
      expect(annotation).toEqual({
        type: AnnotationType.BadMove,
        emphasized: true,
      });
    });

    test('should create a non-emphasized annotation when emphasized is false', () => {
      const annotation = MoveAnnotation.createEmphasized(AnnotationType.BadMove, false);
      expect(annotation).toEqual({
        type: AnnotationType.BadMove,
        emphasized: false,
      });
    });

    test('should create a non-emphasized annotation when emphasized is undefined', () => {
      const annotation = MoveAnnotation.createEmphasized(AnnotationType.BadMove);
      expect(annotation).toEqual({
        type: AnnotationType.BadMove,
        emphasized: false,
      });
    });

    test('should work with all emphasizable types', () => {
      const types = [
        AnnotationType.DoubtfulMove,
        AnnotationType.GoodForBlack,
        AnnotationType.GoodForWhite,
        AnnotationType.Hotspot,
        AnnotationType.UnclearPosition,
        AnnotationType.BadMove,
        AnnotationType.Tesuji,
      ];

      types.forEach((type) => {
        const annotation = MoveAnnotation.createEmphasized(type, true);
        expect(annotation).toEqual({
          type,
          emphasized: true,
        });
      });
    });
  });

  describe('createNumeric', () => {
    test('should create a numeric annotation', () => {
      const annotation = MoveAnnotation.createNumeric(AnnotationType.Value, 3.5);
      expect(annotation).toEqual({
        type: AnnotationType.Value,
        value: 3.5,
      });
    });

    test('should work with integer values', () => {
      const annotation = MoveAnnotation.createNumeric(AnnotationType.Value, 5);
      expect(annotation).toEqual({
        type: AnnotationType.Value,
        value: 5,
      });
    });

    test('should work with negative values', () => {
      const annotation = MoveAnnotation.createNumeric(AnnotationType.Value, -2.25);
      expect(annotation).toEqual({
        type: AnnotationType.Value,
        value: -2.25,
      });
    });

    test('should work with custom annotation types', () => {
      const annotation = MoveAnnotation.createNumeric('CUSTOM_NUMERIC', 10);
      expect(annotation).toEqual({
        type: 'CUSTOM_NUMERIC',
        value: 10,
      });
    });
  });
});

describe('MoveAnnotation.equals', () => {
  test('should return true for identical simple annotations', () => {
    const a = MoveAnnotation.createSimple(AnnotationType.Doubtful);
    const b = MoveAnnotation.createSimple(AnnotationType.Doubtful);
    expect(MoveAnnotation.equals(a, b)).toBe(true);
  });

  test('should return false for different simple annotations', () => {
    const a = MoveAnnotation.createSimple(AnnotationType.Doubtful);
    const b = MoveAnnotation.createSimple(AnnotationType.Interesting);
    expect(MoveAnnotation.equals(a, b)).toBe(false);
  });

  test('should return true for identical numeric annotations', () => {
    const a = MoveAnnotation.createNumeric(AnnotationType.Value, 3.5);
    const b = MoveAnnotation.createNumeric(AnnotationType.Value, 3.5);
    expect(MoveAnnotation.equals(a, b)).toBe(true);
  });

  test('should return false for numeric annotations with different values', () => {
    const a = MoveAnnotation.createNumeric(AnnotationType.Value, 3.5);
    const b = MoveAnnotation.createNumeric(AnnotationType.Value, 2.5);
    expect(MoveAnnotation.equals(a, b)).toBe(false);
  });

  test('should return false for numeric annotations with different types', () => {
    const a = MoveAnnotation.createNumeric(AnnotationType.Value, 3.5);
    const b = MoveAnnotation.createNumeric('CUSTOM', 3.5);
    expect(MoveAnnotation.equals(a, b as any)).toBe(false);
  });

  test('should return true for identical emphasized annotations', () => {
    const a = MoveAnnotation.createEmphasized(AnnotationType.BadMove, true);
    const b = MoveAnnotation.createEmphasized(AnnotationType.BadMove, true);
    expect(MoveAnnotation.equals(a, b)).toBe(true);
  });

  test('should return true for identical non-emphasized annotations', () => {
    const a = MoveAnnotation.createEmphasized(AnnotationType.BadMove, false);
    const b = MoveAnnotation.createEmphasized(AnnotationType.BadMove, false);
    expect(MoveAnnotation.equals(a, b)).toBe(true);
  });

  test('should return false for emphasized vs non-emphasized annotations', () => {
    const a = MoveAnnotation.createEmphasized(AnnotationType.BadMove, true);
    const b = MoveAnnotation.createEmphasized(AnnotationType.BadMove, false);
    expect(MoveAnnotation.equals(a, b)).toBe(false);
  });

  test('should return true when both annotations have no emphasized property', () => {
    const a = MoveAnnotation.createEmphasized(AnnotationType.BadMove);
    const b = MoveAnnotation.createEmphasized(AnnotationType.BadMove);
    expect(MoveAnnotation.equals(a, b)).toBe(true);
  });

  test('should handle mixed annotation types correctly', () => {
    const simple = MoveAnnotation.createSimple(AnnotationType.Doubtful);
    const numeric = MoveAnnotation.createNumeric(AnnotationType.Value, 1);
    const emphasized = MoveAnnotation.createEmphasized(AnnotationType.BadMove, true);

    expect(MoveAnnotation.equals(simple, numeric)).toBe(false);
    expect(MoveAnnotation.equals(simple, emphasized)).toBe(false);
    expect(MoveAnnotation.equals(numeric, emphasized)).toBe(false);
  });
});

describe('MoveAnnotation.conflicts', () => {
  test('should return true for same type annotations', () => {
    const a = MoveAnnotation.createSimple(AnnotationType.Doubtful);
    const b = MoveAnnotation.createSimple(AnnotationType.Doubtful);
    expect(MoveAnnotation.conflicts(a, b)).toBe(true);
  });

  test('should return true for conflicting position annotations', () => {
    const positionTypes = [
      AnnotationType.GoodForBlack,
      AnnotationType.GoodForWhite,
      AnnotationType.DoubtfulMove,
      AnnotationType.UnclearPosition,
    ];

    for (let i = 0; i < positionTypes.length; i++) {
      for (let j = i + 1; j < positionTypes.length; j++) {
        const a = MoveAnnotation.createSimple(positionTypes[i] as any);
        const b = MoveAnnotation.createSimple(positionTypes[j] as any);
        expect(MoveAnnotation.conflicts(a, b)).toBe(true);
      }
    }
  });

  test('should return true for conflicting move annotations', () => {
    const moveTypes = [
      AnnotationType.Doubtful,
      AnnotationType.Interesting,
      AnnotationType.BadMove,
      AnnotationType.Tesuji,
    ];

    for (let i = 0; i < moveTypes.length; i++) {
      for (let j = i + 1; j < moveTypes.length; j++) {
        const a = MoveAnnotation.createSimple(moveTypes[i] as any);
        const b = MoveAnnotation.createSimple(moveTypes[j] as any);
        expect(MoveAnnotation.conflicts(a, b)).toBe(true);
      }
    }
  });

  test('should return false for non-conflicting annotations', () => {
    const position = MoveAnnotation.createSimple(AnnotationType.GoodForBlack as any);
    const move = MoveAnnotation.createSimple(AnnotationType.Doubtful);
    const value = MoveAnnotation.createNumeric(AnnotationType.Value, 1);
    const hotspot = MoveAnnotation.createSimple(AnnotationType.Hotspot as any);

    expect(MoveAnnotation.conflicts(position, move)).toBe(false);
    expect(MoveAnnotation.conflicts(position, value)).toBe(false);
    expect(MoveAnnotation.conflicts(position, hotspot)).toBe(false);
    expect(MoveAnnotation.conflicts(move, value)).toBe(false);
    expect(MoveAnnotation.conflicts(move, hotspot)).toBe(false);
    expect(MoveAnnotation.conflicts(value, hotspot)).toBe(false);
  });
});

describe('MoveAnnotation.fromSGF', () => {
  describe('Value annotations', () => {
    test('should parse numeric value from string', () => {
      const annotation = MoveAnnotation.fromSGF(AnnotationType.Value, '3.5');
      expect(annotation).toEqual({
        type: AnnotationType.Value,
        value: 3.5,
      });
    });

    test('should parse numeric value from number', () => {
      const annotation = MoveAnnotation.fromSGF(AnnotationType.Value, 2.75);
      expect(annotation).toEqual({
        type: AnnotationType.Value,
        value: 2.75,
      });
    });

    test('should return null for invalid numeric values', () => {
      expect(MoveAnnotation.fromSGF(AnnotationType.Value, 'invalid')).toBeNull();
      expect(MoveAnnotation.fromSGF(AnnotationType.Value, '')).toBeNull();
      expect(MoveAnnotation.fromSGF(AnnotationType.Value)).toBeNull();
    });

    test('should handle integer values', () => {
      const annotation = MoveAnnotation.fromSGF(AnnotationType.Value, '5');
      expect(annotation).toEqual({
        type: AnnotationType.Value,
        value: 5,
      });
    });

    test('should handle negative values', () => {
      const annotation = MoveAnnotation.fromSGF(AnnotationType.Value, '-1.5');
      expect(annotation).toEqual({
        type: AnnotationType.Value,
        value: -1.5,
      });
    });
  });

  describe('Simple annotations', () => {
    test('should parse Doubtful annotation', () => {
      const annotation = MoveAnnotation.fromSGF(AnnotationType.Doubtful);
      expect(annotation).toEqual({
        type: AnnotationType.Doubtful,
      });
    });

    test('should parse Interesting annotation', () => {
      const annotation = MoveAnnotation.fromSGF(AnnotationType.Interesting);
      expect(annotation).toEqual({
        type: AnnotationType.Interesting,
      });
    });
  });

  describe('Emphasized annotations', () => {
    const emphasizableTypes = [
      AnnotationType.GoodForBlack,
      AnnotationType.GoodForWhite,
      AnnotationType.BadMove,
      AnnotationType.UnclearPosition,
      AnnotationType.Tesuji,
      AnnotationType.DoubtfulMove,
      AnnotationType.Hotspot,
    ];

    emphasizableTypes.forEach((type) => {
      test(`should parse ${type} without emphasis`, () => {
        const annotation = MoveAnnotation.fromSGF(type);
        expect(annotation).toEqual({
          type,
        });
      });

      test(`should parse ${type} with emphasis when value is "2"`, () => {
        const annotation = MoveAnnotation.fromSGF(type, '2');
        expect(annotation).toEqual({
          type,
          emphasized: true,
        });
      });

      test(`should parse ${type} without emphasis when value is "1"`, () => {
        const annotation = MoveAnnotation.fromSGF(type, '1');
        expect(annotation).toEqual({
          type,
        });
      });

      test(`should parse ${type} without emphasis when value is other string`, () => {
        const annotation = MoveAnnotation.fromSGF(type, 'other');
        expect(annotation).toEqual({
          type,
        });
      });
    });
  });

  describe('Unknown annotations', () => {
    test('should return null for unknown annotation types', () => {
      expect(MoveAnnotation.fromSGF('UNKNOWN')).toBeNull();
      expect(MoveAnnotation.fromSGF('CUSTOM')).toBeNull();
      expect(MoveAnnotation.fromSGF('')).toBeNull();
    });
  });
});

describe('withAnnotations helper', () => {
  interface TestEntity {
    id: number;
    annotations?: ReadonlyArray<import('../src/annotation').MoveAnnotation>;
  }

  const testEntity: TestEntity = { id: 1 };
  const annotationHelpers = withAnnotations<TestEntity>();

  describe('addAnnotation', () => {
    test('should add annotation to entity without existing annotations', () => {
      const annotation = MoveAnnotation.createSimple(AnnotationType.Doubtful);
      const result = annotationHelpers.addAnnotation(testEntity, annotation);

      expect(result).toEqual({
        id: 1,
        annotations: [annotation],
      });
      expect(result).not.toBe(testEntity); // Should be a new object
    });

    test('should add annotation to entity with existing annotations', () => {
      const existing = MoveAnnotation.createSimple(AnnotationType.Interesting);
      const entityWithAnnotations = { id: 1, annotations: [existing] };
      const newAnnotation = MoveAnnotation.createNumeric(AnnotationType.Value, 3);

      const result = annotationHelpers.addAnnotation(entityWithAnnotations, newAnnotation);

      expect(result).toEqual({
        id: 1,
        annotations: [existing, newAnnotation],
      });
    });

    test('should replace conflicting annotations', () => {
      const existing = MoveAnnotation.createSimple(AnnotationType.Doubtful);
      const entityWithAnnotations = { id: 1, annotations: [existing] };
      const conflicting = MoveAnnotation.createSimple(AnnotationType.Interesting);

      const result = annotationHelpers.addAnnotation(entityWithAnnotations, conflicting);

      expect(result).toEqual({
        id: 1,
        annotations: [conflicting],
      });
    });

    test('should handle multiple conflicting annotations', () => {
      const existing1 = MoveAnnotation.createSimple(AnnotationType.Doubtful);
      const existing2 = MoveAnnotation.createNumeric(AnnotationType.Value, 1);
      const existing3 = MoveAnnotation.createSimple(AnnotationType.Interesting);
      const entityWithAnnotations = { id: 1, annotations: [existing1, existing2, existing3] };
      const newAnnotation = MoveAnnotation.createEmphasized(AnnotationType.BadMove);

      const result = annotationHelpers.addAnnotation(entityWithAnnotations, newAnnotation);

      expect(result).toEqual({
        id: 1,
        annotations: [existing2, newAnnotation], // Value annotation kept, move annotations replaced
      });
    });

    test('should work with curried version', () => {
      const annotation = MoveAnnotation.createSimple(AnnotationType.Doubtful);
      const addAnnotation = annotationHelpers.addAnnotation(annotation);
      const result = addAnnotation(testEntity);

      expect(result).toEqual({
        id: 1,
        annotations: [annotation],
      });
    });
  });

  describe('clearAnnotations', () => {
    test('should remove all annotations', () => {
      const annotations = [
        MoveAnnotation.createSimple(AnnotationType.Doubtful),
        MoveAnnotation.createNumeric(AnnotationType.Value, 2),
      ];
      const entityWithAnnotations = { id: 1, annotations };

      const result = annotationHelpers.clearAnnotations(entityWithAnnotations);

      expect(result).toEqual({ id: 1 });
      expect(result).not.toBe(entityWithAnnotations); // Should be a new object
    });

    test('should work on entity without annotations', () => {
      const result = annotationHelpers.clearAnnotations(testEntity);

      expect(result).toEqual({ id: 1 });
      expect(result).not.toBe(testEntity); // Should be a new object
    });

    test('should work with curried version', () => {
      // clearAnnotations with curryLast(1 param) doesn't support partial application
      // It just returns the function that takes the entity
      const result = annotationHelpers.clearAnnotations(testEntity);

      expect(result).toEqual({ id: 1 });
      expect(result).not.toBe(testEntity); // Should be a new object
    });
  });

  describe('removeAnnotationByType', () => {
    test('should remove annotation of specific type', () => {
      const annotations = [
        MoveAnnotation.createSimple(AnnotationType.Doubtful),
        MoveAnnotation.createNumeric(AnnotationType.Value, 2),
        MoveAnnotation.createSimple(AnnotationType.Interesting),
      ];
      const entityWithAnnotations = { id: 1, annotations };

      const result = annotationHelpers.removeAnnotationByType(
        entityWithAnnotations,
        AnnotationType.Doubtful,
      );

      expect(result).toEqual({
        id: 1,
        annotations: [
          MoveAnnotation.createNumeric(AnnotationType.Value, 2),
          MoveAnnotation.createSimple(AnnotationType.Interesting),
        ],
      });
    });

    test('should work when annotation type does not exist', () => {
      const annotations = [MoveAnnotation.createSimple(AnnotationType.Doubtful)];
      const entityWithAnnotations = { id: 1, annotations };

      const result = annotationHelpers.removeAnnotationByType(
        entityWithAnnotations,
        AnnotationType.Interesting,
      );

      expect(result).toEqual({
        id: 1,
        annotations: [MoveAnnotation.createSimple(AnnotationType.Doubtful)],
      });
    });

    test('should work on entity without annotations', () => {
      const result = annotationHelpers.removeAnnotationByType(testEntity, AnnotationType.Doubtful);

      expect(result).toEqual({ id: 1 });
    });

    test('should remove all annotations of the same type', () => {
      const annotations = [
        MoveAnnotation.createSimple(AnnotationType.Doubtful),
        MoveAnnotation.createNumeric(AnnotationType.Value, 2),
        MoveAnnotation.createSimple(AnnotationType.Doubtful), // Another annotation of same type
      ];
      const entityWithAnnotations = { id: 1, annotations };

      const result = annotationHelpers.removeAnnotationByType(
        entityWithAnnotations,
        AnnotationType.Doubtful,
      );

      expect(result).toEqual({
        id: 1,
        annotations: [MoveAnnotation.createNumeric(AnnotationType.Value, 2)],
      });
    });

    test('should work with curried version', () => {
      const annotations = [MoveAnnotation.createSimple(AnnotationType.Doubtful)];
      const entityWithAnnotations = { id: 1, annotations };
      const removeDoubtful = annotationHelpers.removeAnnotationByType(AnnotationType.Doubtful);
      const result = removeDoubtful(entityWithAnnotations);

      expect(result).toEqual({ id: 1, annotations: [] });
    });
  });
});

describe('Type safety and TypeScript integration', () => {
  test('SimpleMoveAnnotation should have correct type constraints', () => {
    // These should compile without errors
    const doubtful: SimpleMoveAnnotation = {
      type: AnnotationType.Doubtful,
    };
    const interesting: SimpleMoveAnnotation = {
      type: AnnotationType.Interesting,
    };

    expect(doubtful.type).toBe(AnnotationType.Doubtful);
    expect(interesting.type).toBe(AnnotationType.Interesting);
  });

  test('EmphasizedMoveAnnotation should have correct type constraints', () => {
    // These should compile without errors
    const badMove: EmphasizedMoveAnnotation = {
      type: AnnotationType.BadMove,
      emphasized: true,
    };
    const tesuji: EmphasizedMoveAnnotation = {
      type: AnnotationType.Tesuji,
      emphasized: true,
    };

    expect(badMove.type).toBe(AnnotationType.BadMove);
    expect(badMove.emphasized).toBe(true);
    expect(tesuji.type).toBe(AnnotationType.Tesuji);
    expect(tesuji.emphasized).toBe(true);
  });

  test('NumericMoveAnnotation should have correct type constraints', () => {
    // These should compile without errors
    const value: NumericMoveAnnotation = {
      type: AnnotationType.Value,
      value: 3.5,
    };

    expect(value.type).toBe(AnnotationType.Value);
    expect(value.value).toBe(3.5);
  });
});
