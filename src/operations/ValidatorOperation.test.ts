import { runAllValidators } from "./ValidatorOperation";
import { errorOrThrow, okOrThrow } from "result-async";

describe("IdentifierValidator", () => {
  describe("filterValidators", () => {
    it("validates capitalized", () => {
      const result = runAllValidators("Foo", ["isCapitalized"]);
      expect(okOrThrow(result)).toBe("Foo");
    });
    it("validates not capitalized", () => {
      const result = runAllValidators("foo", ["isCapitalized"]);
      expect(errorOrThrow(result)).toBe(null);
    });
  });
});
