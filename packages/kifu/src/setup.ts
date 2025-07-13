import { Color, Field, Point, curryLast } from '@wgojs/common';
import { SGFProperties, StandardSGFProperties } from '@wgojs/sgf';

export type PositionSetup = {
  /**
   * This is used to set up initial position of the game. For handicap games, this must contain handicap stones.
   */
  readonly stones?: ReadonlyArray<Field>;

  /**
   * Sets initial player turn - first move should be played with this color.
   *
   * @see https://www.red-bean.com/sgf/properties.html#PL
   */
  readonly startingPlayer?: typeof Color.Black | typeof Color.White;

  /**
   * View only part of the board. WGo only supports rectangular viewport specified in SGF as compressed list (eg. `VW[aa:dd]`)
   *
   * @see https://www.red-bean.com/sgf/properties.html#VW
   */
  readonly boardSection?: [Point, Point];
};

export const PositionSetup = {
  empty: {} as PositionSetup,

  create(stones: ReadonlyArray<Field> = [], startingPlayer?: Color): PositionSetup {
    return {
      stones,
      startingPlayer,
    };
  },

  addStone: curryLast((setup: PositionSetup, stone: Field | Field[]): PositionSetup => {
    const stones = Array.isArray(stone) ? stone : [stone];

    let newStones = setup.stones ? [...setup.stones] : [];
    stones.forEach((s) => {
      newStones = newStones.filter((existing) => !Field.isAt(s, existing));
      newStones.push(s);
    });

    return {
      ...setup,
      stones: newStones,
    };
  }),

  containsStone(setup: PositionSetup, stone: Field): boolean {
    if (!setup.stones) {
      return false;
    }
    return setup.stones.some((existing) => Field.equals(stone, existing));
  },

  removeStone: curryLast((setup: PositionSetup, stone: Field | Field[]): PositionSetup => {
    const stones = Array.isArray(stone) ? stone : [stone];

    let newStones = setup.stones ? [...setup.stones] : [];
    stones.forEach((s) => {
      newStones = newStones.filter((existing) => !Field.equals(s, existing));
    });

    return {
      ...setup,
      stones: newStones,
    };
  }),

  setStartingPlayer: curryLast(
    (setup: PositionSetup, startingPlayer: undefined | Color): PositionSetup => {
      return {
        ...setup,
        startingPlayer: startingPlayer ? startingPlayer : undefined,
      };
    },
  ),

  setBoardSection: curryLast(
    (setup: PositionSetup, boardSection: undefined | [Point, Point]): PositionSetup => {
      return {
        ...setup,
        boardSection: boardSection ? boardSection : undefined,
      };
    },
  ),

  toSGFProperties(setup: PositionSetup): StandardSGFProperties & SGFProperties {
    const properties: StandardSGFProperties & SGFProperties = {};

    if (setup.stones) {
      const ab = setup.stones
        .filter((s) => s.color === Color.Black)
        .map((s) => ({ x: s.x, y: s.y }));
      if (ab.length > 0) {
        properties['AB'] = ab;
      }

      const aw = setup.stones
        .filter((s) => s.color === Color.White)
        .map((s) => ({ x: s.x, y: s.y }));
      if (aw.length > 0) {
        properties['AW'] = aw;
      }

      const ae = setup.stones
        .filter((s) => s.color === Color.Empty)
        .map((s) => ({ x: s.x, y: s.y }));

      if (ae.length > 0) {
        properties['AE'] = ae;
      }
    }

    if (setup.startingPlayer) {
      properties.PL = setup.startingPlayer;
    }

    if (setup.boardSection) {
      properties.VW = setup.boardSection;
    }

    return properties;
  },
};
