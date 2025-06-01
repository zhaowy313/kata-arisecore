import { SGFSyntaxError } from './SGFSyntaxError';
import { SGFParsingContext } from './SGFParsingContext';
import { PropIdent, SGFProperties, SGFCollection, SGFGameTree, SGFNode } from './sgfTypes';

/**
 * Contains methods for parsing SGF (Smart Game Format) strings.
 *
 * This parser implements the complete SGF specification and converts SGF strings
 * into structured JavaScript objects. The parser is stateless and can be reused
 * for multiple parsing operations.
 *
 * @module SGFParser
 * @see {@link https://www.red-bean.com/sgf/} SGF Specification
 *
 * @example
 * ```typescript
 * const parser = new SGFParser();
 * const collection = parser.parseCollection('(;GM[1]FF[4];B[pd];W[dd])');
 * console.log(collection[0].sequence[0].GM); // ['1']
 * ```
 */

const CODE_A = 'A'.charCodeAt(0);
const CODE_Z = 'Z'.charCodeAt(0);

/**
 * Checks if a character is an uppercase letter (A-Z).
 * @param char - The character to check
 * @returns True if the character is an uppercase letter, false otherwise
 */
function isCharUCLetter(char: string): boolean {
  if (!char) {
    return false;
  }

  const charCode = char.charCodeAt(0);
  return charCode >= CODE_A && charCode <= CODE_Z;
}

/**
 * Parses SGF strings into plain JavaScript objects following the SGF specification.
 *
 * This parser converts SGF files into structured data that can be used for game analysis,
 * format conversion, or further processing. Property values are preserved as strings
 * to maintain compatibility with the SGF format.
 *
 * For higher-level game manipulation, consider using the Kifu class which provides
 * a more convenient API for working with parsed SGF data.
 *
 * @example
 * ```typescript
 * // Parse a simple SGF game
 * const parser = new SGFParser();
 * const games = parser.parseCollection('(;GM[1]SZ[19];B[pd];W[dd])');
 *
 * // Access game properties
 * const firstGame = games[0];
 * const rootNode = firstGame.sequence[0];
 * console.log(rootNode.GM); // ['1'] - Game type
 * console.log(rootNode.SZ); // ['19'] - Board size
 * ```
 */
export class SGFParser {
  /**
   * Parses a single SGF property value enclosed in square brackets.
   *
   * Handles escape sequences according to SGF specification:
   * - `\]` becomes `]`
   * - `\\` becomes `\`
   * - `\newline` is ignored
   * - All other escaped characters are preserved as-is
   *
   * @param sgfString - The complete SGF string being parsed
   * @param optional - If true, returns empty string when no value is found instead of throwing
   * @param context - Internal parsing state (should not be provided externally)
   * @returns The parsed property value as a string
   * @throws {SGFSyntaxError} When required brackets are missing or string ends unexpectedly
   *
   * @example
   * ```typescript
   * // Parse a simple value
   * parser.parsePropertyValue('DT[2023-01-01]', false, context); // '2023-01-01'
   *
   * // Parse escaped value
   * parser.parsePropertyValue('C[This is a \\] bracket]', false, context); // 'This is a ] bracket'
   * ```
   */
  parsePropertyValue(
    sgfString: string,
    optional = false,
    context = new SGFParsingContext(),
  ): string {
    if (!sgfString) {
      throw new SGFSyntaxError('Cannot parse property value from empty string', sgfString, context);
    }

    if (optional && context.currentNonWhitespaceChar(sgfString) !== '[') {
      return '';
    }

    let value = '';

    // Process opening bracket and read first character
    let char = context.assertCharAndMoveToNext(sgfString, '[');

    while (char !== ']') {
      if (!char) {
        throw new SGFSyntaxError(
          'Unexpected end of SGF string inside property value',
          sgfString,
          context,
        );
      } else if (char === '\\') {
        // Handle escape sequences
        char = context.moveToNextChar(sgfString);

        if (!char) {
          throw new SGFSyntaxError(
            'Unexpected end of SGF string after escape character',
            sgfString,
            context,
          );
        } else if (char === '\n') {
          // Escaped newlines are ignored per SGF spec
          char = context.moveToNextChar(sgfString);
          continue;
        }
        // All other escaped characters are preserved
      }

      value += char;
      char = context.moveToNextChar(sgfString);
    }

    context.assertCharAndMoveToNext(sgfString, ']');
    return value;
  }

