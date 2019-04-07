import { ok, Result } from "result-async";
import { pascalCase as capitalize, lowerCase as lowercase } from "change-case";

export type IdentifierTransformer = (value: string) => string;

export interface IdentifierTransformers {
  [name: string]: IdentifierTransformer;
}

export const transformerFunctions: {
  [name: string]: (value: string) => string;
} = {
  lowercase,
  capitalize
};

export const transformerNames = Object.keys(transformerFunctions);

export function isTransformer(name: string): boolean {
  return transformerNames.includes(name);
}

export function run(value: string, operator: string): Result<string, null> {
  if (!isTransformer(operator)) return ok(value);
  const f = transformerFunctions[operator];

  return ok(f(value));
}
