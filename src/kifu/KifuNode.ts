import {
  SGFPropertiesBag,
  SGFPropertyDescriptorMap,
  SGFProperties,
  SGFPropertyDescriptor,
} from '../sgf';
import { Color, Field, Move, Point, Vector } from '../types';
import { kifuInfoSGFPropertyDescriptors } from './kifuInfoSGFPropertyDescriptors';
import { kifuNodeSGFPropertyDescriptors } from './kifuNodeSGFPropertyDescriptors';

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

export interface PointMarkup extends Point {
  readonly type:
    | MarkupType.Circle
    | MarkupType.Selected
    | MarkupType.Square
    | MarkupType.Triangle
    | MarkupType.XMark;
}

export interface LineMarkup extends Vector {
  readonly type: MarkupType.Arrow | MarkupType.Line;
}

export interface LabelMarkup extends Point {
  readonly type: MarkupType.Label;
  readonly text: string;
}

export type Markup = PointMarkup | LineMarkup | LabelMarkup;

export interface KifuNodeCustomProperties {
  [key: string]: unknown;
}

/**
 * Class representing one kifu node. It contains some helpful methods for working with the node. Not all SGF properties are supported,
 * but you can access them through `properties` property.
 */
export class KifuNode extends SGFPropertiesBag {
  /**
   * Children of the node. Usually there is only one child representing next move, but there can be more children,
   * that would mean multiple variations.
   */
  children: KifuNode[] = [];

  /**
   * Contains black's or white's move. Unlike in SGF only one move is allowed per node.
   */
  move?: Move;

  /**
   * Setup black or white stones or clear existing stones. This is taken from SGF properties `AB`, `AW` and `AE`.
   *
   * This shouldn't be mutated directly, you can replace it or use methods `removeSetupAt` or `addSetup`.
   */
  setup: ReadonlyArray<Field> = [];

  /**
   * Sets player turn - next move should be played with this color.
   *
   * @see https://www.red-bean.com/sgf/properties.html#PL
   */
  player?: Color.Black | Color.White;

  /**
   * Node markup - for example triangles or square marking some stones or empty fields. WGo supports these
   * SGF markup properties: `AR`, `CR`, `LN`, `LB`, `MA`, `SL`, `SQ` and `TR`.
   *
   * This shouldn't be mutated directly, you can replace it or use methods `removeMarkup`, `removeMarkupAt` or `addMarkup`.
   */
  markup: ReadonlyArray<Markup> = [];

  /**
   * Dimmed area. Corresponds to SGF's DD property. This is technically markup, but it has special behavior - it is inherited,
   * it isn't removed on next node (move), it must be removed manually with empty dim array (in SGF DD[]). It also should be also
   * rendered above all other markup and stones. Finally dimmed area is specified in rectangles, not in points.
   *
   * @see https://www.red-bean.com/sgf/properties.html#VW
   */
  dim?: ReadonlyArray<Vector>;

  /**
   * View only part of the board. WGo only supports rectangular viewport specified in SGF as compressed list (eg. `VW[aa:dd]`)
   *
   * @see https://www.red-bean.com/sgf/properties.html#VW
   */
  boardSection?: Vector | null;

  /**
   * Time left for black, after the move was made. Value is given in seconds.
   *
   * @see https://www.red-bean.com/sgf/properties.html#BL
   */
  blackTimeLeft?: number;

  /**
   * Number of black moves left (after the move of this node was played) to play in this byo-yomi period.
   *
   * @see https://www.red-bean.com/sgf/properties.html#OB
   */
  blackStonesLeft?: number;

  /**
   * Time left for white, after the move was made. Value is given in seconds.
   *
   * @see https://www.red-bean.com/sgf/properties.html#WL
   */
  whiteTimeLeft?: number;

  /**
   * Number of white moves left (after the move of this node was played) to play in this byo-yomi period.
   *
   * @see https://www.red-bean.com/sgf/properties.html#OW
   */
  whiteStonesLeft?: number;

