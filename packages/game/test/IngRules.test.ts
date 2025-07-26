import { describe, expect, test } from 'vitest';
import { commonInvalidMoveTests, commonValidMoveTests, setupKo, setupSuperKo } from './gameRules';
import { GameState, IngRules } from '../src';
import { Color } from '@wgojs/common';

describe('IngRules', () => {
  describe('Valid moves', () => {
    commonValidMoveTests(IngRules);

    test('Suicide', () => {
      const state = GameState.applyPlay(setupKo(), { x: 0, y: 2, color: Color.Black });
      const result = IngRules.validatePlay(state, { x: 0, y: 1, color: Color.White });
      expect(result.valid).toBe(true);
    });
  });
  describe('Invalid moves', () => {
    commonInvalidMoveTests(IngRules);

    test('Super ko', () => {
      const state = setupSuperKo();
      const result = IngRules.validatePlay(state, { x: 4, y: 0, color: Color.Black });
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('ko');
    });
  });
});
