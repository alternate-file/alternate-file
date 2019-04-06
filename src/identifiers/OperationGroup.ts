import { Result } from "result-async";

import * as FileIdentifiers from "./FileIdentifiers";
import { runAllOperators } from ".";

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
 * @param operationGroup one group of operations from the alternate path,
 * @param fileIdentifiers identifers from the main path, and
 * @returns the identifier for the alternate path.
 */
export function transformIdentifier(
  operationGroup: OperationGroup,
  fileIdentifiers: FileIdentifiers.T
): Result<string, null> {
  const startingIdentifier =
    operationGroup.type === "directories"
      ? fileIdentifiers.directories[0]
      : fileIdentifiers.filename;

  return runAllOperators(startingIdentifier, operationGroup.operations);
}
