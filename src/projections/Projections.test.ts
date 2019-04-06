import * as Projection from "./Projections";

describe("Projection", () => {
  it("projectionsToAlternatePatterns parses *", () => {
    const projections: Projection.Projections = {
      "src/*.ts": { alternate: "src/test/{}.test.ts" },
      "app/*.rb": { alternate: "test/{}_spec.rb" }
    };

    expect(Projection.projectionsToAlternatePatterns(projections)).toEqual([
      {
        main: "src/{directories}/{filename}.ts",
        alternate: "src/test/{directories}/{filename}.test.ts"
      },
      {
        main: "app/{directories}/{filename}.rb",
        alternate: "test/{directories}/{filename}_spec.rb"
      }
    ]);
  });

  it("projectionsToAlternatePatterns parses ** and *", () => {
    const projections: Projection.Projections = {
      "src/**/*.ts": { alternate: "src/{directories}/__test__/{filename}.test.ts" }
    };

    expect(Projection.projectionsToAlternatePatterns(projections)).toEqual([
      {
        main: "src/{directories}/{filename}.ts",
        alternate: "src/{directories}/__test__/{filename}.test.ts"
      }
    ]);
  });

  it("projectionsToAlternatePatterns parses multiple", () => {
    const projections: Projection.Projections = {
      "src/*.ts": {
        alternate: [
          "src/test/{}.test.ts",
          "src/{directories}/__test__/{filename}.test.ts"
        ]
      }
    };

    expect(Projection.projectionsToAlternatePatterns(projections)).toEqual([
      {
        main: "src/{directories}/{filename}.ts",
        alternate: "src/test/{directories}/{filename}.test.ts"
      },
      {
        main: "src/{directories}/{filename}.ts",
        alternate: "src/{directories}/__test__/{filename}.test.ts"
      }
    ]);
  });
});
