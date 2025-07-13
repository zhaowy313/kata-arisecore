/**
 * Performs left-to-right function composition. The leftmost function may have any arity;
 * the remaining functions must be unary.
 *
 * The pipe function supports two calling patterns:
 * 1. pipe(value, fn1, fn2, fn3) - applies functions to value immediately
 * 2. pipe(fn1, fn2, fn3)(value) - returns a composed function
 *
 * @param args - Either a value followed by functions, or just functions
 * @returns Either the result of applying functions to value, or a composed function
 *
 * @example
 * ```typescript
 * // Direct application
 * const result = pipe(
 *   5,
 *   x => x * 2,
 *   x => x + 1,
 *   x => x.toString()
 * ); // "11"
 * ```
 *
 * @example
 * ```typescript
 * // Function composition
 * const transform = pipe(
 *   (x: number) => x * 2,
 *   x => x + 1,
 *   x => x.toString()
 * );
 * const result = transform(5); // "11"
 * ```
 *
 * @example
 * ```typescript
 * // Working with arrays
 * const numbers = [1, 2, 3, 4, 5];
 * const result = pipe(
 *   numbers,
 *   arr => arr.filter(x => x > 2),
 *   arr => arr.map(x => x * 2),
 *   arr => arr.reduce((sum, x) => sum + x, 0)
 * ); // 24
 * ```
 */

// Overloads for direct application pattern: pipe(value, fn1, fn2, ...)
export function pipe<A>(value: A): A;
export function pipe<A, B>(value: A, fn1: (a: A) => B): B;
export function pipe<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C;
export function pipe<A, B, C, D>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): D;
export function pipe<A, B, C, D, E>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
): E;
export function pipe<A, B, C, D, E, F>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
): F;
export function pipe<A, B, C, D, E, F, G>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
): G;
export function pipe<A, B, C, D, E, F, G, H>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
): H;
export function pipe<A, B, C, D, E, F, G, H, I>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
): I;
export function pipe<A, B, C, D, E, F, G, H, I, J>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
  fn9: (i: I) => J,
): J;
export function pipe<A, B, C, D, E, F, G, H, I, J, K>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
  fn9: (i: I) => J,
  fn10: (j: J) => K,
): K;

// Overloads for composition pattern: pipe(fn1, fn2, ...)(value)
export function pipe<A, B>(fn1: (a: A) => B): (value: A) => B;
export function pipe<A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C): (value: A) => C;
export function pipe<A, B, C, D>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
): (value: A) => D;
export function pipe<A, B, C, D, E>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
): (value: A) => E;
export function pipe<A, B, C, D, E, F>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
): (value: A) => F;
export function pipe<A, B, C, D, E, F, G>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
): (value: A) => G;
export function pipe<A, B, C, D, E, F, G, H>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
): (value: A) => H;
export function pipe<A, B, C, D, E, F, G, H, I>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
): (value: A) => I;
export function pipe<A, B, C, D, E, F, G, H, I, J>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
  fn9: (i: I) => J,
): (value: A) => J;
export function pipe<A, B, C, D, E, F, G, H, I, J, K>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
  fn9: (i: I) => J,
  fn10: (j: J) => K,
): (value: A) => K;

// Implementation
export function pipe(...args: any[]): any {
  if (args.length === 0) {
    throw new Error('pipe requires at least one argument');
  }

  // Check if first argument is a function
  const isFirstArgFunction = typeof args[0] === 'function';

  if (isFirstArgFunction) {
    // Composition pattern: pipe(fn1, fn2, fn3)(value)
    const functions = args as Array<(arg: any) => any>;
    return (value: any) => functions.reduce((acc, fn) => fn(acc), value);
  } else {
    // Direct application pattern: pipe(value, fn1, fn2, fn3)
    const [value, ...functions] = args;
    if (functions.length === 0) {
      return value;
    }
    return functions.reduce((acc, fn) => fn(acc), value);
  }
}
