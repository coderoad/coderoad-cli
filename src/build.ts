import * as yamlParser from "js-yaml";
import * as path from "path";
import * as _ from "lodash";
import * as fs from "fs";
import * as util from "util";
import { parse } from "./utils/parse";
import { getArg } from "./utils/args";
import { getCommits } from "./utils/commits";
import * as T from "../typings/tutorial";

const write = util.promisify(fs.writeFile);
const read = util.promisify(fs.readFile);

// import not working

const workingDir = "tmp";

function rmDir(dir: string, rmSelf = false) {
  try {
    let files;
    rmSelf = rmSelf === undefined ? true : rmSelf;

    try {
      files = fs.readdirSync(dir);
    } catch (e) {
      console.log(`Sorry, directory '${dir}' doesn't exist.`);
      return;
    }

    if (files.length > 0) {
      files.forEach(function (filePath: string) {
        if (fs.statSync(path.join(dir, filePath)).isDirectory()) {
          rmDir(path.join(dir, filePath));
        } else {
          fs.unlinkSync(path.join(dir, filePath));
        }
      });
    }

    if (rmSelf) {
      // check if user want to delete the directory ir just the files in this directory
      fs.rmdirSync(dir);
    }
  } catch (error) {
    return error;
  }
}

async function cleanupFiles(workingDir: string) {
  try {
    const gitModule = simpleGit(process.cwd());

    await gitModule.subModule(["deinit", "-f", workingDir]);
    await gitModule.rm(workingDir);
    await gitModule.reset(["HEAD"]);
    rmDir(path.join(process.cwd(), ".git", "modules", workingDir));
    rmDir(workingDir);
  } catch (error) {
    return error;
  }
}

export type BuildConfigOptions = {
  text: string; // text document from markdown
  config: T.Tutorial; // yaml config file converted to json
  commits: { [key: string]: string[] };
};

async function generateConfig({ text, config, commits }: BuildConfigOptions) {
  const tutorial = parse(text, config);

  // const isValid = validate(tutorial);

  // if (!isValid) {
  //   console.log(JSON.stringify(validate.errors, null, 2));
  //   return;
  // }

  return tutorial;
}

type BuildArgs = {
  dir: string;
  markdown: string;
  yaml: string;
  output: string;
};

const parseArgs = (args: string[]): BuildArgs => {
  // default .
  const dir = args[0] || ".";
  // -o --output - default coderoad.json
  const output =
    getArg(args, { name: "output", alias: "o" }) || "coderoad.json";
  // -m --markdown - default TUTORIAL.md
  const markdown =
    getArg(args, { name: "markdown", alias: "m" }) || "TUTORIAL.md";
  // -y --yaml - default coderoad-config.yml
  const yaml =
    getArg(args, { name: "coderoad-config.yml", alias: "y" }) ||
    "coderoad-config.yml";

  return {
    dir,
    output,
    markdown,
    yaml,
  };
};

async function build(args: string[]) {
  const options = parseArgs(args);

  // path to run build from
  const localPath = path.join(process.cwd(), options.dir);

  // load files
  const [_markdown, _yaml] = await Promise.all([
    read(path.join(localPath, options.markdown), "utf8"),
    read(path.join(localPath, options.yaml), "utf8"),
  ]);

  const config = yamlParser.load(_yaml);

  const commits = getCommits(config.config.repo.branch);

  // Otherwise, continue with the other options
  const tutorial: T.Tutorial = await generateConfig({
    text: _markdown,
    config,
    commits,
  });

  if (tutorial) {
    if (options.output) {
      await write(options.output, JSON.stringify(tutorial), "utf8");
    } else {
      console.log(JSON.stringify(tutorial, null, 2));
    }
  }
}

export default build;
