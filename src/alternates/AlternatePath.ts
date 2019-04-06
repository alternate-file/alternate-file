import * as FileIdentifiers from "../identifiers/FileIdentifiers";
import * as OperationGroup from "../identifiers/OperationGroup";

import { pipe } from "../utils/utils";
import { Result, isError, okThen } from "result-async";
import {
  oneIdentifierSymbolRegex,
  allIdentifierSymbolsRegex
} from "../identifiers";

export { AlternatePath as T };

/**
 * Data for filling out a path from a path
 */
interface AlternatePath {
  mainPattern: string;
  alternatePattern: string;
}

/**
 * Fill a template given a pattern and a path
 * @param alternateTemplate
 */
export function findAlternatePath(
  rootPath: string,
  mainPath: string,
  mainPattern: string,
  alternatePattern: string
): Result<string, string> {
  return pipe(
    mainPattern,
    sanitizePattern,
    (pattern: string) =>
      FileIdentifiers.extractIdentifiers(mainPath, pattern, rootPath),
    okThen(addCapturesToTemplate(sanitizePattern(alternatePattern)))
  );
}

export function sanitizePattern(path: string): string {
  return path
    .replace(/\*\*/g, "directories")
    .replace(/\*/g, "filename")
    .replace(/([^{])(directories|filename)/g, "$1{$2}");
}

function addCapturesToTemplate(template: string) {
  return function(fileIdentifiers: FileIdentifiers.T): string {
    const symbols = template.match(allIdentifierSymbolsRegex) || [];

    return symbols.reduce((template: string): string => {
      return template.replace(
        oneIdentifierSymbolRegex,
        transformIdentifier(fileIdentifiers)
      );
    }, template);
  };
}

function transformIdentifier(fileIdentifiers: FileIdentifiers.T) {
  return function(symbol: string): string {
    const operations = OperationGroup.parseSymbol(symbol);

    const result = OperationGroup.transformIdentifier(
      operations,
      fileIdentifiers
    );

    return isError(result) ? symbol : result.ok;
  };
}
