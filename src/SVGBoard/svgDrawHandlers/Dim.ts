import { LineBoardObject } from '../../BoardBase';
import { BoardObjectSVGElements, SVGDrawHandler, SVG_NS, SVG_OBJECTS } from '../types';

/**
 * Represents a dimmed area. TODO: probably should be improved.
 */
export default class Dim implements SVGDrawHandler {
  params: { color: string };

  constructor(params: { color: string }) {
    this.params = params;
  }

  createElement() {
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('fill', this.params.color);

    return rect;
  }

  updateElement(elem: BoardObjectSVGElements, boardObject: LineBoardObject): void {
    const leftX = boardObject.start.x < boardObject.end.x ? boardObject.start.x : boardObject.end.x;
    const topY = boardObject.start.y < boardObject.end.y ? boardObject.start.y : boardObject.end.y;

    elem[SVG_OBJECTS].setAttribute('x', `${leftX - 0.5}`);
    elem[SVG_OBJECTS].setAttribute('y', `${topY - 0.5}`);
    elem[SVG_OBJECTS].setAttribute(
      'width',
      `${Math.abs(boardObject.start.x - boardObject.end.x) + 1}`,
    );
    elem[SVG_OBJECTS].setAttribute(
      'height',
      `${Math.abs(boardObject.start.y - boardObject.end.y) + 1}`,
    );
  }
}
