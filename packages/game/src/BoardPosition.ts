import { Color, curryLast, Stone } from '@wgojs/common';

export type BoardPosition = {
  readonly rows: number;
  readonly cols: number;
  readonly grid: Int8Array;
};

export const BoardPosition = {
  /**
   * An empty 19x19 board position.
   */
  empty19: {
    rows: 19,
    cols: 19,
    grid: new Int8Array(361),
  } as BoardPosition,

  /**
   * An empty 13x13 board position.
   */
  empty13: {
    rows: 13,
    cols: 13,
    grid: new Int8Array(169),
  } as BoardPosition,

  /**
   * An empty 9x9 board position.
   */
  empty9: {
    rows: 9,
    cols: 9,
    grid: new Int8Array(81),
  } as BoardPosition,

  /**
   * Creates a new BoardPosition with the given size.
   *
   * @param rows Number of rows in the position.
   * @param cols If not specified, rows will be used for both dimensions.
   * @returns A new BoardPosition instance.
   */
  create(rows: number, cols = rows): BoardPosition {
    if (rows <= 0 || cols <= 0) {
      throw new TypeError('Invalid board size.');
    }

    return {
      rows,
      cols,
      grid: new Int8Array(rows * cols),
    };
  },

  // Basic manipulation methods

  /**
   * Gets the color of the stone at the specified coordinates.
   *
   * @param position The BoardPosition instance.
   * @param x x coordinate of the stone.
   * @param y y coordinate of the stone.
   * @returns The color of the stone at the specified coordinates, or undefined if the coordinates are out of bounds.
   */
  get(position: BoardPosition, x: number, y: number): Color | undefined {
    if (!BoardPosition.isOnBoard(position, x, y)) {
      return undefined;
    }

    return position.grid[y * position.cols + x] as Color;
  },

  /**
   * Sets the color of the stone at the specified coordinates.
   *
   * @param position The BoardPosition instance.
   * @param x x coordinate of the stone.
   * @param y y coordinate of the stone.
   * @param color The color to set at the specified coordinates.
   * @returns A new BoardPosition instance with the updated stone.
   */
  set: curryLast((position: BoardPosition, x: number, y: number, color: Color): BoardPosition => {
    if (!BoardPosition.isOnBoard(position, x, y)) {
      throw new Error('Attempt to set field outside of position.');
    }

    const grid = position.grid.slice();
    grid[y * position.cols + x] = color;

    return {
      ...position,
      grid,
    };
  }),

  /**
   * Checks if the specified coordinates are within the bounds of the position.
   *
   * @param position BoardPosition instance to check.
   * @param x x coordinate to check.
   * @param y y coordinate to check.
   * @returns True if the coordinates are within the bounds of the position, false otherwise.
   */
  isOnBoard(position: BoardPosition, x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < position.cols && y < position.rows;
  },

  /**
   * Compares two BoardPosition instances for equality.
   *
   * @param position1 First BoardPosition instance to compare.
   * @param position2 Second BoardPosition instance to compare.
   * @returns True if the positions are equal, false otherwise.
   */
  equals(position1: BoardPosition, position2: BoardPosition): boolean {
    if (position1.rows !== position2.rows || position1.cols !== position2.cols) {
      return false;
    }
    return position1.grid.every((value, index) => value === position2.grid[index]);
  },

  /**
   * Gets all stones of a specific color from the position. Can be used for rendering or counting.
   *
   * @param position The BoardPosition instance.
   * @param color The color of the stones to get.
   * @returns
   */
  getStones(position: BoardPosition): Stone[] {
    const stones: Stone[] = [];

    for (let y = 0; y < position.rows; y++) {
      for (let x = 0; x < position.cols; x++) {
        if (position.grid[y * position.cols + x]) {
          stones.push({ x, y, color: position.grid[y * position.cols + x] as Color });
        }
      }
    }
    return stones;
  },

  /**
   * Removes a stones from the position. This is useful for capturing stones. You can get
   * connected group of stones with `BoardPosition.getChain()` and then remove them with this method.
   *
   * @param position The BoardPosition instance.
   * @param stones An array of stones to remove.
   * @returns A new BoardPosition instance with the specified stones removed.
   */
  removeStones: curryLast((position: BoardPosition, stones: Stone[]): BoardPosition => {
    const grid = position.grid.slice();

    stones.forEach((point) => {
      grid[point.y * position.cols + point.x] = Color.Empty;
    });

    return {
      ...position,
      grid,
    };
  }),

  // From/to array methods

  /**
   * Creates a BoardPosition from a 2D array of colors.
   *
   * @param array 2D array of colors to convert to BoardPosition.
   * @returns A new BoardPosition instance created from the array.
   */
  fromArray(array: Color[][]): BoardPosition {
    const rows = array.length;
    if (rows === 0) {
      throw new TypeError('Cannot create BoardPosition from empty array.');
    }
    const cols = array[0].length;
    if (cols === 0) {
      throw new TypeError('Cannot create BoardPosition from empty array.');
    }

    const position = BoardPosition.create(rows, cols);

    for (let y = 0; y < rows; y++) {
      if (array[y].length !== cols) {
        throw new TypeError('All rows in the array must have the same length.');
      }
      for (let x = 0; x < cols; x++) {
        position.grid[y * cols + x] = array[y][x];
      }
    }

    return position;
  },

  /**
   * Converts a BoardPosition to a 2D array of colors.
   *
   * @param position BoardPosition instance to convert to a 2D array.
   * @returns A 2D array representation of the BoardPosition.
   */
  toArray(position: BoardPosition): Color[][] {
    const array: Color[][] = [];
    for (let y = 0; y < position.rows; y++) {
      const row: Color[] = [];
      for (let x = 0; x < position.cols; x++) {
        row.push(position.grid[y * position.cols + x] as Color);
      }
      array.push(row);
    }
    return array;
  },

  /**
   * Converts a BoardPosition to a string representation for debugging or display.
   *
   * @param position BoardPosition instance to convert to a string representation.
   * @returns A string representation of the BoardPosition, suitable for debugging or display.
   */
  toString(position: BoardPosition): string {
    const TL = '┌';
    const TM = '┬';
    const TR = '┐';
    const ML = '├';
    const MM = '┼';
    const MR = '┤';
    const BL = '└';
    const BM = '┴';
    const BR = '┘';
    const BS = '●';
    const WS = '○';
    const HF = '─'; // horizontal fill

    let output = '   ';

    for (let i = 0; i < position.cols; i++) {
      output += i < 9 ? `${i} ` : i;
    }

    output += '\n';

    for (let y = 0; y < position.rows; y++) {
      for (let x = 0; x < position.cols; x++) {
        const color = position.grid[y * position.cols + x]
          ? position.grid[y * position.cols + x] === 1
            ? BS
            : WS
          : null;

        if (x === 0) {
          output += `${y < 10 ? ` ${y}` : y} `;
        }

        if (color) {
          output += color;
        } else {
          let char;

          if (y === 0) {
            // top line
            if (x === 0) {
              char = TL;
            } else if (x < position.cols - 1) {
              char = TM;
            } else {
              char = TR;
            }
          } else if (y < position.rows - 1) {
            // middle line
            if (x === 0) {
              char = ML;
            } else if (x < position.cols - 1) {
              char = MM;
            } else {
              char = MR;
            }
          } else {
            // bottom line
            if (x === 0) {
              char = BL;
            } else if (x < position.cols - 1) {
              char = BM;
            } else {
              char = BR;
            }
          }

          output += char;
        }

        if (x === position.cols - 1) {
          if (y !== position.rows - 1) {
            output += '\n';
          }
        } else {
          output += HF;
        }
      }
    }

    return output;
  },

  // Detecting chains (groups), liberties and other go related methods

  /**
   * Gets the chain (group of connected stones) starting from the specified coordinates.
   *
   * @param position The BoardPosition instance.
   * @param x x coordinate of the starting stone.
   * @param y y coordinate of the starting stone.
   * @returns An array of points representing the chain of connected stones.
   */
  getChain(position: BoardPosition, x: number, y: number): Stone[] {
    if (!BoardPosition.isOnBoard(position, x, y)) {
      throw new Error('Coordinates are out of bounds.');
    }

    const initialField = position.grid[y * position.cols + x];
    if (!initialField) {
      return [];
    }

    const chain: Stone[] = [];
    const visited = new Set<string>();

    function explore(px: number, py: number) {
      if (!BoardPosition.isOnBoard(position, px, py)) {
        return;
      }
      const key = `${px},${py}`;
      if (visited.has(key)) {
        return;
      }
      visited.add(key);

      if (position.grid[py * position.cols + px] !== initialField) {
        return;
      }

      chain.push({ x: px, y: py, color: initialField as Color });

      // Explore neighbors
      explore(px - 1, py);
      explore(px + 1, py);
      explore(px, py - 1);
      explore(px, py + 1);
    }

    explore(x, y);
    return chain;
  },

  /**
   * Checks if a stone or group on the given coordinates has at least one liberty. This can be called
   * before making move to check suicide and after move to check neighbors for capturing.
   *
   * @param position The BoardPosition instance.
   * @param x x coordinate of the stone.
   * @param y y coordinate of the stone.
   * @returns True if the stone or group has at least one liberty, false otherwise.
   */
  hasLiberties(position: BoardPosition, x: number, y: number): boolean {
    if (!BoardPosition.isOnBoard(position, x, y)) {
      throw new Error('Coordinates are out of bounds.');
    }

    const color = position.grid[y * position.cols + x];
    if (!color) {
      throw new Error('No stone at the specified coordinates.');
    }

    const visited = new Set<string>();
    visited.add(`${x},${y}`);

    function checkLiberties(px: number, py: number): boolean {
      if (!BoardPosition.isOnBoard(position, px, py)) {
        return false;
      }
      const key = `${px},${py}`;
      if (visited.has(key)) {
        return false;
      }
      visited.add(key);

      const currentColor = position.grid[py * position.cols + px];
      if (!currentColor) {
        return true; // Found a liberty
      }
      if (currentColor !== color) {
        return false; // Not the same color
      }

      // Check neighbors
      return (
        checkLiberties(px - 1, py) ||
        checkLiberties(px + 1, py) ||
        checkLiberties(px, py - 1) ||
        checkLiberties(px, py + 1)
      );
    }

    return (
      checkLiberties(x - 1, y) ||
      checkLiberties(x + 1, y) ||
      checkLiberties(x, y - 1) ||
      checkLiberties(x, y + 1)
    );
  },
};
