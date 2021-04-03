import { mkdir, exists, rmdir } from 'fs'
import util from 'util'
import * as path from 'path'
import { LogResult } from 'simple-git/typings/response'
import gitP, { SimpleGit } from 'simple-git/promise'
import { validateCommitOrder } from './validateCommits'

const mkdirPromise = util.promisify(mkdir)
const existsPromise = util.promisify(exists)
const rmdirPromise = util.promisify(rmdir)

type GetCommitOptions = {
  localDir: string
  codeBranch: string
}

export type CommitLogObject = { [position: string]: string[] }

export function parseCommits (
  logs: LogResult<any>
): { [hash: string]: string[] } {
  // Filter relevant logs
  const commits: CommitLogObject = {}
  const positions: string[] = []

  for (const commit of logs.all) {
    const matches = commit.message.match(
      /^(?<init>INIT)|(L?(?<levelId>\d+)[S|\.]?(?<stepId>\d+)?(?<stepType>[Q|A|T|S])?)/
    )

    if (matches && matches.length) {
      // Use an object of commit arrays to collect all commits
      const { groups } = matches
      let position
      if (groups.init) {
        position = 'INIT'
      } else if (groups.levelId && groups.stepId) {
        let stepType
        // @deprecated Q
        if (!groups.stepType || ['Q', 'T'].includes(groups.stepType)) {
          stepType = 'T' // test
          // @deprecated A
        } else if (!groups.stepType || ['A', 'S'].includes(groups.stepType)) {
          stepType = 'S' // solution
        }
        position = `${groups.levelId}.${groups.stepId}:${stepType}`
      } else if (groups.levelId) {
        position = groups.levelId
      } else {
        console.warn(`No matcher for commit "${commit.message}"`)
      }
      commits[position] = [...(commits[position] || []), commit.hash]
      positions.unshift(position)
    } else {
      const initMatches = commit.message.match(/^INIT/)
      if (initMatches && initMatches.length) {
        commits.INIT = [commit.hash, ...(commits.INIT || [])]
        positions.unshift('INIT')
      }
    }
  }
  // validate order
  validateCommitOrder(positions)
  return commits
}

export async function getCommits ({
  localDir,
  codeBranch
}: GetCommitOptions): Promise<CommitLogObject> {
  const git: SimpleGit = gitP(localDir)

  // check that a repo is created
  const isRepo = await git.checkIsRepo()
  if (!isRepo) {
    throw new Error('No git repo provided')
  }

  // setup .tmp directory
  const tmpDir = path.join(localDir, '.tmp')
  const tmpDirExists = await existsPromise(tmpDir)
  if (tmpDirExists) {
    await rmdirPromise(tmpDir, { recursive: true })
  }
  await mkdirPromise(tmpDir)

  const tempGit = gitP(tmpDir)
  await tempGit.clone(localDir, tmpDir)

  const branches = await git.branch()

  if (!branches.all.length) {
    throw new Error('No branches found')
  } else if (!branches.all.includes(codeBranch)) {
    throw new Error(`Code branch "${codeBranch}" not found`)
  }

  // track the original branch in case of failure
  const originalBranch = branches.current

  try {
    // Checkout the code branches
    await git.checkout(codeBranch)

    // Load all logs
    const logs = await git.log()

    const commits = parseCommits(logs)

    return commits
  } catch (e) {
    console.error('Error with checkout or commit matching')
    throw new Error(e.message)
  } finally {
    // revert back to the original branch on failure
    await git.checkout(originalBranch)
    // cleanup the tmp directory
    await rmdirPromise(tmpDir, { recursive: true })
  }
}
