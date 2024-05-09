import { BoardPosition } from '../src/game';
import { Color } from '../src/types';
import { describe, test, expect } from 'vitest';

describe('New position', () => {
  test('Creates default empty position (19x19)', () => {
    const position = new BoardPosition();

    expect(position.cols).toBe(19);
    expect(position.rows).toBe(19);

    expect(position.has(18, 18)).toBe(true);
    expect(position.has(18, 19)).toBe(false);
    expect(position.has(19, 18)).toBe(false);

    expect(position.has(0, 0)).toBe(true);
    expect(position.has(0, -1)).toBe(false);
    expect(position.has(-1, 0)).toBe(false);
  });

  test('Creates custom square position', () => {
    const position = new BoardPosition(9);

    expect(position.cols).toBe(9);
    expect(position.rows).toBe(9);

    expect(position.has(8, 8)).toBe(true);
    expect(position.has(8, 9)).toBe(false);
    expect(position.has(9, 8)).toBe(false);
  });

  test('Creates custom rectangular position', () => {
    const position = new BoardPosition(9, 19);

    expect(position.cols).toBe(9);
    expect(position.rows).toBe(19);

    expect(position.has(8, 18)).toBe(true);
    expect(position.has(8, 19)).toBe(false);
    expect(position.has(9, 18)).toBe(false);
  });
});

describe('BoardPosition#get() & BoardPosition#set()', () => {
  test('Basic getting and setting fields/stones', () => {
    const position = new BoardPosition(9);

    expect(position.get(0, 0)).toBe(Color.Empty);
    expect(position.get(0, 1)).toBe(Color.Empty);
    expect(position.get(1, 0)).toBe(Color.Empty);
    expect(position.get(1, 1)).toBe(Color.Empty);

    position.set(0, 0, Color.Black);
    position.set(0, 1, Color.Black);
    position.set(1, 0, Color.White);
    position.set(1, 1, Color.White);

    expect(position.get(0, 0)).toBe(Color.Black);
    expect(position.get(0, 1)).toBe(Color.Black);
    expect(position.get(1, 0)).toBe(Color.White);
    expect(position.get(1, 1)).toBe(Color.White);

    position.set(0, 0, Color.Empty);
    position.set(0, 1, Color.White);
    position.set(1, 0, Color.Black);
    position.set(1, 1, Color.Empty);

    expect(position.get(0, 0)).toBe(Color.Empty);
    expect(position.get(0, 1)).toBe(Color.White);
    expect(position.get(1, 0)).toBe(Color.Black);
    expect(position.get(1, 1)).toBe(Color.Empty);
  });

  test('Returns undefined/null when accessing field outside of the position.', () => {
    const position = new BoardPosition(9);

    expect(position.get(0, -1)).toBeUndefined();
    expect(position.get(-1, 0)).toBeUndefined();
    expect(position.get(0, 9)).toBeUndefined();
    expect(position.get(9, 0)).toBeUndefined();
  });

  test('Throws error, when setting field outside of the position.', () => {
    const position = new BoardPosition(9);

    expect(() => {
      position.set(0, -1, Color.White);
    }).toThrow();
    expect(() => {
      position.set(-1, 0, Color.Black);
    }).toThrow();
    expect(() => {
      position.set(0, 9, Color.Empty);
    }).toThrow();
    expect(() => {
      position.set(9, 0, Color.White);
    }).toThrow();
  });
});

describe('BoardPosition#clone()', () => {
  test('Clones empty position', () => {
    const position = new BoardPosition(9);
    const cloned = position.clone();

    expect(position).not.toBe(cloned);
    expect(position).toEqual(cloned);
  });

  test('Clones position with all moves', () => {
    const position = new BoardPosition(3);

    position.set(0, 0, Color.Black);
    position.set(0, 1, Color.White);
    position.set(1, 1, Color.Black);
    position.set(1, 2, Color.White);
    position.set(2, 0, Color.White);
    position.set(2, 2, Color.Black);

    const cloned = position.clone();

    expect(position).toEqual(cloned);

    cloned.set(0, 0, Color.White);
    expect(cloned.get(0, 0)).toBe(Color.White);
    expect(position.get(0, 0)).toBe(Color.Black);
  });
});

describe('BoardPosition#compare()', () => {
  test('Cloned positions are the same', () => {
    const position = new BoardPosition(19);
    position.set(10, 10, Color.Black);
    expect(position.equals(position.clone())).toBe(true);
  });

  test('Different positions are not the same', () => {
    const position = new BoardPosition(3);
    position.set(0, 0, Color.Black);

    const cloned = position.clone();
    cloned.set(1, 0, Color.Black);

    expect(position.equals(cloned)).toBe(false);
  });

  test('Different sizes are not the same', () => {
    const position = new BoardPosition(19);
    const position2 = new BoardPosition(13);

    expect(position.equals(position2)).toBe(false);
  });
});

