import "./utils/logs";
import build from "./build";
import create from "./create";

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
      create(process.cwd());
      break;

    case "--help":
    case "-h":
    default:
      console.log(
        "Docs can be found at github: https://github.com/coderoad/coderoad-cli/"
      );
  }
}
