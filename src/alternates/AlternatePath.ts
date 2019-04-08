import * as path from "path";
import { Result, isError, okThen, ok } from "result-async";

import * as FileIdentifiers from "../identifiers/FileIdentifiers";
import * as Operations from "../operations";

import { pipe } from "../utils/utils";
import { addSymbolsToPattern } from "../operations/OperationSymbol";
export { AlternateFile as T };

/**
 * Data for filling out a path from a path
 */
interface AlternateFile {
  path: string;
  contents: string;
}

/**
 * Fill a template given a pattern and a path
 * @param mainPath The absolute path to the main file
 * @param mainPattern A pattern that could describe the main path.
 * @param alternatePattern A pattern to be filled out with identifiers from the mainPath
 * @param alternateTemplate A pattern to be filled out with identifiers from the mainPath
 * @returns An error with a message if the mainPattern doesn't match. An ok with the filled template if it does match.
 */
export function findAlternatePath(
  rootPath: string,
  mainPath: string,
  mainPattern: string,
  alternatePattern: string,
  alternateTemplate: string = ""
): Result<AlternateFile, string> {
  const mainPatternWithSymbols = addSymbolsToPattern(mainPattern);
  const alternatePatternWithSymbols = addSymbolsToPattern(alternatePattern);

  const fileIdentifiers = FileIdentifiers.getIdentifiersFromPath(
    mainPath,
    mainPatternWithSymbols
  );

  const alternatePathResult = pipe(
    fileIdentifiers,
    okThen(addCapturesToTemplate(alternatePatternWithSymbols))
  );

  if (isError(alternatePathResult)) return alternatePathResult;

  const alternatePath = path.resolve(rootPath, alternatePathResult.ok);

  const alternateFileContents = pipe(
    fileIdentifiers,
    okThen(addCapturesToTemplate(alternateTemplate, alternatePath))
  );

  if (isError(alternateFileContents)) return alternateFileContents;

  return ok({
    path: alternatePath,
    contents: alternateFileContents.ok
  });
}

function addCapturesToTemplate(template: string, alternatePath?: string) {
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
