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
