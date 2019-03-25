import { ok, error, Result } from "result-async";

import * as IdentifierTransformer from "./IdentifierTransformer";

export type IdentifierValidator = (value: string) => boolean;

export interface IdentifierValidators {
  [name: string]: IdentifierValidator;
}

const validatorFunctions: IdentifierValidators = {
  isLowercase
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

/* Validators */

export function isLowercase(s: string) {
  return s === IdentifierTransformer.lowercase(s);
}
