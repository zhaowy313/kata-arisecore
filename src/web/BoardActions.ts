import { BoardBase, FieldBoardObject } from '../BoardBase';
import { BoardController } from '../editor';
import { MarkupType } from '../kifu';
import { Color, Point } from '../types';

interface BoardTool {
  click?(point: Point | null, actions: BoardActions): void;
  mouseMove?(point: Point | null, actions: BoardActions): void;
  mouseOut?(actions: BoardActions): void;
}

class SelectTool implements BoardTool {
  click(point: Point | null, actions: BoardActions) {
    if (point) {
      actions.controller.selectVariation(point);
    }
  }

  mouseMove(point: Point | null, actions: BoardActions) {
    if (!point) {
      actions.mousePosition = null;
      this.#removeVariationCursor(actions);
      return;
    }
    if (
      !actions.mousePosition ||
      point.x !== actions.mousePosition.x ||
      point.y !== actions.mousePosition.y
    ) {
      actions.mousePosition = {
        x: point.x,
        y: point.y,
      };
      this.#addVariationCursor(point, actions);
    }
  }

  mouseOut(actions: BoardActions) {
    if (actions.mousePosition != null) {
      actions.mousePosition = null;
      this.#removeVariationCursor(actions);
    }
  }

  #addVariationCursor(point: Point, actions: BoardActions) {
    if (actions.controller.containsVariation(point)) {
      actions.board.element.style.cursor = 'pointer';
    } else {
      this.#removeVariationCursor(actions);
    }
  }

  #removeVariationCursor(actions: BoardActions) {
    if (actions.board.element.style.cursor) {
      actions.board.element.style.cursor = '';
    }
  }
}

class PlayTool implements BoardTool {
  currentHighlight: FieldBoardObject | null = null;
  previousPoint: Point | null;

  constructor(public config: { hoverOpacity: number } = { hoverOpacity: 0.35 }) {}

  click(point: Point | null, actions: BoardActions): void {
    if (point) {
      const childWithSameMove = actions.controller.editor.currentNode.children.find(
        (child) =>
          child.move &&
          'x' in child.move &&
          child.move.x === point.x &&
          child.move.y === point.y &&
          child.move.c === actions.controller.editor.gameState.player,
      );

      if (childWithSameMove) {
        actions.controller.editor.next(childWithSameMove);
      } else if (actions.controller.editor.isValidMove(point.x, point.y)) {
        actions.controller.editor.play(point.x, point.y);
      }
    }
  }

  mouseMove(point: Point | null, actions: BoardActions): void {
    if (
      point &&
      (!this.previousPoint || point.x !== this.previousPoint.x || point.y !== this.previousPoint.y)
    ) {
      if (actions.controller.editor.isValidMove(point.x, point.y)) {
        const color = actions.controller.editor.gameState.player === Color.Black ? 'B' : 'W';

        if (!this.currentHighlight || this.currentHighlight.type !== color) {
          if (this.currentHighlight) {
            actions.board.removeObject(this.currentHighlight);
          }

          this.currentHighlight = new FieldBoardObject(color, point.x, point.y);
          this.currentHighlight.opacity = this.config.hoverOpacity;
          actions.controller.board.addObject(this.currentHighlight);
        } else {
          this.currentHighlight.setPosition(point.x, point.y);
          actions.controller.board.updateObject(this.currentHighlight);
        }
      } else {
        this.mouseOut(actions);
      }
      this.previousPoint = point;
    }
  }

  mouseOut(actions: BoardActions): void {
    if (this.currentHighlight) {
      actions.board.removeObject(this.currentHighlight);
      this.currentHighlight = null;
    }
    this.previousPoint = null;
  }
}

class AddBlackTool implements BoardTool {
  click(point: Point | null, actions: BoardActions): void {
    if (point) {
      if (actions.controller.editor.gameState.position.get(point.x, point.y) === Color.Black) {
        actions.controller.editor.addSetup({ ...point, c: Color.Empty });
      } else {
        actions.controller.editor.addSetup({ ...point, c: Color.Black });
      }
    }
  }
}

class AddWhiteTool implements BoardTool {
  click(point: Point | null, actions: BoardActions): void {
    if (point) {
      if (actions.controller.editor.gameState.position.get(point.x, point.y) === Color.White) {
        actions.controller.editor.addSetup({ ...point, c: Color.Empty });
      } else {
        actions.controller.editor.addSetup({ ...point, c: Color.White });
      }
    }
  }
}

class AddTriangleTool implements BoardTool {
  click(point: Point | null, actions: BoardActions): void {
    if (point) {
      if (
        actions.controller.editor.currentNode.markup.some(
          (m) => point.x === m.x && point.y === m.y && m.type === MarkupType.Triangle,
        )
      ) {
        actions.controller.editor.removeMarkupAt(point);
      } else {
        actions.controller.editor.addMarkup({ ...point, type: MarkupType.Triangle });
      }
    }
  }
}

// temporary
export class BoardActions {
  board: BoardBase;
  mousePosition: Point | null = null;
  controller: BoardController<BoardBase>;
  tools: { [key: string]: BoardTool } = {
    select: new SelectTool(),
    play: new PlayTool(),
    blackStone: new AddBlackTool(),
    whiteStone: new AddWhiteTool(),
    triangle: new AddTriangleTool(),
  };
  selectedTool: string | null = null;

  #handleBoardClick = ({ point }: { point: Point | null }) => {
    const tool = this.selectedTool && this.tools[this.selectedTool];
    if (tool && tool.click) {
      tool.click(point, this);
    }
  };

  #handleBoardMouseMove = ({ point }: { point: Point | null }) => {
    const tool = this.selectedTool && this.tools[this.selectedTool];
    if (tool && tool.mouseMove) {
      tool.mouseMove(point, this);
    }
  };

  #handleBoardMouseOut = () => {
    const tool = this.selectedTool && this.tools[this.selectedTool];
    if (tool && tool.mouseOut) {
      tool.mouseOut(this);
    }
  };

  constructor(controller: BoardController<BoardBase>) {
    this.board = controller.board;
    this.controller = controller;

    this.board.on('click', this.#handleBoardClick);
    this.board.on('mousemove', this.#handleBoardMouseMove);
    this.board.on('mouseout', this.#handleBoardMouseOut);
  }

  setTool(tool: string | null) {
    this.selectedTool = tool;
  }

  getAvailableTools() {
    return Object.keys(this.tools);
  }
}
