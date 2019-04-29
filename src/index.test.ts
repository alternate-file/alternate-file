import * as path from "path";
import * as tmp from "tmp";
import { pipeAsync, okChainAsync } from "result-async";

import { fileExists, makeFile } from "./utils/File";

import { findOrCreateAlternateFile, initializeConfigFile } from "./index";

describe("Integration Test", () => {
  let testDirectory: string;
  let testDirectoryCleaner: () => void;

  async function expectFileToExistInTestDir(fileName: string) {
    const filePath = path.resolve(testDirectory, fileName);
    expect(await fileExists(filePath)).toHaveProperty("ok");
  }

  // Create a temp directory to do file operations.
  beforeEach(done => {
    tmp.dir({ unsafeCleanup: true }, async (err, dirPath, cleanupCallback) => {
      if (err) throw err;

      testDirectory = dirPath;
      testDirectoryCleaner = cleanupCallback;

      await initializeConfigFile(testDirectory, "react");

      done();
    });
  });

  // Delete temp directory after every test.
  afterEach(() => {
    testDirectoryCleaner();
  });

  describe("findAlternateFile", () => {
    it("creates a file and its implementation in a new subdirectory", async () => {
      const implementation = path.resolve(testDirectory, "src/main.js");
      const result = await pipeAsync(
        implementation,
        makeFile,
        okChainAsync(findOrCreateAlternateFile)
      );

      await expectFileToExistInTestDir("src/main.js");

      expect(result).toHaveProperty("ok");

      await expectFileToExistInTestDir("src/main.js");
      await expectFileToExistInTestDir("src/__tests__/main.test.js");
    });
  });
});
