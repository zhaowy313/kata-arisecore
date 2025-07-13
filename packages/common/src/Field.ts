import { Color } from './Color';
import { Point } from './Point';

/**
 * Represents one field on the board. It consists from coordinates and color.
 */
export type Field = Point & {
  readonly color: Color;
};

export const Field = {
  /**
   * Creates a new field with specified coordinates and color.
   * If color is not provided, it defaults to Color.Empty.
   */
  create(x: number, y: number, color?: Color): Field {
    return { x, y, color: color ?? Color.Empty };
  },

  /**
   * Creates a new field from a Point object and an optional color.
   * If color is not provided, it defaults to Color.Empty.
   */
  fromPoint(point: Point, color?: Color): Field {
    return { ...point, color: color ?? Color.Empty };
  },

  /**
   * Checks if two fields are equal by comparing their coordinates and color.
   * Returns true if both fields have the same x, y, and color values.
   */
  equals: (a: Field, b: Field): boolean => {
    return a.x === b.x && a.y === b.y && a.color === b.color;
  },

  /**
   * Checks if a field is at a specific point.
   */
  isAt: (field: Field, point: Point): boolean => {
    return field.x === point.x && field.y === point.y;
  },
};
