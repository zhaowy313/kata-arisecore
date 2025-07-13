import { curryLast, Point } from '@wgojs/common';
import { StandardSGFProperties, SGFProperties } from '@wgojs/sgf';

export enum MarkupType {
  Arrow = 'AR',
  Circle = 'CR',
  Label = 'LB',
  Line = 'LN',
  XMark = 'MA',
  Selected = 'SL',
  Square = 'SQ',
  Triangle = 'TR',
}

export type PointMarkup<
  T extends string =
    | MarkupType.Circle
    | MarkupType.Selected
    | MarkupType.Square
    | MarkupType.Triangle
    | MarkupType.XMark,
> = {
  readonly type: T;
  readonly at: Point;
};

export type LineMarkup<T extends string = MarkupType.Arrow | MarkupType.Line> = {
  readonly type: T;
  readonly from: Point;
  readonly to: Point;
};

export type LabelMarkup<T extends string = MarkupType.Label> = PointMarkup<T> & {
  readonly text: string;
};

export interface CustomMarkupMap {}

export type Markup =
  | PointMarkup
  | LineMarkup
  | LabelMarkup
  | CustomMarkupMap[keyof CustomMarkupMap];

export interface WithMarkup {
  readonly markup?: ReadonlyArray<Markup>;
}

export const Markup = {
  /**
   * Creates a markup object of point type - markup on specified coordinates.
   */
  createPoint<T extends string>(type: T, at: Point): PointMarkup<T> {
    return { type, at };
  },

  /**
   * Creates a markup object of line type - markup from one point to another.
   */
  createLine<T extends string>(type: T, from: Point, to: Point): LineMarkup<T> {
    return { type, from, to };
  },

  /**
   * Creates a markup object of label type - markup at specified point with text.
   * This is useful for adding labels to the board, such as move numbers or comments.
   */
  createLabel<T extends string>(type: T, at: Point, text: string): LabelMarkup<T> {
    return { type, at, text };
  },

  /**
   * Creates a circle markup at specified point.
   * This is a shorthand for `Markup.create(MarkupType.Circle, point)`.
   *
   * @param at Point where to create the circle markup.
   * @returns Created circle markup object.
   */
  circle(at: Point): PointMarkup {
    return { type: MarkupType.Circle, at };
  },

  /**
   * Creates a selected markup at specified point.
   * This is a shorthand for `Markup.create(MarkupType.Selected, point)`.
   *
   * @param at Point where to create the selected markup.
   * @returns Created selected markup object.
   */
  selected(at: Point): PointMarkup {
    return { type: MarkupType.Selected, at };
  },

  /**
   * Creates a square markup at specified point.
   * This is a shorthand for `Markup.create(MarkupType.Square, point)`.
   *
   * @param at Point where to create the square markup.
   * @returns Created square markup object.
   */
  square(at: Point): PointMarkup {
    return { type: MarkupType.Square, at };
  },

  /**
   * Creates a triangle markup at specified point.
   * This is a shorthand for `Markup.create(MarkupType.Triangle, point)`.
   *
   * @param at Point where to create the triangle markup.
   * @returns Created triangle markup object.
   */
  triangle(at: Point): PointMarkup {
    return { type: MarkupType.Triangle, at };
  },

  /**
   * Creates an X mark markup at specified point.
   * This is a shorthand for `Markup.create(MarkupType.XMark, point)`.
   *
   * @param at Point where to create the X mark markup.
   * @returns Created X mark markup object.
   */
  xMark(at: Point): PointMarkup {
    return { type: MarkupType.XMark, at };
  },

  /**
   * Creates an arrow markup from one point to another.
   * This is a shorthand for `Markup.create(MarkupType.Arrow, from, to)`.
   *
   * @param from Starting point of the arrow.
   * @param to Ending point of the arrow.
   * @returns Created arrow markup object.
   */
  arrow(from: Point, to: Point): LineMarkup {
    return { type: MarkupType.Arrow, from, to };
  },

  /**
   * Creates a line markup from one point to another.
   * This is a shorthand for `Markup.create(MarkupType.Line, from, to)`.
   *
   * @param from Starting point of the line.
   * @param to Ending point of the line.
   * @returns Created line markup object.
   */
  line(from: Point, to: Point): LineMarkup {
    return { type: MarkupType.Line, from, to };
  },

  /**
   * Creates a label markup at specified point with given text.
   * This is a shorthand for `Markup.create(MarkupType.Label, point, text)`.
   *
   * @param at Point where to create the label markup.
   * @param text Text to display in the label.
   * @returns Created label markup object.
   */
  label(at: Point, text: string): LabelMarkup {
    return { type: MarkupType.Label, at, text };
  },

  /**
   * Converts SGF property arguments to markup objects. It is expected that type is one
   * of keys od SGF standard properties and arg its value.
   *
   * @param type Markup type, for example `CR`, it will be used as markup type.
   * @param arg Array of arguments - this may be Point object for classic point markups, or an array of two Points for line markups
   * or an array of Point and string for label markups.
   * @returns Array of created markup objects.
   */
  fromSGFProperty<T extends string>(
    type: T,
    arg: Array<Point | [Point, Point] | [Point, string]>,
  ): Markup[] {
    return arg.map((item) => {
      if (Array.isArray(item)) {
        if (typeof item[1] === 'string') {
          // This is a label markup
          return Markup.createLabel(type, item[0], item[1]) as Markup;
        } else if (
          item[0]?.x != null &&
          item[0]?.y != null &&
          item[1]?.x != null &&
          item[1]?.y != null
        ) {
          // This is a line markup
          return Markup.createLine(type, item[0], item[1]) as Markup;
        }
      } else if (item?.x != null && item?.y != null) {
        return Markup.createPoint(type, item) as Markup;
      }
      throw new Error(`Invalid argument for markup type ${type}: ${JSON.stringify(item)}`);
    });
  },

  /**
   * Checks if two markups are equal. Markups are considered equal if they have the same type and
   * their properties match.
   *
   * @param a First markup to compare.
   * @param b Second markup to compare.
   * @returns `true` if markups are equal, `false` otherwise.
   */
  equals: (a: Markup, b: Markup): boolean => {
    if (a.type !== b.type) {
      return false;
    }
    if (a.type === MarkupType.Label) {
      return (
        Point.equals(a.at, (b as LabelMarkup).at) &&
        (a as LabelMarkup).text === (b as LabelMarkup).text
      );
    }
    if (a.type === MarkupType.Arrow || a.type === MarkupType.Line) {
      return (
        Point.equals(a.from, (b as LineMarkup).from) && Point.equals(a.to, (b as LineMarkup).to)
      );
    }
    return Point.equals((a as PointMarkup).at, (b as PointMarkup).at);
  },

  /**
   * Checks if a markup is at specified point. This is useful for checking if a markup is placed
   * on a specific field of the board.
   *
   * @param markup Markup to check.
   * @param point Point to check against.
   * @returns `true` if markup is at the specified point, `false` otherwise.
   */
  isAt: (markup: Markup, point: Point): boolean => {
    if ('at' in markup) {
      return Point.equals(markup.at, point);
    }
    return false;
  },

  /**
   * Checks if a markup connects two points. This is useful for checking if a line or arrow markup connects
   * two specific points on the board. It is illegal to have multiple lines or arrows connecting the same two points,
   * so this function can be used to ensure that a new markup does not duplicate an existing.
   *
   * @param markup Markup to check.
   * @param a first point to check.
   * @param b second point to check.
   * @returns `true` if markup connects the two points, `false` otherwise.
   */
  connects(markup: Markup, a: Point, b: Point): boolean {
    if (!Markup.isLineMarkup(markup)) {
      return false;
    }

    return (
      (Point.equals(markup.from, a) && Point.equals(markup.to, b)) ||
      (Point.equals(markup.from, b) && Point.equals(markup.to, a))
    );
  },

  /**
   * Checks if two markups conflict with each other.
   * This is useful for determining if two markups can coexist on the board without overlapping or
   * interfering with each other.
   */
  conflicts(a: Markup, b: Markup): boolean {
    if (Markup.isPointMarkup(a) && Markup.isPointMarkup(b) && Markup.isAt(a, b.at)) {
      return true; // Point markups conflict if they are at the same point
    }

    if (Markup.isLineMarkup(a) && Markup.isLineMarkup(b) && Markup.connects(a, b.from, b.to)) {
      return true; // Line markups conflict if they connect the same points
    }

    return false;
  },

  /**
   * Checks if a markup is a point markup (circle, selected, square, triangle, X mark or label).
   * This is useful for filtering markups that are placed on specific fields of the board.
   *
   * @param markup Markup to check.
   * @returns `true` if markup is a point markup, `false` otherwise.
   */
  isPointMarkup: (markup: Markup): markup is PointMarkup => {
    return 'at' in markup;
  },

  /**
   * Checks if a markup is a line markup (arrow or line).
   * This is useful for filtering markups that represent lines or arrows on the board.
   *
   * @param markup Markup to check.
   * @returns `true` if markup is a line markup, `false` otherwise.
   */
  isLineMarkup: (markup: Markup): markup is LineMarkup => {
    return 'from' in markup && 'to' in markup;
  },

  /**
   * Checks if a markup is a label markup.
   * This is useful for filtering markups that represent labels on the board.
   *
   * @param markup Markup to check.
   * @returns `true` if markup is a label markup, `false` otherwise.
   */
  isLabelMarkup: (markup: Markup): markup is LabelMarkup => {
    return 'text' in markup && 'at' in markup;
  },

  ...withMarkup<WithMarkup>(),
};

