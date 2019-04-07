import * as path from "path";
import {
  pipeAsync,
  okChainAsync,
  ResultP,
  isOk,
  okChain,
  errorThen,
  ok,
  error,
  either,
  okThen,
  errorRescueAsync
} from "result-async";

import * as AlternatePattern from "../AlternatePattern";
import * as File from "../utils/File";
import { map, toPairs, flatten, compact } from "../utils/utils";

import { AlternateFileNotFoundError } from "./AlternateFileNotFoundError";

/**
 * the data type for a .projections.json file.
 */
export interface Projections {
  [sourcePattern: string]: SourceData;
}

export interface SourceData {
  alternate?: string | string[];
}

type ProjectionPair = [string, SourceData];
type SingleProjectionPair = [string, { alternate: string }];

export const projectionsFilename = ".projections.json";
const starRegex = /\*/;
const filenameRegex = /\{\}|\{filename\}/;

/**
 * Find the path of the alternate file (if the alternate file actually exists)
 * @param userFilePath
 * @return ResultP(alternate file path, list of all attempted alternate files)
 */
export const findAlternateFile = async (
  userFilePath: string
): ResultP<string, AlternateFileNotFoundError> => {
  const result = await findProjectionsFile(userFilePath);

  if (!isOk(result)) {
    return error({
      message: `No ${projectionsFilename} found as a parent of ${userFilePath}`,
      startingFile: userFilePath
    });
  }

  const projectionsPath = result.ok;
  const normalizedUserFilePath = path.resolve(userFilePath);

  return pipeAsync(
    projectionsPath,
    readProjections,
    okThen(projectionsToAlternatePatterns),
    okChainAsync(alternatePathIfExists(normalizedUserFilePath, projectionsPath))
  );
};

/**
 * Find the path of the alternate file if the alternate file actually exists, or create the file if it doesn't.
 * @param userFilePath
 * @return ResultP(alternate file path, error if no possible alternate file)
 *
 */
export const findOrCreateAlternateFile = async (
  userFilePath: string
): ResultP<string, AlternateFileNotFoundError> => {
  return pipeAsync(
    userFilePath,
    findAlternateFile,
    errorRescueAsync(async (err: AlternateFileNotFoundError) => {
      const alternatesAttempted = err.alternatesAttempted || [];
      if (alternatesAttempted.length === 0) {
        return error({
          ...err,
          message: `Couldn't create an alternate file for '${userFilePath}': it didn't match any known patterns.`
        });
      }

      const newAlternateFile = alternatesAttempted[0];

      return either(
        await File.makeFile(newAlternateFile),
        always(ok(newAlternateFile)),
        always(
          error({
            ...err,
            message: `Couldn't create file ${newAlternateFile}`
          })
        )
      );
    })
  );
};

/**
 * Parse the projections file into alternate pattern lookup objects.
 * @param projections
 */
export const projectionsToAlternatePatterns = (
  projections: Projections
): AlternatePattern.t[] => {
  const pairs = toPairs(projections) as ProjectionPair[];
  const allPairs = flatten(pairs.map(splitOutAlternates));

  return allPairs.map(projectionPairToAlternatePattern);
};

export const create = () => {};

export const findProjectionsFile = async (userFilePath: string) =>
  File.findFileFrom(projectionsFilename)(userFilePath);

/**
 * Read and parse the projections file.
 * @param userFilePath
 * @returns projections data
 */
export const readProjections = async (
  projectionsPath: string
): ResultP<Projections, AlternateFileNotFoundError> => {
  return pipeAsync(
    projectionsPath,
    File.readFile,
    okThen((data: string): string => (data === "" ? "{}" : data)),
    okChain((x: string) => File.parseJson<Projections>(x, projectionsPath)),
    errorThen((err: string) => ({
      startingFile: projectionsPath,
      message: err
    }))
  );
};

const splitOutAlternates = (pair: ProjectionPair): SingleProjectionPair[] => {
  const [main, { alternate }] = pair;

  if (Array.isArray(alternate)) {
    return alternate.map(
      foo => [main, { alternate: foo }] as SingleProjectionPair
    );
  }

  if (alternate) {
    return [[main, { alternate }]] as SingleProjectionPair[];
  }

  throw new Error(`${main} is missing the alternate key`);
};

/**
 * Go from alternate patterns to an alternate file path (if the file exists).
 * @param userFilePath - A file path to find an alternate file for.
 * @param patterns - Alternate Patterns from a projections file.
 */
const alternatePathIfExists = (
  userFilePath: string,
  projectionsPath: string
) => (
  patterns: AlternatePattern.t[]
): ResultP<string, AlternateFileNotFoundError> => {
  return pipeAsync(
    patterns,
    map(AlternatePattern.alternatePath(userFilePath, projectionsPath)),
    (paths: string[]) => compact(paths) as string[],
    File.findExisting,
    errorThen((alternatesAttempted: string[]) => ({
      alternatesAttempted,
      message: `No alternate found for ${userFilePath}. Tried: ${alternatesAttempted}`,
      startingFile: userFilePath
    }))
  );
};

const projectionPairToAlternatePattern = ([
  main,
  { alternate }
]: SingleProjectionPair): AlternatePattern.t => ({
  path: mainPathToAlternate(main),
  alternate: alternatePathToAlternate(alternate)
});

const mainPathToAlternate = (path: string): string => {
  if (!starRegex.test(path)) {
    throw new Error(`${path} is an invalid main projection path`);
  }

  const taggedPath = /\*\*/.test(path) ? path : path.replace("*", "**/*");

  return taggedPath.replace(/\*\*/g, "{directories}").replace("*", "{filename}");
};

const alternatePathToAlternate = (path: string): string => {
  if (!filenameRegex.test(path)) {
    throw new Error(`${path} is an invalid alternate projection path`);
  }

  return path.replace(/\{\}/g, "{directories}/{filename}");
};

const always = <T>(x: T) => (): T => x;