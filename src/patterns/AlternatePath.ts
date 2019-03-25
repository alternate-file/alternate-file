import { pipe, zip, map } from "../utils";
import {
  ok,
  error,
  okChain,
  Result,
  isError,
  allOk,
  okThen
} from "result-async";
import { reduceUnless } from "../result-utils";
import * as FileIdentifiers from "./FileIdentifiers";
import { oneIdentifierSymbolRegex } from "./IdentifierSymbol";

export { AlternatePath as T };

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
    pattern => FileIdentifiers.extractIdentifiers(mainPath, pattern),
    okChain(addCapturesToTemplate(alternatePattern))
  );
}

export function sanitizePattern(path: string): string {
  return path.replace(/\*\*/g, "dirname").replace(/\*/g, "pathname");
}

function addCapturesToTemplate(template: string) {
  return function(fileIdentifiers: FileIdentifiers.T): Result<string, string> {
    // TODO: while there are matches:
    template.replace(oneIdentifierSymbolRegex, (symbol: string) => {
      // TODO: replace one match, using identifiers
    });
  };
}
// function fillWithCaptures(template: string) {
//   return function(captures: string[]): string {
//     captures.reduce((finalString, capture) => finalString.replace())
//   };
// }
// function joinTemplate(filledTemplate: string[]): string {
//   return filledTemplate.join("\n");
// }