/**
 * Utility function to add markup-related methods to an entity that has a `markup` list property.
 */
export function withMarkup<T extends WithMarkup>() {
  return {
    /**
     * Adds specified markup to entity, which contains markup array. If there is already markup on specified point, it will be removed.
     */
    addMarkup: curryLast((entity: T, markup: Markup | Markup[]): T => {
      if (!Array.isArray(markup)) {
        markup = [markup];
      }

      let newMarkup = entity.markup ? [...entity.markup] : [];
      markup.forEach((m) => {
        newMarkup = newMarkup.filter((existing) => !Markup.conflicts(existing, m));
        newMarkup.push(m);
      });

      return {
        ...entity,
        markup: newMarkup,
      };
    }),

    /**
     * Checks if entity contains specified markup.
     */
    containsMarkup(entity: T, markup: Markup): boolean {
      if (!entity.markup) {
        return false;
      }
      return entity.markup.some((existing) => Markup.equals(existing, markup));
    },

    /**
     * Removes specified markup from entity, which contains markup array.
     * If no markup is specified, all markup will be removed.
     */
    removeMarkup: curryLast((entity: T, markup: Markup | Markup[]): T => {
      if (!entity.markup) {
        return entity;
      }

      if (!Array.isArray(markup)) {
        markup = [markup];
      }

      return {
        ...entity,
        markup: entity.markup.filter((m) =>
          markup.every((toRemove) => !Markup.equals(m, toRemove)),
        ),
      };
    }),
  };
}

/**
 * Converts entity with markup to SGF properties.
 * This function extracts markup from the entity and converts it to SGF properties format.
 *
 * @param entity Entity with markup to convert.
 * @returns SGF properties object containing markup properties.
 */
withMarkup.toSGFProperties = function <T extends WithMarkup>(
  entity: T,
): StandardSGFProperties & SGFProperties {
  const properties: StandardSGFProperties & SGFProperties = {};
  if (entity.markup) {
    entity.markup.forEach((markup) => {
      const markupType = markup.type;
      properties[markupType] ||= [];
      if (Markup.isLabelMarkup(markup)) {
        properties[markupType].push([markup.at, markup.text] as any);
      } else if (Markup.isPointMarkup(markup)) {
        properties[markupType].push(markup.at as any);
      } else if (Markup.isLineMarkup(markup)) {
        properties[markupType].push([markup.from, markup.to] as any);
      }
    });
  }
  return properties;
};
