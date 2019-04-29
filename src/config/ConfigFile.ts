import * as path from "path";
import {
  error,
  errorThen,
  isError,
  okChain,
  okThen,
  pipeAsync,
  ResultP
} from "result-async";

import * as Projections from "./Projections";

import * as File from "../utils/File";
import { map, flatten, pipe } from "../utils/utils";

import { AlternateFileNotFoundError } from "../alternates/AlternateFileNotFoundError";

import { ConfigFile, UserFileConfig, FileConfig } from "./types";
import * as UpgradeProjections from "./UpgradeProjections";

export { ConfigFile as T };

// TODO: json5 or json
export const configFileNames = [
  ".alternate-file.json",
  ".alternate-file.json5",
  Projections.projectionsFilename
];

export const defaultConfigFileName = configFileNames[0];

/**
 * Find the path of the alternate file (if the alternate file actually exists)
 * @param userFilePath
 * @return ResultP(alternate file path, list of all attempted alternate files)
 */
export const lookupConfig = async (
  userFilePath: string
): ResultP<ConfigFile, AlternateFileNotFoundError> => {
  const result = await findConfigFile(userFilePath);
  const normalizedUserFilePath = path.resolve(userFilePath);

  if (isError(result)) {
    return error({
      message: noConfigFileMessage(normalizedUserFilePath),
      startingFile: userFilePath
    });
  }

  const configFilePath = result.ok;
  const configFileDirectory = path.dirname(configFilePath)
  const configFileParser = isProjectionsFile(configFilePath)
    ? UpgradeProjections.parseProjectionsFile
    : parseConfigFile;

  return pipeAsync(
    configFilePath,
    configFileParser,
    okThen(combineFileConfigs(configFileDirectory))
  );
};

function noConfigFileMessage(path: string): string {
  const names = configFileNames.join("|");
  return `No file matching (${names}) found as a parent of ${path}`;
}

function isProjectionsFile(filename: string): boolean {
  return filename === Projections.projectionsFilename;
}

function findConfigFile(userFilePath: string): ResultP<string, string> {
  return File.findFileFrom(configFileNames)(userFilePath);
}

/**
 * Read and parse the config file.
 * @param userFilePath
 * @returns config data
 */
export const parseConfigFile = async (
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

export const combineFileConfigs = (rootPath: string) => (
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
    : fileConfig.alternate
    ? [fileConfig.alternate]
    : [];

  return pipe(
    alternates,
    map(
      (alternate: string): FileConfig => ({
        alternate,
        path: fileConfig.path,
        template: (fileConfig.template || []).join("\n"),
        alternateTemplate: (fileConfig.alternateTemplate || []).join("\n")
      })
    ),
    map((fileConfig: FileConfig) => [
      flipAlternateToMain(fileConfig),
      fileConfig
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
