import { getIdentifiersFromPath } from "./FileIdentifiers";
import { okOrThrow, errorOrThrow } from "result-async";

describe("FileIdentifiers", () => {
  it("extracts identifiers from a matching pattern", () => {
    const identifiers = getIdentifiersFromPath(
      "/project/src/lib/group/foo.js",
      "src/{directories}/{filename}.js"
    );

    expect(okOrThrow(identifiers)).toEqual({
      directories: ["lib/group"],
      filename: "foo",
      absolutePath: "/project/src/lib/group/foo.js"
    });
  });

  it("returns an error when no match", () => {
    const identifiers = getIdentifiersFromPath(
      "/project/app/lib/group/foo.rb",
      "src/{directories}/{filename}.js"
    );

    expect(errorOrThrow(identifiers)).toBeTruthy();
  });
});
