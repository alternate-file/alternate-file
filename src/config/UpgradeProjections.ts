import { okThen, pipeAsync, ResultP } from "result-async";

import { toPairs } from "../utils/utils";
import { AlternateFileNotFoundError } from "../alternates/AlternateFileNotFoundError";
import * as Projections from "./Projections";

import { UserFileConfig } from "./types";

export function parseProjectionsFile(
  projectionsPath: string
): ResultP<UserFileConfig[], AlternateFileNotFoundError> {
  return pipeAsync(
    projectionsPath,
    Projections.readProjections,
    okThen(projectionsToConfigFile)
  );
}

export function projectionsToConfigFile(
  projections: Projections.T
): UserFileConfig[] {
  const pairs = toPairs(projections);

  return pairs.map(([path, { alternate }]: Projections.ProjectionPair) => ({
    path,
    alternate
  }));
}
