import { pipe } from "./utils";

export { AlternateTemplate as T };

interface AlternateTemplate {
  path: string;
  pattern: string;
  template?: string[];
}

/**
 * Fill a template given a pattern and a path
 * @param alternateTemplate
 */
export function fillTemplate(alternateTemplate: AlternateTemplate): string {
  if (!alternateTemplate.template) return "";

  const { path, template } = alternateTemplate;

  const transformers = patternToTransformers(alternateTemplate.pattern);

  return pipe(
    alternateTemplate.pattern,
    patternToRegex,
    capturesFromPath(path),
    transformCaptures(transformers),
    fillTemplateWithCaptures(template),
    joinTemplate
  );
}

function patternToTransformers(pattern: string): string[][] {}
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
