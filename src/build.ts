import { load } from 'js-yaml'
import { join } from 'path'
import { writeFile, readFile } from 'fs'
import { promisify } from 'util'
import { parse } from './utils/parse'
import { getArg } from './utils/args'
import { getCommits, CommitLogObject } from './utils/commits'
import skeletonSchema from './schema/skeleton'
import tutorialSchema from './schema/tutorial'
import { validateSchema } from './utils/validateSchema'
import { validateMarkdown } from './utils/validateMarkdown'
import * as T from '../typings/tutorial'

const write = promisify(writeFile)
const read = promisify(readFile)

export type BuildConfigOptions = {
  text: string // text document from markdown
  config: T.Tutorial // yaml config file converted to json
  commits: CommitLogObject // an object of tutorial positions with a list of commit hashes
}

type BuildArgs = {
  dir: string
  markdown: string
  yaml: string
  output: string
  validate: boolean
}

async function build (args: string[]) {
  let options: BuildArgs

  try {
    // dir - default .
    const dir = !args.length || args[0].match(/^-/) ? '.' : args[0]
    // -m --markdown - default TUTORIAL.md
    const markdown =
      getArg(args, { name: 'markdown', alias: 'm' }) || 'TUTORIAL.md'
    // -y --yaml - default coderoad-config.yml
    const yaml = getArg(args, { name: 'yaml', alias: 'y' }) || 'coderoad.yaml'
    // -o --output - default coderoad.json
    const output =
      getArg(args, { name: 'output', alias: 'o' }) || 'tutorial.json'
    const validate = getArg(args, { name: 'validate', alias: 'v' }) !== 'false'

    console.log(`Building CodeRoad ${output}...`)

    options = {
      dir,
      output,
      markdown,
      yaml,
      validate
    }
  } catch (e) {
    console.error('Error parsing build logs')
    console.error(e.message)
    return
  }

  // path to run build from
  const localPath = join(process.cwd(), options.dir)

  // load markdown and files
  let _markdown: string
  let _yaml: string
  try {
    ;[_markdown, _yaml] = await Promise.all([
      read(join(localPath, options.markdown), 'utf8'),
      read(join(localPath, options.yaml), 'utf8')
    ])
  } catch (e) {
    console.error('Error reading file:')
    console.error(e.message)
    return
  }

  // validate markdown loosely
  try {
    const isValid = validateMarkdown(_markdown)
    if (!isValid) {
      console.warn('Invalid markdown')
    }
  } catch (e) {
    console.error('Error validating markdown:')
    console.error(e.message)
    return
  }

  // parse yaml skeleton config
  let skeleton
  try {
    skeleton = load(_yaml) as T.TutorialSkeleton
    if (!skeleton || !Object.keys(skeleton).length) {
      throw new Error(`Skeleton at "${options.yaml}" is invalid`)
    }
  } catch (e) {
    console.error('Error parsing yaml')
    console.error(e.message)
    return
  }

  // validate skeleton based on skeleton json schema
  try {
    const valid = validateSchema(skeletonSchema, skeleton)
    if (!valid) {
      console.error('Skeleton validation failed. See above to see what to fix')
      return
    }
  } catch (e) {
    console.error('Error validating tutorial schema:')
    console.error(e.message)
  }

  // load git commits to use in parse step
  let commits: CommitLogObject
  try {
    commits = await getCommits({
      localDir: localPath,
      codeBranch: skeleton.config.repo.branch
    })
  } catch (e) {
    console.error('Error loading commits:')
    console.error(e.message)
    return
  }

  // parse tutorial from markdown and yaml
  let tutorial: T.Tutorial
  try {
    tutorial = await parse({
      text: _markdown,
      skeleton,
      commits
    })
  } catch (e) {
    console.error('Error parsing tutorial:')
    console.error(e.message)
    return
  }

  // validate tutorial based on tutorial json schema
  try {
    if (options.validate) {
      const valid = validateSchema(tutorialSchema, tutorial)
      if (!valid) {
        console.error(
          'Tutorial validation failed. See above to see what to fix'
        )
        // continue rather than exiting early
      }
    }
  } catch (e) {
    console.error('Error validating tutorial schema:')
    console.error(e.message)
  }

  // write tutorial
  if (tutorial) {
    try {
      await write(options.output, JSON.stringify(tutorial, null, 2), 'utf8')
      console.info(`Success! See output at ${options.output}`)
    } catch (e) {
      console.error('Error writing tutorial json file:')
      console.error(e.message)
    }
  }
}

export default build