describe('BoardPosition#hasLiberties()', () => {
  test('One lonely stone has liberties', () => {
    const position = new BoardPosition(9);
    position.set(0, 0, Color.Black);
    position.set(0, 8, Color.White);
    position.set(8, 0, Color.Black);
    position.set(8, 8, Color.White);
    position.set(4, 4, Color.Black);

    expect(position.hasLiberties(0, 0)).toBe(true);
    expect(position.hasLiberties(0, 8)).toBe(true);
    expect(position.hasLiberties(8, 0)).toBe(true);
    expect(position.hasLiberties(8, 8)).toBe(true);
    expect(position.hasLiberties(4, 4)).toBe(true);
  });

  test("Surrounded stone doesn't have liberties", () => {
    const position = new BoardPosition(9);
    position.set(0, 0, Color.Black);
    position.set(1, 0, Color.White);
    position.set(0, 1, Color.White);

    position.set(0, 8, Color.White);
    position.set(1, 8, Color.Black);
    position.set(0, 7, Color.Black);

    position.set(8, 0, Color.Black);
    position.set(8, 1, Color.White);
    position.set(7, 0, Color.White);

    position.set(8, 8, Color.White);
    position.set(7, 8, Color.Black);
    position.set(8, 7, Color.Black);

    position.set(4, 4, Color.Black);
    position.set(3, 4, Color.White);
    position.set(5, 4, Color.White);
    position.set(4, 3, Color.White);
    position.set(4, 5, Color.White);

    expect(position.hasLiberties(0, 0)).toBe(false);
    expect(position.hasLiberties(0, 8)).toBe(false);
    expect(position.hasLiberties(8, 0)).toBe(false);
    expect(position.hasLiberties(8, 8)).toBe(false);
    expect(position.hasLiberties(4, 4)).toBe(false);
  });

  test('Group of stones with liberty', () => {
    const position = new BoardPosition(9, 13);
    position.set(0, 0, Color.Black);
    position.set(0, 1, Color.Black);
    position.set(0, 2, Color.Black);
    position.set(1, 2, Color.Black);
    position.set(2, 2, Color.Black);

    position.set(1, 1, Color.White);
    position.set(2, 1, Color.White);
    position.set(3, 2, Color.White);
    position.set(2, 3, Color.White);
    position.set(1, 3, Color.White);
    position.set(0, 3, Color.White);

    expect(position.hasLiberties(2, 2)).toBe(true);
  });

  test('Group of stones without liberty', () => {
    const position = new BoardPosition(9);
    position.set(0, 0, Color.Black);
    position.set(0, 1, Color.Black);
    position.set(0, 2, Color.Black);
    position.set(1, 2, Color.Black);
    position.set(2, 2, Color.Black);

    position.set(1, 0, Color.White);
    position.set(1, 1, Color.White);
    position.set(2, 1, Color.White);
    position.set(3, 2, Color.White);
    position.set(2, 3, Color.White);
    position.set(1, 3, Color.White);
    position.set(0, 3, Color.White);

    expect(position.hasLiberties(2, 2)).toBe(false);
  });
});

describe('BoardPosition#removeChain()', () => {
  test('Test removing of all stones', () => {
    const position = new BoardPosition(3);

    position.set(0, 0, Color.Black);
    position.set(0, 1, Color.Black);
    position.set(0, 2, Color.Black);
    position.set(1, 0, Color.Black);
    position.set(1, 1, Color.Black);
    position.set(1, 2, Color.Black);
    position.set(2, 0, Color.Black);
    position.set(2, 1, Color.Black);
    position.set(2, 2, Color.Black);

    expect(position.removeChain(1, 1)).toBe(9);

    expect(position.get(0, 0)).toBe(Color.Empty);
    expect(position.get(0, 1)).toBe(Color.Empty);
    expect(position.get(0, 2)).toBe(Color.Empty);
    expect(position.get(1, 0)).toBe(Color.Empty);
    expect(position.get(1, 1)).toBe(Color.Empty);
    expect(position.get(1, 2)).toBe(Color.Empty);
    expect(position.get(2, 0)).toBe(Color.Empty);
    expect(position.get(2, 1)).toBe(Color.Empty);
    expect(position.get(2, 2)).toBe(Color.Empty);
  });

  test('Group of stones is correctly captured', () => {
    const position = new BoardPosition(9);
    position.set(0, 0, Color.Black);
    position.set(0, 1, Color.Black);
    position.set(0, 2, Color.Black);
    position.set(1, 2, Color.Black);
    position.set(2, 2, Color.Black);

    position.set(2, 0, Color.Black);
    position.set(3, 1, Color.Black);
    position.set(3, 3, Color.Black);

    position.set(1, 1, Color.White);
    position.set(2, 1, Color.White);
    position.set(3, 2, Color.White);
    position.set(2, 3, Color.White);
    position.set(1, 3, Color.White);
    position.set(0, 3, Color.White);

    expect(position.removeChain(2, 2)).toBe(5);

    expect(position.get(0, 0)).toBe(Color.Empty);
    expect(position.get(0, 1)).toBe(Color.Empty);
    expect(position.get(0, 2)).toBe(Color.Empty);
    expect(position.get(1, 2)).toBe(Color.Empty);
    expect(position.get(2, 2)).toBe(Color.Empty);

    expect(position.get(2, 0)).toBe(Color.Black);
    expect(position.get(3, 1)).toBe(Color.Black);
    expect(position.get(3, 3)).toBe(Color.Black);

    expect(position.get(1, 1)).toBe(Color.White);
    expect(position.get(2, 1)).toBe(Color.White);
    expect(position.get(3, 2)).toBe(Color.White);
    expect(position.get(2, 3)).toBe(Color.White);
    expect(position.get(1, 3)).toBe(Color.White);
    expect(position.get(0, 3)).toBe(Color.White);
  });
});
