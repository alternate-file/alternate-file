import { Result } from "result-async";

import * as AlternatePath from "./AlternateFile";
import { map, pipe } from "../utils/utils";

import { AlternateFileNotFoundError } from "./AlternateFileNotFoundError";
import { filterOks } from "../utils/result-utils";
import * as ConfigFile from "../config/ConfigFile";

export const getPossibleAlternates = (userFilePath: string) => (
  config: ConfigFile.T
): Result<AlternatePath.T[], AlternateFileNotFoundError> => {
  return pipe(
    config.files,
    map(attemptToMatchAlternate(userFilePath, config.rootPath)),
    filterOks({
      message: `Couldn't create an alternate file for '${userFilePath}': it didn't match any known patterns.`,
      startingFile: userFilePath
    })
  );
};

const attemptToMatchAlternate = (userFilePath: string, rootPath: string) => (
  fileConfig: ConfigFile.FileConfig
): Result<AlternatePath.T, string> =>
  AlternatePath.findAlternatePath(
    rootPath,
    userFilePath,
    fileConfig.path,
    fileConfig.alternate,
    fileConfig.alternateTemplate
  );
