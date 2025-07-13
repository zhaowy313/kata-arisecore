/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, test, expect } from 'vitest';
import { curryLast } from '../src/utils/curryLast';

describe('curryLast function', () => {
  describe('Basic functionality', () => {
    test('should curry a simple function with 2 parameters', () => {
      const subtract = (a: number, b: number) => a - b;
      const curriedSubtract = curryLast(subtract);

      // Test different calling patterns
      expect(curriedSubtract(5, 3)).toBe(2); // 5 - 3 = 2
      expect(curriedSubtract(3)(5)).toBe(2); // 5 - 3 = 2 (data comes first)
    });

    test('should curry a function with 3 parameters', () => {
      const subtract3 = (a: number, b: number, c: number) => a - b - c;
      const curriedSubtract3 = curryLast(subtract3);

      // Test all possible calling patterns
      expect(curriedSubtract3(10, 2, 1)).toBe(7); // 10 - 2 - 1 = 7
      expect(curriedSubtract3(2, 1)(10)).toBe(7); // 10 - 2 - 1 = 7 (data comes first)
    });

    test('should curry a function with 4 parameters', () => {
      const calc4 = (a: number, b: number, c: number, d: number) => a - b - c - d;
      const curriedCalc4 = curryLast(calc4);

      // Test all possible calling patterns
      expect(curriedCalc4(20, 5, 3, 2)).toBe(10); // 20 - 5 - 3 - 2 = 10
      expect(curriedCalc4(5, 3, 2)(20)).toBe(10); // 20 - 5 - 3 - 2 = 10 (data comes first)
    });

    test('should handle single parameter functions', () => {
      const double = (x: number) => x * 2;
      const curriedDouble = curryLast(double);

      expect(curriedDouble(5)).toBe(10);
    });
  });

  describe('Practical examples', () => {
    test('should work with divide operation', () => {
      const divide = (dividend: number, divisor: number) => dividend / divisor;
      const curriedDivide = curryLast(divide);
      const divideBy2 = curriedDivide(2);
      const divideBy5 = curriedDivide(5);

      expect(divideBy2(10)).toBe(5); // 10 / 2 = 5
      expect(divideBy2(8)).toBe(4); // 8 / 2 = 4
      expect(divideBy5(25)).toBe(5); // 25 / 5 = 5
    });

    test('should work with string replace operation', () => {
      const replace = (text: string, search: string, replacement: string) =>
        text.replace(new RegExp(search, 'g'), replacement);

      const curriedReplace = curryLast(replace);
      const removeSpaces = curriedReplace(' ', '');
      const replaceCommas = curriedReplace(',', ';');

      expect(removeSpaces('hello world')).toBe('helloworld');
      expect(replaceCommas('a,b,c')).toBe('a;b;c');
    });
  });

  describe('Edge cases and type handling', () => {
    test('should work with boolean parameters', () => {
      const conditionalOp = (condition: boolean, trueVal: string, falseVal: string) =>
        condition ? trueVal : falseVal;

      const curriedConditional = curryLast(conditionalOp);
      const yesNo = curriedConditional('yes', 'no');

      expect(yesNo(true)).toBe('yes');
      expect(yesNo(false)).toBe('no');
    });

    test('should handle mixed parameter types', () => {
      const createUrl = (host: string, protocol: string, port: number) =>
        `${protocol}://${host}:${port}`;

      const curriedCreateUrl = curryLast(createUrl);
      const httpsOnPort443 = curriedCreateUrl('https', 443);

      expect(httpsOnPort443('example.com')).toBe('https://example.com:443');
    });

    test('should work with null and undefined values', () => {
      const checkValues = (a: any, b: any, c: any) => [a, b, c];
      const curriedCheck = curryLast(checkValues);

      expect(curriedCheck(null, undefined)(0)).toEqual([0, null, undefined]);
      expect(curriedCheck(0, null, undefined)).toEqual([0, null, undefined]);
    });
  });

  describe('Performance and behavior', () => {
    test('should maintain function behavior when fully applied', () => {
      const subtract = (a: number, b: number, c: number) => a - b - c;
      const curriedSubtract = curryLast(subtract);

      // Different ways of calling should produce the same result
      const result1 = curriedSubtract(10, 1, 2); // 10 - 1 - 2 = 7
      const result2 = subtract(10, 1, 2); // 10 - 1 - 2 = 7

      expect(result1).toBe(result2);
    });

    test('should handle excess parameters correctly', () => {
      const subtract = (a: number, b: number) => a - b;
      const curriedSubtract = curryLast(subtract);

      // Should ignore extra parameters and return result
      // @ts-ignore
      expect(curriedSubtract(5, 3, 10, 2)).toBe(2); // 5 - 3 = 2
    });

    test('should be reusable across multiple invocations', () => {
      const divide = (dividend: number, divisor: number) => dividend / divisor;
      const curriedDivide = curryLast(divide);
      const divideBy4 = curriedDivide(4);

      expect(divideBy4(20)).toBe(5);
      expect(divideBy4(16)).toBe(4);
      expect(divideBy4(12)).toBe(3);
    });
  });

  describe('Comparison with regular curry', () => {
    test('should demonstrate the difference between curry and curryLast', () => {
      const subtract = (a: number, b: number, c: number) => a - b - c;

      // With curryLast
      const curriedLastSubtract = curryLast(subtract);

      // curryLast: data (first parameter) can be provided last
      expect(curriedLastSubtract(10, 1, 2)).toBe(7); // 10 - 1 - 2 = 7
      expect(curriedLastSubtract(1, 2)(10)).toBe(7); // 10 - 1 - 2 = 7

      // Demonstrating the pattern
      expect(curriedLastSubtract(20, 5, 3)).toBe(12); // 20 - 5 - 3 = 12
    });

    test('should show practical use case differences', () => {
      const formatString = (text: string, prefix: string, suffix: string) =>
        `${prefix}${text}${suffix}`;

      const curriedLastFormat = curryLast(formatString);

      // Create reusable formatters where the text comes last (natural for functional programming)
      const addQuotes = curriedLastFormat('"', '"');
      const addBrackets = curriedLastFormat('[', ']');

      const texts = ['hello', 'world', 'test'];

      expect(texts.map(addQuotes)).toEqual(['"hello"', '"world"', '"test"']);
      expect(texts.map(addBrackets)).toEqual(['[hello]', '[world]', '[test]']);
    });
  });
});
