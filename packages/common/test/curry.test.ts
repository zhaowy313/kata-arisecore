/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, test, expect } from 'vitest';
import { curry } from '../src/utils/curry';

describe('curry function', () => {
  describe('Basic functionality', () => {
    test('should curry a simple function with 2 parameters', () => {
      const add = (a: number, b: number) => a + b;
      const curriedAdd = curry(add);

      // Test different calling patterns
      expect(curriedAdd(5)(3)).toBe(8);
      expect(curriedAdd(5, 3)).toBe(8);
    });

    test('should curry a function with 3 parameters', () => {
      const add3 = (a: number, b: number, c: number) => a + b + c;
      const curriedAdd3 = curry(add3);

      // Test all possible calling patterns
      expect(curriedAdd3(1)(2)(3)).toBe(6);
      expect(curriedAdd3(1, 2)(3)).toBe(6);
      expect(curriedAdd3(1)(2, 3)).toBe(6);
      expect(curriedAdd3(1, 2, 3)).toBe(6);
    });

    test('should curry a function with 4 parameters', () => {
      const add4 = (a: number, b: number, c: number, d: number) => a + b + c + d;
      const curriedAdd4 = curry(add4);

      expect(curriedAdd4(1)(2)(3)(4)).toBe(10);
      expect(curriedAdd4(1, 2)(3, 4)).toBe(10);
      expect(curriedAdd4(1)(2, 3, 4)).toBe(10);
      expect(curriedAdd4(1, 2, 3, 4)).toBe(10);
    });

    test('should curry a function with 5 parameters', () => {
      const add5 = (a: number, b: number, c: number, d: number, e: number) => a + b + c + d + e;
      const curriedAdd5 = curry(add5);

      expect(curriedAdd5(1)(2)(3)(4)(5)).toBe(15);
      expect(curriedAdd5(1, 2)(3, 4)(5)).toBe(15);
      expect(curriedAdd5(1)(2, 3, 4, 5)).toBe(15);
      expect(curriedAdd5(1, 2, 3, 4, 5)).toBe(15);
    });

    test('should handle single parameter functions', () => {
      const double = (x: number) => x * 2;
      const curriedDouble = curry(double);

      expect(curriedDouble(5)).toBe(10);
    });
  });

  describe('Partial application', () => {
    test('should create reusable specialized functions', () => {
      const greet = (greeting: string, name: string, punctuation: string) =>
        `${greeting} ${name}${punctuation}`;

      const curriedGreet = curry(greet);
      const sayHello = curriedGreet('Hello');
      const sayHelloJohn = sayHello('John');

      expect(sayHelloJohn('!')).toBe('Hello John!');
      expect(sayHelloJohn('?')).toBe('Hello John?');
      expect(sayHelloJohn('.')).toBe('Hello John.');
    });

    test('should work with property access pattern', () => {
      const users = [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 },
      ];

      const prop = curry((key: string, obj: any) => obj[key]);
      const getName = prop('name');
      const getAge = prop('age');

      const names = users.map(getName);
      const ages = users.map(getAge);

      expect(names).toEqual(['Alice', 'Bob']);
      expect(ages).toEqual([25, 30]);
    });

    test('should enable function composition', () => {
      const multiply = curry((a: number, b: number) => a * b);
      const add = curry((a: number, b: number) => a + b);

      const multiplyBy2 = multiply(2);
      const add10 = add(10);

      const numbers = [1, 2, 3, 4, 5];
      const result = numbers.map(multiplyBy2).map(add10);

      expect(result).toEqual([12, 14, 16, 18, 20]);
    });
  });

  describe('Edge cases', () => {
    test('should handle functions that return functions', () => {
      const createAdder = (x: number) => (y: number) => x + y;
      const curriedCreateAdder = curry(createAdder);

      const add5 = curriedCreateAdder(5);
      expect(add5(3)).toBe(8);
    });

    test('should work with boolean parameters', () => {
      const logicalOp = (a: boolean, b: boolean, operation: string) => {
        if (operation === 'and') return a && b;
        if (operation === 'or') return a || b;
        return false;
      };

      const curriedLogical = curry(logicalOp);
      const andOp = curriedLogical(true, false);

      expect(andOp('and')).toBe(false);
      expect(andOp('or')).toBe(true);
    });

    test('should handle mixed parameter types', () => {
      const formatter = (template: string, value: number, format: boolean) =>
        format ? `[${template}: ${value}]` : `${template}: ${value}`;

      const curriedFormatter = curry(formatter);
      const priceFormatter = curriedFormatter('Price');
      const formattedPrice = priceFormatter(100);

      expect(formattedPrice(true)).toBe('[Price: 100]');
      expect(formattedPrice(false)).toBe('Price: 100');
    });

    test('should work with null and undefined values', () => {
      const checkValues = (a: any, b: any, c: any) => [a, b, c];
      const curriedCheck = curry(checkValues);

      expect(curriedCheck(null)(undefined)(0)).toEqual([null, undefined, 0]);
      expect(curriedCheck(null, undefined, 0)).toEqual([null, undefined, 0]);
    });

    test('should handle array parameters', () => {
      const arrayOp = (arr: number[], multiplier: number, addValue: number) =>
        arr.map((x) => x * multiplier + addValue);

      const curriedArrayOp = curry(arrayOp);
      const processArray = curriedArrayOp([1, 2, 3]);
      const doubleAndAdd5 = processArray(2);

      expect(doubleAndAdd5(5)).toEqual([7, 9, 11]);
    });

    test('should handle object parameters', () => {
      const updateUser = (user: { name: string; age: number }, field: string, value: any) => ({
        ...user,
        [field]: value,
      });

      const curriedUpdate = curry(updateUser);
      const updateAge = curriedUpdate({ name: 'John', age: 25 }, 'age');

      expect(updateAge(30)).toEqual({ name: 'John', age: 30 });
    });
  });

  describe('Performance and behavior', () => {
    test('should maintain function identity when fully applied', () => {
      const sum = (a: number, b: number, c: number) => a + b + c;
      const curriedSum = curry(sum);

      // Different ways of calling should produce the same result
      const result1 = curriedSum(1, 2, 3);
      const result2 = sum(1, 2, 3);

      expect(result1).toBe(result2);
    });

    test('should handle excess parameters correctly', () => {
      const add = (a: number, b: number) => a + b;
      const curriedAdd = curry(add);

      // Should ignore extra parameters and return result
      // @ts-ignore
      expect(curriedAdd(1, 2, 3, 4)).toBe(3);
    });

    test('should be reusable across multiple invocations', () => {
      const multiply = curry((a: number, b: number) => a * b);
      const multiplyBy3 = multiply(3);

      expect(multiplyBy3(4)).toBe(12);
      expect(multiplyBy3(5)).toBe(15);
      expect(multiplyBy3(6)).toBe(18);
    });

    test('should work with non-recursive curried functions', () => {
      const power = (base: number, exponent: number) => Math.pow(base, exponent);
      const curriedPower = curry(power);
      const square = curriedPower(2);

      expect(square(4)).toBe(16);
      expect(curriedPower(3, 2)).toBe(9);
      expect(curriedPower(3)(2)).toBe(9);
    });
  });

  describe('Type safety scenarios', () => {
    test('should work with string manipulation functions', () => {
      const padString = (str: string, length: number, char: string) => str.padStart(length, char);

      const curriedPad = curry(padString);
      const padWith0 = curriedPad('123', 5);

      expect(padWith0('0')).toBe('00123');
    });

    test('should handle date operations', () => {
      const formatDate = (date: Date, locale: string, options: Intl.DateTimeFormatOptions) =>
        date.toLocaleDateString(locale, options);

      const curriedFormat = curry(formatDate);
      const formatEnglish = curriedFormat(new Date('2023-12-25'), 'en-US');

      const result = formatEnglish({ year: 'numeric', month: 'long', day: 'numeric' });
      expect(result).toContain('December');
      expect(result).toContain('25');
      expect(result).toContain('2023');
    });
  });

  describe('Functional programming patterns', () => {
    test('should work in map/filter/reduce chains', () => {
      const numbers = [1, 2, 3, 4, 5];

      const multiply = curry((factor: number, value: number) => factor * value);
      const isGreaterThan = curry((threshold: number, value: number) => value > threshold);
      const sum = curry((acc: number, value: number) => acc + value);

      const multiplyBy2 = multiply(2);
      const greaterThan5 = isGreaterThan(5);

      const result = numbers.map(multiplyBy2).filter(greaterThan5).reduce(sum, 0);

      expect(result).toBe(24); // [6, 8, 10] -> 24
    });

    test('should enable point-free style programming', () => {
      const data = [
        { name: 'apple', price: 1.5 },
        { name: 'banana', price: 0.8 },
        { name: 'cherry', price: 3.0 },
      ];

      const getProperty = curry((prop: string, obj: any) => obj[prop]);
      const multiplyBy = curry((factor: number, value: number) => factor * value);

      const getName = getProperty('name');
      const getPrice = getProperty('price');
      const doublePrice = multiplyBy(2);

      const names = data.map(getName);
      const doubledPrices = data.map(getPrice).map(doublePrice);

      expect(names).toEqual(['apple', 'banana', 'cherry']);
      expect(doubledPrices).toEqual([3.0, 1.6, 6.0]);
    });

    test('should work with higher-order functions', () => {
      const applyToAll = curry((fn: (x: number) => number, arr: number[]) => arr.map(fn));
      const add = curry((a: number, b: number) => a + b);

      const add10ToAll = applyToAll(add(10));

      expect(add10ToAll([1, 2, 3])).toEqual([11, 12, 13]);
    });
  });

  describe('Complex scenarios', () => {
    test('should handle deeply nested currying', () => {
      const complex = (a: number) => (b: number) => (c: number) => (d: number) => a + b + c + d;
      const curriedComplex = curry(complex);

      // Should work the same way as manual currying
      expect(curriedComplex(1)(2)(3)(4)).toBe(10);
    });

    test('should work with async function wrappers', async () => {
      const asyncAdd = async (a: number, b: number, c: number) => {
        return new Promise<number>((resolve) => {
          setTimeout(() => resolve(a + b + c), 1);
        });
      };

      const curriedAsyncAdd = curry(asyncAdd);
      const partialAsync = curriedAsyncAdd(1, 2);

      const result = await partialAsync(3);
      expect(result).toBe(6);
    });

    test('should maintain context for method-like functions', () => {
      const context = { multiplier: 10 };
      const contextualMultiply = function (this: typeof context, a: number, b: number) {
        return (a + b) * this.multiplier;
      };

      const curriedContextual = curry(contextualMultiply.bind(context));
      const add5AndMultiply = curriedContextual(5);

      expect(add5AndMultiply(3)).toBe(80); // (5 + 3) * 10
    });
  });
});
