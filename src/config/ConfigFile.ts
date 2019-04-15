import * as path from "path";
import {
  error,
  errorThen,
  isError,
  okChain,
  okThen,
  pipeAsync,
  ResultP,
  Result
} from "result-async";

import * as AlternatePath from "../alternates/AlternatePath";
import * as File from "../utils/File";
import { map, flatten, compact, pipe } from "../utils/utils";

import { AlternateFileNotFoundError } from "../alternates/AlternateFileNotFoundError";
import { filterOks } from "../utils/result-utils";

export { ConfigFile as T };

/**
 * the data type for a .projections.json file.
 */
interface ConfigFile {
  rootPath: string;
  files: FileConfig[];
}

interface UserFileConfig {
  path: string;
  alternate: string | string[];
  template: string[];
  alternateTemplate: string[];
}

interface FileConfig {
  path: string;
  alternate: string;
  template: string;
  alternateTemplate: string;
}

// TODO: json5 or json
export const configFileName = ".alternate-file.json5";

/**
 * Find the path of the alternate file (if the alternate file actually exists)
 * @param userFilePath
 * @return ResultP(alternate file path, list of all attempted alternate files)
 */
export const possibleAlternateFiles = async (
  userFilePath: string
): ResultP<AlternatePath.T[], AlternateFileNotFoundError> => {
  const result = await findConfigFile(userFilePath);
  const normalizedUserFilePath = path.resolve(userFilePath);

  if (isError(result)) {
    return error({
      message: `No ${configFileName} found as a parent of ${normalizedUserFilePath}`,
      startingFile: userFilePath
    });
  }

  const configFilePath = result.ok;

  return pipeAsync(
    configFilePath,
    parseConfigFile,
    okThen(combineFileConfigs(result.ok)),
    okChain(getPossibleAlternates(normalizedUserFilePath))
  );
};

function findConfigFile(userFilePath: string): ResultP<string, string> {
  return File.findFileFrom(configFileName)(userFilePath);
}

/**
 * Read and parse the projections file.
 * @param userFilePath
 * @returns projections data
 */
const parseConfigFile = async (
  configFilePath: string
): ResultP<UserFileConfig[], AlternateFileNotFoundError> => {
  return pipeAsync(
    configFilePath,
    File.readFile,
    okThen((data: string): string => (data === "" ? "{}" : data)),
    okChain((x: string) => File.parseJson<UserFileConfig[]>(x, configFilePath)),
    errorThen((err: string) => ({
      startingFile: configFilePath,
      message: err
    }))
  );
};

const combineFileConfigs = (rootPath: string) => (
  fileConfigs: UserFileConfig[]
): ConfigFile => {
  const files = flatten(fileConfigs.map(splitOutFileAlternates));

  return {
    files,
    rootPath
  };
};

const splitOutFileAlternates = (fileConfig: UserFileConfig): FileConfig[] => {
  const alternates: string[] = Array.isArray(fileConfig.alternate)
    ? fileConfig.alternate
    : [fileConfig.alternate];

  return pipe(
    alternates,
    map(
      (alternate: string): FileConfig => ({
        alternate,
        path: fileConfig.path,
        template: fileConfig.template.join("\n"),
        alternateTemplate: fileConfig.alternateTemplate.join("\n")
      })
    ),
    map((fileConfig: FileConfig) => [
      fileConfig,
      flipAlternateToMain(fileConfig)
    ]),
    flatten
  );
};

const flipAlternateToMain = (fileConfig: FileConfig): FileConfig => ({
  path: fileConfig.alternate,
  alternate: fileConfig.path,
  template: fileConfig.alternateTemplate,
  alternateTemplate: fileConfig.template
});

const getPossibleAlternates = (userFilePath: string) => (
  config: ConfigFile
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
  fileConfig: FileConfig
): Result<AlternatePath.T, string> =>
  AlternatePath.findAlternatePath(
    rootPath,
    userFilePath,
    fileConfig.path,
    fileConfig.alternate,
    fileConfig.alternateTemplate
  );
