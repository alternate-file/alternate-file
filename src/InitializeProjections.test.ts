import * as path from "path";
import * as tmp from "tmp";
import { ok, either } from "result-async";

import { initializeProjections } from "./InitializeProjections";
import { fileExists, readFile } from "./File";
import { projectionsFilename } from "./Projections";

describe("InitializeProjections", () => {
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

    await initializeProjections(testDirectory, "");

    await expectProjectionsToExist();

    expect(await readFile(testProjectionsPath)).toEqual(ok("{}\n"));
  });

  it("creates a new framework file", async () => {
    await expectProjectionsNotToExist();

    await initializeProjections(testDirectory, "react");

    await expectProjectionsToExist();

    either(
      await readFile(testProjectionsPath),
      content => expect(content).toContain(".test.jsx"),
      err => {
        throw err;
      }
    );
  });

  it("does not create a new file if there's already one", async () => {
    expect(await initializeProjections(testDirectory, "")).toHaveProperty("ok");
    expect(await initializeProjections(testDirectory, "")).toHaveProperty(
      "error"
    );
  });

  it("does not create a new file if its an unknown framework", async () => {
    expect(
      await initializeProjections(testDirectory, "something weird")
    ).toHaveProperty("error");

    await expectProjectionsNotToExist();
  });

  it("does not create a new file if its an unknown framework", async () => {
    expect(
      await initializeProjections(testDirectory, "something weird")
    ).toHaveProperty("error");

    await expectProjectionsNotToExist();
  });
});
