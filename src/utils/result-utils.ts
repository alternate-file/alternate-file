import { Result, ok, isError } from "result-async";

/**
 * Reduce, with the option of an early return.
 *
 * @param xs - An iterable list
 * @param f - A function that takes the accumulator and an element, and must
 *            return a Result. Return an Error to short-circuit the reduce,
 *            or an Ok to keep going.
 * @param start - The first value of the accumulator.
 * @returns The accumulator
 *
 * ```javascript
 * function countCharactersInLine(characters) {
 *   return reduceWhile(characters, (count, char) => {
 *     if (char === "\n") return error(count);
 *
 *     return ok(count + 1);
 *   }, 0)
 * }
 * countCharactersInLine("foo\nbar"); // 3
 * ```
 */
export function reduceWhile<Element, Acc>(
  xs: Element[],
  f: (acc: Acc, x: Element) => Result<Acc, Acc>,
  start: Acc
): Acc {
  let acc = start;

  for (const x of xs) {
    const result = f(acc, x);
    if (isError(result)) return result.error;

    acc = result.ok;
  }

  return acc;
}

/**
 * Reduce, with the option of an early return.
 *
 * @param xs - An iterable list
 * @param f - A function that takes the accumulator and an element, and must
 *            return a Result. Return an Error to short-circuit the reduce,
 *            or an Ok to keep going.
 * @param start - The first value of the accumulator.
 * @returns The accumulator
 *
 * ```javascript
 * function countCharactersInLine(characters) {
 *   return reduceUnless(characters, (count, char) => {
 *     if (char === "\n") return error("only pass one line!");
 *
 *     return ok(count + 1);
 *   }, 0)
 * }
 * countCharactersInLine("foo"); // ok(3)
 * countCharactersInLine("foo\nbar"); // error("only pass one line!")
 * ```
 */
export function reduceUnless<Element, Acc, ErrorMessage>(
  xs: Element[],
  f: (acc: Acc, x: Element) => Result<Acc, ErrorMessage>,
  start: Acc
): Result<Acc, ErrorMessage> {
  let acc = start;

  for (const x of xs) {
    const result = f(acc, x);
    if (isError(result)) return result;

    acc = result.ok;
  }

  return ok(acc);
}
