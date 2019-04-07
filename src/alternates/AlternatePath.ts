import * as FileIdentifiers from "../identifiers/FileIdentifiers";
import * as OperationGroup from "../operations/OperationGroup";

import { pipe } from "../utils/utils";
import { Result, isError, okThen } from "result-async";
import {
  oneIdentifierSymbolRegex,
  allIdentifierSymbolsRegex
} from "../operations";

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
      FileIdentifiers.getIdentifiersFromPath(mainPath, pattern, rootPath),
    okThen(addCapturesToTemplate(sanitizePattern(alternatePattern)))
  );
}

export function sanitizePattern(path: string): string {
  return path
    .replace(/\*\*/g, "directories")
    .replace(/\*/g, "filename")
    .replace(/([^{])(directories|filename)/g, "$1{$2}");
}

// TODO This seems wrong.
// Also paths and templates are the same - you 
// create FileIdentifiers for the mainPath,
// and call parseSymbol |> getIdentifierForAlternate
// to replace every symbol in the template/altPath
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

    const result = OperationGroup.getIdentifierForAlternate(
      operations,
      fileIdentifiers
    );

    return isError(result) ? symbol : result.ok;
  };
}
