import * as IdentifierOperator from "./Operation";
import { Operation, operationTypes } from "./OperationGroup";

export function addSymbolsToPattern(path: string): string {
  return path
    .replace(/\*\*/g, Operation.Directories)
    .replace(/\*/g, Operation.Filename)
    .replace(operationTypeReplacerRegex, "$1{$2}");
}

export const allIdentifierSymbolsRegex = makeSymbolRegex(
  IdentifierOperator.names,
  "g"
);

const operationTypeReplacerRegex = makeOperationTypeRegex();

function makeOperationTypeRegex(): RegExp {
  const typeGroup = operationTypes.join("|");

  return new RegExp(`([^{])(${typeGroup})`, "g");
}

function makeSymbolRegex(names: string[], flags?: string): RegExp {
  const optionsList = names.concat(["directories", "filename"]);
  const option = `(?:${optionsList.join("|")})`;
  const optionsGroup = `(?:${option}\\|?)`;

  return new RegExp(`({${optionsGroup}+})`, flags);
}
