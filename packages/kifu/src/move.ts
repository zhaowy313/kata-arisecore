import { Color, curryLast, Field, Point } from '@wgojs/common';
import { Markup, MarkupType, withMarkup, WithMarkup } from './markup';
import { MoveAnnotation, withAnnotations, WithAnnotations } from './annotation';
import { PositionSetup } from './setup';
import { SGFProperties, StandardSGFProperties } from '@wgojs/sgf';
import { KifuVariation } from './variation';
import { ApplyPropertiesParams, createApplyProperties } from './applyProperties';
import { kifuSGFParser } from './kifuSGFParser';

export type KifuMove = {
  /**
   * The x coordinate of the move on the board. If not specified, the move is considered a pass.
   * This is 0-based index, so the first column is 0.
   */
  readonly x?: number;
  /**
   * The y coordinate of the move on the board. If not specified, the move is considered a pass.
   * This is 0-based index, so the first row is 0.
   */
  readonly y?: number;

  /**
   * The color of the move. It doesn't have to be specified - it is inferred from the position in the game.
   * First move is black, second is white, third is black, etc.
   */
  readonly color?: typeof Color.Black | typeof Color.White;

  /**
   * Comment for the move.
   */
  readonly comment?: string;

  /**
   * Setup of the position. This should nod be used, but it is here for compatibility with SGF. Position should be set up only
   * once at the beginning of the game (for example for go problems or handicaps).
   */
  readonly setup?: PositionSetup;

  readonly variations?: ReadonlyArray<KifuVariation>;
  readonly custom?: KifuMoveCustom;
} & WithMarkup &
  WithAnnotations;

export interface KifuMoveCustom {
  readonly [key: string]: unknown;
}

const applySGFProperty = curryLast(
  (
    move: KifuMove,
    properties: StandardSGFProperties & SGFProperties,
    key: keyof (StandardSGFProperties & SGFProperties),
  ): KifuMove => {
    switch (key) {
      // Move
      case 'B':
      case 'W':
        return {
          ...move,
          ...properties[key],
          color: key === 'B' ? Color.Black : Color.White,
        };
      // Annotations
      case 'DM':
      case 'GB':
      case 'GW':
      case 'HO':
      case 'UC':
      case 'BM':
      case 'TE':
      case 'DO':
      case 'IT':
      case 'V':
        return addAnnotation(move, MoveAnnotation.fromSGF(key, properties[key])!);
      case 'C':
        return KifuMove.setComment(move, properties[key]);
      case 'AB':
        return addSetupStones(move, properties[key]!, Color.Black);
      case 'AE':
        return addSetupStones(move, properties[key]!, Color.Empty);
      case 'AW':
        return addSetupStones(move, properties[key]!, Color.White);
      case 'PL':
        return {
          ...move,
          setup: {
            ...move.setup,
            startingPlayer: properties[key] === Color.Black ? Color.Black : Color.White,
          },
        };
      case 'VW':
        return {
          ...move,
          setup: {
            ...move.setup,
            boardSection: properties[key],
          },
        };
      case 'CR':
      case 'MA':
      case 'SL':
      case 'SQ':
      case 'TR':
      case 'AR':
      case 'LN':
      case 'LB':
        return addMarkup(move, key, properties[key]!);
    }

    return {
      ...move,
      custom: {
        ...move.custom,
        [key]: properties[key],
      },
    };
  },
);

