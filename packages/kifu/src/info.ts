import { Color, curryLast, BoardSize } from '@wgojs/common';
import { SGFProperties, StandardSGFProperties } from '@wgojs/sgf';
import { createApplyProperties } from './applyProperties';

export type KifuInfo = {
  /**
   * Size of the board.
   *
   * @see https://www.red-bean.com/sgf/properties.html#SZ
   */
  readonly boardSize?: BoardSize;

  /**
   * Handicap. This is for information only, handicap stones must be set with `AB` properties.
   *
   * @see https://www.red-bean.com/sgf/go.html#HA
   */
  readonly handicap?: number;

  /**
   * Komi. This is used when scoring territory.
   *
   * @see https://www.red-bean.com/sgf/go.html#KM
   */
  readonly komi?: number;

  /**
   * Black player information.
   */
  readonly black?: KifuPlayerInfo;

  /**
   * White player information.
   */
  readonly white?: KifuPlayerInfo;

  /**
   * @see https://www.red-bean.com/sgf/properties.html#ST
   */
  readonly variationsStyle?: {
    /**
     * If true variations of current node should be shown (siblings variations). Otherwise successor info
     * variations are shown (children variations).
     */
    readonly currentNode?: boolean;

    /**
     * If true, no variation markup should be shown on board.
     */
    readonly noMarkup?: boolean;
  };

  /**
   * @see https://www.red-bean.com/sgf/properties.html#GN
   */
  readonly gameName?: string;

  /**
   * @see https://www.red-bean.com/sgf/properties.html#GC
   */
  readonly gameComment?: string;

  /**
   * Provides the date when the game was played. Should be in ISO format.
   *
   * @see https://www.red-bean.com/sgf/properties.html#DT
   */
  readonly date?: string;

  /**
   * Provides the name of the event (e.g. tournament).
   *
   * @see https://www.red-bean.com/sgf/properties.html#EV
   */
  readonly event?: string;

  /**
   * @see https://www.red-bean.com/sgf/properties.html#PC
   */
  readonly place?: string;

  /**
   * @see https://www.red-bean.com/sgf/properties.html#RO
   */
  readonly round?: string;

  /**
   * Provides the result of the game. It is MANDATORY to use specified format.
   *
   * @see https://www.red-bean.com/sgf/properties.html#RE
   */
  readonly result?: Result;

  /**
   * Provides the time limits of the game. The time limit is given in seconds.
   *
   * @see https://www.red-bean.com/sgf/properties.html#TM
   */
  readonly timeLimit?: number;

  /**
   * Describes the method used for overtime (byo-yomi).
   *
   * @see https://www.red-bean.com/sgf/properties.html#OT
   */
  readonly overTime?: string;

  /**
   * Specified rule set. This is used by game engine.
   *
   * @see https://www.red-bean.com/sgf/properties.html#RU
   */
  readonly rules?: KnownGoRule | string;

  /**
   * @see https://www.red-bean.com/sgf/properties.html#SO
   */
  readonly source?: string;

  /**
   * @see https://www.red-bean.com/sgf/properties.html#US
   */
  readonly author?: string;

  /**
   * @see https://www.red-bean.com/sgf/properties.html#AN
   */
  readonly annotator?: string;

  /**
   * @see https://www.red-bean.com/sgf/properties.html#CP
   */
  readonly copyright?: string;

  readonly custom?: KifuInfoCustom;
};

export enum KnownGoRule {
  AGA = 'AGA',
  GOE = 'GOE',
  Japanese = 'Japanese',
  NZ = 'NZ',
  Chinese = 'Chinese',
}

export interface KifuPlayerInfo {
  /**
   * Player's name.
   *
   * @see https://www.red-bean.com/sgf/properties.html#PB
   */
  readonly name?: string;

  /**
   * Player's rank.
   *
   * @see https://www.red-bean.com/sgf/properties.html#BR
   */
  readonly rank?: string;

  /**
   * Player's team.
   *
   * @see https://www.red-bean.com/sgf/properties.html#BT
   */
  readonly team?: string;
}

export interface KifuInfoCustom {
  readonly [key: string]: unknown;
}

/**
 * Result of the game as string with specific format. It is taken from the SGF specification.
 *
 * @see https://www.red-bean.com/sgf/properties.html#RE
 */
export type Result =
  | '0'
  | 'Draw'
  | 'Void'
  | '?'
  | `B+`
  | `B+${number}`
  | 'B+R'
  | 'B+Resign'
  | 'B+T'
  | 'B+Time'
  | 'B+F'
  | 'B+Forfeit'
  | `W+`
  | `W+${number}`
  | 'W+R'
  | 'W+Resign'
  | 'W+T'
  | 'W+Time'
  | 'W+F'
  | 'W+Forfeit';

