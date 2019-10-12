import * as fs from "fs";
import * as path from "path";
import findUp from "find-up";
import { promisify } from "util";
import { map } from "./utils";

import {
  error,
  errorReplace,
  errorThen,
  firstOk,
  ok,
  okChainAsync,
  okReplace,
  Result,
  resultify,
  ResultP
} from "result-async";
import { pipeA } from "pipeout";

export type t = string;

/**
 * Find a file by recursively walking up the directory chain.
 * @param fileName - The filename to look for.
 * @param fromFilePath - The file to start looking from
 * @return the full path/"not found"
 */
export const findFileFrom = (fileName: string) => async (
  fromFilePath: string
): ResultP<string, string> => {
  const filePath = await findUp(fileName, { cwd: fromFilePath });

  return filePath ? ok(filePath) : error("file not found");
};

/**
 * Create a new file, with contents. Also creates the path if necessary.
 * @param path
 * @param contents
 * @returns filePath
 */
export async function makeFile(filePath: string, contents: string = "") {
  // prettier-ignore
  return pipeA
    (filePath)
    (makeDirectoryForFile)
    (okChainAsync(makeFileShallow(contents)))
    .value
}

/**
 * Create a new file, with contents. Fails if the directory doesn't exist.
 * @param path
 * @param contents
 * @returns filePath
 */
export const makeFileShallow = (contents: string) => (
  filePath: string
): ResultP<string, string> => {
  // prettier-ignore
  return pipeA
    (writeFile(filePath, contents, { flag: "wx" }))
    (errorReplace(`${filePath} already exists`))
    (okReplace(filePath))
    .value
};

export async function makeDirectoryDeep(
  dirPath: string
): ResultP<string, string> {
  await mkdir(dirPath, { recursive: true });

  return ok(dirPath);
}

/**
 * Delete a file by path
 * @param filePath
 * @returns ResultP<the deleted file, an error message>
 */
export const deleteFile = (filePath: string): ResultP<string, string> => {
  // prettier-ignore
  return pipeA
    (filePath)
    (unlink)
    (okReplace(filePath))
    (errorReplace(`can't delete ${filePath}`))
    .value
};

/**
 * Check if any of the provided files exists.
 * @param filePaths
 * @returns Ok(filePath) | Error(null)
 */
export const findExisting = async (filePaths: t[]): ResultP<t, string[]> => {
  // prettier-ignore
  return pipeA
    (filePaths)
    (map(fileExists))
    (files => Promise.all(files))
    (file => firstOk(file))
    (errorThen(always(filePaths)))
    .value
};

/**
 * Read the contents of a file.
 */
export const readFile = (path: string): ResultP<string, any> =>
  fsReadFile(path, "utf8") as ResultP<string, any>;

/**
 * Checks if a file exists and is readable.
 * @param filePath - The file path to check for
 * @returns Ok(path) if the file exist, Error(null) if it doesn't.
 */
export const fileExists = async (filePath: t): ResultP<t, string> => {
  // prettier-ignore
  return pipeA
    (access(filePath, fs.constants.R_OK))
    (okReplace(filePath))
    (errorReplace(filePath))
    .value
};

export async function ls(directoryPath: string): ResultP<string[], string> {
  // prettier-ignore
  return pipeA
    (directoryPath)
    (readdir)
    (errorReplace(`${directoryPath} not found`))
    .value
}

/**
 * Wrap a JSON parse in a
 * @returns Ok(body)
 */
export const parseJson = <T>(
  data: string,
  fileName?: string
): Result<T, string> => {
  try {
    return ok(JSON.parse(data));
  } catch (e) {
    const message = `Couldn't parse ${fileName || "file"}: ${e.message}`;
    return error(message);
  }
};

/**
 * Recursively create a directory for a file.
 * @param filePath
 * @returns The original filePath for piping.
 */
async function makeDirectoryForFile(filePath: string): ResultP<string, string> {
  // prettier-ignore
  return pipeA
    (filePath)
    (path.dirname)
    (makeDirectoryDeep)
    (okReplace(filePath))
    .value
}

/**
 * Read a file's contents
 * @returns a ResultP<file contents, error>
 */
const fsReadFile = resultify(promisify(fs.readFile));

const mkdir = resultify(promisify(fs.mkdir));
const writeFile = resultify(promisify(fs.writeFile));
const access = resultify(promisify(fs.access));
const unlink = resultify(promisify(fs.unlink));
const readdirP = promisify(fs.readdir);
const readdir: (path: string) => ResultP<string[], any> = resultify(
  (path: string) => readdirP(path)
);

const always = <T>(x: T) => (..._args: any[]) => x;
