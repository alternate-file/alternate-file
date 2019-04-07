import { Result } from "result-async";

import * as FileIdentifiers from "../identifiers/FileIdentifiers";
import { runAllOperators } from "./Operation";
import { runAllValidators } from "./ValidatorOperation";

export { OperationGroup as T };

export interface OperationGroup {
  type: FileIdentifiers.IdentifierType;
  operations: string[];
}

export function parseSymbol(symbol: string): OperationGroup {
  const [type, ...operations] = symbol
    .replace("{", "")
    .replace("}", "")
    .split("|") as [FileIdentifiers.IdentifierType, ...string[]];

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
  fileIdentifiers: FileIdentifiers.T
): Result<string, null> {
  const startingIdentifier = lookupIdentifier(operationGroup, fileIdentifiers);

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
  fileIdentifiers: FileIdentifiers.T
) {
  return operationGroup.type === "directories"
    ? fileIdentifiers.directories[0]
    : fileIdentifiers.filename;
}