const applySGFProperty = curryLast(
  (
    kifuInfo: KifuInfo,
    properties: StandardSGFProperties & SGFProperties,
    key: keyof (StandardSGFProperties & SGFProperties),
  ): KifuInfo => {
    switch (key) {
      case 'SZ':
        return {
          ...kifuInfo,
          boardSize: Array.isArray(properties[key])
            ? BoardSize.create(...properties[key])
            : properties[key],
        };
      case 'HA':
        return { ...kifuInfo, handicap: properties[key] };
      case 'KM':
        return {
          ...kifuInfo,
          komi: properties[key],
        };
      case 'PB':
        return {
          ...kifuInfo,
          black: {
            ...kifuInfo.black,
            name: properties[key],
          },
        };
      case 'BR':
        return {
          ...kifuInfo,
          black: {
            ...kifuInfo.black,
            rank: properties[key],
          },
        };
      case 'BT':
        return {
          ...kifuInfo,
          black: {
            ...kifuInfo.black,
            team: properties[key],
          },
        };
      case 'PW':
        return {
          ...kifuInfo,
          white: {
            ...kifuInfo.white,
            name: properties[key],
          },
        };
      case 'WR':
        return {
          ...kifuInfo,
          white: {
            ...kifuInfo.white,
            rank: properties[key],
          },
        };
      case 'WT':
        return {
          ...kifuInfo,
          white: {
            ...kifuInfo.white,
            team: properties[key],
          },
        };
      case 'GC':
        return {
          ...kifuInfo,
          gameComment: properties[key],
        };
      case 'GN':
        return {
          ...kifuInfo,
          gameName: properties[key],
        };
      case 'DT':
        return {
          ...kifuInfo,
          date: properties[key],
        };
      case 'EV':
        return {
          ...kifuInfo,
          event: properties[key],
        };
      case 'PC':
        return {
          ...kifuInfo,
          place: properties[key],
        };
      case 'RO':
        return {
          ...kifuInfo,
          round: properties[key],
        };
      case 'RE':
        return {
          ...kifuInfo,
          result: Result.isValid(properties[key]) ? properties[key] : undefined,
        };
      case 'TM':
        return {
          ...kifuInfo,
          timeLimit: properties[key],
        };
      case 'OT':
        return {
          ...kifuInfo,
          overTime: properties[key],
        };
      case 'RU':
        return {
          ...kifuInfo,
          rules: properties[key] as KnownGoRule | string,
        };
      case 'SO':
        return {
          ...kifuInfo,
          source: properties[key],
        };
      case 'US':
        return {
          ...kifuInfo,
          author: properties[key],
        };
      case 'AN':
        return {
          ...kifuInfo,
          annotator: properties[key],
        };
      case 'CP':
        return {
          ...kifuInfo,
          copyright: properties[key],
        };
      case 'ST':
        return {
          ...kifuInfo,
          variationsStyle: {
            currentNode: !!(properties[key]! & 1),
            noMarkup: !!(properties[key]! & 2),
          },
        };
    }

    return kifuInfo;
  },
);

