import * as AlternatePattern from "./AlternatePattern";

describe("AlternatePattern", () => {
  const patterns: { [name: string]: AlternatePattern.t } = {
    splitTs: {
      path: "src/**/*.ts",
      alternate: "src/**/__test__/*.test.ts"
    },
    simpleRb: {
      path: "app/**/*.rb",
      alternate: "test/**/*_spec.rb"
    },
    jsxTemplate: {
      path: "src/**/{*|isUppercase}.jsx",
      alternate: "src/**/__test__/*.test.jsx",
      alternateTemplate: ["import {filename} from '{relativePath}';"]
    },
    conditionalTemplate: {
      path: "src/**/{*|isLowercase}.ts",
      alternate: "src/**/__test__/*.test.ts",
      alternateTemplate: [
        "import * as {filename|capitalize} from '{relativePath}';"
      ]
    },
    multiSplitTemplate: {
      path: "apps/**/lib/**/{basename}.ex",
      alternate: "apps/**/test/**/*_test.exs",
      alternateTemplate: ["alias {**|2|dedupe|dot|capitalize}"]
    }
  };

  const projectionsPath = "/project/.alternate-file.json5";

  describe("alternatePath", () => {
    describe("finding files", () => {
      it("finds an implementation from a test", () => {
        expect(
          AlternatePattern.alternatePath(
            "/project/src/components/__test__/Foo.test.ts",
            projectionsPath
          )(patterns.simpleJs)
        ).toBe("/project/src/components/Foo.ts");
      });

      it("finds alternate for short path", () => {
        expect(
          AlternatePattern.alternatePath(
            "/project/app/foo.rb",
            projectionsPath
          )(patterns.simpleRb)
        ).toBe("/project/test/foo_spec.rb");
      });

      it("finds ts specs", () => {
        expect(
          AlternatePattern.alternatePath(
            "/project/src/foo/bar.ts",
            projectionsPath
          )(patterns.splitTs)
        ).toBe("/project/src/foo/__test__/bar.test.ts");
      });

      it("fails conditional checks", () => {
        expect(
          AlternatePattern.alternatePath(
            "/project/src/foo/Bar.ts",
            projectionsPath
          )(patterns.splitTs)
        ).toBe(null);
      });

      it("returns null for non-matches", () => {
        expect(
          AlternatePattern.alternatePath(
            "/project/src/foo.rb",
            projectionsPath
          )(patterns.splitTs)
        ).toBe(null);
      });

      it("finds a match with multiple dirnames", () => {
        const path = AlternatePattern.alternatePath(
          "/project/apps/my_app/lib/accounts/user.ex",
          projectionsPath
        )(patterns.multiSplitTemplate);

        expect(path).toBe("/project/apps/my_app/test/accounts/user_test.exs");
      });
    });

    describe("filling templates", () => {
      it("fills a simple template", () => {
        const template = AlternatePattern.template(
          "/project/src/feature/Component.jsx"
        )(patterns.jsxTemplate);

        expect(template).toBe("import Component from '../Component';");
      });
    });
  });
});
