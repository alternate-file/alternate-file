import { pipe } from "../utils/utils";
import * as Operations from "../operations";
import * as FileIdentifiers from "../identifiers";

export { AlternateTemplate as T };

/**
 * Data for filling out a template from a path
 */
interface AlternateTemplate {
  path: string;
  pattern: string;
  template?: string[];
}

/**
 * Fill a template given a pattern and a path
 * @param alternateTemplate
 */
export function fillTemplate(
  alternateTemplate: AlternateTemplate,
  rootPath: string
): string {
  if (!alternateTemplate.template) return "";

  const { path, pattern, template } = alternateTemplate;

  const operationGroups = Operations.patternToOperators(
    alternateTemplate.pattern
  );

  const fileIdentifiers = FileIdentifiers.getIdentifiersFromPath(
    path,
    pattern,
    rootPath
  );

  return pipe(
    alternateTemplate.pattern,
    patternToRegex,
    capturesFromPath(path),
    transformCaptures(operationGroups),
    fillTemplateWithCaptures(template),
    joinTemplate
  );
}

// TODO
function patternToRegex(pattern: string): RegExp {}
function capturesFromPath(path: string) {
  return function(regex: RegExp): string[] {};
}
function transformCaptures(transformers: string[][]) {
  return function(captures: string[]): any {};
}
function fillTemplateWithCaptures(template: string[]) {
  return function(data: any): string[] {};
}
function joinTemplate(filledTemplate: string[]): string {
  return filledTemplate.join("\n");
}
