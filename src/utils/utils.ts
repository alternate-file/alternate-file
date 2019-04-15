/**
 * Pipeable console.log
 * @param args - Varadic args to tag the log with.
 * @param data - Final data to console.log
 */
export const log = (...args: any[]) => <T>(data: T): T => {
  const logArgs = args.concat([data]);
  console.log(...logArgs);
  return data;
};

export const always = <T>(x: T) => (): T => x;

/**
 * Async sleep
 * @param milliseconds
 */
export const sleep = (milliseconds: number): Promise<number> => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

/**
 * Zip two arrays together. Output is the length of the first array.
 * @param array1
 * @param array2
 */
export const zip = <T, U>(array1: T[], array2: U[]): [T, U][] =>
  array1.map((a, i) => {
    const b = array2[i];
    return [a, b] as [T, U];
  });

/**
 * Pipeable version of String.replace
 * @param searchValue - The pattern to replace
 * @param replaceValue  - The value to replace the pattern with
 * @returns the updated string.
 */
export const replace = (searchValue: RegExp | string, replaceValue: string) => (
  oldString: string
): string => oldString.replace(searchValue, replaceValue);

export const map = <T, U>(f: (x: T) => U) => (xs: T[]): U[] => xs.map(f);

/** Convert an object to a list of tuples. */
export function toPairs<Value>(dictionary: {
  [key: string]: Value;
}): [string, Value][] {
  return Object.keys(dictionary).map(
    key => [key, dictionary[key]] as [string, Value]
  );
}

/** Convert to an object from a list of tuples. */
export function fromPairs<T>(pairs: [string, T][]): { [key: string]: T } {
  const object: { [key: string]: T } = {};

  pairs.forEach(([key, value]) => {
    object[key] = value;
  });
  return object;
}

/** Shallow flatten a list. */
export function flatten<T>(xss: T[][]): T[] {
  return xss.reduce((acc, xs) => acc.concat(xs), []);
}

export function compact<T>(xs: (T | undefined | null)[]): T[] {
  return reject(isNil, xs) as T[];
}

export function filter<T>(f: (x: T) => boolean, xs: T[]): T[] {
  return xs.reduce((acc: T[], x: T) => {
    if (!f(x)) return acc;

    acc.push(x);
    return acc;
  }, []);
}

export function reject<T>(f: (x: T) => boolean, xs: T[]): T[] {
  return filter(x => !f(x), xs);
}

export function isNil(x: any): boolean {
  return x === undefined || x === null;
}

export const titleCase = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

/** Map over the keys and values of an object */
export function mapObject<T, U>(
  object: { [key: string]: T },
  f: (key: string, value: T) => [string, U]
): { [key: string]: U } {
  const pairs = Object.keys(object).map(key => f(key, object[key]));
  return fromPairs(pairs);
}

type Unary<In, Out> = (x: In) => Out;

/**
 * Pipe the first argument through a series of transforming functions,
 * where each function takes the return from the previous one.
 *
 * Similar to Ramda's `pipe`, but is not curried.
 * @param start - The value to start with.
 * @param fs - The functions to pipe the value through.
 * @returns the return value of the final function.
 */
export function pipe<In, Out1, OutLast>(
  start: In,
  f2: Unary<In, OutLast>
): OutLast;

export function pipe<In, Out1, OutLast>(
  start: In,
  f1: Unary<In, Out1>,
  f2: Unary<Out1, OutLast>
): OutLast;

export function pipe<In, Out1, Out2, OutLast>(
  start: In,
  f1: Unary<In, Out1>,
  f2: Unary<Out1, Out2>,
  f3: Unary<Out2, OutLast>
): OutLast;

export function pipe<In, Out1, Out2, Out3, OutLast>(
  start: In,
  f1: Unary<In, Out1>,
  f2: Unary<Out1, Out2>,
  f3: Unary<Out2, Out3>,
  f4: Unary<Out3, OutLast>
): OutLast;

export function pipe<In, Out1, Out2, Out3, Out4, OutLast>(
  start: In,
  f1: Unary<In, Out1>,
  f2: Unary<Out1, Out2>,
  f3: Unary<Out2, Out3>,
  f4: Unary<Out3, Out4>,
  f5: Unary<Out4, OutLast>
): OutLast;

export function pipe<In, Out1, Out2, Out3, Out4, Out5, OutLast>(
  start: In,
  f1: Unary<In, Out1>,
  f2: Unary<Out1, Out2>,
  f3: Unary<Out2, Out3>,
  f4: Unary<Out3, Out4>,
  f5: Unary<Out4, Out5>,
  f6: Unary<Out5, OutLast>
): OutLast;

export function pipe<In, Out1, Out2, Out3, Out4, Out5, Out6, OutLast>(
  start: In,
  f1: Unary<In, Out1>,
  f2: Unary<Out1, Out2>,
  f3: Unary<Out2, Out3>,
  f4: Unary<Out3, Out4>,
  f5: Unary<Out4, Out5>,
  f6: Unary<Out5, Out6>,
  f7: Unary<Out6, OutLast>
): OutLast;

export function pipe<
  In,
  Out1,
  Out2,
  Out3,
  Out4,
  Out5,
  Out6,
  Out7,
  Out8,
  OutLast
>(
  start: In,
  f1: Unary<In, Out1>,
  f2: Unary<Out1, Out2>,
  f3: Unary<Out2, Out3>,
  f4: Unary<Out3, Out4>,
  f5: Unary<Out4, Out5>,
  f6: Unary<Out5, Out6>,
  f7: Unary<Out6, Out7>,
  f8: Unary<Out7, Out8>,
  f9: Unary<Out8, OutLast>
): OutLast;

export function pipe<
  In,
  Out1,
  Out2,
  Out3,
  Out4,
  Out5,
  Out6,
  Out7,
  Out8,
  Out9,
  OutLast
>(
  start: In,
  f1: Unary<In, Out1>,
  f2: Unary<Out1, Out2>,
  f3: Unary<Out2, Out3>,
  f4: Unary<Out3, Out4>,
  f5: Unary<Out4, Out5>,
  f6: Unary<Out5, Out6>,
  f7: Unary<Out6, Out7>,
  f8: Unary<Out7, Out8>,
  f9: Unary<Out8, Out9>,
  f10: Unary<Out9, OutLast>
): OutLast;

export function pipe<
  In,
  Out1,
  Out2,
  Out3,
  Out4,
  Out5,
  Out6,
  Out7,
  Out8,
  Out9,
  Out10,
  OutLast
>(
  start: In,
  f1: Unary<In, Out1>,
  f2: Unary<Out1, Out2>,
  f3: Unary<Out2, Out3>,
  f4: Unary<Out3, Out4>,
  f5: Unary<Out4, Out5>,
  f6: Unary<Out5, Out6>,
  f7: Unary<Out6, Out7>,
  f8: Unary<Out7, Out8>,
  f9: Unary<Out8, Out9>,
  f10: Unary<Out9, Out10>,
  f11: Unary<Out10, OutLast>
): OutLast;

export function pipe(start: any, ...fs: any) {
  let acc: any = start;

  for (const i in fs) {
    acc = fs[i](acc);
  }

  return acc;
}
