import { getIdentifiersFromPath } from "./FileIdentifiers";
import { okOrThrow, errorOrThrow } from "result-async";

describe("FileIdentifiers", () => {
  it("extracts identifiers from a matching pattern", () => {
    const identifiers = getIdentifiersFromPath(
      "src/lib/group/foo.js",
      "src/{directories}/{filename}.js",
      "/tmp"
    );

    expect(okOrThrow(identifiers)).toEqual({
      directories: ["lib/group"],
      filename: "foo",
      rootPath: "/tmp"
    });
  });

  it("returns an error when no match", () => {
    const identifiers = getIdentifiersFromPath(
      "app/lib/group/foo.rb",
      "src/{directories}/{filename}.js",
      "/tmp"
    );

    expect(errorOrThrow(identifiers)).toBeTruthy();
  });
});
