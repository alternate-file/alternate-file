import { ok, error, Result, errorReplace } from "result-async";

import * as IdentifierTransformer from "./IdentifierTransformer";
import { reduceUnless } from "../utils/result-utils";

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

export function validateCapture(
  operators: string[],
  capture: string
): Result<string, string> {
  return reduceUnless(
    // TODO: Reverse transformers?
    filterValidators(operators),
    (capture: string, operator) => {
      return errorReplace("pattern doesn't match")(run(capture, operator));
    },
    capture
  );
}

/* Validators */

export function isLowercase(s: string) {
  return s === IdentifierTransformer.lowercase(s);
}
