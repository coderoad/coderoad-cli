import simpleGit from 'simple-git/promise';
import yamlParser from 'js-yaml';
import path from 'path';
import _ from 'lodash';
import fs from 'fs';
// import validate from './validator';

const workingDir = 'tmp';

function parseContent(md) {

  let start = -1;
  const parts = [];

  const lines = md.split('\n');

  // Split the multiple parts - This way enables the creator to use 4/5 level headers inside the content.
  lines.forEach((line, index) => {
    if (line.match(/#{1,3}\s/) || index === lines.length - 1) {
      if (start !== -1) {
        parts.push(lines.slice(start, index).join('\n'));
        start = index
      }
      else {
        start = index
      }
    }
  });

  const sections = {};

  // Identify and remove the header
  const summaryMatch = parts.shift().match(/^#\s(?<tutorialTitle>.*)\n+(?<tutorialDescription>[^]*)/);

  sections['summary'] = {
    title: summaryMatch.groups.tutorialTitle,
    description: summaryMatch.groups.tutorialDescription,
  };

  // Identify each part of the content
  parts.forEach(section => {
    const levelRegex = /^(##\s(?<levelId>L\d+)\s(?<levelTitle>.*)\n*(>\s*(?<levelSummary>.*))?\n+(?<levelContent>[^]*))/;
    const stepRegex = /^(###\s(?<stepId>(?<levelId>L\d+)S\d+)\s(?<stepTitle>.*)\n+(?<stepContent>[^]*))/;

    const levelMatch = section.match(levelRegex);
    const stepMatch = section.match(stepRegex);

    if (levelMatch) {
      const level = {
        [levelMatch.groups.levelId]: {
          id: levelMatch.groups.levelId,
          title: levelMatch.groups.levelTitle,
          summary: levelMatch.groups.levelSummary,
          content: levelMatch.groups.levelContent,
        }
      };

      _.merge(sections, level);

    }
    else if (stepMatch) {

      const step = {
        [stepMatch.groups.levelId]: {
          steps: {
            [stepMatch.groups.stepId]: {
              id: stepMatch.groups.stepId,
              // title: stepMatch.groups.stepTitle, //Not using at this momemnt
              content: stepMatch.groups.stepContent
            }
          }
        }
      };

      _.merge(sections, step);

    }

  });

  return sections;

}

function rmDir(dir, rmSelf) {

  let files;
  rmSelf = (rmSelf === undefined) ? true : rmSelf;
  // dir = dir + path.sep;

  try { files = fs.readdirSync(dir); } catch (e) { console.log(`Sorry, directory '${dir}' doesn't exist.`); return; }

  if (files.length > 0) {
    files.forEach(function (x, i) {
      if (fs.statSync(path.join(dir, x)).isDirectory()) {
        rmDir(path.join(dir, x));
      } else {
        fs.unlinkSync(path.join(dir, x));
      }
    });
  }

  if (rmSelf) {
    // check if user want to delete the directory ir just the files in this directory
    fs.rmdirSync(dir);
  }

}

async function cleanupFiles(workingDir) {

  try {
    const gitModule = simpleGit(__dirname);

    await gitModule.subModule(['deinit', '-f', workingDir]);
    await gitModule.rm(workingDir);
    await gitModule.reset(['HEAD']);
    rmDir(path.join(__dirname, '.git', 'modules', workingDir));
    rmDir(workingDir);

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 
 * @param {string} repo Git url to the repo. It should finish with .git
 * @param {string} codeBranch The branch containing the tutorial code
 * @param {string} setupBranch The branch containing the configuration files
 * @param {string} isLocal define if the repo is local or remote
 */
async function build({ repo, codeBranch, setupBranch, isLocal }) {

  let git;
  let isSubModule = false;

  if (isLocal) {
    git = simpleGit(repo);
  }
  else {
    const gitTest = simpleGit(__dirname);
    const isRepo = await gitTest.checkIsRepo();

    if (isRepo) {
      const startCleanup = cleanupFiles(workingDir);

      if (startCleanup) {
        console.log('Clenned old files from git module...');
      }

      await gitTest.submoduleAdd(repo, workingDir);

      git = simpleGit(path.join(__dirname, workingDir));

      isSubModule = true;

    }
    else {
      await gitTest.clone(repo);
      git = simpleGit(__dirname);
    }
  }

  await git.fetch();

  // checkout the branch to load configuration and content branch
  await git.checkout(setupBranch);

  // Load files
  const _mdContent = fs.readFileSync(path.join(__dirname, workingDir, 'TUTORIAL.md'), 'utf8');
  let _config = fs.readFileSync(path.join(__dirname, workingDir, 'coderoad.yaml'), 'utf8');

  // Add one more line to the content as per Shawn's request
  const mdContent = parseContent(_mdContent);

  // Parse config to JSON
  const config = yamlParser.load(_config);

  // Add the summary to the config file
  config['summary'] = mdContent.summary;

  // merge content and config
  config.levels.forEach(level => {
    const { steps, ...content } = mdContent[level.id];

    level.steps.forEach(step => _.merge(step, steps[step.id]));

    _.merge(level, content);
  });

  // Checkout the code branches
  await git.checkout(codeBranch);

  // Load all logs
  const logs = await git.log();

  // Filter relevant logs
  const parts = new Set();

  for (const commit of logs.all) {

    const matches = commit.message.match(/^(?<stepId>(?<levelId>L\d+)S\d+)(?<stepType>[QA])?/);

    if (matches && !parts.has(matches[0])) {
      // Uses a set to make sure only the latest commit is proccessed 
      parts.add(matches[0]);

      // Add the content and git hash to the config
      if (matches.groups.stepId) {
        // If it's a step: add the content and the setup/solution hashes depending on the type
        const theStep = config.levels
          .find(level => level.id === matches.groups.levelId)
          .steps.find(step => step.id === matches.groups.stepId);

        if (matches.groups.stepType === 'Q') {
          theStep.setup.commits.push(commit.hash.substr(0, 7));
        }
        else if (matches.groups.stepType === 'A' && theStep.solution.commits) {
          theStep.solution.commits.push(commit.hash.substr(0, 7));
        }
      }
      else {
        // If it's level: add the commit hash (if the level has the commit key) and the content to the config
        const theLevel = config.levels.find(level => level.id === matches.groups.levelId);

        if (_.has(theLevel, 'config.commits')) {
          theLevel.setup.commits.push(commit.hash.substr(0, 7));
        }
      }
    }
  };

  // cleanup the submodules
  if (!isLocal) {
    const endCleanup = await cleanupFiles(workingDir);

    if (!endCleanup) {
      console.log('Error when deleting the git submodules');
    }
  }

  // const isValid = validate(config);

  // if (!isValid) {
  //   console.log(JSON.stringify(validate.errors, null, 2));
  //   return;
  // }

  return config;

}

export default build;