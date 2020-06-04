import * as path from "path";
import * as fs from "fs";
import util from "util";
import gitP, { SimpleGit } from "simple-git/promise";
import { getCommits, CommitLogObject } from "./utils/commits";

const mkdir = util.promisify(fs.mkdir);
const exists = util.promisify(fs.exists);
const rmdir = util.promisify(fs.rmdir);

async function validate(args: string[]) {
  // dir - default .
  const dir = !args.length || args[0].match(/^-/) ? "." : args[0];
  console.warn("Not yet implemented. Coming soon");

  const localDir = path.join(process.cwd(), dir);
  const codeBranch = "";

  const commits = getCommits({ localDir, codeBranch });
  // VALIDATE SKELETON WITH COMMITS
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
