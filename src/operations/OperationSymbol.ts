import * as IdentifierOperator from "./Operation";
import { OperationType } from "./OperationGroup";

export function addSymbolsToPattern(path: string): string {
  return path
    .replace(/\*\*/g, OperationType.Directories)
    .replace(/\*/g, OperationType.Filename)
    .replace(operationTypeReplacerRegex, "$1{$2}");
}

export const allIdentifierSymbolsRegex = makeSymbolRegex(
  IdentifierOperator.names,
  "g"
);

const operationTypeReplacerRegex = makeOperationTypeRegex();

function makeOperationTypeRegex(): RegExp {
  const typeGroup = [OperationType.Directories, OperationType.Filename].join(
    "|"
  );

  return new RegExp(`(^|[^{])(${typeGroup})`, "g");
}

function makeSymbolRegex(names: string[], flags?: string): RegExp {
  const optionsList = Object.values(OperationType).concat(names);

  const option = `(?:${optionsList.join("|")})`;
  const optionsGroup = `(?:${option}\\|?)`;

  return new RegExp(`({${optionsGroup}+})`, flags);
}
