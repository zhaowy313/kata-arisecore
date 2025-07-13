/**
 * Color enum representing black/white stones and empty fields on a Go board.
 */
export type Color = -1 | 0 | 1;

export const Color = {
  /**
   * Represents black color on the board.
   */
  Black: 1 as Color,

  /**
   * Represents empty field on the board.
   */
  Empty: 0 as Color,

  /**
   * Represents white color on the board.
   */
  White: -1 as Color,

  /**
   * @alias Color.Black
   */
  B: 1 as Color,

  /**
   * @alias Color.Empty
   */
  E: 0 as Color,

  /**
   * @alias Color.White
   */
  W: -1 as Color,

  /**
   * Switches the color to its opposite.
   */
  opposite(color: Color): Color {
    return (color * -1) as Color;
  },

  /**
   * Converts a string (SGF) representation of a color to the Color enum.
   * - 'B' = Color.Black
   * - 'W' = Color.White
   * - empty string or null = Color.Empty
   */
  fromString(color?: string | null): Color {
    if (!color) {
      return Color.Empty;
    }

    switch (color[0].toLowerCase()) {
      case 'b':
        return Color.Black;
      case 'w':
        return Color.White;
      default:
        throw new Error(`Invalid color string: ${color}`);
    }
  },

  /**
   * Converts a Color enum to its string (SGF) representation.
   * - Color.Black = 'B'
   * - Color.White = 'W'
   * - Color.Empty = ''
   */
  toString(color: Color): string {
    switch (color) {
      case Color.Black:
        return 'B';
      case Color.White:
        return 'W';
    }
    return '';
  },
};
