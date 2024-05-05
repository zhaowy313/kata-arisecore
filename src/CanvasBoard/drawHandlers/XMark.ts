import ShapeMarkup from './ShapeMarkup';

export default class XMark extends ShapeMarkup {
  drawShape(canvasCtx: CanvasRenderingContext2D) {
    canvasCtx.moveTo(-0.2, -0.2);
    canvasCtx.lineTo(0.2, 0.2);
    canvasCtx.moveTo(0.2, -0.2);
    canvasCtx.lineTo(-0.2, 0.2);
  }
}
