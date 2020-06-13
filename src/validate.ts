import * as path from "path";
import * as fs from "fs-extra";
import * as yamlParser from "js-yaml";
import { getArg } from "./utils/args";
import gitP, { SimpleGit } from "simple-git/promise";
import { createCommandRunner, createCherryPick } from "./utils/exec";
import { getCommits, CommitLogObject } from "./utils/commits";

async function validate(args: string[]) {
  // dir - default .
  const dir = !args.length || args[0].match(/^-/) ? "." : args[0];
  const localDir = path.join(process.cwd(), dir);

  // -y --yaml - default coderoad-config.yml
  const options = {
    yaml: getArg(args, { name: "yaml", alias: "y" }) || "coderoad.yaml",
  };

  const _yaml = await fs.readFile(path.join(localDir, options.yaml), "utf8");

  // parse yaml config
  let skeleton;
  try {
    skeleton = yamlParser.load(_yaml);

    if (!skeleton) {
      throw new Error("Invalid yaml file contents");
    }
  } catch (e) {
    console.error("Error parsing yaml");
    console.error(e.message);
  }

  const codeBranch: string = skeleton.config.repo.branch;

  // validate commits
  const commits: CommitLogObject = await getCommits({ localDir, codeBranch });

  // setup tmp dir
  const tmpDir = path.join(localDir, ".tmp");

  try {
    if (!(await fs.pathExists(tmpDir))) {
      await fs.emptyDir(tmpDir);
    }
    const tempGit: SimpleGit = gitP(tmpDir);

    await tempGit.init();
    await tempGit.addRemote("origin", skeleton.config.repo.uri);
    await tempGit.fetch("origin", skeleton.config.repo.branch);
    // no js cherry pick implementation
    const cherryPick = createCherryPick(tmpDir);
    const runCommands = createCommandRunner(tmpDir);

    // VALIDATE TUTORIAL TESTS
    if (commits.INIT) {
      // load commits
      console.info("Loading setup commits...");
      cherryPick(commits.INIT);

      // run commands
      if (skeleton.config?.testRunner?.setup?.commands) {
        runCommands(skeleton.config?.testRunner?.setup?.commands);
      }
    }

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

    // load INIT commit(s)
  } catch (e) {
    console.error(e.message);
  } finally {
    // cleanup
    // await fs.emptyDir(tmpDir);
  }
}

export default validate;
