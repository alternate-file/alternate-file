import * as UpgradeProjections from "./UpgradeProjections";
import * as Projections from "./Projections";

describe("Projection", () => {
  it("projectionsToAlternatePatterns parses *", () => {
    const projections: Projections.T = {
      "src/*.ts": { alternate: "src/test/{}.test.ts" },
      "app/*.rb": { alternate: "test/{}_spec.rb" }
    };

    expect(UpgradeProjections.projectionsToConfigFile(projections)).toEqual([
      {
        path: "src/{directories}/{filename}.ts",
        alternate: "src/test/{directories}/{filename}.test.ts"
      },
      {
        path: "app/{directories}/{filename}.rb",
        alternate: "test/{directories}/{filename}_spec.rb"
      }
    ]);
  });
});
