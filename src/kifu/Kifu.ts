import { SGFGameTree, SGFParser } from '../sgf';
import { KifuInfo } from './KifuInfo';
import { KifuNode } from './KifuNode';
import { deepClone } from '../utils/deepClone';

/**
 * Object describing position of kifu node in kifu tree. When kifu changes, kifu paths must be
 * updated too, if we want them to correspond to the same nodes. This is immutable object.
 */
export interface KifuPath {
  /** Depth of node (for root node it is 0) */
  readonly moveNumber: number;

  /**
   * Array of children array indexes of all predecessors which have siblings. These numbers
   * are used, when there is fork in kifu tree and we have to decide witch child to use.
   */
  readonly variations: ReadonlyArray<number>;
}

/**
 * Represents one go game record. It is inspired by SGF format, but its properties have better names and
 * their values have better types, so it is easier to use. For example in SGF you have property `B` for black
 * move and its value like `de`, in `Kifu` (respectively `KifuNode`) you have property `move` and value
 * like `{ x: 3, y: 4, c: Color.B }`. For that reason Kifu may not be fully compatible with SGF. For example,
 * if SGF contains B and W properties on the same node, Kifu only stores the later one.
 *
 * Kifu doesn't have any internal state - it consists only from game information and game tree.
 *
 * @example
 * ```javascript
 * import { Kifu, KifuNode, MarkupType } from 'wgo';
 *
 * // Create kifu object from SGF
 * const kifu = Kifu.fromSGF('(;FF[4]SZ[19]AB[ab];B[cd];W[ef])');
 *
 * console.log(kifu.info.boardSize); // 19
 * console.log(kifu.info.properties.FF); // 4
 * console.log(kifu.info.properties.AB); // undefined - AB is stored in kifu node
 * console.log(kifu.root.setup); // [{ x: 0, y: 1, c: 1 }] - Color.Black equals to 1
 * console.log(kifu.root.move); // undefined - no move here
 *
 * const move1 = kifu.root.children[0];
 * console.log(move1.move); // { x: 2, y: 3, c: 1 }
 *
 * const move2 = move1.children[0];
 * console.log(move2.move); // { x: 4, y: 5, c: -1 } - Color.White equals to -1
 *
 * // Add variation
 * const altMove2 = new KifuNode();
 * altMove2.move = { x: 6, y: 7, c: -1 };
 * move1.children.push(altMove2);
 * console.log(kifu.toSGF()); // '(;FF[4]SZ[19]AB[ab];B[cd](;W[ef])(;W[GH]))'
 *
 * // Set properties (markup) in SGF format
 * altMove2.setSGFProperties({
 *   TR: ['aa'],
 *   SQ: ['bb'],
 * });
 * console.log(kifu.toSGF()); // '(;FF[4]SZ[19]AB[ab];B[cd](;W[ef])(;W[GH]TR[aa]SQ[bb]))'
 *
 * // Add additional markup
 * altMove2.addMarkup({ type: MarkupType.Square, x: 2, y: 2});
 * console.log(kifu.toSGF()); // '(;FF[4]SZ[19]AB[ab];B[cd](;W[ef])(;W[GH]TR[aa]SQ[bb][cc]))'
 * ```
 */
export class Kifu {
  /**
   * Information about the game recorded in this kifu. It is related to the whole game, not to a single node.
   */
  info: KifuInfo;

  /**
   * Root node of the kifu. Must be set, even if it is empty.
   */
  root: KifuNode;

  constructor(info: KifuInfo | Partial<KifuInfo> = new KifuInfo(), root = new KifuNode()) {
    this.info = info instanceof KifuInfo ? info : KifuInfo.fromJS(info);
    this.root = root;
  }

  /**
   * Get KifuNode located on specified path in the kifu. You can also pass number, in that case
   * it will corresponds to move number.
   */
  getNode(path: KifuPath | number): KifuNode | undefined {
    const moveNumber = typeof path === 'number' ? path : path.moveNumber;
    const variations = typeof path === 'number' ? [] : path.variations;
    let node = this.root;
    let varCount = 0;

    for (let i = 0; i < moveNumber; i++) {
      if (!node.children.length) {
        return undefined;
      } else if (node.children.length > 1) {
        node = node.children[variations[varCount] || 0];
        varCount++;
      } else {
        node = node.children[0];
      }

      if (!node) {
        return undefined;
      }
    }

    return node;
  }

