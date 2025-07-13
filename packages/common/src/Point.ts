/**
 * Represent field on the board. It is used for representing moves. It is immutable.
 */
export type Point = {
  /**
   * X coordinate of the point, on 19x19 go board x=0 corresponds to column A and x=18 to column T.
   */
  readonly x: number;
  /**
   * Y coordinate of the point, on 19x19 go board y=0 corresponds to row 19 and y=18 to row 1.
   */
  readonly y: number;
};

export const Point = {
  /**
   * Creates a new point with specified coordinates.
   */
  create(x: number, y: number): Point {
    return { x, y };
  },

  /**
   * Checks if two points are equal by comparing their coordinates.
   */
  equals: (a: Point, b: Point): boolean => {
    return a.x === b.x && a.y === b.y;
  },

  /**
   * Creates a new point from SGF representation of coordinates (two lowercase letters)
   */
  fromSGF: (sgfValue: string): Point => {
    if (!sgfValue || sgfValue.length !== 2) {
      throw new Error(`Invalid SGF point: "${sgfValue}". Expected two lowercase letters.`);
    }

    return {
      x: sgfValue.charCodeAt(0) - 97,
      y: sgfValue.charCodeAt(1) - 97,
    };
  },

  toSGF: (point: Point): string => {
    return String.fromCharCode(point.x + 97) + String.fromCharCode(point.y + 97);
  },
};
