import { ChineseRules } from './ChineseRules';
import { IngRules } from './IngRules';
import { JapaneseRules } from './JapaneseRules';
import { Rules } from './Rules';

export const sgfRulesMap: { [key: string]: Rules } = {
  Japanese: new JapaneseRules('Japanese'),
  GOE: new IngRules('GOE'),
  NZ: new IngRules('NZ'),
  Chinese: new ChineseRules('Chinese'),
  AGA: new ChineseRules('AGA'),
};
