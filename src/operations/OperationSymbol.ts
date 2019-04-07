import * as IdentifierOperator from "./Operation";

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
