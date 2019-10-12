import * as path from "path";
import * as tmp from "tmp";
import { okChainAsync } from "result-async";
import { pipeA } from "pipeout";

import { fileExists, makeFile } from "./File";

import { findOrCreateAlternateFile, initializeProjections } from "./index";

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

      await initializeProjections(testDirectory, "react");
      done();
    });
  });

  // Delete temp directory after every test.
  afterEach(() => {
    testDirectoryCleaner();
  });

  describe("findAlternateFile", () => {
    it("creates a file and its implementation in a new subdirectory", async () => {
      const implementation = path.resolve(testDirectory, "main.js");

      // prettier-ignore
      await pipeA
        (implementation)
        (makeFile)
        (okChainAsync(findOrCreateAlternateFile))
        .value

      await expectFileToExistInTestDir("main.js");
      await expectFileToExistInTestDir("__test__/main.test.js");
    });
  });
});
