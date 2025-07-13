/**
 * Context for parsing SGF files. SGF parser track current game and move numbers, you can add
 * additional properties. Context is mutable.
 */
export type SGFParsingContext<P = Record<string, unknown>> = P & {
  /**
   * The game number (order) in the SGF file. Numbered from 0.
   */
  game?: number;

  /**
   * The move (node) number in SGF game. Root node is 0, first move 1 and so on.
   */
  move?: number;
};
