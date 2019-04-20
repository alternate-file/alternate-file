import {
  either,
  error,
  errorRescueAsync,
  ok,
  pipeAsync,
  ResultP,
  isError
} from "result-async";

import * as AlternateFile from "./AlternateFile";
import * as File from "../utils/File";
import { map, pipe } from "../utils/utils";

export type AlternateFinder = (
  possibleAlternates: AlternateFile.T[]
) => ResultP<string, string>;

/**
 * Find the first possible alternate that actually exists.
 */
export const findExistingAlternateFile: AlternateFinder = async (
  possibleAlternates: AlternateFile.T[]
): ResultP<string, string> => {
  const result = await pipe(
    possibleAlternates,
    map(({ path }) => path),
    File.findExisting
  );

  if (isError(result)) {
    return error("Couldn't find any matching alternate files");
  }

  const foundFilePath = result.ok;
  const alternate = possibleAlternates.find(
    ({ path }) => path === foundFilePath
  ) as AlternateFile.T;

  return ok(alternate.path);
};

/**
 * Find the path of the alternate file if the alternate file actually exists, or create the file if it doesn't.
 * @return ResultP(alternate file path, error if no possible alternate file)
 */
export const findExistingOrCreateAlternateFile: AlternateFinder = async (
  possibleAlternates: AlternateFile.T[]
): ResultP<string, string> => {
  return pipeAsync(
    possibleAlternates,
    findExistingAlternateFile,
    errorRescueAsync(createAlternateFile(possibleAlternates))
  );
};

const createAlternateFile = (
  possibleAlternates: AlternateFile.T[]
) => async (): ResultP<string, string> => {
  const alternate = possibleAlternates[0];
  return either(
    await File.makeFile(alternate.path, alternate.contents),
    () => ok(alternate.path),
    () => error(`Couldn't create file ${alternate.path}`)
  );
};
