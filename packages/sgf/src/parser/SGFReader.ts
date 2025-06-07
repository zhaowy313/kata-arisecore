import { SGFSyntaxError } from './SGFSyntaxError';

/**
 * SGF parsing context. This is internal class for SGFParser.
 */
export class SGFReader {
  /** Custom data */
  source: string;

  /** Current character position */
  position: number = 0;

  /** Current line number */
  line: number = 1;

  /** Current char number (on the line) */
  column: number = 0;

  /**
   * @param source SGF string to read.
   */
  constructor(source: string) {
    this.source = source;
  }

  /**
   * Peeks the current character (whitespace included) without advancing.
   */
  peek(): string | null {
    return this.source[this.position] ?? null;
  }

  /**
   * Peeks the next significant character (ignoring whitespace characters).
   */
  peekSignificant(): string | null {
    let i = this.position;
    while (i < this.source.length && /\s/.test(this.source[i])) {
      i++;
    }
    return this.source[i] ?? null;
  }

  /**
   * Move pointer to next character and return it (including whitespace).
   */
  next() {
    const char = this.source[this.position++] ?? null;

    if (char === '\n') {
      this.line++;
      this.column = 0;
    } else {
      this.column++;
    }

    return char;
  }

  /**
   * Returns next significant character (ignoring whitespace characters).
   * If there is end of string, return undefined.
   */
  nextSignificant(): string | null {
    let char;

    do {
      char = this.next();
    } while (char !== null && /\s/.test(char));

    return char;
  }

  /**
   * Reads current significant character and if it isn't equal with the argument, throws an error.
   * Then move pointer to next character.
   */
  expect(expected: string): void {
    const actual = this.nextSignificant();
    if (actual !== expected) {
      throw new SGFSyntaxError(
        `Unexpected character ${actual}. Character ${expected} was expected.`,
        this.source,
        this.getPosition(),
      );
    }
  }

  /**
   * Gets current position for error reporting and more.
   */
  getPosition(): Pick<SGFReader, 'position' | 'line' | 'column'> {
    return { position: this.position, line: this.line, column: this.column };
  }
}
