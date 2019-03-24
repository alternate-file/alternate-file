import { pipe, zip, map, reduce } from "./utils";
import {
  ok,
  error,
  okChain,
  Result,
  isError,
  allOk,
  okThen
} from "result-async";
import { reduceUnless } from "./result-utils";

export { AlternatePath as T };

interface AlternatePath {
  mainPattern: string;
  alternatePattern: string;
}

interface PathPart {
  type: "directories" | "filename";
  value: string;
}

interface PathParts {
  directories: string[];
  filename: string;
}

function isLowercase(s: string) {
  return s === lowercase(s);
}

function lowercase(s: string): string {
  return s.toLowerCase();
}

const checkerFunctions: { [name: string]: (value: string) => boolean } = {
  isLowercase
};

const transformerFunctions: { [name: string]: (value: string) => string } = {
  lowercase
};

const checkerNames = Object.keys(checkerFunctions);
const transformerNames = Object.keys(transformerFunctions);

const slotRegex = makeSlotRegex(checkerNames.concat(transformerNames));

function makeSlotRegex(names: string[]): RegExp {
  const optionsList = names.concat(["dirname", "basename"]);
  const option = `(?:${optionsList.join("|")})`;
  const optionsGroup = `(?:${option}\\|?)`;

  return new RegExp(`(dirname|basename|{${optionsGroup}+})`, "g");
}

/**
 * Fill a template given a pattern and a path
 * @param alternateTemplate
 */
export function findAlternatePath(
  rootPath: string,
  mainPath: string,
  alternatePath: string,
  alternateTemplate: AlternatePath
): Result<string, string> {
  let { mainPattern } = alternateTemplate;

  mainPattern = sanitizePattern(mainPattern);

  const mainTransformers = patternToTransformers(mainPattern);

  if (isError(mainTransformers)) return mainTransformers;

  return pipe(
    mainPath,
    patternToRegex,
    capturesFromPath(mainPath),
    okChain(categorizeCaptures(mainTransformers.ok)),
    okChain(addCapturesToTemplate(alternateTemplate))
  );
}

export function sanitizePattern(path: string): string {
  return path.replace(/\*\*/g, "dirname").replace(/\*/g, "pathname");
}

export function patternToTransformers(
  pattern: string
): Result<string[][], string> {
  const matches = pattern.match(slotRegex);
  if (!matches) return error("invalid pattern");

  const transformGroups = matches.map(match =>
    match
      .replace("{", "")
      .replace("}", "")
      .split("|")
  );

  return ok(transformGroups);
}

function patternToRegex(pattern: string): RegExp {
  return new RegExp(pattern.replace(slotRegex, "(.+)"));
}

function capturesFromPath(path: string) {
  return function(regex: RegExp): Result<string[], string> {
    const matches = path.match(regex);
    return matches ? ok(matches) : error("pattern doesn't match");
  };
}

function categorizeCaptures(transformers: string[][]) {
  return function(captures: string[]): Result<PathParts, string> {
    return pipe(
      zip(captures, transformers),
      map(([capture, transformers]) =>
        categorizeCapture(capture, transformers)
      ),
      allOk,
      okThen(pathParts =>
        pathParts.reduce(
          (pathParts: PathParts, pathPart: PathPart) => {
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
        )
      )
    );
  };
}

function categorizeCapture(
  capture: string,
  transformers: string[]
): Result<PathPart, string> {
  const [captureType, ...actualTransformers] = transformers;

  const type: "filename" | "directories" =
    captureType === "basename" ? "filename" : "directories";

  const finalValue = reduceUnless(
    actualTransformers,
    (capture: string, transformer) => {
      // TODO: Reverse transformer?
      if (!checkerNames.includes(transformer)) return ok(capture);

      const checkerFunction = checkerFunctions[transformer];

      if (!checkerFunction(capture)) {
        return error("pattern doesn't match");
      }

      return ok(capture);
    },
    capture
  );

  return isError(finalValue) ? finalValue : ok({ type, value: finalValue.ok });
}

function addCapturesToTemplate(template: string) {
  return function(pathParts: PathParts): Result<string, string> {
    const transformerGroups = patternToTransformers(template);

    if (isError(transformerGroups)) return ok(template);

    return transformerGroups.ok.reduce((template: string, transformers) => {
      const [captureType, ...actualTransformers] = transformers;
      const type: "filename" | "directories" =
        captureType === "basename" ? "filename" : "directories";
      // TODO: Finish
    }, template);
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
