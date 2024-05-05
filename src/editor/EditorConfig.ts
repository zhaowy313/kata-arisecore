import { JapaneseRules, Rules } from '../game';
import { BoardSize } from '../types';

export interface EditorConfig {
  defaultRules: Rules;
  defaultKomi: number;
  defaultBoardSize: BoardSize;
}

export const defaultEditorConfig: EditorConfig = {
  defaultRules: new JapaneseRules(),
  defaultKomi: 6.5,
  defaultBoardSize: 19,
};
