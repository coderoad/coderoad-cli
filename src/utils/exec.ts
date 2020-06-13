import * as T from "../../typings/tutorial";
import { exec as cpExec } from "child_process";
import * as path from "path";
import { promisify } from "util";

const asyncExec = promisify(cpExec);

export function createExec(cwd: string) {
  return function exec(
    command: string
  ): Promise<{ stdout: string; stderr: string }> | never {
    return asyncExec(command, { cwd });
  };
}

export function createCherryPick(cwd: string) {
  return async function cherryPick(commits: string[]): Promise<void> {
    for (const commit of commits) {
      try {
        const { stdout } = await createExec(cwd)(
          `git cherry-pick -X theirs ${commit}`
        );
        if (!stdout) {
          console.warn(`No cherry-pick output for ${commit}`);
        }
      } catch (e) {
        console.warn(`Cherry-pick failed for ${commit}`);
      }
    }
  };
}

export function createCommandRunner(cwd: string) {
  return async function runCommands(commands: string[], dir?: string) {
    for (const command of commands) {
      try {
        console.log(`> ${command}`);
        let cwdDir = cwd;
        if (dir) {
          cwdDir = path.join(cwd, dir);
        }
        await createExec(cwdDir)(command);
      } catch (e) {
        console.log(`Setup command failed: "${command}"`);
        console.log(e.message);
      }
    }
  };
}

function isAbsolute(p: string) {
  return path.normalize(p + "/") === path.normalize(path.resolve(p) + "/");
}

export function createTestRunner(cwd: string, config: T.TestRunnerConfig) {
  const { command, args, directory } = config;

  const commandIsAbsolute = isAbsolute(command);

  let runnerPath;
  if (commandIsAbsolute) {
    // absolute path
    runnerPath = command;
  } else {
    // relative path
    runnerPath = path.join(cwd, directory || "", command);
  }

  const commandWithArgs = `${runnerPath} ${args.tap}`;

  return async function runTest() {
    const { stdout, stderr } = await createExec(cwd)(commandWithArgs);
    console.log(stdout);
    console.warn(stderr);
  };
}
