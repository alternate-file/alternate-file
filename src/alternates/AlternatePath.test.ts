import { findAlternatePath } from "./AlternatePath";
import { okOrThrow, errorOrThrow } from "result-async";

describe("AlternatePath", () => {
  describe("findAlternatePath", () => {
    it("finds an alternate path", () => {
      const alternate = findAlternatePath(
        "/project/src/components/mine.js",
        "src/**/*.js",
        "src/**/__test__/*.test.js"
      );

      expect(okOrThrow(alternate)).toBe("src/components/__test__/mine.test.js");
    });

    it("returns an error when there's not a match", () => {
      const alternate = findAlternatePath(
        "/project/app/components/mine.rb",
        "src/**/*.js",
        "src/**/__test__/*.test.js"
      );

      expect(errorOrThrow(alternate)).toBeTruthy();
    });

    it("fills out a template", () => {
      const alternate = findAlternatePath(
        "/project/src/components/mine.js",
        "src/**/*.js",
        [
          "import {} from '{relativePath}'",
          "",
          "describe('{filename|capitalize}', () => {",
          "  it('', () => {",
          "  });",
          "});"
        ].join("\n"),
        "/project/src/components/__test__/mine.js"
      );

      expect(okOrThrow(alternate)).toBe(
        [
          "import {} from '../mine'",
          "",
          "describe('Mine', () => {",
          "  it('', () => {",
          "  });",
          "});"
        ].join("\n")
      );
    });
  });
});