export const KifuMove = {
  // Constructors

  empty: {} as KifuMove,
  create(x: number, y: number, color?: typeof Color.Black | typeof Color.White): KifuMove {
    return color ? { x, y, color } : { x, y };
  },
  createPass(color?: typeof Color.Black | typeof Color.White): KifuMove {
    return color ? { color } : KifuMove.empty;
  },
  update: curryLast((move: KifuMove, changes: Partial<KifuMove>): KifuMove => {
    return { ...move, ...changes };
  }),

  // Setters

  setMove: curryLast((move: KifuMove, x: number, y: number): KifuMove => {
    return { ...move, x, y };
  }),
  setPass: curryLast((move: KifuMove) => {
    const newMove = { ...move };

    delete newMove.x;
    delete newMove.y;

    return newMove;
  }),
  setComment: curryLast((move: KifuMove, comment: string | undefined): KifuMove => {
    return { ...move, comment };
  }),

  setCustom: curryLast((move: KifuMove, custom: KifuMoveCustom): KifuMove => {
    return { ...move, custom: { ...move.custom, ...custom } };
  }),

  addVariation: curryLast((move: KifuMove, variation: KifuVariation | KifuMove[]): KifuMove => {
    if (Array.isArray(variation)) {
      variation = { moves: variation };
    }
    return { ...move, variations: [...(move.variations || []), variation] };
  }),
  removeVariation: curryLast((move: KifuMove, variation: KifuVariation | number): KifuMove => {
    if (!move.variations) {
      return move;
    }
    if (typeof variation === 'number') {
      return { ...move, variations: move.variations.filter((_, index) => index !== variation) };
    }
    return { ...move, variations: move.variations.filter((v) => v !== variation) };
  }),
  updateVariation: curryLast(
    (
      move: KifuMove,
      variation: KifuVariation | number,
      updateFn: (variation: KifuVariation) => KifuVariation,
    ): KifuMove => {
      if (!move.variations) {
        return move;
      }
      const variations = [...move.variations];
      if (typeof variation === 'number') {
        variations[variation] = updateFn(variations[variation]);
      } else {
        const index = variations.indexOf(variation);
        if (index !== -1) {
          variations[index] = updateFn(variations[index]);
        }
      }
      return { ...move, variations };
    },
  ),

  // SGF related

  fromSGF<P extends Record<string, any> = StandardSGFProperties & SGFProperties>(
    sgf: string,
    params: Pick<ApplyPropertiesParams<KifuMove, P>, 'applyProperty'> = {},
  ): KifuMove {
    const properties = kifuSGFParser.parseProperties(sgf) as P;
    return KifuMove.applyProperties<P>(KifuMove.empty, {
      ...params,
      properties,
    });
  },

  applyProperties: createApplyProperties<KifuMove>(applySGFProperty),
  applySGFProperty,

  toSGFProperties(move: KifuMove, currentColor?: Color): StandardSGFProperties & SGFProperties {
    const properties: StandardSGFProperties & SGFProperties = {
      ...withMarkup.toSGFProperties(move),
      ...withAnnotations.toSGFProperties(move),
      ...(move.setup && PositionSetup.toSGFProperties(move.setup)),
    };

    const color = move.color || currentColor || Color.Black;

    properties[color === Color.Black ? 'B' : 'W'] =
      move.x !== undefined && move.y !== undefined ? { x: move.x, y: move.y } : null;

    if (move.comment) {
      properties.C = move.comment;
    }

    return properties;
  },

  ...withMarkup<KifuMove>(),
  ...withAnnotations<KifuMove>(),
};

// Add setup for constructing from SGF
function addSetupStones(move: KifuMove, points: Point[], color: Color) {
  return {
    ...move,
    setup: {
      ...move.setup,
      stones: [...(move.setup?.stones || []), ...points.map((p) => Field.fromPoint(p, color))],
    },
  };
}

// Add annotation for constructing from SGF
function addAnnotation(move: KifuMove, annotation: MoveAnnotation | null) {
  if (annotation) {
    return {
      ...move,
      annotations: [...(move.annotations || []), annotation],
    };
  }

  return move;
}

// Add markup for constructing from SGF
function addMarkup(move: KifuMove, type: string, args: any[]) {
  return {
    ...move,
    markup: [...(move.markup || []), ...Markup.fromSGFProperty(type as MarkupType, args)],
  };
}