  /**
   * Comment for the node. Usually it's used to describe the move however it often contains chat from the online games too.
   *
   * @see https://www.red-bean.com/sgf/properties.html#C
   */
  comment?: string;

  override properties: KifuNodeCustomProperties = {};

  override getPropertyDescriptors() {
    return kifuNodeSGFPropertyDescriptors;
  }

  override getPropertyDescriptor(propIdent: string) {
    if (kifuInfoSGFPropertyDescriptors[propIdent]) {
      // Ignore properties that are managed by KifuInfo.
      return;
    }

    if (kifuNodeSGFPropertyDescriptors[propIdent]) {
      return kifuNodeSGFPropertyDescriptors[propIdent];
    }

    return super.getPropertyDescriptor(propIdent);
  }

  /**
   * Adds setup at given point.
   */
  addSetup(setup: Field | Field[]) {
    if (!Array.isArray(setup)) {
      setup = [setup];
    }

    const newSetupList = [...this.setup];
    setup.forEach((s) => {
      const existingSetupIndex = newSetupList.findIndex((s2) => s2.x === s.x && s2.y === s.y);
      if (existingSetupIndex !== -1) {
        newSetupList.splice(existingSetupIndex, 1);
      }
      newSetupList.push(s);
    });
    this.setup = newSetupList;
  }

  /**
   * Removes setup at given point.
   */
  removeSetupAt(point: Point | Point[]) {
    if (!Array.isArray(point)) {
      point = [point];
    }

    this.setup = this.setup.filter(
      (s) => !(point as Point[]).some((p) => p.x === s.x && p.y === s.y),
    );
  }

  /**
   * Adds specified markup. If markup already exist in the node, it won't be added. Markups are the same,
   * if they have same properties. You can provide multiple markups at once.
   *
   * @example
   * ```javascript
   * const node = new KifuNode({
   *   markup: [
   *     { type: 'CR', x: 1, y: 1 }
   *     { type: 'TR', x: 1, y: 1 }
   *   ],
   * });
   *
   * node.addMarkup([
   *   { type: 'CR', x: 1, y: 1 },
   *   { type: 'AR', x1: 1, y1: 1, x2: 2, y2: 2 },
   * ]);
   *
   * console.log(node.markup); // [{ type: 'CR', x: 1, y: 1 }, { type: 'TR', x: 1, y: 1 }, { type: 'AR', x1: 1, y1: 1, x2: 2, y2: 2 }]
   * ```
   */
  addMarkup(markup: Markup | Markup[]) {
    if (!Array.isArray(markup)) {
      markup = [markup];
    }

    const newMarkup = [...this.markup];
    markup.forEach((m) => {
      if (!newMarkup.some((m2) => compareMarkup(m, m2))) {
        newMarkup.push(m);
      }
    });
    this.markup = newMarkup;
  }

  /**
   * Removes specified markup. Markup objects are compared shallowly.
   */
  removeMarkup(markup: Markup | Markup[]) {
    if (!Array.isArray(markup)) {
      markup = [markup];
    }

    this.markup = this.markup.filter(
      (m) => !(markup as Markup[]).some((m2) => compareMarkup(m, m2)),
    );
  }

  /**
   * Removes markup at given point or vector.
   */
  removeMarkupAt(point: Point | Vector | (Point | Vector)[]) {
    if (!Array.isArray(point)) {
      point = [point];
    }

    this.markup = this.markup.filter(
      (m) => !(point as (Point | Vector)[]).some((p) => comparePoints(p, m)),
    );
  }

  /**
   * Create KifuNode instance from SGF properties.
   */
  static fromSGF(sgfProperties: SGFProperties | string) {
    const kifuNode = new KifuNode();
    kifuNode.setSGFProperties(sgfProperties);
    return kifuNode;
  }

  /**
   * Create KifuNode instance from plain JS object with same structure as KifuNode.
   */
  static fromJS(node: Partial<KifuNode>) {
    const kifuNode = new KifuNode();
    Object.assign(kifuNode, node);
    kifuNode.children = kifuNode.children.map(KifuNode.fromJS);
    return kifuNode;
  }

