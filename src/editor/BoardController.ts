import {
  Board,
  BoardObject,
  FieldBoardObject,
  LabelBoardObject,
  LineBoardObject,
  MarkupBoardObject,
} from '../BoardBase';
import { Editor } from '../editor';
import { KifuNode } from '../kifu';
import { Color, Point, Vector } from '../types';

enum VariationsStyle {
  None = 'NONE',
  Siblings = 'SIBLINGS',
  Children = 'CHILDREN',
}

interface BoardControllerConfig {
  currentMoveMarkup: string;
  highlightCurrentMove: boolean;
  variationsStyle: VariationsStyle;
  variationsMarkup: string;
}

const defaultBoardControllerConfig: BoardControllerConfig = {
  highlightCurrentMove: true,
  currentMoveMarkup: 'CR',
  variationsStyle: VariationsStyle.Children,
  variationsMarkup: 'LB',
};

/**
 * This class connects board and editor together. It registers all necessary event listeners of editor class
 * and updates board accordingly. The controller works with generic boards, so it can be used not only in
 * browser, but also in node.js environment.
 */
export class BoardController<T extends Board> {
  editor: Editor;
  board: T;
  config: BoardControllerConfig;

  // Current board objects for stones - should match the position object of the game
  #stoneBoardObjects: FieldBoardObject[];

  // Board object valid just for current node - usually markup and other temporary objects like current move marker.
  #nodeBoardObjects: BoardObject[];

  // Alternative variations for current node
  #variations: KifuNode[] = [];

  // Variation markup style - cached because it is used often
  #variationsStyle: VariationsStyle = VariationsStyle.None;

