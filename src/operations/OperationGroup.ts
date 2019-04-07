import { Result } from "result-async";
import * as path from "path";

import * as FileIdentifiers from "../identifiers/FileIdentifiers";
import { runAllOperators } from "./Operation";
import { runAllValidators } from "./ValidatorOperation";

export { OperationGroup as T };

export enum Operation {
  Directories = "directories",
  Filename = "directories",
  RelativePath = "relativePath",
  AbsolutePath = "absolutePath"
}

export const operationTypes = Object.keys(Operation);

export interface OperationGroup {
  type: Operation;
  operations: string[];
}

export function parseSymbol(symbol: string): OperationGroup {
  const [type, ...operations] = symbol
    .replace("{", "")
    .replace("}", "")
    .split("|") as [Operation, ...string[]];

  return { type, operations };
}

/**
 * Looks up and transforms a identifier from a FileIdentifiers for a given operationGroup
 * @param operationGroup one group of operations from the alternate path,
 * @param fileIdentifiers identifers from the main path, and
 * @returns the identifier for the alternate path.
 */
export function getIdentifierForAlternate(
  operationGroup: OperationGroup,
  fileIdentifiers: FileIdentifiers.T,
  pathToAlternate?: string
): Result<string, null> {
  const startingIdentifier = lookupIdentifier(
    operationGroup,
    fileIdentifiers,
    pathToAlternate
  );

  return runAllOperators(startingIdentifier, operationGroup.operations);
}

export function validateIdentifier(
  operationGroup: OperationGroup,
  identifier: string
): Result<string, null> {
  return runAllValidators(identifier, operationGroup.operations);
}

/** Get an identifier for the group */
function lookupIdentifier(
  operationGroup: OperationGroup,
  fileIdentifiers: FileIdentifiers.T,
  pathToAlternate: string | undefined
): string {
  const type = operationGroup.type;
  if (type === Operation.Directories) {
    // TODO: Multiple directories
    return fileIdentifiers.directories[0];
  }
  if (type === Operation.RelativePath) {
    if (!pathToAlternate) return fileIdentifiers.absolutePath;

    return path.relative(pathToAlternate, fileIdentifiers.absolutePath);
  }
  if (type === Operation.AbsolutePath) {
    return fileIdentifiers.absolutePath;
  }
  return fileIdentifiers.filename;
}
