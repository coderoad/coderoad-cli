import { exec as cpExec } from "child_process";
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
  return async function runCommands(commands: string[]) {
    for (const command of commands) {
      try {
        console.log(`> ${command}`);
        await createExec(cwd)(command);
      } catch (e) {
        console.log(`Setup command failed: "${command}"`);
        console.log(e.message);
      }
    }
  };
}
