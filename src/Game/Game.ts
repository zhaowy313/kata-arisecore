import { BoardSize, Color, Move } from '../types';
import { BoardPosition } from './BoardPosition';
import { GameState } from './GameState';
import { Rules } from './rules/Rules';

export interface GameParams {
  /**
   * Rule set of the game - it is used for checking move validity.
   */
  readonly rules: Rules;

  /**
   * Komi value for scoring.
   */
  readonly komi: number;

  /**
   * Board size.
   */
  size: BoardSize;

  /**
   * Handicap stones count. They are not placed on the board automatically, you need to set them.
   */
  handicap?: number;
}

/**
 * Represents one go game. It contains current board position, captured stones counts and other game state.
 * This class can be used to play and evaluate go games - you can play moves and board position is updated according
 * to go rules. You can also setup position and store additional state properties. You can also revert previous state
 * for convenience.
 */
export class Game implements GameParams {
  readonly rules: Rules;
  readonly size: BoardSize;
  komi: number;
  handicap?: number;

  /**
   * Current game state. You can use it to get information about the game like board position or current player.
   * You can also modify it - for example if you want to setup position.
   */
  currentState: GameState;

  /**
   * Previous game states. It is used to revert previous positions and for checking KO.
   */
  #previousStates: GameState[] = [];

  constructor({ size, rules, komi, handicap }: GameParams) {
    this.rules = rules;
    this.size = size;
    this.komi = komi;
    this.handicap = handicap;
    this.#previousStates = [];
    this.currentState = this.#getInitialState();
  }

  /**
   * Creates a new game state. Current state is pushed to the history.
   */
  next() {
    this.#previousStates.push(this.currentState);
    this.currentState = this.currentState.clone();
  }

  /**
   * Restores previous game state. Current state is dropped.
   */
  previous() {
    this.currentState = this.#previousStates.pop()!;
  }

  /**
   * Returns to initial (empty) game state.
   */
  initial() {
    this.#previousStates = [];
    this.currentState = this.#getInitialState();
  }

  /**
   * Returns true if move is valid according to the rules.
   */
  isValidMove(x: number, y: number): boolean {
    return this.rules.isValidMove(
      { x, y, c: this.currentState.player },
      { gameState: this.currentState, previousGameStates: this.#previousStates },
    );
  }

  /**
   * Play move if it is valid, and add current state to the history. Exception is thrown if move is invalid.
   */
  play(x: number, y: number) {
    if (!this.isValidMove(x, y)) {
      throw new Error(
        `Invalid move. Current player (${
          this.currentState.player === Color.Black ? 'black' : 'white'
        }) cannot play on ${x}x${y}.`,
      );
    }
    this.next();
    this.makeMove({ x, y, c: this.currentState.player });
  }

  /**
   * Pass the move. Current state is added to the history and player to move is reverted.
   */
  pass() {
    this.next();
    this.currentState.player = -this.currentState.player;
  }

  /**
   * Make move of any color on the board regardless of validity and current player. This method
   * doesn't push the state to the history - you should call `next()` before calling this method.
   */
  makeMove(move: Move) {
    if ('x' in move) {
      const captures = this.currentState.position.makeMove(move.x, move.y, move.c);
      const capturedColor = captures < 0 ? -move.c : move.c;

      if (capturedColor === Color.Black) {
        this.currentState.blackCaptures += Math.abs(captures);
      } else {
        this.currentState.whiteCaptures += Math.abs(captures);
      }
    }

    this.currentState.player = -move.c;
  }

  #getInitialState() {
    const state = new GameState(
      typeof this.size === 'object'
        ? new BoardPosition(this.size.cols, this.size.rows)
        : new BoardPosition(this.size),
    );

    if (this.handicap && this.handicap > 1) {
      // Special case - if handicap is set and larger than 1, we need to set player to white
      state.player = Color.White;
    }

    return state;
  }
}
