import * as T from '../../typings/tutorial'
import { exec as cpExec } from 'child_process'
import * as path from 'path'
import { promisify } from 'util'

const asyncExec = promisify(cpExec)

export function createExec (cwd: string) {
  return async function exec (
    command: string
  ): Promise<{ stdout: string | null; stderr: string }> {
    try {
      const result = await asyncExec(command, { cwd })
      return result
    } catch (e) {
      return { stdout: null, stderr: e.message }
    }
  }
}

export function createCherryPick (cwd: string) {
  return async function cherryPick (commits: string[]): Promise<void> {
    for (const commit of commits) {
      try {
        const { stdout, stderr } = await createExec(cwd)(
          `git cherry-pick -X theirs ${commit}`
        )
        if (stderr) {
          console.warn(stderr)
        }
        if (!stdout) {
          console.warn(`No cherry-pick output for ${commit}`)
        }
      } catch (e) {
        console.warn(`Cherry-pick failed for ${commit}`)
        console.error(e.message)
      }
    }
  }
}

export function createCommandRunner (cwd: string) {
  return async function runCommands (
    commands: string[],
    dir?: string
  ): Promise<boolean> {
    let errors = []
    for (const command of commands) {
      try {
        console.log(`--> ${command}`)
        let cwdDir = cwd
        if (dir) {
          cwdDir = path.join(cwd, dir)
        }
        const { stdout, stderr } = await createExec(cwdDir)(command)

        console.log(stdout)
        console.warn(stderr)
      } catch (e) {
        console.error(`Command failed: "${command}"`)
        console.warn(e.message)
        errors.push(e.message)
      }
    }
    return !!errors.length
  }
}

// function isAbsolute(p: string) {
//   return path.normalize(p + "/") === path.normalize(path.resolve(p) + "/");
// }

export function createTestRunner (cwd: string, config: T.TestRunnerConfig) {
  const { command, args, directory } = config

  // const commandIsAbsolute = isAbsolute(command);

  let wd = cwd
  if (directory) {
    wd = path.join(cwd, directory)
  }

  const commandWithArgs = `${command} ${args.tap}`

  return async function runTest (): Promise<{
    stdout: string | null
    stderr: string | null
  }> {
    try {
      // console.log(await createExec(wd)("ls -a node_modules/.bin"));
      return await createExec(wd)(commandWithArgs)
    } catch (e) {
      return Promise.resolve({ stdout: null, stderr: e.message })
    }
  }
}
