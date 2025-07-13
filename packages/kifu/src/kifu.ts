import { Color, curryLast } from '@wgojs/common';
import { KifuInfo } from './info';
import { KifuSGFParser, kifuSGFParser, KifuSGFParserConfig } from './kifuSGFParser';
import { withMarkup, WithMarkup } from './markup';
import { KifuMove } from './move';
import { withAnnotations, WithAnnotations } from './annotation';
import { PositionSetup } from './setup';
import { withMoves } from './variation';
import { SGFProperties, StandardSGFProperties } from '@wgojs/sgf';
import { KifuSGFWriter, KifuSGFWriterConfig } from './kifuSGFWriter';

/**
 * Lightweight representation of one go game record. This is immutable structure, so it is not meant to be modified.
 * However there are helper methods to create new instances with modified properties.
 */
export interface Kifu {
  /**
   * General information about the game, like board size, komi, players, etc.
   */
  readonly info: KifuInfo;

  /**
   * Setup of initial position of the game. Also contains markup and comment visible at the beginning of the game.
   */
  readonly setup?: PositionSetup;

  /**
   * Move and node specific properties, which are on the root node of the kifu, if created from SGF.
   * There can be move, markup and annotations, which will be executed and shown at the initial position.
   */
  readonly root?: KifuRoot;

  /**
   * Moves of the game.
   */
  readonly moves: ReadonlyArray<KifuMove>;
}

export const Kifu = {
  empty: {
    info: {},
    moves: [],
  } as Kifu,

  create(info: KifuInfo, moves: ReadonlyArray<KifuMove> = []): Kifu {
    return {
      info,
      moves,
    };
  },

  fromSGF<P extends Record<string, unknown>>(
    sgf: string,
    parserConfig?: KifuSGFParserConfig<P>,
  ): Kifu {
    if (parserConfig) {
      const kifuSGFParserWithConfig = new KifuSGFParser(parserConfig);
      return kifuSGFParserWithConfig.parseCollection(sgf)[0];
    }
    return kifuSGFParser.parseCollection(sgf)[0];
  },

  toSGF(kifu: Kifu, parserConfig?: KifuSGFWriterConfig): string {
    const kifuSGFWriter = new KifuSGFWriter(parserConfig);
    return kifuSGFWriter.stringify(kifu);
  },

  addInfo: curryLast((kifu: Kifu, fragment: Partial<KifuInfo>): Kifu => {
    return {
      ...kifu,
      info: {
        ...kifu.info,
        ...fragment,
      },
    };
  }),

  updateInfo: curryLast((kifu: Kifu, updateFn: (info: KifuInfo) => KifuInfo) => {
    return {
      ...kifu,
      info: updateFn(kifu.info),
    };
  }),

  addSetup: curryLast((kifu: Kifu, fragment: Partial<PositionSetup>): Kifu => {
    return {
      ...kifu,
      setup: {
        ...kifu.setup,
        ...fragment,
      },
    };
  }),

  updateSetup: curryLast((kifu: Kifu, updateFn: (setup: PositionSetup) => PositionSetup): Kifu => {
    return {
      ...kifu,
      setup: updateFn(kifu.setup || PositionSetup.empty),
    };
  }),

  addRoot: curryLast((kifu: Kifu, fragment: Partial<KifuRoot>): Kifu => {
    return {
      ...kifu,
      root: {
        ...kifu.root,
        ...fragment,
      },
    };
  }),

  updateRoot: curryLast((kifu: Kifu, updateFn: (root: KifuRoot) => KifuRoot): Kifu => {
    return {
      ...kifu,
      root: updateFn(kifu.root || KifuRoot.empty),
    };
  }),

  ...withMoves<Kifu>(),
};

export type KifuRoot = {
  readonly move?: Pick<KifuMove, 'x' | 'y' | 'color'>;
  readonly comment?: string;
} & WithMarkup &
  WithAnnotations;

export const KifuRoot = {
  empty: {} as KifuRoot,
  setComment: curryLast((root: KifuRoot, comment: string | undefined): KifuRoot => {
    return {
      ...root,
      comment: comment ? comment : undefined,
    };
  }),
  toSGFProperties(root: KifuRoot) {
    const properties: StandardSGFProperties & SGFProperties = {
      ...withMarkup.toSGFProperties(root),
      ...withAnnotations.toSGFProperties(root),
    };

    if (root.move && root.move.x !== undefined && root.move.y !== undefined) {
      properties[root.move.color === Color.White ? 'W' : 'B'] = { x: root.move.x, y: root.move.y };
    }

    if (root.comment) {
      properties.C = root.comment;
    }

    return properties;
  },
  ...withMarkup<KifuRoot>(),
  ...withAnnotations<KifuRoot>(),
};
