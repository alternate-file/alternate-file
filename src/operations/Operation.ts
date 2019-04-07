import { okChain, Result } from "result-async";

import * as IdentifierTransformer from "./TransformerOperation";
import * as IdentifierValidator from "./ValidatorOperation";
import { pipe } from "../utils/utils";
import { reduceUnless } from "../utils/result-utils";
reduceUnless;

export const names = IdentifierValidator.validatorNames.concat(
  IdentifierTransformer.transformerNames
);

export function isOperator(name: string): boolean {
  return (
    IdentifierTransformer.isTransformer(name) ||
    IdentifierValidator.isValidator(name)
  );
}

export function run(value: string, operator: string): Result<string, null> {
  return pipe(
    IdentifierValidator.run(value, operator),
    okChain(value => IdentifierTransformer.run(value, operator))
  );
}

/**
 * Run all operators. Return error if a validator fails.
 * @param identifier Value to transform/validate
 * @param operators List of operations
 * @returns Transformed value
 */
export function runAllOperators(
  identifier: string,
  operators: string[]
): Result<string, null> {
  return reduceUnless(operators, run, identifier);
}
