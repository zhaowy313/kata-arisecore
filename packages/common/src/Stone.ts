import { Color } from './Color';
import { Point } from './Point';

/**
 * Represents a stone on the board. It consists of coordinates and it can be black or white.
 */
export type Stone = Point & {
  readonly color: typeof Color.Black | typeof Color.White;
};

export const Stone = {
  /**
   * Creates a new stone with specified coordinates and color.
   */
  create(x: number, y: number, color: typeof Color.Black | typeof Color.White): Stone {
    return { x, y, color };
  },

  /**
   * Creates a new stone from a Point object and a color.
   */
  fromPoint(point: Point, color: typeof Color.Black | typeof Color.White): Stone {
    return { ...point, color };
  },

  /**
   * Checks if two stones are equal by comparing their coordinates and color.
   */
  equals: (a: Stone, b: Stone): boolean => {
    return a.x === b.x && a.y === b.y && a.color === b.color;
  },

  /**
   * Checks if a stone is at a specific point.
   */
  isAt: (field: Stone, point: Point): boolean => {
    return field.x === point.x && field.y === point.y;
  },
};
