import * as fs from "fs";
import * as path from "path";
import * as findUp from "find-up";
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
  pipeAsync,
  Result,
  resultify,
  ResultP
} from "result-async";

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

  return filePath === null ? error("file not found") : ok(filePath);
};

/**
 * Create a new file, with contents. Also creates the path if necessary.
 * @param path
 * @param contents
 * @returns filePath
 */
export async function makeFile(filePath: string, contents: string = "") {
  return pipeAsync(
    filePath,
    makeDirectoryForFile,
    okChainAsync(makeFileShallow(contents))
  );
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
  return pipeAsync(
    writeFile(filePath, contents, { flag: "wx" }),
    errorReplace(`${filePath} already exists`),
    okReplace(filePath)
  );
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
  return pipeAsync(
    filePath,
    unlink,
    okReplace(filePath),
    errorReplace(`can't delete ${filePath}`)
  );
};

/**
 * Check if any of the provided files exists.
 * @param filePaths
 * @returns Ok(filePath) | Error(null)
 */
export const findExisting = async (filePaths: t[]): ResultP<t, string[]> => {
  return pipeAsync(
    filePaths,
    map(fileExists),
    files => Promise.all(files),
    file => firstOk(file),
    errorThen(always(filePaths))
  );
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
  return pipeAsync(
    access(filePath, fs.constants.R_OK),
    okReplace(filePath),
    errorReplace(filePath)
  );
};

export async function ls(directoryPath: string): ResultP<string[], string> {
  return pipeAsync(
    directoryPath,
    readdir,
    errorReplace(`${directoryPath} not found`)
  );
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
  return pipeAsync(
    filePath,
    path.dirname,
    makeDirectoryDeep,
    okReplace(filePath)
  );
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
