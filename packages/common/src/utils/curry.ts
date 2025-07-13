/**
 * Transforms a function into a curried version that supports partial application.
 *
 * A curried function can be called with fewer arguments than it expects,
 * returning a new function that takes the remaining arguments. This enables
 * function composition and creates reusable specialized functions.
 *
 * @param fn - The function to be curried
 * @returns A curried version of the input function
 *
 * @example
 * ```typescript
 * // Basic usage with a simple function
 * const add = (a: number, b: number, c: number) => a + b + c;
 * const curriedAdd = curry(add);
 *
 * // All these calls are equivalent:
 * curriedAdd(1)(2)(3); // 6
 * curriedAdd(1, 2)(3); // 6
 * curriedAdd(1)(2, 3); // 6
 * curriedAdd(1, 2, 3); // 6
 * ```
 *
 * @example
 * ```typescript
 * // Creating specialized functions through partial application
 * const greet = (greeting: string, name: string, punctuation: string) =>
 *   `${greeting} ${name}${punctuation}`;
 *
 * const curriedGreet = curry(greet);
 * const sayHello = curriedGreet("Hello");
 * const sayHelloJohn = sayHello("John");
 *
 * console.log(sayHelloJohn("!")); // "Hello John!"
 * console.log(sayHelloJohn("?")); // "Hello John?"
 * ```
 *
 * @example
 * ```typescript
 * // Useful for functional programming patterns
 * const users = [
 *   { name: "Alice", age: 25 },
 *   { name: "Bob", age: 30 }
 * ];
 *
 * const prop = curry((key: string, obj: any) => obj[key]);
 * const getName = prop("name");
 *
 * const names = users.map(getName); // ["Alice", "Bob"]
 * ```
 */
export function curry<A, R>(fn: (a: A) => R): CurriedFunction1<A, R>;
export function curry<A, B, R>(fn: (a: A, b: B) => R): CurriedFunction2<A, B, R>;
export function curry<A, B, C, R>(fn: (a: A, b: B, c: C) => R): CurriedFunction3<A, B, C, R>;
export function curry<A, B, C, D, R>(
  fn: (a: A, b: B, c: C, d: D) => R,
): CurriedFunction4<A, B, C, D, R>;
export function curry<A, B, C, D, E, R>(
  fn: (a: A, b: B, c: C, d: D, e: E) => R,
): CurriedFunction5<A, B, C, D, E, R>;
export function curry<Args extends any[], Return>(fn: (...args: Args) => Return): any {
  return function curried(...args: any[]): any {
    if (args.length >= fn.length) {
      return fn(...(args as Args));
    }
    return (...nextArgs: any[]) => curried(...args, ...nextArgs);
  };
}

// Type definitions for curried functions
type CurriedFunction1<A, R> = {
  (a: A): R;
};

type CurriedFunction2<A, B, R> = {
  (a: A): CurriedFunction1<B, R>;
  (a: A, b: B): R;
};

type CurriedFunction3<A, B, C, R> = {
  (a: A): CurriedFunction2<B, C, R>;
  (a: A, b: B): CurriedFunction1<C, R>;
  (a: A, b: B, c: C): R;
};

type CurriedFunction4<A, B, C, D, R> = {
  (a: A): CurriedFunction3<B, C, D, R>;
  (a: A, b: B): CurriedFunction2<C, D, R>;
  (a: A, b: B, c: C): CurriedFunction1<D, R>;
  (a: A, b: B, c: C, d: D): R;
};

type CurriedFunction5<A, B, C, D, E, R> = {
  (a: A): CurriedFunction4<B, C, D, E, R>;
  (a: A, b: B): CurriedFunction3<C, D, E, R>;
  (a: A, b: B, c: C): CurriedFunction2<D, E, R>;
  (a: A, b: B, c: C, d: D): CurriedFunction1<E, R>;
  (a: A, b: B, c: C, d: D, e: E): R;
};
