import * as path from "path";
import * as tmp from "tmp";
import { ok, okOrThrow } from "result-async";

import {
  initializeConfigFile,
  possibleFrameworks
} from "./InitializeConfig";
import { fileExists, readFile } from "../utils/File";
import { projectionsFilename } from "./Projections";

describe("InitializeConfig", () => {
  describe("possibleFrameworks", () => {
    it("starts with Empty", async () => {
      const frameworks = okOrThrow(await possibleFrameworks());

      expect(frameworks[0]).toEqual(["Empty", ""]);
    });
    it("looks up framework files", async () => {
      const frameworks = okOrThrow(await possibleFrameworks());
      expect(frameworks).toContainEqual(["React", "react"]);
    });
  });
  describe("initializeConfigFile", () => {
    let testDirectory: string;
    let testProjectionsPath: string;
    let testDirectoryCleaner: () => void;

    async function expectProjectionsToExist() {
      return expect(await fileExists(testProjectionsPath)).toHaveProperty("ok");
    }

    async function expectProjectionsNotToExist() {
      return expect(await fileExists(testProjectionsPath)).toHaveProperty(
        "error"
      );
    }

    // Create a temp directory to do file operations.
    beforeEach(done => {
      tmp.dir({ unsafeCleanup: true }, (err, dirPath, cleanupCallback) => {
        if (err) throw err;

        testDirectory = dirPath;
        testProjectionsPath = path.resolve(testDirectory, projectionsFilename);
        testDirectoryCleaner = cleanupCallback;

        done();
      });
    });

    // Delete temp directory after every test.
    afterEach(() => {
      testDirectoryCleaner();
    });

    it("creates a new empty file", async () => {
      await expectProjectionsNotToExist();

      await initializeConfigFile(testDirectory, "");

      await expectProjectionsToExist();

      expect(await readFile(testProjectionsPath)).toEqual(ok("{}\n"));
    });

    it("creates a new framework file", async () => {
      await expectProjectionsNotToExist();

      expect(
        await initializeConfigFile(testDirectory, "react")
      ).toHaveProperty("ok");

      await expectProjectionsToExist();

      expect(okOrThrow(await readFile(testProjectionsPath))).toContain(
        ".test.jsx"
      );
    });

    it("does not create a new file if there's already one", async () => {
      expect(
        await initializeConfigFile(testDirectory, "react")
      ).toHaveProperty("ok");
      expect(await initializeConfigFile(testDirectory, "")).toHaveProperty(
        "error"
      );
    });

    it("does not create a new file if its an unknown framework", async () => {
      expect(
        await initializeConfigFile(testDirectory, "something weird")
      ).toHaveProperty("error");

      await expectProjectionsNotToExist();
    });

    it("does not create a new file if its an unknown framework", async () => {
      expect(
        await initializeConfigFile(testDirectory, "something weird")
      ).toHaveProperty("error");

      await expectProjectionsNotToExist();
    });
  });
});
