import { describe, expect, test } from 'vitest';
import {
  commonInvalidMoveTests,
  commonValidMoveTests,
  setupSuperKo,
  suicideTests,
} from './gameRules';
import { ChineseRules } from '../src';
import { Color } from '@wgojs/common';

describe('ChineseRules', () => {
  describe('Valid moves', () => {
    commonValidMoveTests(ChineseRules);
  });
  describe('Invalid moves', () => {
    commonInvalidMoveTests(ChineseRules);
    suicideTests(ChineseRules);

    test('Super ko', () => {
      const state = setupSuperKo();
      const result = ChineseRules.validatePlay(state, { x: 4, y: 0, color: Color.Black });
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('ko');
    });
  });
});
