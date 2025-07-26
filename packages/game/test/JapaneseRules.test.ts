import { describe, expect, test } from 'vitest';
import { JapaneseRules } from '../src';
import {
  commonInvalidMoveTests,
  commonValidMoveTests,
  setupSuperKo,
  suicideTests,
} from './gameRules';
import { Color } from '@wgojs/common';

describe('JapaneseRules', () => {
  describe('Valid moves', () => {
    commonValidMoveTests(JapaneseRules);

    test('Super ko', () => {
      const state = setupSuperKo();
      const result = JapaneseRules.validatePlay(state, { x: 4, y: 0, color: Color.Black });
      expect(result.valid).toBe(true);
    });
  });
  describe('Invalid moves', () => {
    commonInvalidMoveTests(JapaneseRules);
    suicideTests(JapaneseRules);
  });
});
