import { runAllValidators } from "./ValidatorOperation";
import { error, ok } from "result-async";

describe("IdentifierValidator", () => {
  describe("filterValidators", () => {
    it("validates capitalized", () => {
      const result = runAllValidators("Foo", ["isCapitalized"]);
      expect(result).toEqual(ok("Foo"));
    });
    it("validates not capitalized", () => {
      const result = runAllValidators("foo", ["isCapitalized"]);
      expect(result).toEqual(error(null));
    });
  });
});
