import { noExtension } from "./TransformerOperation";

describe("TransformerOperation", () => {
  describe("noExtension", () => {
    it("works", () => {
      expect(noExtension("foo.js")).toBe("foo");
    });
  });
});
