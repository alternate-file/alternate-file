import * as path from "path";
import * as tmp from "tmp";
import { ok, okOrThrow } from "result-async";

import { defaultConfigFileName } from "./ConfigFile";
import { initializeConfigFile, possibleFrameworks } from "./InitializeConfig";
import { fileExists, readFile } from "../utils/File";
// import { projectionsFilename } from "./Projections";

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
    let testConfigPath: string;
    let testDirectoryCleaner: () => void;

    async function expectConfigToExist() {
      return expect(await fileExists(testConfigPath)).toHaveProperty("ok");
    }

    async function expectConfigNotToExist() {
      return expect(await fileExists(testConfigPath)).toHaveProperty("error");
    }

    // Create a temp directory to do file operations.
    beforeEach(done => {
      tmp.dir({ unsafeCleanup: true }, (err, dirPath, cleanupCallback) => {
        if (err) throw err;

        testDirectory = dirPath;
        testConfigPath = path.resolve(testDirectory, defaultConfigFileName);
        testDirectoryCleaner = cleanupCallback;

        done();
      });
    });

    // Delete temp directory after every test.
    afterEach(() => {
      testDirectoryCleaner();
    });

    it("creates a new empty file", async () => {
      await expectConfigNotToExist();

      await initializeConfigFile(testDirectory, "");

      await expectConfigToExist();

      expect(await readFile(testConfigPath)).toEqual(ok("[]\n"));
    });

    it("creates a new framework file", async () => {
      await expectConfigNotToExist();

      expect(await initializeConfigFile(testDirectory, "react")).toHaveProperty(
        "ok"
      );

      await expectConfigToExist();

      expect(okOrThrow(await readFile(testConfigPath))).toContain(
        "React Component"
      );
    });

    it("does not create a new file if there's already one", async () => {
      expect(await initializeConfigFile(testDirectory, "react")).toHaveProperty(
        "ok"
      );
      expect(await initializeConfigFile(testDirectory, "")).toHaveProperty(
        "error"
      );
    });

    it("does not create a new file if its an unknown framework", async () => {
      expect(
        await initializeConfigFile(testDirectory, "something weird")
      ).toHaveProperty("error");

      await expectConfigNotToExist();
    });

    it("does not create a new file if its an unknown framework", async () => {
      expect(
        await initializeConfigFile(testDirectory, "something weird")
      ).toHaveProperty("error");

      await expectConfigNotToExist();
    });
  });
});
