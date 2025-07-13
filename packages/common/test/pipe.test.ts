import { describe, test, expect } from 'vitest';
import { pipe } from '../src/utils/pipe';

describe('pipe function', () => {
  describe('Direct application pattern: pipe(value, fn1, fn2, ...)', () => {
    test('should return value unchanged when no functions provided', () => {
      expect(pipe(5)).toBe(5);
      expect(pipe('hello')).toBe('hello');
      expect(pipe({ a: 1 })).toEqual({ a: 1 });
    });

    test('should apply single function to value', () => {
      const double = (x: number) => x * 2;
      expect(pipe(5, double)).toBe(10);
    });

    test('should apply two functions in sequence', () => {
      const double = (x: number) => x * 2;
      const addOne = (x: number) => x + 1;

      expect(pipe(5, double, addOne)).toBe(11); // (5 * 2) + 1
    });

    test('should apply three functions in sequence', () => {
      const double = (x: number) => x * 2;
      const addOne = (x: number) => x + 1;
      const toString = (x: number) => x.toString();

      expect(pipe(5, double, addOne, toString)).toBe('11');
    });

    test('should work with different types through the pipeline', () => {
      const result = pipe(
        'hello world',
        (s: string) => s.split(' '),
        (arr: string[]) => arr.length,
        (n: number) => n * 2,
        (n: number) => `Count: ${n}`,
      );

      expect(result).toBe('Count: 4');
    });

    test('should handle array operations', () => {
      const numbers = [1, 2, 3, 4, 5];
      const result = pipe(
        numbers,
        (arr: number[]) => arr.filter((x) => x > 2),
        (arr: number[]) => arr.map((x) => x * 2),
        (arr: number[]) => arr.reduce((sum, x) => sum + x, 0),
      );

      expect(result).toBe(24); // [3, 4, 5] -> [6, 8, 10] -> 24
    });

    test('should work with up to 10 functions', () => {
      const add1 = (x: number) => x + 1;

      const result = pipe(0, add1, add1, add1, add1, add1, add1, add1, add1, add1, add1);

      expect(result).toBe(10);
    });

    test('should preserve type safety', () => {
      // This test is mainly for TypeScript compilation - if it compiles, types are correct
      const result: string = pipe(
        5,
        (x: number) => x * 2,
        (x: number) => x + 1,
        (x: number) => x.toString(),
      );

      expect(typeof result).toBe('string');
      expect(result).toBe('11');
    });
  });

  describe('Composition pattern: pipe(fn1, fn2, ...)(value)', () => {
    test('should create a composed function from single function', () => {
      const double = (x: number) => x * 2;
      const composedFn = pipe(double);

      expect(composedFn(5)).toBe(10);
      expect(composedFn(3)).toBe(6);
    });

    test('should create a composed function from two functions', () => {
      const double = (x: number) => x * 2;
      const addOne = (x: number) => x + 1;
      const composedFn = pipe(double, addOne);

      expect(composedFn(5)).toBe(11);
      expect(composedFn(3)).toBe(7);
    });

    test('should create a composed function from three functions', () => {
      const double = (x: number) => x * 2;
      const addOne = (x: number) => x + 1;
      const toString = (x: number) => x.toString();
      const composedFn = pipe(double, addOne, toString);

      expect(composedFn(5)).toBe('11');
      expect(composedFn(3)).toBe('7');
    });

    test('should work with different types through the pipeline', () => {
      const composedFn = pipe(
        (s: string) => s.split(' '),
        (arr: string[]) => arr.length,
        (n: number) => n * 2,
        (n: number) => `Count: ${n}`,
      );

      expect(composedFn('hello world')).toBe('Count: 4');
      expect(composedFn('one two three')).toBe('Count: 6');
    });

    test('should create reusable composed functions', () => {
      const processNumbers = pipe(
        (arr: number[]) => arr.filter((x) => x > 0),
        (arr: number[]) => arr.map((x) => x * 2),
        (arr: number[]) => arr.reduce((sum, x) => sum + x, 0),
      );

      expect(processNumbers([1, -2, 3, -4, 5])).toBe(18); // [1, 3, 5] -> [2, 6, 10] -> 18
      expect(processNumbers([2, 4, 6])).toBe(24); // [2, 4, 6] -> [4, 8, 12] -> 24
    });

    test('should work with up to 10 functions in composition', () => {
      const add1 = (x: number) => x + 1;
      const composedFn = pipe(add1, add1, add1, add1, add1, add1, add1, add1, add1, add1);

      expect(composedFn(0)).toBe(10);
      expect(composedFn(5)).toBe(15);
    });

    test('should preserve type safety in composition', () => {
      // This test is mainly for TypeScript compilation
      const composedFn: (x: number) => string = pipe(
        (x: number) => x * 2,
        (x: number) => x + 1,
        (x: number) => x.toString(),
      );

      const result = composedFn(5);
      expect(typeof result).toBe('string');
      expect(result).toBe('11');
    });
  });

  describe('Edge cases and error handling', () => {
    test('should throw error when called with no arguments', () => {
      // @ts-expect-error - Testing runtime behavior
      expect(() => pipe()).toThrow('pipe requires at least one argument');
    });

    test('should handle null and undefined values', () => {
      const toString = (x: any) => String(x);

      expect(pipe(null, toString)).toBe('null');
      expect(pipe(undefined, toString)).toBe('undefined');
    });

    test('should handle functions that return null or undefined', () => {
      const returnNull = () => null;
      const returnUndefined = () => undefined;
      const toString = (x: any) => String(x);

      expect(pipe(5, returnNull, toString)).toBe('null');
      expect(pipe(5, returnUndefined, toString)).toBe('undefined');
    });

    test('should work with async functions (when awaited)', async () => {
      const asyncDouble = async (x: number) => x * 2;
      const asyncAddOne = async (x: number) => x + 1;

      // Direct application with async
      const result1 = await pipe(5, asyncDouble, (promise: Promise<number>) =>
        promise.then(asyncAddOne),
      );
      expect(result1).toBe(11);

      // Composition with async
      const composedAsync = pipe(asyncDouble, (promise: Promise<number>) =>
        promise.then(asyncAddOne),
      );
      const result2 = await composedAsync(5);
      expect(result2).toBe(11);
    });
  });

  describe('Functional programming examples', () => {
    test('should work well with array processing chains', () => {
      const processUsers = pipe(
        (users: Array<{ name: string; age: number }>) => users.filter((user) => user.age >= 18),
        (adults: Array<{ name: string; age: number }>) => adults.map((user) => user.name),
        (names: string[]) => names.map((name) => name.toUpperCase()),
        (upperNames: string[]) => upperNames.sort(),
      );

      const users = [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 17 },
        { name: 'Charlie', age: 30 },
        { name: 'David', age: 16 },
      ];

      expect(processUsers(users)).toEqual(['ALICE', 'CHARLIE']);
    });

    test('should enable point-free style programming', () => {
      const multiply = (factor: number) => (x: number) => x * factor;
      const add = (amount: number) => (x: number) => x + amount;
      const toString = (x: number) => x.toString();

      const transform = pipe(multiply(2), add(1), toString);

      expect(transform(5)).toBe('11');
      expect(transform(10)).toBe('21');
    });

    test('should work with method chaining alternative', () => {
      // Instead of: str.trim().toLowerCase().split(' ')
      const processString = pipe(
        (s: string) => s.trim(),
        (s: string) => s.toLowerCase(),
        (s: string) => s.split(' '),
      );

      expect(processString('  Hello World  ')).toEqual(['hello', 'world']);
    });
  });

  describe('Performance and practical usage', () => {
    test('should handle large chains efficiently', () => {
      const start = performance.now();

      const result = pipe(
        Array.from({ length: 1000 }, (_, i) => i),
        (arr: number[]) => arr.filter((x) => x % 2 === 0),
        (arr: number[]) => arr.map((x) => x * 2),
        (arr: number[]) => arr.slice(0, 10),
        (arr: number[]) => arr.reduce((sum, x) => sum + x, 0),
      );

      const end = performance.now();

      expect(result).toBe(180);
      expect(end - start).toBeLessThan(100); // Should be fast
    });

    test('should be composable with other functional utilities', () => {
      // Simulate using with other FP libraries
      const map =
        <T, U>(fn: (item: T) => U) =>
        (arr: T[]) =>
          arr.map(fn);
      const filter =
        <T>(predicate: (item: T) => boolean) =>
        (arr: T[]) =>
          arr.filter(predicate);
      const reduce =
        <T, U>(reducer: (acc: U, item: T) => U, initial: U) =>
        (arr: T[]) =>
          arr.reduce(reducer, initial);

      const processNumbers = pipe(
        filter((x: number) => x > 0),
        map((x: number) => x * 2),
        reduce((sum: number, x: number) => sum + x, 0),
      );

      expect(processNumbers([1, -2, 3, -4, 5])).toBe(18);
    });
  });
});
