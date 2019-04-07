import { ok, error, Result } from "result-async";

import { transformerFunctions } from "./TransformerOperation";
import { reduceUnless } from "../utils/result-utils";

export type IdentifierValidator = (value: string) => boolean;

export interface IdentifierValidators {
  [name: string]: IdentifierValidator;
}

const validatorFunctions: IdentifierValidators = {
  isLowercase: isTransformed(transformerFunctions.lowercase),
  isCapitalized: isTransformed(transformerFunctions.capitalize)
};

export const validatorNames = Object.keys(validatorFunctions);

export function isValidator(name: string): boolean {
  return validatorNames.includes(name);
}

export function run(value: string, operator: string): Result<string, null> {
  if (!isValidator(operator)) return ok(value);
  const f = validatorFunctions[operator];

  return f(value) ? ok(value) : error(null);
}

export function filterValidators(operators: string[]): string[] {
  return operators.filter(isValidator);
}

export function runAllValidators(
  identifier: string,
  operators: string[]
): Result<string, null> {
  return reduceUnless(
    // TODO: Reverse transformers?
    filterValidators(operators),
    run,
    identifier
  );
}

function isTransformed(transformer: (s: string) => string) {
  return function(s: string): boolean {
    return s === transformer(s);
  };
}
