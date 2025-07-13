import { curryLast, Writable } from '@wgojs/common';
import { SGFProperties, StandardSGFProperties } from '@wgojs/sgf';

export enum AnnotationType {
  /** Good for Black */
  GoodForBlack = 'GB',
  /** Good for White */
  GoodForWhite = 'GW',
  /** Bad move */
  BadMove = 'BM',
  /** Unclear position */
  UnclearPosition = 'UC',
  /** Tesuji (good move) */
  Tesuji = 'TE',
  /** Doubtful move */
  DoubtfulMove = 'DM',
  /** Hotspot */
  Hotspot = 'HO',
  /** Doubtful */
  Doubtful = 'DO',
  /** Interesting */
  Interesting = 'IT',
  /** Value */
  Value = 'V',
}

export type SimpleMoveAnnotation<
  T extends string = AnnotationType.Doubtful | AnnotationType.Interesting,
> = {
  readonly type: T;
};

export type EmphasizedMoveAnnotation<
  T extends string =
    | AnnotationType.DoubtfulMove
    | AnnotationType.GoodForBlack
    | AnnotationType.GoodForWhite
    | AnnotationType.Hotspot
    | AnnotationType.UnclearPosition
    | AnnotationType.BadMove
    | AnnotationType.Tesuji,
> = {
  readonly type: T;
  readonly emphasized: boolean;
};

export type NumericMoveAnnotation<T extends string = AnnotationType.Value> = {
  readonly type: T;
  readonly value: number;
};

export interface CustomMoveAnnotationMap {}

export type MoveAnnotation =
  | SimpleMoveAnnotation
  | EmphasizedMoveAnnotation
  | NumericMoveAnnotation
  | CustomMoveAnnotationMap[keyof CustomMoveAnnotationMap];

export interface WithAnnotations {
  /**
   * Annotations for the move or position. These are used to mark the move with special properties, like "good move", "blunder", etc.
   * See {@link MoveAnnotation} for more details.
   */
  readonly annotations?: ReadonlyArray<MoveAnnotation>;
}

export const MoveAnnotation = {
  /**
   * Creates a simple symbolic annotation.
   */
  createSimple<T extends string>(type: T): SimpleMoveAnnotation<T> {
    return { type };
  },

  /**
   * Creates an emphasized move annotation.
   */
  createEmphasized<T extends string>(type: T, emphasized = false): EmphasizedMoveAnnotation<T> {
    return { type, emphasized };
  },

  /**
   * Creates a numeric annotation.
   */
  createNumeric<T extends string>(type: T, value: number): NumericMoveAnnotation<T> {
    return { type, value };
  },

  /**
   * Compares two annotations for equality.
   */
  equals: (a: MoveAnnotation, b: MoveAnnotation): boolean => {
    if (a.type !== b.type) {
      return false;
    }

    if ('value' in a) {
      return a.value === (b as any).value;
    }

    if ('emphasized' in a) {
      return a.emphasized === (b as any).emphasized;
    }

    return true;
  },

  conflicts: (a: MoveAnnotation, b: MoveAnnotation): boolean => {
    if (a.type === b.type) {
      return true; // Same type = conflict
    }

    if (positionAnnotations.includes(a.type) && positionAnnotations.includes(b.type)) {
      return true; // Both are position annotations
    }

    if (moveAnnotations.includes(a.type) && moveAnnotations.includes(b.type)) {
      return true; // Both are move annotations
    }

    return false; // No conflict
  },

  // TODO: think about name
  fromSGF(prop: string, value?: string | number): MoveAnnotation | null {
    if (prop === AnnotationType.Value) {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return num == null || isNaN(num) ? null : { type: AnnotationType.Value, value: num };
    }

    if (prop === AnnotationType.Doubtful || prop === AnnotationType.Interesting) {
      return { type: prop as any };
    }

    if (
      [
        AnnotationType.GoodForBlack,
        AnnotationType.GoodForWhite,
        AnnotationType.BadMove,
        AnnotationType.UnclearPosition,
        AnnotationType.Tesuji,
        AnnotationType.DoubtfulMove,
        AnnotationType.Hotspot,
      ].includes(prop as AnnotationType)
    ) {
      if (value === '2') {
        return {
          type: prop as any,
          emphasized: true,
        };
      }
      return {
        type: prop as any,
      };
    }

    return null; // TODO: should be fallback for custom, or exception?
  },
};

const positionAnnotations = [
  AnnotationType.GoodForBlack,
  AnnotationType.GoodForWhite,
  AnnotationType.DoubtfulMove,
  AnnotationType.UnclearPosition,
];

const moveAnnotations = [
  AnnotationType.Doubtful,
  AnnotationType.Interesting,
  AnnotationType.BadMove,
  AnnotationType.Tesuji,
];

export function withAnnotations<T extends WithAnnotations>() {
  return {
    addAnnotation: curryLast((entity: T, annotation: MoveAnnotation): T => {
      const newEntity = { ...entity } as Writable<WithAnnotations>;
      if (!newEntity.annotations) {
        newEntity.annotations = [];
      }
      // filter out existing annotations of the same type
      newEntity.annotations = newEntity.annotations!.filter(
        (a) => !MoveAnnotation.conflicts(a, annotation),
      );
      // add the new annotation
      newEntity.annotations.push(annotation);
      return newEntity as T;
    }),
    clearAnnotations: curryLast((entity: T): T => {
      const newEntity = { ...entity } as Writable<WithAnnotations>;
      delete newEntity.annotations;
      return newEntity as T;
    }),
    removeAnnotationByType: curryLast((entity: T, type: string): T => {
      const newEntity = { ...entity } as Writable<WithAnnotations>;
      if (newEntity.annotations) {
        newEntity.annotations = newEntity.annotations.filter((a) => a.type !== type);
      }
      return newEntity as T;
    }),
  };
}

withAnnotations.toSGFProperties = function <T extends WithAnnotations>(
  entity: T,
): StandardSGFProperties & SGFProperties {
  const properties: StandardSGFProperties & SGFProperties = {};
  if (entity.annotations) {
    entity.annotations.forEach((annotation) => {
      if ('value' in annotation) {
        properties[annotation.type] = annotation.value;
      } else if ('emphasized' in annotation) {
        properties[annotation.type] = annotation.emphasized ? '2' : '1';
      } else {
        properties[annotation.type] = '';
      }
    });
  }
  return properties;
};
