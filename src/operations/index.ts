import { Result, error, ok } from "result-async";
import { parseSymbol, OperationGroup } from "./OperationGroup";
import { allIdentifierSymbolsRegex } from "./OperationSymbol";

export {
  OperationGroup,
  parseSymbol,
  validateIdentifier,
  getIdentifierForAlternate
} from "./OperationGroup";

export {
  oneIdentifierSymbolRegex,
  allIdentifierSymbolsRegex
} from "./OperationSymbol";

export { runAllValidators } from "./ValidatorOperation";

export function patternToOperators(
  pattern: string
): Result<OperationGroup[], string> {
  const matches = pattern.match(allIdentifierSymbolsRegex);
  if (!matches) return error("no match");

  const operationGroups = matches.map(parseSymbol);

  return ok(operationGroups);
}
