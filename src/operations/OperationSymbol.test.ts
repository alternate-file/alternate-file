import { addSymbolsToPattern } from "./OperationSymbol";

describe("OperationSymbol", () => {
  describe("sanitizePattern", () => {
    it("sanitizes stars without operators", () => {
      expect(addSymbolsToPattern("src/**/*.js")).toEqual(
        "src/{directories}/{filename}.js"
      );
    });

    it("sanitizes stars with operators", () => {
      expect(addSymbolsToPattern("src/{**}/{*|isCapitalized}.js")).toEqual(
        "src/{directories}/{filename|isCapitalized}.js"
      );
    });
  });
});
