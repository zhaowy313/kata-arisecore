import { Color, curryLast, pipe, Stone } from '@wgojs/common';
import { BoardPosition } from './BoardPosition';
import { PositionHash } from './PositionHash';
import { Play } from './rules/GameRules';

export type GameState = {
  /**
   * The current board position.
   */
  readonly position: BoardPosition;

  /**
   * The current turn color.
   */
  readonly turn: typeof Color.Black | typeof Color.White;

  /**
   * The number of captured stones by given player.
   *
   * @example
   * ```
   * // Black captured 5 stones, white captured 3 stones
   * captured: {
   *   black: 5,
   *   white: 3
   * }
   * ```
   */
  readonly captured: {
    readonly black: number;
    readonly white: number;
  };

  history: PositionHash[];
};

export const GameState = {
  /**
   * Creates a new game state with the initial position and starting player.
   *
   * @param initialPosition Initial position of the game. For standard game this is empty board (eg. `BoardPosition.empty19`).
   * @param startingPlayer The player who starts the game. Default is black.
   * @returns A new game state with the initial position and starting player.
   */
  create(initialPosition: BoardPosition, startingPlayer: Color = Color.Black): GameState {
    return {
      position: initialPosition,
      turn: startingPlayer,
      captured: {
        black: 0,
        white: 0,
      },
      history: [
        PositionHash.updateHash(PositionHash.empty, BoardPosition.getStones(initialPosition)),
      ],
    };
  },

  /**
   * Applies a play to the game state and returns a new game state. This method ignores the validity of the move
   * and move is played even if there is already a stone on the field. After the play, the turn is switched
   * to the opposite player and the captured stones are updated. If suicide move is played, the suicide stones
   * will be captured.
   *
   * @param state The current game state.
   * @param play The play to apply.
   * @returns A new game state with the applied play.
   */
  applyPlay: curryLast((state: GameState, play: Play): GameState => {
    const oppositeColor = Color.opposite(play.color);

    if (play.x == null || play.y == null) {
      // Pass move
      return {
        ...state,
        turn: oppositeColor,
      };
    }

    if (!BoardPosition.isOnBoard(state.position, play.x, play.y)) {
      throw new Error(`Invalid move: (${play.x}, ${play.y}) is out of board.`);
    }

    const newPosition = BoardPosition.set(state.position, play.x, play.y, play.color);
    const capturedStones: Stone[] = [];
    const captured = {
      ...state.captured,
    };

    function captureStonesIfPossible(x: number, y: number, color: Color = oppositeColor) {
      if (
        BoardPosition.isOnBoard(newPosition, x, y) &&
        BoardPosition.get(newPosition, x, y) === color &&
        !BoardPosition.hasLiberties(newPosition, x, y)
      ) {
        // Stone (or group) doesn't have liberties, add it to captured
        capturedStones.push(...BoardPosition.getChain(newPosition, x, y));
      }
    }

    captureStonesIfPossible(play.x - 1, play.y); // Left
    captureStonesIfPossible(play.x + 1, play.y); // Right
    captureStonesIfPossible(play.x, play.y - 1); // Up
    captureStonesIfPossible(play.x, play.y + 1); // Down

    if (!capturedStones.length) {
      // No stones captured, check suicide
      captureStonesIfPossible(play.x, play.y, play.color);
      if (capturedStones.length) {
        // An opponent will capture stones for suicide move
        captured[oppositeColor === Color.Black ? 'black' : 'white'] += capturedStones.length;
      }
    } else {
      captured[play.color === Color.Black ? 'black' : 'white'] += capturedStones.length;
    }

    const positionHash = pipe(
      state.history[state.history.length - 1],
      PositionHash.updateHash(play as Stone), // Played move
      PositionHash.updateHash(capturedStones), // Captured stones
    );

    return {
      position: capturedStones.length
        ? BoardPosition.removeStones(newPosition, capturedStones)
        : newPosition,
      turn: oppositeColor,
      captured,
      history: [...state.history, positionHash],
    };
  }),
};
