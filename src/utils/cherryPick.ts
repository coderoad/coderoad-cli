import { exec as cpExec } from "child_process";
import { promisify } from "util";

const asyncExec = promisify(cpExec);

export const exec = (
  command: string,
  cwd: string
): Promise<{ stdout: string; stderr: string }> | never => {
  return asyncExec(command, { cwd });
};

export function gitPCherryPick(cwd: string) {
  return async function cherryPick(commits: string[]): Promise<void> {
    for (const commit of commits) {
      try {
        const { stdout } = await exec(
          `git cherry-pick -X theirs ${commit}`,
          cwd
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
