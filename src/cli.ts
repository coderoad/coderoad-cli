import "./utils/logs";
import build from "./build";
import create from "./create";
import validate from "./validate";
import * as help from "./help";

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
        help.build();
        return;
      }
      build(args);
      break;

    case "create":
      if (args.length && ["--help", "-h"].includes(args[0])) {
        help.create();
        return;
      }
      create(args);
      break;

    case "validate":
      if (args.length && ["--help", "-h"].includes(args[0])) {
        help.validate();
        return;
      }
      validate(args);
      break;

    case "--help":
    case "-h":
    default:
      help.main();
  }
}
