import "./utils/logs";
import build from "./build";
import create from "./create";
import help from "./help";

export async function cli(rawArgs: string[]): Promise<void> {
  const command: string = rawArgs[2];
  const args = rawArgs.slice(3);

  switch (command) {
    case "--version":
    case "-v":
      const version = require("../package.json").version;
      console.log(`v${version}`);
      return;

    case "build":
      build(args);
      break;

    case "create":
      create(args);
      break;

    case "--help":
    case "-h":
    default:
      help();
  }
}
