import { possibleAlternateFiles } from "./ConfigFile";
import {
  findExistingAlternateFile,
  findOrCreateAlternateFile
} from "./FilesystemAlternateFile";

export async function foo(userFilePath) {
  const alternates = await possibleAlternateFiles(userFilePath);

  // TODO: Where should alternate errors go?
  findExistingAlternateFile(alternates)

}