  #handleGameLoad = () => {
    const { rows, cols } = this.editor.gameState.position;
    this.board.setSize(cols, rows);
    this.#variationsStyle = this.#getVariationsStyle();
  };

  #handleNodeChange = () => {
    this.#variations = this.editor.getVariations();

    this.#removeAllNodeBoardObjects();
    this.#highlightCurrentMove();
    this.#addVariationMarkup();
    this.#applyMarkup();
  };

  #handleGameStateChange = () => {
    this.#updateStones();
  };

  #handleViewportChange = () => {
    this.#updateViewport();
  };

  constructor(
    editor: Editor,
    board: T,
    config: BoardControllerConfig = defaultBoardControllerConfig,
  ) {
    this.editor = editor;
    this.config = config;
    this.board = board;
    this.#stoneBoardObjects = [];
    this.#nodeBoardObjects = [];

    this.editor.on('gameLoad', this.#handleGameLoad);
    this.editor.on('nodeChange', this.#handleNodeChange);
    this.editor.on('gameStateChange', this.#handleGameStateChange);
    this.editor.on('viewportChange', this.#handleViewportChange);

    if (this.editor.kifu) {
      this.#handleGameLoad();
      this.#handleNodeChange();
      this.#handleGameStateChange();
      this.#handleViewportChange();
    }
  }

  destroy() {
    this.editor.off('gameLoad', this.#handleGameLoad);
    this.editor.off('nodeChange', this.#handleNodeChange);
    this.editor.off('gameStateChange', this.#handleGameStateChange);
    this.editor.off('viewportChange', this.#handleViewportChange);
  }

  addNodeBoardObject(obj: BoardObject) {
    this.#nodeBoardObjects.push(obj);
    this.board.addObject(obj);
  }

  removeNodeBoardObject(obj: BoardObject) {
    this.#nodeBoardObjects = this.#nodeBoardObjects.filter((o) => o !== obj);
    this.board.removeObject(obj);
  }

  /**
   * Go to variation, which has next move on the given point. It also depends on variations style. If
   * variations style is set to none, nothing happens. Given field also contains variation markup.
   */
  selectVariation(point: Point) {
    if (this.#variationsStyle === VariationsStyle.None || this.#variations.length <= 1) {
      return;
    }

    const node = this.#findVariation(point);

    if (node) {
      if (this.#variationsStyle === VariationsStyle.Siblings) {
        this.editor.previous();
        this.editor.next(node);
      } else {
        this.editor.next(node);
      }
    }
  }

  /**
   * Returns true if the field contains variation markup. That means that variation continues from this field.
   * Usually it is possible to click to this field and select the variation.
   */
  containsVariation(point: Point) {
    if (this.#variationsStyle === VariationsStyle.None || this.#variations.length <= 1) {
      return false;
    }

    return !!this.#findVariation(point);
  }

  #updateStones() {
    // Remove missing stones in current position
    this.#stoneBoardObjects = this.#stoneBoardObjects.filter((boardObject) => {
      if (
        this.editor.gameState.position.get(boardObject.x, boardObject.y) !==
        colorsMap[boardObject.type]
      ) {
        this.board.removeObject(boardObject);
        return false;
      }
      return true;
    });

    // Add new stones from current position
    const position = this.editor.gameState.position;

    for (let x = 0; x < position.cols; x++) {
      for (let y = 0; y < position.rows; y++) {
        const c = position.get(x, y);
        if (
          c &&
          !this.#stoneBoardObjects.some(
            (boardObject) =>
              boardObject.x === x &&
              boardObject.y === y &&
              c === colorsMap[boardObject.type as string],
          )
        ) {
          const boardObject = new FieldBoardObject(c === Color.B ? 'B' : 'W', x, y);
          this.board.addObject(boardObject);
          this.#stoneBoardObjects.push(boardObject);
        }
      }
    }
  }

  #removeAllNodeBoardObjects() {
    this.#nodeBoardObjects.forEach((obj) => this.board.removeObject(obj));
    this.#nodeBoardObjects = [];
  }

  #highlightCurrentMove() {
    if (!this.config.highlightCurrentMove) {
      return;
    }
    const { move, markup } = this.editor.currentNode;

    if (!move || !('x' in move)) {
      // move is missing, or pass
      return;
    }

    if (markup.some((m) => 'x' in m && m.x === move.x && m.y === move.y)) {
      // don't show current move markup, when there is markup in kifu node
      return;
    }

    if (this.#variations.length > 1 && this.#variationsStyle === VariationsStyle.Siblings) {
      // don't show current move markup, if there is multiple variations and "show current variations" style set
      return;
    }

    // add current move mark
    const boardMarkup = new MarkupBoardObject(
      this.config.currentMoveMarkup,
      move.x,
      move.y,
      move.c === Color.Black ? Color.Black : Color.White,
    );
    boardMarkup.zIndex = 10;
    this.addNodeBoardObject(boardMarkup);
  }

  #applyMarkup() {
    this.editor.currentNode.markup.forEach((markup) => {
      let boardMarkup: BoardObject;

      if ('text' in markup) {
        // label markup
        boardMarkup = new LabelBoardObject(
          markup.text,
          markup.x,
          markup.y,
          this.editor.gameState.position.get(markup.x, markup.y),
        );
      } else if ('x' in markup) {
        boardMarkup = new MarkupBoardObject(
          markup.type,
          markup.x,
          markup.y,
          this.editor.gameState.position.get(markup.x, markup.y),
        );
      } else {
        boardMarkup = new LineBoardObject(
          markup.type,
          { x: markup.x1, y: markup.y1 },
          { x: markup.x2, y: markup.y2 },
        );
      }

      boardMarkup.zIndex = 10;
      this.addNodeBoardObject(boardMarkup);
    });

    // Not sure if this is optimal for dimming, probably not the most performant solution
    this.editor.gameState.properties.dim?.forEach((dim: Vector) => {
      const boardMarkup = new LineBoardObject(
        'DD',
        { x: dim.x1, y: dim.y1 },
        { x: dim.x2, y: dim.y2 },
      );

      boardMarkup.zIndex = 10;
      this.addNodeBoardObject(boardMarkup);
    });
  }

  #updateViewport() {
    const { boardSection } = this.editor.gameState.properties;

    if (boardSection) {
      const minX = Math.min(boardSection.x1, boardSection.x2);
      const minY = Math.min(boardSection.y1, boardSection.y2);
      const maxX = Math.max(boardSection.x1, boardSection.x2);
      const maxY = Math.max(boardSection.y1, boardSection.y2);
      const size = this.board.getSize();

      this.board.setViewport({
        left: minX,
        top: minY,
        right: size.x - maxX - 1,
        bottom: size.y - maxY - 1,
      });
    } else {
      // Reset viewport
      this.board.setViewport({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      });
    }
  }

  #getVariationsStyle() {
    const { variationsStyle } = this.editor.kifu.info;

    if (variationsStyle) {
      if (variationsStyle.noMarkup) {
        return VariationsStyle.None;
      }
      if (variationsStyle.currentNode != null) {
        return variationsStyle.currentNode ? VariationsStyle.Siblings : VariationsStyle.Children;
      }
    }

    return this.config.variationsStyle;
  }

  #addVariationMarkup() {
    if (this.#variationsStyle === VariationsStyle.None || this.#variations.length <= 1) {
      return;
    }

    this.#variations.forEach((node, i) => {
      if (!('x' in node.move!)) {
        return;
      }

      const obj = new LabelBoardObject(String.fromCodePoint(65 + i), node.move!.x, node.move!.y);
      //obj.handler = this.config.variationDrawHandler;
      this.addNodeBoardObject(obj);
    });

    //if (this.mousePosition) {
    //  this.#addVariationCursor(this.mousePosition);
    //}
  }

  #findVariation(point: Point) {
    return this.#variations.find(
      ({ move }) => 'x' in move! && move.x === point.x && move.y === point.y,
    );
  }
}

const colorsMap = {
  B: Color.Black,
  W: Color.White,
} as { [key: string]: Color | undefined };
