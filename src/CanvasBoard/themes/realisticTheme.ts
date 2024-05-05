import * as drawHandlers from '../drawHandlers';
import { CanvasBoardTheme } from '../types';
import baseTheme from './baseTheme';

const realisticTheme: CanvasBoardTheme = {
  ...baseTheme,
  font: 'calibri',
  backgroundImage: 'images/wood1.jpg',
  stoneSize: 0.48,
  drawHandlers: {
    ...baseTheme.drawHandlers,
    B: new drawHandlers.RealisticStone(
      [
        'images/black00_128.png',
        'images/black01_128.png',
        'images/black02_128.png',
        'images/black03_128.png',
      ],
      new drawHandlers.GlassStoneBlack(),
    ),
    W: new drawHandlers.RealisticStone(
      [
        'images/white00_128.png',
        'images/white01_128.png',
        'images/white02_128.png',
        'images/white03_128.png',
        'images/white04_128.png',
        'images/white05_128.png',
        'images/white06_128.png',
        'images/white07_128.png',
        'images/white08_128.png',
        'images/white09_128.png',
        'images/white10_128.png',
      ],
      new drawHandlers.GlassStoneWhite(),
    ),
  },
};

export default realisticTheme;
