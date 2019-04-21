import {
  ResultP,
  pipeAsync,
  okChain,
  okChainAsync,
  errorThen
} from "result-async";

import * as Config from "../config";
errorThen;
import {
  findExistingAlternateFile,
  findExistingOrCreateAlternateFile,
  AlternateFinder
} from "../alternates/FilesystemAlternateFile";

import { getPossibleAlternates } from "./PossibleAlternateFiles";
import { AlternateFileNotFoundError } from "./AlternateFileNotFoundError";
import * as AlternateFile from "./AlternateFile";

export function findAlternateFile(
  userFilePath: string
): ResultP<string, AlternateFileNotFoundError> {
  return findSomeAlternateFile(userFilePath, findExistingAlternateFile);
}

export function findOrCreateAlternateFile(
  userFilePath: string
): ResultP<string, AlternateFileNotFoundError> {
  return findSomeAlternateFile(userFilePath, findExistingOrCreateAlternateFile);
}

function findSomeAlternateFile(
  userFilePath: string,
  finder: AlternateFinder
): ResultP<string, AlternateFileNotFoundError> {
  return pipeAsync(
    userFilePath,
    Config.lookupConfig,
    okChain(getPossibleAlternates(userFilePath)),
    okChainAsync(findFinalAlternate(finder, userFilePath))
  );
}

function findFinalAlternate(finder: AlternateFinder, userFilePath: string) {
  return async function(
    possibleAlternates: AlternateFile.T[]
  ): ResultP<string, AlternateFileNotFoundError> {
    const createOrError = errorThen(
      (message: string): AlternateFileNotFoundError => ({
        message,
        startingFile: userFilePath,
        alternatesAttempted: possibleAlternates.map(({ path }) => path)
      })
    );

    const result = await finder(possibleAlternates);
    return createOrError(result);
  };
}

export {
  AlternateFileNotFoundError,
  isAlternateFileNotFoundError
} from "./AlternateFileNotFoundError";
