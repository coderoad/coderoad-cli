import * as path from "path";
import * as _ from "lodash";
import * as fs from "fs";
import * as util from "util";
import { parse } from "./utils/parse";
import { getArg } from "./utils/args";
import { getCommits, CommitLogObject } from "./utils/commits";
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

  const commits: CommitLogObject = await getCommits(config.config.repo.branch);

  // Otherwise, continue with the other options
  const tutorial: T.Tutorial = await parse({
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