  /**
   * Finds path to the specified node. If kifu doesn't contain the node, null is returned. This method
   * uses breadth-first search to find the node.
   */
  getPath(node: KifuNode): KifuPath | undefined {
    return this.#bfs((n) => n === node)?.path;
  }

  /**
   * Find the first node in the kifu which matches the predicate. If there is no such node, null is returned.
   * You can specify starting path, from which the search will begin (excluding the node on that path).
   *
   * This method uses breadth-first search to find the node. Path to the found node is also returned.
   */
  find(
    predicate: (node: KifuNode) => boolean,
    startingPath?: KifuPath,
  ): { node: KifuNode; path: KifuPath } | undefined {
    return this.#bfs(predicate, startingPath);
  }

  /**
   * Generates full SGF string from this kifu.
   */
  toSGF(): string {
    return `(;${this.info.getSGFProperties()}${gameTreeToSgf(this.root)})`;
  }

  /**
   * Returns this kifu as plain JS object (JSON). This is useful for serialization.
   */
  toJS() {
    return {
      info: { ...this.info },
      root: { ...this.root },
    };
  }

  /**
   * Deeply clones this kifu.
   */
  clone(): Kifu {
    return Kifu.fromJS(deepClone(this));
  }

  #bfs(
    predicate: (node: KifuNode) => boolean,
    fromPath?: KifuPath,
  ): { node: KifuNode; path: KifuPath } | undefined {
    const queue: Array<{ node: KifuNode; path: KifuPath }> = [];

    if (fromPath) {
      const fromNode = this.getNode(fromPath);
      if (fromNode) {
        queue.push(...childrenWithPaths(fromNode, fromPath));
      }
    } else {
      queue.push({ node: this.root, path: { moveNumber: 0, variations: [] } });
    }

    while (queue.length) {
      const item = queue.shift()!;
      if (predicate(item.node)) {
        return item;
      }

      queue.push(...childrenWithPaths(item.node, item.path));
    }

    return undefined;
  }

  /**
   * Creates Kifu object from plain JS object (JSON).
   */
  static fromJS(kifu: Partial<Kifu>) {
    return new Kifu(
      kifu.info && KifuInfo.fromJS(kifu.info),
      kifu.root && KifuNode.fromJS(kifu.root),
    );
  }

  /**
   * Create Kifu object from the SGF string.
   *
   * @param sgfStringOrGameTree
   * @param gameNo
   */
  static fromSGF(sgfStringOrGameTree: string | SGFGameTree, gameNo: number = 0): Kifu {
    if (typeof sgfStringOrGameTree === 'string') {
      const parser = new SGFParser();
      return Kifu.fromSGF(parser.parseCollection(sgfStringOrGameTree)[gameNo]);
    }

    const kifu = new Kifu();
    kifu.info.setSGFProperties(sgfStringOrGameTree.sequence[0]);
    processGameTree(kifu.root, sgfStringOrGameTree);

    return kifu;
  }
}

function processGameTree(node: KifuNode, gameTree: SGFGameTree) {
  node.setSGFProperties(gameTree.sequence[0]);

  let lastNode = node;
  for (let i = 1; i < gameTree.sequence.length; i++) {
    const node = new KifuNode();
    node.setSGFProperties(gameTree.sequence[i]);
    lastNode.children.push(node);
    lastNode = node;
  }

  for (let i = 0; i < gameTree.children.length; i++) {
    lastNode.children.push(processGameTree(new KifuNode(), gameTree.children[i]));
  }

  return node;
}

function gameTreeToSgf(node: KifuNode): string {
  const properties = node.getSGFProperties();

  if (node.children.length === 1) {
    return `${properties};${gameTreeToSgf(node.children[0])}`;
  } else if (node.children.length > 1) {
    return `${properties}${node.children.map((child) => `(;${gameTreeToSgf(child)})`).join('')}`;
  }

  return properties;
}

function childrenWithPaths(node: KifuNode, path: KifuPath) {
  return node.children.map((childNode, index) => ({
    node: childNode,
    path: {
      moveNumber: path.moveNumber + 1,
      variations: node.children.length > 1 ? [...path.variations, index] : path.variations,
    },
  }));
}
