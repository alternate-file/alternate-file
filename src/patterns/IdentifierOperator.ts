import { okChain, Result } from "result-async";

import * as IdentifierTransformer from "./IdentifierTransformer";
import * as IdentifierValidator from "./IdentifierValidator";
import { pipe } from "../utils";

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