  /**
   * Define custom handling of SGF properties for KifuNode. If you want to add support for new properties,
   * you can use this method.
   */
  static defineProperties(sgfPropertyDescriptors: SGFPropertyDescriptorMap<KifuNode>) {
    Object.assign(kifuNodeSGFPropertyDescriptors, sgfPropertyDescriptors);
  }

  static createMoveDescriptor(color: Color.Black | Color.White): SGFPropertyDescriptor<KifuNode> {
    return {
      set([value]: string[]) {
        if (value) {
          this.move = {
            ...SGFPropertiesBag.parsePoint(value),
            c: color,
          };
        } else if (value === '') {
          this.move = { c: color };
        } else {
          this.move = undefined;
        }
      },
      get() {
        if (this.move && this.move.c === color) {
          return ['x' in this.move ? SGFPropertiesBag.pointToSGFValue(this.move) : ''];
        }
      },
    };
  }

  static createSetupDescriptor(color: Color): SGFPropertyDescriptor<KifuNode> {
    return {
      set(values: string[]) {
        this.setup = this.setup.filter((s) => s.c !== color);
        this.addSetup(
          values.map((value) => ({
            c: color,
            ...SGFPropertiesBag.parsePoint(value),
          })),
        );
      },
      get() {
        const blackStones = this.setup.filter((s) => s.c === color);
        return blackStones.map((bs) => SGFPropertiesBag.pointToSGFValue(bs));
      },
    };
  }

  static createPointMarkupDescriptor(type: PointMarkup['type']): SGFPropertyDescriptor<KifuNode> {
    return {
      set(values: string[]) {
        this.markup = this.markup.filter((m) => m.type !== type);
        this.addMarkup(
          values.map((value) => ({
            type,
            ...SGFPropertiesBag.parsePoint(value),
          })),
        );
      },
      get() {
        const markup = this.markup.filter((m) => m.type === type) as PointMarkup[];
        return markup.map((m) => SGFPropertiesBag.pointToSGFValue(m));
      },
    };
  }

  static createLineMarkupDescriptor(type: LineMarkup['type']): SGFPropertyDescriptor<KifuNode> {
    return {
      set(values: string[]) {
        this.markup = this.markup.filter((m) => m.type !== type);
        this.addMarkup(
          values.map((value) => ({
            type,
            ...SGFPropertiesBag.parseVector(value),
          })),
        );
      },
      get() {
        const lineMarkup = this.markup.filter((m) => m.type === type) as LineMarkup[];
        return lineMarkup.map((m) => SGFPropertiesBag.vectorToSGFValue(m));
      },
    };
  }

  static createLabelMarkupDescriptor(type: LabelMarkup['type']): SGFPropertyDescriptor<KifuNode> {
    return {
      set(values: string[]) {
        this.markup = this.markup.filter((m) => m.type !== type);
        this.addMarkup(
          values.map((value) => ({
            type,
            text: value.substring(3),
            ...SGFPropertiesBag.parsePoint(value),
          })),
        );
      },
      get() {
        const labelMarkup = this.markup.filter((m) => m.type === type) as LabelMarkup[];
        return labelMarkup.map((m) => `${SGFPropertiesBag.pointToSGFValue(m)}:${m.text}`);
      },
    };
  }
}

function compareMarkup(a: Markup, b: Markup) {
  if (a.type !== b.type) {
    return false;
  }

  const keys = Object.keys(b);
  return keys.every((key) => (a as any)[key] === (b as any)[key]);
}

function comparePoints(a: Point | Vector, b: Point | Vector) {
  const isAPoint = 'x' in a;
  const isBPoint = 'x' in b;

  if (isAPoint && isBPoint) {
    return a.x === b.x && a.y === b.y;
  } else if (!isAPoint && !isBPoint) {
    return a.x1 === b.x1 && a.y1 === b.y1 && a.x2 === b.x2 && a.y2 === b.y2;
  }

  return false;
}
