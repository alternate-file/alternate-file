import * as utils from "./utils";

describe("utils", () => {
  describe("log", () => {
    it("returns the passing in data", () => {
      jest
        .spyOn(console, "log")
        .mockImplementation((..._args: any[]) => (x: any) => x);

      expect(utils.log("a test")(1)).toBe(1);
    });
  });

  describe("zip", () => {
    it("zips two arrays", () => {
      expect(utils.zip([1, 2, 3], [4, 5, 6])).toEqual([[1, 4], [2, 5], [3, 6]]);
    });
  });

  describe("replace", () => {
    it("replaces text in a string", () => {
      const numberReplacer = utils.replace(/\d/g, "*");
      expect(numberReplacer("123-12-1234")).toEqual("***-**-****");
    });
  });

  describe("toPairs", () => {
    it("converts a dictionary to pairs", () => {
      const dictionary = {
        a: 1,
        b: 2
      };
      expect(utils.toPairs(dictionary)).toEqual([["a", 1], ["b", 2]]);
    });
  });

  describe("flatten", () => {
    it("flattens a deep list once", () => {
      const list = [[1, 2], [3, [4, 5], 6]];
      expect(utils.flatten(list)).toEqual([1, 2, 3, [4, 5], 6]);
    });
  });

  describe("filter", () => {
    it("filters stuff", () => {
      const list = [1, null, 2, undefined];
      expect(utils.compact(list)).toEqual([1, 2]);
    });
  });

  describe("compact", () => {
    it("removes nils", () => {
      const list = [1, null, 2, undefined];
      expect(utils.compact(list)).toEqual([1, 2]);
    });
  });
});
