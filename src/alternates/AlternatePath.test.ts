import { findAlternatePath, sanitizePattern } from "./AlternatePath";
import { okOrThrow, errorOrThrow } from "result-async";

describe("AlternatePath", () => {
  describe("sanitizePattern", () => {
    it("sanitizes stars without operators", () => {
      expect(sanitizePattern("src/**/*.js")).toEqual(
        "src/{directories}/{filename}.js"
      );
    });

    it("sanitizes stars with operators", () => {
      expect(sanitizePattern("src/{**}/{*|isCapitalized}.js")).toEqual(
        "src/{directories}/{filename|isCapitalized}.js"
      );
    });
  });
  describe("findAlternatePath", () => {
    it("finds an alternate path", () => {
      const alternate = findAlternatePath(
        "/tmp",
        "src/components/mine.js",
        "src/**/*.js",
        "src/**/__test__/*.test.js"
      );

      expect(okOrThrow(alternate)).toBe("src/components/__test__/mine.test.js");
    });

    it("returns an error when there's not a match", () => {
      const alternate = findAlternatePath(
        "/tmp",
        "app/components/mine.rb",
        "src/**/*.js",
        "src/**/__test__/*.test.js"
      );

      expect(errorOrThrow(alternate)).toBeTruthy();
    });
  });
});
