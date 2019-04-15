import {
  either,
  error,
  errorRescueAsync,
  ok,
  pipeAsync,
  ResultP,
  isError,
} from "result-async";

import * as AlternatePath from "../alternates/AlternatePath";
import * as File from "../utils/File";
import { map, pipe } from "../utils/utils";


/**
 * Find the first possible alternate that actually exists.
 */
export async function findExistingAlternateFile(
  possibleAlternates: AlternatePath.T[]
): ResultP<AlternatePath.T, null> {
  const result = await pipe(
    possibleAlternates,
    map(({ path }) => path),
    File.findExisting
  );

  if (isError(result)) return error(null);

  const foundFilePath = result.ok;
  const alternate = possibleAlternates.find(
    ({ path }) => path === foundFilePath
  ) as AlternatePath.T;

  return ok(alternate);
}

/**
 * Find the path of the alternate file if the alternate file actually exists, or create the file if it doesn't.
 * @return ResultP(alternate file path, error if no possible alternate file)
 */
export async function findOrCreateAlternateFile(
  possibleAlternates: AlternatePath.T[]
): ResultP<AlternatePath.T, string> {
  return pipeAsync(
    possibleAlternates,
    findExistingAlternateFile,
    errorRescueAsync(async () => {
      const alternate = possibleAlternates[0];
      return either(
        await File.makeFile(alternate.path),
        () => ok(alternate),
        () => error(`Couldn't create file ${alternate.path}`)
      );
    })
  );
}
