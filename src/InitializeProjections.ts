import * as path from "path";
import {
  isOk,
  error,
  replaceError,
  ResultP,
  pipeAsync,
  asyncChainOk
} from "result-async";

import { fileExists, readFile, makeFile } from "./File";
import { projectionsFilename } from "./Projections";

/**
 * Create a .projections.json file for a given directory, if it doesn't exist already.
 * @param currentPath
 * @param frameworkName - The name of the framework. If it's blank, creates a blank .projections.json.
 *                        If it's unknown, returns an error.
 * @returns The new projections file path.
 */
export async function initializeProjections(
  currentPath: string,
  frameworkName: string
): ResultP<string, string> {
  const projectionsPath = path.resolve(currentPath, projectionsFilename);

  if (isOk(await fileExists(projectionsPath))) {
    return error(`${projectionsPath} already exists!`);
  }

  return pipeAsync(
    frameworkName,
    sampleFileName,
    fileExists,
    replaceError(
      `sorry, ${frameworkName} doesn't have a default projections file yet.`
    ),
    asyncChainOk(readFile),
    asyncChainOk(contents => makeFile(projectionsPath, contents))
  );
}

/** Returns the absolute path to a framework file. */
function sampleFileName(framework: string): string {
  const frameworkNamePart = framework ? `.${framework}` : "";
  return path.resolve(
    __dirname,
    `../sample-projections/projections${frameworkNamePart}.json`
  );
}
