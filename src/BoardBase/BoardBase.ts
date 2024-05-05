import { EventEmitter } from '../utils/EventEmitter';
import makeConfig, { PartialRecursive } from '../utils/makeConfig';
import { Board, BoardBaseConfig, BoardViewport } from './types';
import { BoardObject } from '.';
import FieldBoardObject from './FieldBoardObject';
import { defaultBoardBaseConfig } from './defaultConfig';
import { Point } from '../types';

/**
 * Board class with basic functionality which can be used for creating boards for web.
 *
 * TODO: rename.
 */
export abstract class BoardBase extends EventEmitter implements Board {
  readonly config: BoardBaseConfig;
  readonly element: HTMLElement;

  protected objects: BoardObject[] = [];

  // Offsets (TODO: rename and check)
  left: number;
  right: number;
  bottom: number;
  top: number;
  touchArea: HTMLElement;

  constructor(element: HTMLElement, config: PartialRecursive<BoardBaseConfig> = {}) {
    super();

    // merge user config with default
    this.element = element;
    this.touchArea = element;
    this.config = makeConfig(defaultBoardBaseConfig, config);
  }

  /**
   * Updates dimensions and redraws everything
   */
  abstract resize(): void;

  /**
   * Redraw everything.
   */
  abstract redraw(): void;

  /**
   * Add board object. Main function for adding graphics on the board.
   *
   * @param boardObject
   */
  addObject(boardObject: BoardObject | BoardObject[]) {
    // handling multiple objects
    if (Array.isArray(boardObject)) {
      for (let i = 0; i < boardObject.length; i++) {
        this.addObject(boardObject[i]);
      }
      return;
    }

    if (!this.hasObject(boardObject)) {
      this.objects.push(boardObject);
    }
  }

  /**
   * Method to update board object. Can be called, when some params of boardObject changes.
   * It is similar to redraw(), but only boardObject can be redrawn, so performance can/should be better.
   *
   * @param boardObject
   */
  abstract updateObject(boardObject: BoardObject | BoardObject[]): void;

  /**
   * Remove board object. Main function for removing graphics on the board.
   *
   * @param boardObject
   */
  removeObject(boardObject: BoardObject | BoardObject[]) {
    // handling multiple objects
    if (Array.isArray(boardObject)) {
      for (let i = 0; i < boardObject.length; i++) {
        this.removeObject(boardObject[i]);
      }
      return;
    }

    const objectPos = this.objects.indexOf(boardObject);

    if (objectPos === -1) {
      // object isn't on the board, ignore it
      return;
    }

    this.objects.splice(objectPos, 1);
  }

  /**
   * Removes all objects on specified field.
   *
   * @param x
   * @param y
   */
  removeObjectsAt(x: number, y: number) {
    this.objects.forEach((obj) => {
      if (obj instanceof FieldBoardObject && obj.x === x && obj.y === y) {
        this.removeObject(obj);
      }
    });
  }

  /**
   * Removes all objects on the board.
   */
  removeAllObjects() {
    this.objects = [];
  }

  /**
   * Returns true if object is already on the board.
   *
   * @param boardObject
   */
  hasObject(boardObject: BoardObject) {
    return this.objects.indexOf(boardObject) >= 0;
  }

  /**
   * Sets width of the board, height will be automatically computed. Then everything will be redrawn.
   *
   * @param width
   */
  setWidth(width: number) {
    this.config.width = width;
    this.config.height = 0;
    this.resize();
  }

  /**
   * Sets height of the board, width will be automatically computed. Then everything will be redrawn.
   *
   * @param height
   */
  setHeight(height: number) {
    this.config.width = 0;
    this.config.height = height;
    this.resize();
  }

  /**
   * Sets exact dimensions of the board. Then everything will be redrawn.
   *
   * @param width
   * @param height
   */
  setDimensions(width: number, height: number) {
    this.config.width = width;
    this.config.height = height;
    this.resize();
  }

  /**
   * Get currently visible section of the board.
   */

  getViewport() {
    return this.config.viewport;
  }

  /**
   * Set section of the board to be displayed.
   */
  setViewport(viewport: BoardViewport) {
    this.config.viewport = viewport;
  }

  /**
   * Helper to get board size.
   */
  getSize() {
    return {
      x: this.config.sizeX != null ? this.config.sizeX : this.config.size,
      y: this.config.sizeY != null ? this.config.sizeY : this.config.size,
    };
  }

  /**
   * Helper to set board size.
   */
  setSize(sizeX: number = 19, sizeY: number = sizeX) {
    this.config.sizeX = sizeX;
    this.config.sizeY = sizeY;
  }

  /**
   * Returns true, if coordinates around board are visible.
   */
  getCoordinates() {
    return this.config.coordinates;
  }

  /**
   * Enable or disable coordinates around board.
   */
  setCoordinates(coordinates: boolean) {
    this.config.coordinates = coordinates;
  }

  on<T extends string>(
    type: T,
    callback: (evt: { target: any; type: T; point: Point | null }) => void,
  ) {
    super.on(type, callback);
    this.registerBoardListener(type);

    return this;
  }

  registerBoardListener(type: string) {
    this.touchArea.addEventListener(type, (evt) => {
      if ((evt as any).layerX != null) {
        const pos = this.getRelativeCoordinates((evt as any).layerX, (evt as any).layerY);
        this.emit(type, { ...evt, point: pos });
      } else {
        this.emit(type, evt);
      }
    });
  }

  getRelativeCoordinates(absoluteX: number, absoluteY: number) {
    // new hopefully better translation of coordinates

    const fieldWidth = this.touchArea.offsetWidth / this.right;
    const fieldHeight = this.touchArea.offsetHeight / this.bottom;

    const x = Math.round(absoluteX / fieldWidth + this.left);
    const y = Math.round(absoluteY / fieldHeight + this.top);
    const size = this.getSize();

    if (x < 0 || x >= size.x || y < 0 || y >= size.y) {
      return null;
    }

    return { x, y };
  }
}
