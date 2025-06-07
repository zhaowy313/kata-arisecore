import { SGFSyntaxError } from './SGFSyntaxError';
import { SGFReader } from './SGFReader';
import { PropIdent, SGFCollection, SGFGameTree, SGFNode, StandardSGFProperties } from '../sgfTypes';
import { SGFPropertyMapper } from '../mapper/SGFPropertyMapper';
import { StandardSGFPropertyMapper } from '../mapper/StandardSGFPropertyMapper';

/**
 * Configuration options for {@link SGFParser}.
 *
 * @template SGF_PROPS - The type of properties to use for parsed nodes.
 * @property propertyMapper - Optional custom property mapper for converting SGF property values to JavaScript types.
 */
export interface SGFParserConfig<
  SGF_PROPS extends Record<string, unknown> = StandardSGFProperties,
  GAME_TREE = SGFGameTree<SGF_PROPS>,
  COLLECTION = SGFCollection<SGF_PROPS>,
  CONTEXT extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * Optional custom property mapper for converting SGF property values to JavaScript types.
   * If not provided, the default {@link StandardSGFPropertyMapper} will be used.
   */
  propertyMapper?: SGFPropertyMapper<SGF_PROPS>;

  /**
   * This is called once per node during traversal of the SGF tree. Can be used to
   * extend the parser functionality, e.g. to collect additional information, validate nodes, etc.
   * You can use `context.data` to store any custom data you need during parsing.
   *
   * @param node
   * @param context
   * @returns
   */
  visitNode?: (node: SGFNode<SGF_PROPS>, context: CONTEXT) => void;

  /**
   * This is called, when the parser finishes parsing a game tree. You can transform the
   * tree structure here, or convert it to a different format.
   *
   * @param tree
   * @param context
   * @returns
   */
  transformTree?: (
    sequence: SGFNode<SGF_PROPS>[],
    children: GAME_TREE[],
    context: CONTEXT,
  ) => GAME_TREE;

  /**
   * This is called, when the parser finishes parsing a collection of game trees.
   * You can transform the collection structure here, or convert it to a different format.
   * This is useful, if you want to generate a different structure from the parsed SGF.
   *
   * @param collection
   * @param context
   * @returns
   */
  transformCollection?: (collection: GAME_TREE[], context: CONTEXT) => COLLECTION;
}

/**
 * SGFParser parses SGF (Smart Game Format) strings into structured JavaScript objects.
 *
 * This parser implements the complete SGF specification, supporting all standard properties,
 * variations, and collections. It is stateless and reusable for multiple parsing operations.
 * The parser can be customized with a property mapper to control how SGF property values
 * are converted to JavaScript types.
 *
 * @see {@link https://www.red-bean.com/sgf/} SGF Specification
 *
 * @example
 * ```typescript
 * const parser = new SGFParser();
 * const collection = parser.parseCollection('(;GM[1]FF[4];B[pd];W[dd])');
 * console.log(collection[0].sequence[0].GM); // ['1']
 * ```
 */
export class SGFParser<
  SGF_PROPS extends Record<string, unknown> = StandardSGFProperties,
  GAME_TREE = SGFGameTree<SGF_PROPS>,
  COLLECTION = SGFCollection<SGF_PROPS>,
  CONTEXT extends Record<string, unknown> = Record<string, unknown>,
