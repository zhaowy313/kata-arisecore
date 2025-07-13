import { Color, Writable } from '@wgojs/common';
import { SGFParser, SGFParsingContext, StandardSGFProperties } from '@wgojs/sgf';
import { Kifu, KifuRoot } from './kifu';
import { KifuInfo } from './info';
import { KifuMove } from './move';
import { KifuVariation } from './variation';
import { MoveAnnotation } from './annotation';
import { Markup } from './markup';

type KifuParsingContext = SGFParsingContext<{
  kifuInfo: KifuInfo[];
}>;

export interface KifuSGFParserConfig<
  SGF_PROPS extends Record<string, unknown> = StandardSGFProperties,
> {
  applyMoveProperty?: (move: KifuMove, properties: SGF_PROPS, key: keyof SGF_PROPS) => KifuMove;
  applyGameInfoProperty?: (
    gameInfo: KifuInfo,
    properties: SGF_PROPS,
    key: keyof SGF_PROPS,
  ) => KifuInfo;
}

export class KifuSGFParser<
  SGF_PROPS extends Record<string, unknown> = StandardSGFProperties,
> extends SGFParser<SGF_PROPS, KifuMove[], Kifu[], KifuParsingContext> {
  constructor(config: KifuSGFParserConfig<SGF_PROPS> = {}) {
    super({
      visitNode: (properties, context: KifuParsingContext) => {
        // Here we store properties related to the game info into the context,
        // it will be used in `transformCollection` later
        // Initialize kifuInfo for the current game if it doesn't exist yet
        context.kifuInfo ||= [];
        const game = context.game || 0;
        context.kifuInfo[game] = KifuInfo.applyProperties(
          context.kifuInfo[game] || KifuInfo.empty,
          {
            properties,
            applyProperty: config.applyGameInfoProperty,
          },
        );
      },
      transformTree: (sequence, children): KifuMove[] => {
        const moves = sequence.map((properties) =>
          KifuMove.applyProperties(KifuMove.empty, {
            properties,
            applyProperty: config.applyMoveProperty,
          }),
        );

        if (children.length > 0) {
          const variations: KifuVariation[] = [];

          for (let i = 1; i < children.length; i++) {
            const variation: KifuVariation = {
              moves: children[i],
            };
            if (children[i][0].custom?.N) {
              (variation as any).name = children[i][0].custom!.N;
              // Remove the custom property if it only contains the name
              delete (children[i][0].custom as any).N;
              if (Object.keys(children[i][0].custom!).length === 0) {
                delete (children[i][0] as any).custom;
              }
            }
            variations.push(variation);
          }

          return [...moves, { ...children[0][0], variations: variations }, ...children[0].slice(1)];
        }

        return moves;
      },
      transformCollection: (collection: KifuMove[][], context: KifuParsingContext): Kifu[] => {
        return collection.map((tree, index) => {
          // TODO: handle custom info properties

          const kifu = {
            info: context.kifuInfo[index],
            setup: tree[0].setup,
            moves: tree.splice(1),
          };
          const root: Writable<KifuRoot> = {};

          if (tree[0].x != null && tree[0].y != null) {
            root.move = {
              x: tree[0].x,
              y: tree[0].y,
              color: tree[0].color || Color.Black,
            };
          }

          if (tree[0].comment) {
            root.comment = tree[0].comment;
          }
          if (tree[0].annotations) {
            root.annotations = tree[0].annotations as MoveAnnotation[];
          }
          if (tree[0].markup) {
            root.markup = tree[0].markup as Markup[];
          }

          if (tree[0].custom) {
            kifu.info = {
              ...kifu.info,
              custom: {
                ...tree[0].custom,
                ...kifu.info.custom,
              },
            };
          }

          return Object.keys(root).length > 0 ? { ...kifu, root } : kifu;
        });
      },
    });
  }
}

export const kifuSGFParser = new KifuSGFParser();
