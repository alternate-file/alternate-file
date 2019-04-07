import * as FileIdentifiers from "../identifiers/FileIdentifiers";
import * as Operations from "../operations";

import { pipe } from "../utils/utils";
import { Result, isError, okThen } from "result-async";
import { addSymbolsToPattern } from "../operations/OperationSymbol";
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
 * @param mainPath The absolute path to the main file
 * @param mainPattern A pattern that could describe the main path.
 * @param alternateTemplate A pattern to be filled out with identifiers from the mainPath
 * @param alternatePath The absolute path to the alternate file. Used for building file templates, and not for finding alternate paths.
 * @returns An error with a message if the mainPattern doesn't match. An ok with the filled template if it does match.
 */
export function findAlternatePath(
  mainPath: string,
  mainPattern: string,
  alternateTemplate: string,
  alternatePath?: string
): Result<string, string> {
  const mainPatternWithSymbols = addSymbolsToPattern(mainPattern);
  const alternatePatternWithSymbols = addSymbolsToPattern(alternateTemplate);

  return pipe(
    FileIdentifiers.getIdentifiersFromPath(mainPath, mainPatternWithSymbols),
    okThen(addCapturesToTemplate(alternatePatternWithSymbols, alternatePath))
  );
}

function addCapturesToTemplate(
  template: string,
  alternatePath: string | undefined
) {
  return function(fileIdentifiers: FileIdentifiers.T): string {
    return template.replace(
      Operations.allIdentifierSymbolsRegex,
      transformIdentifier(fileIdentifiers, alternatePath)
    );
  };
}

function transformIdentifier(
  fileIdentifiers: FileIdentifiers.T,
  alternatePath: string | undefined
) {
  return function(symbol: string): string {
    const operations = Operations.parseSymbol(symbol);

    const result = Operations.getIdentifierForAlternate(
      operations,
      fileIdentifiers,
      alternatePath
    );

    return isError(result) ? symbol : result.ok;
  };
}
