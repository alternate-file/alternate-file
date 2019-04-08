/**
 * A standardized error type for failures to find alternate files.
 */
export interface AlternateFileNotFoundError {
  message: string;
  startingFile: string;
  alternatesAttempted?: string[];
}

export const isAlternateFileNotFoundError = (
  error: AlternateFileNotFoundError | any
): error is AlternateFileNotFoundError => error.message !== undefined;
