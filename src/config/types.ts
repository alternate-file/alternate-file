/**
 * the data type for a .alternate-file.json5 file.
 */
export interface ConfigFile {
  rootPath: string;
  files: FileConfig[];
}

export interface UserFileConfig {
  path: string;
  alternate?: string | string[];
  template?: string[];
  alternateTemplate?: string[];
}

export interface FileConfig {
  path: string;
  alternate: string;
  template: string;
  alternateTemplate: string;
}
