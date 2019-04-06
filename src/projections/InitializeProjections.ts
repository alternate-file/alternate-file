import * as path from "path";
import {
  isOk,
  okThen,
  error,
  errorReplace,
  ResultP,
  pipeAsync,
  okChainAsync
} from "result-async";

import { fileExists, readFile, makeFile, ls } from "../utils/File";
import { map, titleCase } from "../utils/utils";
import { projectionsFilename } from "./Projections";

const sampleProjectionsDirectory = path.resolve(
  __directories,
  "../sample-projections"
);

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
    errorReplace(
      `sorry, ${frameworkName} doesn't have a default projections file yet.`
    ),
    okChainAsync(readFile),
    okChainAsync(contents => makeFile(projectionsPath, contents))
  );
}

/**
 * Get a list of known frameworks, and their human-readable names.
 * @returns a list of [name, value] pairs. Send the value to initializeProjections.
 */
export async function possibleFrameworks(): ResultP<
  [string, string][],
  string
> {
  return pipeAsync(
    sampleProjectionsDirectory,
    ls,
    okThen(map(frameworkFromSampleFilename)),
    okThen(frameworkNamesToTitlePair)
  );
}

/** Returns the absolute path to a framework file. */
function sampleFileName(framework: string): string {
  const frameworkNamePart = framework ? `.${framework}` : "";
  return path.resolve(
    sampleProjectionsDirectory,
    `projections${frameworkNamePart}.json`
  );
}

function frameworkFromSampleFilename(fileName: string): string {
  const matches = fileName.match(/projections(?:\.(.+))?.json/);

  if (!matches) return "";

  return matches[1] || "";
}

function frameworkNamesToTitlePair(frameworks: string[]): [string, string][] {
  return frameworks.sort().map(framework => {
    const name = framework ? titleCase(framework) : "Empty";
    return [name, framework] as [string, string];
  });
}
