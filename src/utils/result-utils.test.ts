import { ok, error } from "result-async";

import { reduceWhile, reduceUnless } from "./result-utils";

describe("reduceWhile", () => {
  function countCharactersInLine(characters: string[]) {
    return reduceWhile(
      characters,
      (count: number, char: string) => {
        if (char === "\n") return error(count);

        return ok(count + 1);
      },
      0
    );
  }

  it("returns early", () => {
    expect(countCharactersInLine("foo\nbar".split(""))).toEqual(3);
  });

  it("reduces completely", () => {
    expect(countCharactersInLine("foobar".split(""))).toEqual(6);
  });
});

describe("reduceUnless", () => {
  function countCharactersInLine(characters: string[]) {
    return reduceUnless(
      characters,
      (count, char) => {
        if (char === "\n") return error("only pass one line!");

        return ok(count + 1);
      },
      0
    );
  }

  it("returns early", () => {
    expect(countCharactersInLine("foo\nbar".split(""))).toEqual(
      error("only pass one line!")
    );
  });

  it("reduces completely", () => {
    expect(countCharactersInLine("foo".split(""))).toEqual(ok(3));
  });
});
