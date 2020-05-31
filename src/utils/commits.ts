import * as path from "path";
import gitP, { SimpleGit, StatusResult } from "simple-git/promise";

export async function getCommits() {
  const git: SimpleGit = gitP(process.cwd());

  const isRepo = await git.checkIsRepo();

  const tmpDirectory = "tmp";
  const localPath = path.join(process.cwd(), tmpDirectory);

  if (!isRepo) {
    throw new Error("No git repo provided");
  }

  //   if (isRepo) {
  //     await gitTest.submoduleAdd(repo, workingDir);

  //     isSubModule = true;
  //   } else {
  //     await gitTest.clone(repo, localPath);
  //   }

  //   await git.fetch();

  //   // checkout the branch to load tutorialuration and content branch
  //   await git.checkout(setupBranch);

  //   // Checkout the code branches
  //   await git.checkout(codeBranch);

  //   // Load all logs
  //   const logs = await git.log();

  //   // Filter relevant logs
  //   const parts = new Set();

  //   for (const commit of logs.all) {
  //     const matches = commit.message.match(
  //       /^(?<stepId>(?<levelId>L\d+)S\d+)(?<stepType>[QA])?/
  //     );

  //     if (matches && !parts.has(matches[0])) {
  //       // Uses a set to make sure only the latest commit is proccessed
  //       parts.add(matches[0]);

  //       // Add the content and git hash to the tutorial
  //       if (matches.groups.stepId) {
  //         // If it's a step: add the content and the setup/solution hashes depending on the type
  //         const level: T.Level | null =
  //           tutorial.levels.find(
  //             (level: T.Level) => level.id === matches.groups.levelId
  //           ) || null;
  //         if (!level) {
  //           console.log(`Level ${matches.groups.levelId} not found`);
  //         } else {
  //           const theStep: T.Step | null =
  //             level.steps.find(
  //               (step: T.Step) => step.id === matches.groups.stepId
  //             ) || null;

  //           if (!theStep) {
  //             console.log(`Step ${matches.groups.stepId} not found`);
  //           } else {
  //             if (matches.groups.stepType === "Q") {
  //               theStep.setup.commits.push(commit.hash.substr(0, 7));
  //             } else if (
  //               matches.groups.stepType === "A" &&
  //               theStep.solution &&
  //               theStep.solution.commits
  //             ) {
  //               theStep.solution.commits.push(commit.hash.substr(0, 7));
  //             }
  //           }
  //         }
  //       } else {
  //         // If it's level: add the commit hash (if the level has the commit key) and the content to the tutorial
  //         const theLevel: T.Level | null =
  //           tutorial.levels.find(
  //             (level: T.Level) => level.id === matches.groups.levelId
  //           ) || null;

  //         if (!theLevel) {
  //           console.log(`Level ${matches.groups.levelId} not found`);
  //         } else {
  //           if (_.has(theLevel, "tutorial.commits")) {
  //             if (theLevel.setup) {
  //               theLevel.setup.commits.push(commit.hash.substr(0, 7));
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }

  //   // cleanup the submodules
  //   if (!isLocal) {
  //     let cleanupErr;

  //     if (isSubModule) {
  //       cleanupErr = await cleanupFiles(workingDir);
  //     } else {
  //       cleanupErr = rmDir(path.join(process.cwd(), workingDir));
  //     }

  //     if (cleanupErr) {
  //       console.log(
  //         `Error when deleting temporary files on ${
  //           isSubModule ? "module" : "folder"
  //         } ${workingDir}.`
  //       );
  //     }
  //   }
}

getCommits();
