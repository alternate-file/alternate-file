import { patternToTransformers } from "./patterns/AlternatePath";

describe("AlternatePath", () => {
  describe("findAlternatePath", () => {
    it("works", () => {
      console.log(patternToTransformers("**/*.test.js"));
      console.log(
        patternToTransformers("{**|lowercase}/{*|isLowercase}.test.js")
      );
    });
  });
});
