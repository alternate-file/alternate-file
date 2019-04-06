import { pipe, zip, map } from "../utils/utils";
import {
  ok,
  error,
  Result,
  isError,
  allOk,
  okThen,
  okChain
} from "result-async";
import {
  allIdentifierSymbolsRegex,
  splitSymbol,
  validateCapture
} from ".";

export { FileIdentifiers as T };

export type IdentifierType = "directories" | "filename";

interface FileIdentifiers {
  directories: string[];
  filename: string;
  rootPath: string;
}

interface FileIdentifier {
  type: IdentifierType;
  value: string;
}

/**
 * Take a filePath and a possibly matching pattern, and either
 * extract the useful identifiers if there's a match,
 * or return an error if there isn't a match.
 */
export function extractIdentifiers(
  filePath: string,
  pattern: string,
  rootPath: string
): Result<FileIdentifiers, string> {
  const operatorPipelines = patternToOperators(pattern);
  if (isError(operatorPipelines)) return operatorPipelines;

  return pipe(
    pattern,
    patternToMatcherRegex,
    capturesFromPath(filePath),
    okChain(capturesToIdentifiers(operatorPipelines.ok, rootPath))
  );
}

function patternToOperators(pattern: string): Result<string[][], string> {
  const matches = pattern.match(allIdentifierSymbolsRegex);
  if (!matches) return error("invalid pattern");

  const operatorPipelines = matches.map(splitSymbol);

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

function capturesToIdentifiers(
  operatorPipelines: string[][],
  rootPath: string
) {
  return function(captures: string[]): Result<FileIdentifiers, string> {
    return pipe(
      zip(captures, operatorPipelines),
      map(([capture, operatorPipeline]) =>
        captureToIdentifier(capture, operatorPipeline)
      ),
      allOk,
      okThen(combineIdentifiers(rootPath))
    );
  };
}

function captureToIdentifier(
  capture: string,
  operatorPipeline: string[]
): Result<FileIdentifier, string> {
  const [captureType, ...actualOperators] = operatorPipeline;

  const type: IdentifierType =
    captureType === "basename" ? "filename" : "directories";

  const finalValue = validateCapture(actualOperators, capture);

  return okThen((value: string) => ({ type, value }))(finalValue);
}

function combineIdentifiers(rootPath: string) {
  return function(fileIdentifierList: FileIdentifier[]): FileIdentifiers {
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
        rootPath,
        directories: [],
        filename: ""
      }
    );
  };
}
