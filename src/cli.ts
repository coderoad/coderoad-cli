import "./utils/logs";
import build from "./build";
import create from "./create";
import { help, create as createHelp, build as buildHelp } from "./help";

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
      if (args.length && ["--help", "-h"].includes(args[0])) {
        buildHelp();
        return;
      }
      build(args);
      break;

    case "create":
      if (args.length && ["--help", "-h"].includes(args[0])) {
        createHelp();
        return;
      }
      create(args);
      break;

    case "--help":
    case "-h":
    default:
      help();
  }
}
