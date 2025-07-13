/**
 * Transforms a function into a curried version that allows the data parameter to be provided last.
 *
 * A curryLast function can be called with fewer arguments than it expects,
 * returning a new function that takes the remaining arguments. The key feature is that
 * the first parameter (typically the data) can be provided either first (normal call)
 * or last (when partially applied).
 *
 * @param fn - The function to be curried with data-last parameter ordering
 * @returns A curried version where the data parameter can be provided last
 *
 * @example
 * ```typescript
 * // Basic usage - data parameter can be provided last
 * const subtract = (a: number, b: number, c: number) => a - b - c;
 * const curriedSubtract = curryLast(subtract);
 *
 * // These are equivalent:
 * curriedSubtract(10, 5, 2); // 10 - 5 - 2 = 3
 * curriedSubtract(5, 2)(10); // 10 - 5 - 2 = 3
 * ```
 *
 * @example
 * ```typescript
 * // Useful for creating specialized functions
 * const divide = (dividend: number, divisor: number) => dividend / divisor;
 * const curriedDivide = curryLast(divide);
 * const divideBy2 = curriedDivide(2);
 *
 * console.log(divideBy2(10)); // 10 / 2 = 5
 * console.log(divideBy2(8));  // 8 / 2 = 4
 * ```
 *
 * @example
 * ```typescript
 * // String operations where the text comes first, but can be provided last for functional programming
 * const replace = (text: string, search: string, replacement: string) =>
 *   text.replace(search, replacement);
 *
 * const curriedReplace = curryLast(replace);
 * const removeSpaces = curriedReplace(' ', '');
 *
 * console.log(removeSpaces('hello world')); // 'helloworld'
 * ```
 */
export function curryLast<S, R>(fn: (data: S) => R): CurriedLastFunction1<S, R>;
export function curryLast<S, A, R>(fn: (data: S, a: A) => R): CurriedLastFunction2<S, A, R>;
export function curryLast<S, A, B, R>(
  fn: (data: S, a: A, b: B) => R,
): CurriedLastFunction3<S, A, B, R>;
export function curryLast<S, A, B, C, R>(
  fn: (data: S, a: A, b: B, c: C) => R,
): CurriedLastFunction4<S, A, B, C, R>;
export function curryLast<S, A, B, C, D, R>(
  fn: (data: S, a: A, b: B, c: C, d: D) => R,
): CurriedLastFunction5<S, A, B, C, D, R>;
export function curryLast<Args extends any[], Return>(fn: (...args: Args) => Return): any {
  return function curriedLast(...args: any[]): any {
    if (args.length >= fn.length) {
      // If we have all arguments, call the function normally
      return fn(...(args as Args));
    }

    // For partial application: we're missing the data parameter
    // Return a function that takes the data parameter as the first argument
    return (data: any) => {
      // Call the original function with data first, then the other arguments
      return fn(...([data, ...args] as Args));
    };
  };
}

// Type definitions for curryLast functions
type CurriedLastFunction1<S, R> = {
  (data: S): R;
};

type CurriedLastFunction2<S, A, R> = {
  (a: A): (data: S) => R;
  (data: S, a: A): R;
};

type CurriedLastFunction3<S, A, B, R> = {
  (a: A, b: B): (data: S) => R;
  (data: S, a: A, b: B): R;
};

type CurriedLastFunction4<S, A, B, C, R> = {
  (a: A, b: B, c: C): (data: S) => R;
  (data: S, a: A, b: B, c: C): R;
};

type CurriedLastFunction5<S, A, B, C, D, R> = {
  (a: A, b: B, c: C, d: D): (data: S) => R;
  (data: S, a: A, b: B, c: C, d: D): R;
};