> {
  propertyMapper: SGFPropertyMapper<SGF_PROPS>;
  visitNode?: (node: SGFNode<SGF_PROPS>, context: CONTEXT) => void;
  transformTree?: (
    sequence: SGFNode<SGF_PROPS>[],
    children: GAME_TREE[],
    context: CONTEXT,
  ) => GAME_TREE;
  transformCollection?: (collection: GAME_TREE[], context: CONTEXT) => COLLECTION;

  /**
   * Creates a new SGFParser instance.
   *
   * @param config - Optional configuration object. You can provide a custom property mapper
   *                 to control how SGF property values are converted to JavaScript types.
   *                 If omitted, the default {@link StandardSGFPropertyMapper} is used.
   *
   * @example
   * ```typescript
   * // Using default property mapping:
   * const parser = new SGFParser();
   *
   * // Using a custom property mapper:
   * const parser = new SGFParser({ propertyMapper: myCustomMapper });
   * ```
   */
  constructor(config?: SGFParserConfig<SGF_PROPS, GAME_TREE, COLLECTION, CONTEXT>) {
    this.propertyMapper = config?.propertyMapper || (StandardSGFPropertyMapper as any);
    this.visitNode = config?.visitNode as any;
    this.transformTree = config?.transformTree as any;
    this.transformCollection = config?.transformCollection as any;
  }

  /**
   * Parses a property identifier consisting of one or more uppercase letters.
   *
   * Property identifiers in SGF must start with an uppercase letter and can contain
   * only uppercase letters. This follows the SGF specification for property names.
   *
   * EBNF definition of *PropIdent* is `PropIdent = UcLetter { UcLetter }`.
   *
   * @param reader - Internal SGF reader
   * @returns The property identifier as a string
   * @throws {SGFSyntaxError} When the identifier contains invalid characters
   */
  #parsePropertyIdent(reader: SGFReader): string {
    let identifier = '';
    let char = reader.nextSignificant();

    if (!char || !isCharUCLetter(char)) {
      throw new SGFSyntaxError(
        `Property identifier must start with uppercase letter, found: '${char || 'end of string'}'`,
        reader.source,
        reader.getPosition(),
      );
    }

    identifier += char;

    while ((char = reader.peek())) {
      if (!isCharUCLetter(char)) {
        break;
      }
      identifier += char;
      reader.next();
    }

    return identifier as PropIdent;
  }

  /**
   * Parses a single SGF property value enclosed in square brackets.
   *
   * Handles escape sequences according to SGF specification:
   * - `\]` becomes `]`
   * - `\\` becomes `\`
   * - `\newline` is ignored
   * - All other escaped characters are preserved as-is
   *
   * EBNF definition of *PropValue* is `PropValue = "[" CValueType "]"`.
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
   * parser.parsePropertyValue('[2023-01-01]'); // '2023-01-01'
   *
   * // Parse escaped value
   * parser.parsePropertyValue('[This is a \\] bracket]'); // 'This is a ] bracket'
   * ```
   */
  #parsePropertyValue(reader: SGFReader): string {
    let value = '';

    // Process opening bracket and read first character
    reader.expect('[');

    let char = reader.next();
    while (char !== ']') {
      if (!char) {
        throw new SGFSyntaxError(
          'Unexpected end of SGF string inside property value',
          reader.source,
          reader.getPosition(),
        );
      } else if (char === '\\') {
        // Handle escape sequences
        char = reader.next();

        if (!char) {
          throw new SGFSyntaxError(
            'Unexpected end of SGF string after escape character',
            reader.source,
            reader.getPosition(),
          );
        } else if (char === '\n') {
          // Escaped newlines are ignored per SGF spec
          char = reader.next();
          continue;
        }
        // All other escaped characters are preserved
      }

      value += char;
      char = reader.next();
    }

    return value;
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
   * parser.parsePropertyValues('[1]'); // ['1']
   *
   * // Multiple values (e.g., multiple stones)
   * parser.parsePropertyValues('[pd][dd][pp]'); // ['pd', 'dd', 'pp']
   * ```
   */
  #parsePropertyValues(reader: SGFReader): string[] {
    const values: string[] = [];

    // Parse the first required value
    values.push(this.#parsePropertyValue(reader));

    // Parse any additional optional values
    while (reader.peekSignificant() === '[') {
      values.push(this.#parsePropertyValue(reader));
    }

    return values.filter((value) => value !== ''); // Filter out empty values
  }

  #parseProperty<T extends keyof SGF_PROPS>(reader: SGFReader): [T, SGF_PROPS[T]] | undefined {
    const currentChar = reader.peekSignificant();

    if (!currentChar || !isCharUCLetter(currentChar)) {
      return undefined;
    }

    try {
      const identifier = this.#parsePropertyIdent(reader);
      const values = this.#parsePropertyValues(reader);
      return [identifier, this.propertyMapper.map(identifier, values)] as [T, SGF_PROPS[T]];
    } catch (error) {
      if (error instanceof SGFSyntaxError) {
        throw new SGFSyntaxError(
          `Error parsing property: ${error.message}`,
          reader.source,
          reader.getPosition(),
        );
      }
      throw error;
    }
  }

  /**
   * Parses a complete SGF property (identifier + values). You probably won't need this method
   * directly, it is used internally by `parseProperties`.
   *
   * A property consists of a property identifier followed by one or more values.
   * This is a fundamental building block of SGF nodes.
   *
   * EBNF definition of *Property* is `Property = PropIdent PropValue { PropValue }`.
   *
   * @param sgfString - The complete SGF string being parsed
   * @param context - Internal parsing state (should not be provided externally)
   * @returns Tuple of [property identifier, array of values] or undefined if no property found
   *
   * @example
   * ```typescript
   * parser.parseProperty('GM[1]'); // ['GM', ['1']]
   * parser.parseProperty('AB[pd][dd]'); // ['AB', ['pd', 'dd']]
   * ```
   */
  parseProperty<T extends keyof SGF_PROPS>(sgfString: string): [T, SGF_PROPS[T]] | undefined {
    return this.#parseProperty(new SGFReader(sgfString));
  }

  #parseProperties(reader: SGFReader): SGF_PROPS {
    const properties = {} as SGF_PROPS;
    let property: [keyof SGF_PROPS, any] | undefined;

    while ((property = this.#parseProperty(reader))) {
      const [identifier, values] = property;

      if (properties[identifier]) {
        throw new SGFSyntaxError(
          `Duplicate property '${identifier as string}' found in node`,
          reader.source,
          reader.getPosition(),
        );
      }

      properties[identifier] = values;
    }

    return properties;
  }

  /**
   * Parses all properties of a single SGF node. Use this if you want to get
   * properties from a single node.
   *
   * @param sgfString - The complete SGF string being parsed
   * @param context - Internal parsing state (should not be provided externally)
   * @returns Object containing all properties of the node, where keys are property identifiers
   * @throws {SGFSyntaxError} When duplicate properties are found or node format is invalid
   *
   * @example
   * ```typescript
   * parser.parseProperties('GM[1]B[pd]');
   * // { GM: ['1'], B: ['pd'] }
   * ```
   */
  parseProperties(sgfString: string): SGF_PROPS {
    return this.#parseProperties(new SGFReader(sgfString));
  }

  /**
   * Parses a complete SGF node starting with a semicolon.
   *
   * A node contains zero or more properties and represents a single position
   * or move in the game tree. The first character must be a semicolon.
   *
   * EBNF definition of *Node* is `Node = ";" { Property }`.
   *
   * @param sgfString - The complete SGF string being parsed
   * @param context - Internal parsing state (should not be provided externally)
   * @returns Object containing all properties of the node
   * @throws {SGFSyntaxError} When node format is invalid
   *
   * @example
   * ```typescript
   * parser.parseNode(';GM[1]SZ[19]');
   * // { GM: ['1'], SZ: ['19'] }
   * ```
   */
  #parseNode(reader: SGFReader, context: CONTEXT): SGFNode<SGF_PROPS> {
    reader.expect(';');

    const node = this.#parseProperties(reader);
    this.visitNode?.(node, context);

    return node;
  }

  /**
   * Parses a sequence of SGF nodes.
   *
   * A sequence represents the main line of play and consists of one or more nodes.
   * Each node in the sequence represents a consecutive position in the game.
   *
   * EBNF definition of *Sequence* is `Sequence = Node { Node }`.
   *
   * @param sgfString - The complete SGF string being parsed
   * @param context - Internal parsing state (should not be provided externally)
   * @returns Array of nodes representing the main sequence
   * @throws {SGFSyntaxError} When sequence format is invalid
   *
   * @example
   * ```typescript
   * parser.parseSequence(';GM[1];B[pd];W[dd]');
   * // [{ GM: ['1'] }, { B: ['pd'] }, { W: ['dd'] }]
   * ```
   */
  #parseSequence(reader: SGFReader, context: CONTEXT): SGFNode<SGF_PROPS>[] {
    const sequence: SGFNode<SGF_PROPS>[] = [];

    // Parse the first required node
    sequence.push(this.#parseNode(reader, context));

    // Parse any additional nodes in the sequence
    while (reader.peekSignificant() === ';') {
      sequence.push(this.#parseNode(reader, context));
    }

    return sequence;
  }

  #parseTree(reader: SGFReader, context: CONTEXT = {} as CONTEXT): GAME_TREE {
    reader.expect('(');

    const sequence = this.#parseSequence(reader, context);
    const children: GAME_TREE[] = [];

    // Parse any child game trees (variations)
    while (reader.peekSignificant() === '(') {
      children.push(this.#parseTree(reader, context));
    }

    reader.expect(')');

    return this.transformTree
      ? this.transformTree(sequence, children, context)
      : ({ sequence, children } as GAME_TREE);
  }

  /**
   * Parses a complete SGF game tree enclosed in parentheses. Use this method as
   * the main entry point for parsing SGF files, if you support only one game.
   *
   * A game tree consists of a main sequence and zero or more child game trees
   * representing variations. This represents a complete game or game fragment.
   *
   * EBNF definition of *GameTree* is `GameTree = "(" Sequence { GameTree } ")"`.
   *
   * @param sgfString - The complete SGF string being parsed
   * @param context - Internal parsing state (should not be provided externally)
   * @returns Game tree object with sequence and children
   * @throws {SGFSyntaxError} When game tree format is invalid
   *
   * @example
   * ```typescript
   * parser.parseTree('(;GM[1];B[pd];W[dd])');
   * // { sequence: [{ GM: ['1'] }, { B: ['pd'] }, { W: ['dd'] }], children: [] }
   *
   * // With variations
   * parser.parseTree('(;GM[1];B[pd](;W[dd])(;W[pp]))');
   * // { sequence: [{ GM: ['1'] }, { B: ['pd'] }], children: [...] }
   * ```
   */
  parseTree(sgfString: string, context: CONTEXT = {} as CONTEXT): GAME_TREE {
    return this.#parseTree(new SGFReader(sgfString), context);
  }

  #parseCollection(reader: SGFReader, context: CONTEXT = {} as CONTEXT): COLLECTION {
    if (reader.peekSignificant() !== '(') {
      throw new SGFSyntaxError(
        'At least one game tree in collection is required',
        reader.source,
        reader.getPosition(),
      );
    }

    const gameTrees: GAME_TREE[] = [];

    // Parse the first required game tree
    gameTrees.push();

    // Parse any additional game trees
    while (reader.peekSignificant() === '(') {
      gameTrees.push(this.#parseTree(reader, context));
    }

    return this.transformCollection
      ? this.transformCollection(gameTrees, context)
      : (gameTrees as COLLECTION);
  }

  /**
   * Parses a complete SGF collection containing one or more game trees.
   *
   * This is the main entry point for parsing SGF files. A collection can contain
   * multiple independent games, though most SGF files contain only one game.
   *
   * EBNF definition of *Collection* is `Collection = GameTree { GameTree }`.
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
  parseCollection(sgfString: string, context: CONTEXT = {} as CONTEXT): COLLECTION {
    return this.#parseCollection(new SGFReader(sgfString), context);
  }
}

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
