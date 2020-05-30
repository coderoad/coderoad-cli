import * as yamlParser from "js-yaml";
import * as path from "path";
import * as _ from "lodash";
import * as fs from "fs";
import * as T from "../typings/tutorial";
import { parse } from "./utils/parse";
// import validate from './validator';

// import not working
const simpleGit = require("simple-git/promise");

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

export type BuildOptions = {
  repo: string; // Git url to the repo. It should finish with .git
  codeBranch: string; // The branch containing the tutorial code
  setupBranch: string; // The branch containing the tutorialuration files
  isLocal: boolean; // define if the repo is local or remote
  output: string;
};

async function build({ repo, codeBranch, setupBranch, isLocal }: BuildOptions) {
  let git: any;
  let isSubModule = false;
  let localPath: string;

  if (isLocal) {
    git = simpleGit(repo);
    localPath = repo;
  } else {
    const gitTest = simpleGit(process.cwd());
    const isRepo = await gitTest.checkIsRepo();
    localPath = path.join(process.cwd(), workingDir);

    if (isRepo) {
      await gitTest.submoduleAdd(repo, workingDir);

      isSubModule = true;
    } else {
      await gitTest.clone(repo, localPath);
    }

    git = simpleGit(localPath);
  }

  await git.fetch();

  // checkout the branch to load tutorialuration and content branch
  await git.checkout(setupBranch);

  // Load files
  const _content = fs.readFileSync(path.join(localPath, "TUTORIAL.md"), "utf8");
  let _config = fs.readFileSync(path.join(localPath, "coderoad.yaml"), "utf8");

  const tutorial = parse(_content, _config);

  // Checkout the code branches
  await git.checkout(codeBranch);

  // Load all logs
  const logs = await git.log();

  // Filter relevant logs
  const parts = new Set();

  for (const commit of logs.all) {
    const matches = commit.message.match(
      /^(?<stepId>(?<levelId>L\d+)S\d+)(?<stepType>[QA])?/
    );

    if (matches && !parts.has(matches[0])) {
      // Uses a set to make sure only the latest commit is proccessed
      parts.add(matches[0]);

      // Add the content and git hash to the tutorial
      if (matches.groups.stepId) {
        // If it's a step: add the content and the setup/solution hashes depending on the type
        const level: T.Level | null =
          tutorial.levels.find(
            (level: T.Level) => level.id === matches.groups.levelId
          ) || null;
        if (!level) {
          console.log(`Level ${matches.groups.levelId} not found`);
        } else {
          const theStep: T.Step | null =
            level.steps.find(
              (step: T.Step) => step.id === matches.groups.stepId
            ) || null;

          if (!theStep) {
            console.log(`Step ${matches.groups.stepId} not found`);
          } else {
            if (matches.groups.stepType === "Q") {
              theStep.setup.commits.push(commit.hash.substr(0, 7));
            } else if (
              matches.groups.stepType === "A" &&
              theStep.solution &&
              theStep.solution.commits
            ) {
              theStep.solution.commits.push(commit.hash.substr(0, 7));
            }
          }
        }
      } else {
        // If it's level: add the commit hash (if the level has the commit key) and the content to the tutorial
        const theLevel: T.Level | null =
          tutorial.levels.find(
            (level: T.Level) => level.id === matches.groups.levelId
          ) || null;

        if (!theLevel) {
          console.log(`Level ${matches.groups.levelId} not found`);
        } else {
          if (_.has(theLevel, "tutorial.commits")) {
            if (theLevel.setup) {
              theLevel.setup.commits.push(commit.hash.substr(0, 7));
            }
          }
        }
      }
    }
  }

  // cleanup the submodules
  if (!isLocal) {
    let cleanupErr;

    if (isSubModule) {
      cleanupErr = await cleanupFiles(workingDir);
    } else {
      cleanupErr = rmDir(path.join(process.cwd(), workingDir));
    }

    if (cleanupErr) {
      console.log(
        `Error when deleting temporary files on ${
          isSubModule ? "module" : "folder"
        } ${workingDir}.`
      );
    }
  }

  // const isValid = validate(tutorial);

  // if (!isValid) {
  //   console.log(JSON.stringify(validate.errors, null, 2));
  //   return;
  // }

  return tutorial;
}

export default build;
