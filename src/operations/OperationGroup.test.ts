import { validateIdentifier, OperationType } from "./OperationGroup";
import { okOrThrow, errorOrThrow } from "result-async";

describe("OperationGroup", () => {
  describe("validateIdentifier", () => {
    it("validates a valid identifier", () => {
      const result = validateIdentifier(
        {
          type: OperationType.Filename,
          operations: ["isLowercase"]
        },
        "foo"
      );

      expect(okOrThrow(result)).toBe("foo");
    });
    it("finds an invalid identifier", () => {
      const result = validateIdentifier(
        {
          type: OperationType.Filename,
          operations: ["isCapitalized"]
        },
        "foo"
      );

      expect(errorOrThrow(result)).toBe(null);
    });
  });
});
