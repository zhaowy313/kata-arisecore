import { describe, test, expect } from 'vitest';
import { BoardSize } from '../src';

describe('BoardSize helper methods', () => {
  describe('BoardSize.create', () => {
    test('should create square board size from single number', () => {
      const size = BoardSize.create(19);
      expect(size).toBe(19);
    });

    test('should create rectangular board size from two numbers', () => {
      const size = BoardSize.create(19, 13);
      expect(size).toEqual({ cols: 19, rows: 13 });
    });

    test('should handle equal dimensions', () => {
      const size = BoardSize.create(19, 19);
      expect(size).toEqual({ cols: 19, rows: 19 });
    });
  });

  describe('BoardSize.equals', () => {
    test('should compare two numeric board sizes', () => {
      expect(BoardSize.equals(19, 19)).toBe(true);
      expect(BoardSize.equals(19, 13)).toBe(false);
    });

    test('should compare two object board sizes', () => {
      expect(BoardSize.equals({ cols: 19, rows: 13 }, { cols: 19, rows: 13 })).toBe(true);
      expect(BoardSize.equals({ cols: 19, rows: 13 }, { cols: 13, rows: 19 })).toBe(false);
    });

    test('should compare numeric with object board sizes', () => {
      expect(BoardSize.equals(19, { cols: 19, rows: 19 })).toBe(true);
      expect(BoardSize.equals(19, { cols: 19, rows: 13 })).toBe(false);
      expect(BoardSize.equals({ cols: 19, rows: 19 }, 19)).toBe(true);
      expect(BoardSize.equals({ cols: 19, rows: 13 }, 19)).toBe(false);
    });
  });

  describe('BoardSize.getRows', () => {
    test('should get rows from numeric board size', () => {
      expect(BoardSize.getRows(19)).toBe(19);
    });

    test('should get rows from object board size', () => {
      expect(BoardSize.getRows({ cols: 19, rows: 13 })).toBe(13);
    });
  });

  describe('BoardSize.getCols', () => {
    test('should get cols from numeric board size', () => {
      expect(BoardSize.getCols(19)).toBe(19);
    });

    test('should get cols from object board size', () => {
      expect(BoardSize.getCols({ cols: 19, rows: 13 })).toBe(19);
    });
  });

  describe('BoardSize.isRectangular', () => {
    test('should return false for numeric board size', () => {
      expect(BoardSize.isRectangular(19)).toBe(false);
    });

    test('should return false for square object board size', () => {
      expect(BoardSize.isRectangular({ cols: 19, rows: 19 })).toBe(false);
    });

    test('should return true for rectangular object board size', () => {
      expect(BoardSize.isRectangular({ cols: 19, rows: 13 })).toBe(true);
    });
  });
});
