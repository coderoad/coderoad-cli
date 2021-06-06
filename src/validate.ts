import { join } from 'path'
import { readFile, pathExists, emptyDir } from 'fs-extra'
import { load } from 'js-yaml'
import { getArg } from './utils/args'
import gitP, { SimpleGit } from 'simple-git/promise'
import {
  createCommandRunner,
  createCherryPick,
  createTestRunner
} from './utils/exec'
import { getCommits, CommitLogObject } from './utils/commits'
import { TutorialSkeleton } from '../typings/tutorial'

interface Options {
  yaml: string
  clean: boolean
}

async function validate (args: string[]) {
  // dir - default .
  const dir = !args.length || args[0].match(/^-/) ? '.' : args[0]
  const localDir = join(process.cwd(), dir)

  // -y --yaml - default coderoad-config.yml
  const options: Options = {
    yaml: getArg(args, { name: 'yaml', alias: 'y' }) || 'coderoad.yaml',
    clean: getArg(args, { name: 'clean', alias: 'c' }) !== 'false'
  }

  const _yaml: string = await readFile(join(localDir, options.yaml), 'utf8')

  // parse yaml config
  let skeleton
  try {
    skeleton = load(_yaml) as TutorialSkeleton

    if (!skeleton) {
      throw new Error('Invalid yaml file contents')
    }
  } catch (e) {
    console.error('Error parsing yaml')
    console.error(e.message)
    return
  }

  const codeBranch: string = skeleton.config.repo.branch

  // validate commits
  const commits: CommitLogObject = await getCommits({ localDir, codeBranch })

  // setup tmp dir
  const tmpDir = join(localDir, '.tmp')

  try {
    if (!(await pathExists(tmpDir))) {
      await emptyDir(tmpDir)
    }
    const tempGit: SimpleGit = gitP(tmpDir)

    await tempGit.init()
    await tempGit
      .addRemote('origin', skeleton.config.repo.uri)
      .catch(console.warn)
    await tempGit.fetch('origin', skeleton.config.repo.branch)
    // no js cherry pick implementation
    const cherryPick = createCherryPick(tmpDir)
    const runCommands = createCommandRunner(tmpDir)
    const runTest = createTestRunner(tmpDir, skeleton.config.testRunner)

    // setup
    console.info('* Setup')
    if (commits.INIT) {
      // load commits
      console.info('-- Loading commits...')
      await cherryPick(commits.INIT)

      // run commands
      if (skeleton.config?.setup?.commands) {
        console.info('-- Running commands...')

        await runCommands(skeleton.config?.setup?.commands)
      }
    }

    for (const level of skeleton.levels) {
      console.info(`* ${level.id}`)
      if (level?.setup) {
        // load commits
        if (commits[`${level.id}`]) {
          console.log(`-- Loading commits...`)
          await cherryPick(commits[level.id])
        }
        // run commands
        if (level.setup?.commands) {
          console.log(`-- Running commands...`)
          await runCommands(level.setup.commands)
        }
      }
      // steps
      if (level.steps) {
        for (const step of level.steps) {
          console.info(`** ${step.id}`)
          // load commits
          const stepSetupCommits = commits[`${step.id}:T`]
          if (stepSetupCommits) {
            console.info(`--- Loading setup commits...`)
            await cherryPick(stepSetupCommits)
          }
          // run commands
          if (step?.setup?.commands) {
            console.info(`--- Running setup commands...`)
            await runCommands(step.setup.commands)
          }

          const stepSolutionCommits = commits[`${step.id}:S`]
          const hasSolution = step.solution || stepSolutionCommits

          // ignore running tests on steps with no solution
          if (hasSolution) {
            // run test
            console.info('--- Running setup test...')
            // expect fail
            const { stdout, stderr } = await runTest()
            if (stdout) {
              console.error(
                `--- Expected ${step.id} setup tests to fail, but passed`
              )
              // log tests
              console.log(stdout)
            }
          }

          if (stepSolutionCommits) {
            console.info(`--- Loading solution commits...`)
            await cherryPick(stepSolutionCommits)
          }

          // run commands
          if (step?.solution?.commands) {
            console.info(`--- Running solution commands...`)
            await runCommands(step.solution.commands)
          }

          if (hasSolution) {
            // run test
            console.info('--- Running solution test...')
            // expect pass
            const { stdout, stderr } = await runTest()
            if (stderr) {
              console.error(
                `--- Expected ${step.id} solution tests to pass, but failed`
              )
              // log tests
              console.log(stderr)
            }
          }
        }
      }
    }

    console.info(`\n✔ Success!`)
  } catch (e) {
    console.error('\n✘ Fail!')
    console.error(e.message)
  } finally {
    // cleanup
    if (options.clean) {
      await emptyDir(tmpDir)
    }
  }
}

export default validate
