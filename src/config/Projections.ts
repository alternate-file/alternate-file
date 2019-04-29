import { pipeAsync, ResultP, okChain, errorThen, okThen } from "result-async";

import * as File from "../utils/File";

import { AlternateFileNotFoundError } from "../alternates/AlternateFileNotFoundError";

export { Projections as T };

/** the data type for the old .alternate-file.json file. */
export interface Projections {
  [sourcePattern: string]: SourceData;
}

export type ProjectionPair = [string, SourceData];

interface SourceData {
  alternate?: string | string[];
}

export const projectionsFilename = ".alternate-file.json";

/**
 * Read and parse the projections file.
 * @param userFilePath
 * @returns projections data
 */
export const readProjections = async (
  projectionsPath: string
): ResultP<Projections, AlternateFileNotFoundError> => {
  return pipeAsync(
    projectionsPath,
    File.readFile,
    okThen((data: string): string => (data === "" ? "{}" : data)),
    okChain((x: string) => File.parseJson<Projections>(x, projectionsPath)),
    errorThen((err: string) => ({
      startingFile: projectionsPath,
      message: err
    }))
  );
};
