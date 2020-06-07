import * as path from "path";
import * as fs from "fs";
import util from "util";
import * as yamlParser from "js-yaml";
import { getArg } from "./utils/args";
import gitP, { SimpleGit } from "simple-git/promise";
import { getCommits, CommitLogObject } from "./utils/commits";

const mkdir = util.promisify(fs.mkdir);
const exists = util.promisify(fs.exists);
const rmdir = util.promisify(fs.rmdir);
const read = util.promisify(fs.readFile);

async function validate(args: string[]) {
  // dir - default .
  const dir = !args.length || args[0].match(/^-/) ? "." : args[0];
  const localDir = path.join(process.cwd(), dir);

  // -y --yaml - default coderoad-config.yml
  const options = {
    yaml: getArg(args, { name: "yaml", alias: "y" }) || "coderoad.yaml",
  };

  const _yaml = await read(path.join(localDir, options.yaml), "utf8");

  // parse yaml config
  let config;
  try {
    config = yamlParser.load(_yaml);
    // TODO: validate yaml
    if (!config || !config.length) {
      throw new Error("Invalid yaml file contents");
    }
  } catch (e) {
    console.error("Error parsing yaml");
    console.error(e.message);
  }

  const codeBranch: string = config.config.repo.branch;

  // VALIDATE SKELETON WITH COMMITS
  const commits = getCommits({ localDir, codeBranch });

  // parse tutorial skeleton for order and commands

  // on error, warn missing level/step

  // VALIDATE COMMIT ORDER
  // list all commits in order
  // validate that a level number doesn't come before another level
  // validate that a step falls within a level
  // validate that steps are in order

  // on error, show level/step out of order

  // VALIDATE TUTORIAL TESTS
  // load INIT commit(s)
  // run test runner setup command(s)
  // loop over commits:
  // - load level commit
  // - run level setup command(s)
  // - load step setup commit(s)
  // - run step setup command(s)
  // - if next solution:
  //    - run test - expect fail
  // - if solution
  //    - run test - expect pass

  // log level/step
  // on error, show level/step & error message

  // CLEANUP
}

export default validate;
