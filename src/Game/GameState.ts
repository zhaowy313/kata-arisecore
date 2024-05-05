import { Color } from '../types';
import { BoardPosition } from './BoardPosition';

/**
 * Represents state of go game in one exact turn. This includes position, captured stones and player to move.
 */
export class GameState {
  /**
   * Additional properties related to game state. Can be used to store some additional info for special go rules
   * or other purposes. When cloning, this will be shallow copied.
   */
  properties: Record<string, any> = {};

  constructor(
    public position: BoardPosition = new BoardPosition(),
    public blackCaptures: number = 0,
    public whiteCaptures: number = 0,
    public player: Color.Black | Color.White = Color.Black,
  ) {}

  clone(): GameState {
    const gameState = new GameState(
      this.position.clone(),
      this.blackCaptures,
      this.whiteCaptures,
      this.player,
    );
    gameState.properties = { ...this.properties };
    return gameState;
  }
}