  /**
   * Parses a property identifier consisting of one or more uppercase letters.
   *
   * Property identifiers in SGF must start with an uppercase letter and can contain
   * only uppercase letters. This follows the SGF specification for property names.
   *
   * @param sgfString - The complete SGF string being parsed
   * @param context - Internal parsing state (should not be provided externally)
   * @returns The property identifier as a string
   * @throws {SGFSyntaxError} When the identifier contains invalid characters
   *
   * @example
   * ```typescript
   * parser.parsePropertyIdent('GM[1]', context); // 'GM'
   * parser.parsePropertyIdent('PB[Black Player]', context); // 'PB'
   * ```
   */
  parsePropertyIdent(sgfString: string, context = new SGFParsingContext()): PropIdent {
    if (!sgfString) {
      throw new SGFSyntaxError(
        'Cannot parse property identifier from empty string',
        sgfString,
        context,
      );
    }

    let identifier = '';
    let char = context.currentNonWhitespaceChar(sgfString);

    if (!isCharUCLetter(char)) {
      throw new SGFSyntaxError(
        `Property identifier must start with uppercase letter, found: '${char || 'end of string'}'`,
        sgfString,
        context,
      );
    }

    identifier += char;

    while ((char = context.moveToNextChar(sgfString))) {
      if (!isCharUCLetter(char)) {
        break;
      }
      identifier += char;
    }

    return identifier as PropIdent;
  }

  /**
   * Parses a sequence of property values for a single property.
   *
   * Some SGF properties can have multiple values (e.g., multiple stones placed at once).
   * This method parses all consecutive property values for a single property.
   *
   * @param sgfString - The complete SGF string being parsed
   * @param context - Internal parsing state (should not be provided externally)
   * @returns Array of property values as strings
   * @throws {SGFSyntaxError} When property values are malformed
   *
   * @example
   * ```typescript
   * // Single value
   * parser.parsePropertyValues('GM[1]', context); // ['1']
   *
   * // Multiple values (e.g., multiple stones)
   * parser.parsePropertyValues('AB[pd][dd][pp]', context); // ['pd', 'dd', 'pp']
   * ```
   */
  parsePropertyValues(sgfString: string, context = new SGFParsingContext()): string[] {
    const values: string[] = [];

    // Parse the first required value
    const firstValue = this.parsePropertyValue(sgfString, false, context);
    values.push(firstValue);

    // Parse any additional optional values
    let additionalValue: string;
    while ((additionalValue = this.parsePropertyValue(sgfString, true, context))) {
      values.push(additionalValue);
    }

    return values;
  }

  /**
   * Parses a complete SGF property (identifier + values).
   *
   * A property consists of a property identifier followed by one or more values.
   * This is a fundamental building block of SGF nodes.
   *
   * @param sgfString - The complete SGF string being parsed
   * @param context - Internal parsing state (should not be provided externally)
   * @returns Tuple of [property identifier, array of values] or undefined if no property found
   *
   * @example
   * ```typescript
   * parser.parseProperty('GM[1]', context); // ['GM', ['1']]
   * parser.parseProperty('AB[pd][dd]', context); // ['AB', ['pd', 'dd']]
   * ```
   */
  parseProperty(
    sgfString: string,
    context = new SGFParsingContext(),
  ): [PropIdent, string[]] | undefined {
    const currentChar = context.currentNonWhitespaceChar(sgfString);

    if (!isCharUCLetter(currentChar)) {
      return undefined;
    }

    try {
      const identifier = this.parsePropertyIdent(sgfString, context);
      const values = this.parsePropertyValues(sgfString, context);
      return [identifier, values];
    } catch (error) {
      if (error instanceof SGFSyntaxError) {
        throw new SGFSyntaxError(`Error parsing property: ${error.message}`, sgfString, context);
      }
      throw error;
    }
  }

  /**
   * Parses a complete SGF node starting with a semicolon.
   *
   * A node contains zero or more properties and represents a single position
   * or move in the game tree. The first character must be a semicolon.
   *
   * @param sgfString - The complete SGF string being parsed
   * @param context - Internal parsing state (should not be provided externally)
   * @returns Object containing all properties of the node
   * @throws {SGFSyntaxError} When node format is invalid
   *
   * @example
   * ```typescript
   * parser.parseNode(';GM[1]SZ[19]', context);
   * // { GM: ['1'], SZ: ['19'] }
   *
   * parser.parseNode(';B[pd]', context);
   * // { B: ['pd'] }
   * ```
   */
  parseNode(sgfString: string, context = new SGFParsingContext()): SGFNode {
    context.assertCharAndMoveToNext(sgfString, ';');

    const properties: SGFProperties = {};
    let property: [PropIdent, string[]] | undefined;

    while ((property = this.parseProperty(sgfString, context))) {
      const [identifier, values] = property;

      if (properties[identifier]) {
        throw new SGFSyntaxError(
          `Duplicate property '${identifier}' found in node`,
          sgfString,
          context,
        );
      }

      properties[identifier] = values;
    }

    return properties;
  }