export const KifuInfo = {
  empty: {} as KifuInfo,

  applyProperties: createApplyProperties<KifuInfo>(applySGFProperty),

  applySGFProperty,

  update: curryLast((info: KifuInfo, changes: Partial<KifuInfo>): KifuInfo => {
    return { ...info, ...changes };
  }),

  setBlack: curryLast((info: KifuInfo, blackInfo: KifuPlayerInfo): KifuInfo => {
    return { ...info, black: { ...info.black, ...blackInfo } };
  }),

  setWhite: curryLast((info: KifuInfo, whiteInfo: KifuPlayerInfo): KifuInfo => {
    return { ...info, white: { ...info.white, ...whiteInfo } };
  }),

  setCustom: curryLast((info: KifuInfo, custom: KifuInfoCustom): KifuInfo => {
    return { ...info, custom: { ...info.custom, ...custom } };
  }),

  toSGFProperties(info: KifuInfo): StandardSGFProperties & SGFProperties {
    const properties: StandardSGFProperties & SGFProperties = {};

    if (info.boardSize) {
      if (typeof info.boardSize === 'number') {
        properties.SZ = info.boardSize;
      } else {
        properties.SZ = [info.boardSize.cols, info.boardSize.rows];
      }
    }

    if (info.handicap) {
      properties.HA = info.handicap;
    }

    if (info.komi) {
      properties.KM = info.komi;
    }

    if (info.black?.name) {
      properties.PB = info.black.name;
    }

    if (info.black?.rank) {
      properties.BR = info.black.rank;
    }

    if (info.black?.team) {
      properties.BT = info.black.team;
    }

    if (info.white?.name) {
      properties.PW = info.white.name;
    }

    if (info.white?.rank) {
      properties.WR = info.white.rank;
    }

    if (info.white?.team) {
      properties.WT = info.white.team;
    }

    if (info.gameComment) {
      properties.GC = info.gameComment;
    }

    if (info.gameName) {
      properties.GN = info.gameName;
    }

    if (info.date) {
      properties.DT = info.date;
    }

    if (info.event) {
      properties.EV = info.event;
    }

    if (info.place) {
      properties.PC = info.place;
    }

    if (info.round) {
      properties.RO = info.round;
    }

    if (info.result) {
      properties.RE = info.result;
    }

    if (info.timeLimit) {
      properties.TM = info.timeLimit;
    }

    if (info.overTime) {
      properties.OT = info.overTime;
    }

    if (info.rules) {
      properties.RU = info.rules;
    }

    if (info.source) {
      properties.SO = info.source;
    }

    if (info.author) {
      properties.US = info.author;
    }

    if (info.annotator) {
      properties.AN = info.annotator;
    }

    if (info.copyright) {
      properties.CP = info.copyright;
    }

    if (info.variationsStyle) {
      properties.ST =
        (info.variationsStyle.currentNode ? 1 : 0) | (info.variationsStyle.noMarkup ? 2 : 0);
    }

    return properties;
  },
};

export const Result = {
  /**
   * Creates a result string based on the color and value provided. It uses unified notation for results (whole words like B+Time, Draw etc).
   * If the color is not specified or unknown value, result will be '?'.
   *
   * @param color - The color of the player (Color.B for Black, Color.W for White, Color.E for empty).
   * @param value - The result value, which can be a number, string, or undefined. If undefined, it defaults to the standard result for the color.
   */
  create(color?: Color, value?: number | string): Result {
    if (color === Color.E) {
      if (!value) {
        return 'Draw';
      }
      switch (value.toString().toLowerCase()) {
        case '0':
        case 'draw':
          return 'Draw';
        case 'void':
          return 'Void';
      }
    } else if (color) {
      const letter = color === Color.B ? 'B' : 'W';

      if (!value) {
        return `${letter}+`;
      }

      if (typeof value === 'number') {
        return `${letter}+${value}`;
      }

      switch (value.toLowerCase()) {
        case 'r':
        case 'resign':
          return `${letter}+Resign`;
        case 't':
        case 'time':
          return `${letter}+Time`;
        case 'f':
        case 'forfeit':
          return `${letter}+Forfeit`;
        default:
          return `${letter}+`;
      }
    }

    return '?';
  },

  isValid(result?: string): result is Result {
    if (!result) {
      return false; // Empty result is not valid
    }

    // Check if the result matches the expected format
    const validResultPattern =
      /^(0|Draw|Void|\?|B\+|B\+\d+(\.\d+)?|B\+R|B\+Resign|B\+T|B\+Time|B\+F|B\+Forfeit|W\+|W\+\d+(\.\d+)?|W\+R|W\+Resign|W\+T|W\+Time|W\+F|W\+Forfeit)$/;
    return validResultPattern.test(result);
  },

  /**
   * Extracts the winner from the result string.
   * Returns Color.B for Black, Color.W for White, or Color.E for empty (draw or no winner).
   *
   * @param result - The result string to analyze.
   */
  getWinner(result: Result): Color {
    const match = result.match(/^([BW])\+/);
    if (match) {
      return match[1] === 'B' ? Color.B : Color.W;
    }
    return Color.E; // No winner or draw
  },

  /**
   * Extracts the score from the result string.
   * Returns the score as a number or null if no score is available.
   *
   * @param result - The result string to analyze.
   */
  getScore(result: Result): number | null {
    const match = result.match(/^[BW]\+(.*)/);
    if (match && match[1]) {
      const score = parseFloat(match[1]);
      if (!isNaN(score)) {
        return score;
      }
    }
    return null; // No score available
  },

  /**
   * Creates a Result string from territory counting.
   */
  fromCounting(blackScore: number, whiteScore: number): Result {
    if (blackScore > whiteScore) {
      const score = blackScore - whiteScore;
      return Result.create(Color.B, score);
    } else if (whiteScore > blackScore) {
      const score = whiteScore - blackScore;
      return Result.create(Color.W, score);
    } else {
      return Result.create(Color.E);
    }
  },
};
