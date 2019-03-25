import { pipe, zip, map } from "../utils";
import {
  ok,
  error,
  Result,
  isError,
  allOk,
  okThen,
  okChain,
  errorReplace
} from "result-async";
import { reduceUnless } from "../result-utils";
import { allIdentifierSymbolsRegex } from "./IdentifierSymbol";

import * as IdentifierValidator from "./IdentifierValidator";

export { FileIdentifiers as T };

interface FileIdentifiers {
  directories: string[];
  filename: string;
}

interface FileIdentifier {
  type: "directories" | "filename";
  value: string;
}

/**
 * Take a filePath and a possibly matching pattern, and either
 * extract the useful identifiers if there's a match,
 * or return an error if there isn't a match.
 */
export function extractIdentifiers(
  filePath: string,
  pattern: string
): Result<FileIdentifiers, string> {
  const operatorPipelines = patternToOperators(pattern);
  if (isError(operatorPipelines)) return operatorPipelines;

  return pipe(
    pattern,
    patternToMatcherRegex,
    capturesFromPath(filePath),
    okChain(capturesToIdentifiers(operatorPipelines.ok))
  );
}

function patternToOperators(pattern: string): Result<string[][], string> {
  const matches = pattern.match(allIdentifierSymbolsRegex);
  if (!matches) return error("invalid pattern");

  const operatorPipelines = matches.map(match =>
    match
      .replace("{", "")
      .replace("}", "")
      .split("|")
  );

  return ok(operatorPipelines);
}

function patternToMatcherRegex(pattern: string): RegExp {
  return new RegExp(pattern.replace(allIdentifierSymbolsRegex, "(.+)"));
}

function capturesFromPath(path: string) {
  return function(regex: RegExp): Result<string[], string> {
    const matches = path.match(regex);
    return matches ? ok(matches) : error("pattern doesn't match");
  };
}

function capturesToIdentifiers(operatorPipelines: string[][]) {
  return function(captures: string[]): Result<FileIdentifiers, string> {
    return pipe(
      zip(captures, operatorPipelines),
      map(([capture, operatorPipeline]) =>
        captureToIdentifier(capture, operatorPipeline)
      ),
      allOk,
      okThen(combineIdentifiers)
    );
  };
}

function captureToIdentifier(
  capture: string,
  operatorPipeline: string[]
): Result<FileIdentifier, string> {
  const [captureType, ...actualOperators] = operatorPipeline;

  const type: "filename" | "directories" =
    captureType === "basename" ? "filename" : "directories";

  const finalValue = reduceUnless(
    // TODO: Reverse transformers?
    IdentifierValidator.filterValidators(actualOperators),
    (capture: string, operator) => {
      return errorReplace("pattern doesn't match")(
        IdentifierValidator.run(capture, operator)
      );
    },
    capture
  );

  return okThen((value: string) => ({ type, value }))(finalValue);
}

function combineIdentifiers(
  fileIdentifierList: FileIdentifier[]
): FileIdentifiers {
  return fileIdentifierList.reduce(
    (pathParts: FileIdentifiers, pathPart: FileIdentifier) => {
      return pathPart.type === "filename"
        ? { ...pathParts, filename: pathPart.value }
        : {
            ...pathParts,
            directories: [...pathParts.directories, pathPart.value]
          };
    },
    {
      directories: [],
      filename: ""
    }
  );
}
