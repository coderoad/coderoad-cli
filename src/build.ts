import * as yamlParser from "js-yaml";
import * as path from "path";
import * as _ from "lodash";
import * as fs from "fs";
import * as util from "util";
import { parse } from "./utils/parse";
import { getArg } from "./utils/args";
import { getCommits, CommitLogObject } from "./utils/commits";
import { validateSchema } from "./utils/validate";
import * as T from "../typings/tutorial";

const write = util.promisify(fs.writeFile);
const read = util.promisify(fs.readFile);

export type BuildConfigOptions = {
  text: string; // text document from markdown
  config: T.Tutorial; // yaml config file converted to json
  commits: CommitLogObject; // an object of tutorial positions with a list of commit hashes
};

type BuildArgs = {
  dir: string;
  markdown: string;
  yaml: string;
  output: string;
};

const parseArgs = (args: string[]): BuildArgs => {
  // default .
  const dir = args[0] || ".";

  // -m --markdown - default TUTORIAL.md
  const markdown =
    getArg(args, { name: "markdown", alias: "m" }) || "TUTORIAL.md";
  // -y --yaml - default coderoad-config.yml
  const yaml = getArg(args, { name: "yaml", alias: "y" }) || "coderoad.yaml";
  // -o --output - default coderoad.json
  const output =
    getArg(args, { name: "output", alias: "o" }) || "tutorial.json";

  return {
    dir,
    output,
    markdown,
    yaml,
  };
};

async function build(args: string[]) {
  let options: BuildArgs;
  try {
    options = parseArgs(args);
  } catch (e) {
    console.error("Error parsing build logs");
    console.error(e.message);
    return;
  }

  // path to run build from
  const localPath = path.join(process.cwd(), options.dir);

  // load markdown and files
  let _markdown: string;
  let _yaml: string;
  try {
    [_markdown, _yaml] = await Promise.all([
      read(path.join(localPath, options.markdown), "utf8"),
      read(path.join(localPath, options.yaml), "utf8"),
    ]);
  } catch (e) {
    console.error("Error reading file:");
    console.error(e.message);
    return;
  }

  // parse yaml config
  let config;
  try {
    config = yamlParser.load(_yaml);
  } catch (e) {
    console.error("Error parsing yaml");
    console.error(e.message);
  }

  // load git commits to use in parse step
  let commits: CommitLogObject;
  try {
    commits = await getCommits({
      localDir: localPath,
      codeBranch: config.config.repo.branch,
    });
  } catch (e) {
    console.error("Error loading commits:");
    console.error(e.message);
    return;
  }

  // parse tutorial from markdown and yaml
  let tutorial: T.Tutorial;
  try {
    tutorial = await parse({
      text: _markdown,
      config,
      commits,
    });
  } catch (e) {
    console.error("Error parsing tutorial:");
    console.error(e.message);
    return;
  }

  // validate tutorial based on json schema
  try {
    const valid = validateSchema(tutorial);
    if (!valid) {
      console.error("Tutorial validation failed. See above to see what to fix");
      return;
    }
  } catch (e) {
    console.error("Error validating tutorial schema:");
    console.error(e.message);
  }

  // write tutorial
  if (tutorial) {
    try {
      await write(options.output, JSON.stringify(tutorial, null, 2), "utf8");
      console.info(`Success! See output at ${options.output}`);
    } catch (e) {
      console.error("Error writing tutorial json file:");
      console.error(e.message);
    }
  }
}

export default build;