  /**
   * Parses a sequence of SGF nodes.
   *
   * A sequence represents the main line of play and consists of one or more nodes.
   * Each node in the sequence represents a consecutive position in the game.
   *
   * @param sgfString - The complete SGF string being parsed
   * @param context - Internal parsing state (should not be provided externally)
   * @returns Array of nodes representing the main sequence
   * @throws {SGFSyntaxError} When sequence format is invalid
   *
   * @example
   * ```typescript
   * parser.parseSequence(';GM[1];B[pd];W[dd]', context);
   * // [{ GM: ['1'] }, { B: ['pd'] }, { W: ['dd'] }]
   * ```
   */
  parseSequence(sgfString: string, context = new SGFParsingContext()): SGFNode[] {
    const sequence: SGFNode[] = [];

    // Parse the first required node
    sequence.push(this.parseNode(sgfString, context));

    // Parse any additional nodes in the sequence
    while (context.currentNonWhitespaceChar(sgfString) === ';') {
      sequence.push(this.parseNode(sgfString, context));
    }

    return sequence;
  }

  /**
   * Parses a complete SGF game tree enclosed in parentheses.
   *
   * A game tree consists of a main sequence and zero or more child game trees
   * representing variations. This represents a complete game or game fragment.
   *
   * @param sgfString - The complete SGF string being parsed
   * @param context - Internal parsing state (should not be provided externally)
   * @returns Game tree object with sequence and children
   * @throws {SGFSyntaxError} When game tree format is invalid
   *
   * @example
   * ```typescript
   * parser.parseGameTree('(;GM[1];B[pd];W[dd])', context);
   * // { sequence: [{ GM: ['1'] }, { B: ['pd'] }, { W: ['dd'] }], children: [] }
   *
   * // With variations
   * parser.parseGameTree('(;GM[1];B[pd](;W[dd])(;W[pp]))', context);
   * // { sequence: [{ GM: ['1'] }, { B: ['pd'] }], children: [...] }
   * ```
   */
  parseGameTree(sgfString: string, context = new SGFParsingContext()): SGFGameTree {
    context.assertCharAndMoveToNext(sgfString, '(');

    const sequence = this.parseSequence(sgfString, context);
    let children: SGFGameTree[] = [];

    // Parse any child game trees (variations)
    if (context.currentNonWhitespaceChar(sgfString) === '(') {
      children = this.parseCollection(sgfString, context);
    }

    context.assertCharAndMoveToNext(sgfString, ')');

    return { sequence, children };
  }

  /**
   * Parses a complete SGF collection containing one or more game trees.
   *
   * This is the main entry point for parsing SGF files. A collection can contain
   * multiple independent games, though most SGF files contain only one game.
   *
   * @param sgfString - The complete SGF string to parse
   * @param context - Internal parsing state (should not be provided externally)
   * @returns Array of game trees representing all games in the collection
   * @throws {SGFSyntaxError} When SGF format is invalid
   *
   * @example
   * ```typescript
   * // Single game
   * parser.parseCollection('(;GM[1]FF[4];B[pd];W[dd])');
   * // [{ sequence: [...], children: [] }]
   *
   * // Multiple games
   * parser.parseCollection('(;GM[1];B[pd])(;GM[1];B[dd])');
   * // [{ sequence: [...], children: [] }, { sequence: [...], children: [] }]
   * ```
   */
  parseCollection(sgfString: string, context = new SGFParsingContext()): SGFCollection {
    if (!sgfString || !sgfString.trim()) {
      throw new SGFSyntaxError('Cannot parse empty SGF string', sgfString, context);
    }

    const gameTrees: SGFCollection = [];

    // Parse the first required game tree
    gameTrees.push(this.parseGameTree(sgfString, context));

    // Parse any additional game trees
    while (context.currentNonWhitespaceChar(sgfString) === '(') {
      gameTrees.push(this.parseGameTree(sgfString, context));
    }

    return gameTrees;
  }
}
