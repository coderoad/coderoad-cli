import arg from "arg";
import * as inquirer from "inquirer";
import simpleGit from "simple-git/promise";
import * as fs from "fs";
import * as T from "../typings/tutorial";
import build, { BuildOptions } from "./build";
import create from "./create";

type Q = inquirer.Question<any> & { choices?: string[] };

type ParsedArgs = {
  command: string;
  git?: string;
  dir?: string;
  codeBranch: string;
  setupBranch: string;
  output?: string;
  help: string;
};

type Options = {
  repo: string;
  setupBranch: string;
  codeBranch: string;
  output: string;
  isLocal: boolean;
};

const localGit = "Local directory";
const remoteGit = "Git remote address";

function parseArgumentsIntoOptions(rawArgs: string[]): ParsedArgs {
  const args = arg(
    {
      "--git": String,
      "--dir": String,
      "--code": String,
      "--setup": String,
      "--output": String,
      "--help": Boolean,
      "-g": "--git",
      "-d": "--dir",
      "-c": "--code",
      "-s": "--setup",
      "-o": "--output",
      "-h": "--help",
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    command: args["_"][0],
    git: args["--git"],
    dir: args["--dir"],
    codeBranch: args["--code"],
    setupBranch: args["--setup"],
    output: args["--output"],
    help: args["--help"] || false,
  };
}

async function promptForMissingOptions(options: ParsedArgs): Promise<Options> {
  const questions: Q[] = [];

  // if no git remote addres is provided, assume current folder
  if (!options.git && !options.dir) {
    // check if the current dir is a valid repo
    const git = simpleGit(process.cwd());
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      questions.push({
        type: "list",
        name: "source",
        message: `The current directory (${process.cwd()}) is not a valid git repo. Would you like to provide a...`,
        choices: [localGit, remoteGit],
        default: localGit,
      });

      questions.push({
        type: "input",
        name: "localGit",
        message:
          "Please, provide a local directory of the valid git repository: ",
        when: (input: any) => input.source === localGit,
      });

      questions.push({
        type: "input",
        name: "remoteGit",
        message: "Please, provide the address of a remote git repository: ",
        when: (input: any) => input.source === remoteGit,
      });
    }
  }
  // if both local dir and remote repos are provided
  else if (options.git && options.dir) {
    questions.push({
      type: "list",
      name: "source",
      message:
        "A local git directory and a remote address were both provided. Please, choose either one or those to parse: ",
      choices: [localGit, remoteGit],
      default: localGit,
    });
  }

  // if the branch containing the code is not provided
  if (!options.codeBranch) {
    questions.push({
      type: "input",
      name: "codeBranch",
      message: "Please, provide the branch with the code commits: ",
    });
  }

  // if the branch containing the setup files is not provided
  if (!options.setupBranch) {
    questions.push({
      type: "input",
      name: "setupBranch",
      message:
        "Please, provide the branch with the setup files (coderoad.yaml and tutorial.md): ",
    });
  }

  const answers: any = await inquirer.prompt(questions);

  let repo: string;
  let isLocal: boolean;

  if (answers.source) {
    repo = (answers.source === localGit ? options.dir : options.git) || "";
    isLocal = answers.source === localGit;
  } else {
    repo = options.dir || options.git || process.cwd();
    isLocal = options.git ? false : true;
  }

  return {
    repo,
    setupBranch: options.setupBranch || answers.setupBranch,
    codeBranch: options.codeBranch || answers.codeBranch,
    output: options.output || ".",
    isLocal,
  };
}

export async function cli(args: string[]) {
  let parsedArgs: ParsedArgs = parseArgumentsIntoOptions(args);

  // If help called just print the help text and exit
  if (parsedArgs.help) {
    console.log(
      "Docs can be found at github: https://github.com/coderoad/coderoad-cli/"
    );
  } else if (!parsedArgs.command) {
    console.log(
      `The command is missing. Choose either 'create' or 'build' and its options.`
    );
  } else {
    switch (parsedArgs.command) {
      case "build":
        // Otherwise, continue with the other options
        const options: BuildOptions = await promptForMissingOptions(parsedArgs);
        console.log(options);
        const tutorial: T.Tutorial = await build(options);

        if (tutorial) {
          if (options.output) {
            fs.writeFileSync(options.output, JSON.stringify(tutorial), "utf8");
          } else {
            console.log(JSON.stringify(tutorial, null, 2));
          }
        }
        return;

      case "create":
        create(process.cwd());
        return;
    }
  }
}
