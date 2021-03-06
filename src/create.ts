import ncp from 'ncp'
import * as path from 'path'
import { promisify } from 'util'
import { getArg } from './utils/args'

const copy = promisify(ncp)

type CreateArgs = {
  dir: string
  lang: string
  testRunner: string
}

async function create (args: string[]): Promise<void> {
  let options: CreateArgs

  // dir - default .
  const dir = !args.length || args[0].match(/^-/) ? '.' : args[0]
  // lang - default js
  const lang: string = getArg(args, { name: 'lang', alias: 'l' }) || 'js'
  // testRunner - default mocha
  const testRunner: string =
    getArg(args, { name: 'testRunner', alias: 't' }) || 'mocha'

  // validate lang
  if (!['js'].includes(lang)) {
    throw new Error(`Language ${lang} not supported yet in create`)
  }

  // validate test runner
  if (!['mocha'].includes(testRunner)) {
    throw new Error(`Test Runner ${testRunner} not supported yet in create`)
  }

  console.info(`Creating CodeRoad project for ${lang} ${testRunner}`)

  options = {
    dir,
    lang,
    testRunner
  }

  const localPath = path.join(process.cwd(), options.dir)

  // TODO: git init ?

  // copy tutorial file
  const pathToSrc = path.join(__dirname, '..', 'src')
  const templateDirectory = path.resolve(pathToSrc, 'templates')

  const markdownPath = path.join(templateDirectory, 'TUTORIAL.md')
  const targetMarkdownPath = path.join(localPath, 'TUTORIAL.md')
  try {
    await copy(markdownPath, targetMarkdownPath, {
      clobber: false
    })
  } catch (e) {
    console.error('Error on creating markdown file')
    console.error(e.message)
  }

  // TODO: copy master yaml
  const pathToYaml = path.join(templateDirectory, `${lang}-${testRunner}`)
  try {
    await copy(pathToYaml, localPath, {
      clobber: false
    })
  } catch (e) {
    console.error('Error on creating yaml file')
    console.error(e.message)
  }

  // TODO: copy code files with commits
}

export default create
