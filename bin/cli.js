#!/usr/bin/env node

const { either } = require("result-async");
const parseArgs = require("minimist");

const AlternateFile = require("../lib");

const helpMessage = `
Usage: alternate-file filePath

Options:
  --create                Create the matched file, if it doesn't exist.
  --init=framework-name   Create a .alternate-file.json in the current
                          directory for the given framework.
                          See ./sample-config for the available frameworks.
`;

async function findOrCreate(args) {
  const action = args.create
    ? AlternateFile.findOrCreateAlternateFile
    : AlternateFile.findAlternateFile;

  const fromFile = args["_"][0];

  either(await action(fromFile), console.log, error =>
    console.error(error.message)
  );
}

async function init(args) {
  const path = args._[0];
  const frameworkName = args.init;

  either(
    await AlternateFile.initializeConfigFile(path, frameworkName),
    console.log,
    console.error
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args._.length === 0) {
    console.log(helpMessage);
    return;
  }

  if (args.init !== undefined) {
    return init(args);
  }

  return findOrCreate(args);
}

main();
