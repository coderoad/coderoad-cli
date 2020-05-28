import arg from 'arg';
import inquirer from 'inquirer';
import simpleGit from 'simple-git/promise';
import build from './parse';
import create from './create';
import fs from 'fs';

const localGit = 'Local directory';
const remoteGit = 'Git remote address';

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--git': String,
      '--dir': String,
      '--code': String,
      '--setup': String,
      '--output': String,
      '--help': Boolean,
      '-g': '--git',
      '-d': '--dir',
      '-c': '--code',
      '-s': '--setup',
      '-o': '--output',
      '-h': '--help',
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    command: args['_'][0],
    git: args['--git'],
    dir: args['--dir'],
    codeBranch: args['--code'],
    setupBranch: args['--setup'],
    output: args['--output'],
    help: args['--help'] || false,
  };
}

async function promptForMissingOptions(options) {

  const questions = [];

  // if no git remote addres is provided, assume current folder
  if (!options.git && !options.dir) {

    // check if the current dir is a valid repo
    const git = simpleGit(process.cwd());
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {

      questions.push({
        type: 'list',
        name: 'source',
        message: `The current directory (${process.cwd()}) is not a valid git repo. Would you like to provide a...`,
        choices: [localGit, remoteGit],
        default: localGit,
      });

      questions.push({
        type: 'input',
        name: 'localGit',
        message: 'Please, provide a directory of the valid git repository: ',
        when: (answers) => answers.source === localGit,
      });

      questions.push({
        type: 'input',
        name: 'remoteGit',
        message: 'Please, provide the address of a remote git repository: ',
        when: (answers) => answers.source === remoteGit,
      });
    }
  }
  // if both local dir and remote repos are provided
  else if (options.git && options.dir) {
    questions.push({
      type: 'list',
      name: 'source',
      message: 'It was provided both a local git directory and a remote address. Please, choose either one or those to parse: ',
      choices: [localGit, remoteGit],
      default: localGit,
    });
  }

  // if the branch containing the code is not provided
  if (!options.codeBranch) {
    questions.push({
      type: 'imput',
      name: 'codeBranch',
      message: 'Please, provide the branch with the code commits: ',
    });
  }

  // if the branch containing the setup files is not provided
  if (!options.setupBranch) {
    questions.push({
      type: 'imput',
      name: 'setupBranch',
      message: 'Please, provide the branch with the setup files (coderoad.yaml and tutorial.md): ',
    });
  }

  const answers = await inquirer.prompt(questions);

  let repo;
  let isLocal;

  if (answers.source) {
    repo = answers.source === localGit ? options.dir : options.git;
    isLocal = answers.source === localGit;
  }
  else {
    repo = options.dir || options.git || process.cwd();
    isLocal = options.git ? false : true;
  }

  return {
    repo,
    setupBranch: options.setupBranch || answers.setupBranch,
    codeBranch: options.codeBranch || answers.codeBranch,
    output: options.output,
    isLocal,
  };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  
  // If help called just print the help text and exit
  if (options.help) {
    console.log('Docs can be found at github: https://github.com/coderoad/builder-cli/');
  }
  else if (!options.command) {
    console.log(`The command is missing. Chose either 'create' or 'build' and its options.`)
  } 
  else {
    switch (options.command) {
      case 'build':
        // Otherwise, continue with the other options
        options = await promptForMissingOptions(options);
        console.log(options);
        const config = await build(options);

        if (config) {
          if (options.output) {
            fs.writeFileSync(options.output, JSON.stringify(config), 'utf8');
          }
          else {
            console.log(JSON.stringify(config, null, 2));
          }
        }
        break;
      
      case 'create':
        create(process.cwd());
        break;
    }
  }
}