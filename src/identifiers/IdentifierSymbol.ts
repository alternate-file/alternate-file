import * as IdentifierOperator from "./IdentifierOperator";

export const allIdentifierSymbolsRegex = makeRegex(
  IdentifierOperator.names,
  "g"
);

export const oneIdentifierSymbolRegex = makeRegex(IdentifierOperator.names);

function makeRegex(names: string[], flags?: string): RegExp {
  const optionsList = names.concat(["directories", "filename"]);
  const option = `(?:${optionsList.join("|")})`;
  const optionsGroup = `(?:${option}\\|?)`;

  return new RegExp(`({${optionsGroup}+})`, flags);
}

export function splitSymbol(symbol: string): string[] {
  return symbol
    .replace("{", "")
    .replace("}", "")
    .split("|");
}
