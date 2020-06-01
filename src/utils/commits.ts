import * as fs from "fs";
import util from "util";
import * as path from "path";
import gitP, { SimpleGit } from "simple-git/promise";
import * as T from "../../typings/tutorial";

const mkdir = util.promisify(fs.mkdir);
const exists = util.promisify(fs.exists);
const rmdir = util.promisify(fs.rmdir);

type GetCommitOptions = {
  localDir: string;
  codeBranch: string;
};

export type CommitLogObject = { [position: string]: string[] };

export async function getCommits({
  localDir,
  codeBranch,
}: GetCommitOptions): Promise<CommitLogObject> {
  const git: SimpleGit = gitP(localDir);

  const isRepo = await git.checkIsRepo();

  if (!isRepo) {
    throw new Error("No git repo provided");
  }

  const tmpDir = path.join(localDir, ".tmp");

  const tmpDirExists = await exists(tmpDir);
  if (tmpDirExists) {
    await rmdir(tmpDir, { recursive: true });
  }
  await mkdir(tmpDir);
  const tempGit = gitP(tmpDir);
  await tempGit.clone(localDir, tmpDir);

  const branches = await git.branch();

  if (!branches.all.length) {
    throw new Error("No branches found");
  } else if (!branches.all.includes(codeBranch)) {
    throw new Error(`Code branch "${codeBranch}" not found`);
  }

  // track the original branch in case of failure
  const originalBranch = branches.current;

  // Filter relevant logs
  const commits: CommitLogObject = {};

  try {
    // Checkout the code branches
    await git.checkout(codeBranch);

    // Load all logs
    const logs = await git.log();

    for (const commit of logs.all) {
      const matches = commit.message.match(
        /^(?<stepId>(?<levelId>L\d+)(S\d+))(?<stepType>[QA])?/
      );

      if (matches && matches.length) {
        // Use an object of commit arrays to collect all commits
        const position = matches[0];
        if (!commits[position]) {
          // does not exist, create the list
          commits[position] = [commit.hash];
        } else {
          // add to the list
          commits[position].push(commit.hash);
        }
      } else {
        const initMatches = commit.message.match(/^INIT/);
        if (initMatches && initMatches.length) {
          if (!commits.INIT) {
            // does not exist, create the list
            commits.INIT = [commit.hash];
          } else {
            // add to the list
            commits.INIT.push(commit.hash);
          }
        }
      }
    }
  } catch (e) {
    console.error("Error with checkout or commit matching");
    throw new Error(e.message);
  } finally {
    // revert back to the original branch on failure
    await git.checkout(originalBranch);
    // cleanup the tmp directory
    await rmdir(tmpDir, { recursive: true });
  }

  return commits;
}
