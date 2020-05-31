// import not working
// const arg = require("arg");
// const simpleGit = require("simple-git/promise");

// type Q = inquirer.Question<any> & { choices?: string[] };

// type ParsedArgs = {
//   command: string;
//   git?: string;
//   dir?: string;
//   codeBranch: string;
//   setupBranch: string;
//   output?: string;
//   help: string;
//   version?: string;
// };

// type Options = {
//   repo: string;
//   setupBranch: string;
//   codeBranch: string;
//   output: string;
//   isLocal: boolean;
// };

// const localGit = "Local directory";
// const remoteGit = "Git remote address";

// export async function promptForMissingOptions(
//   options: ParsedArgs
// ): Promise<Options> {
//   const questions: Q[] = [];

//   // if no git remote addres is provided, assume current folder
//   if (!options.git && !options.dir) {
//     // check if the current dir is a valid repo
//     const git = simpleGit(process.cwd());
//     const isRepo = await git.checkIsRepo();

//     if (!isRepo) {
//       questions.push({
//         type: "list",
//         name: "source",
//         message: `The current directory (${process.cwd()}) is not a valid git repo. Would you like to provide a...`,
//         choices: [localGit, remoteGit],
//         default: localGit,
//       });

//       questions.push({
//         type: "input",
//         name: "localGit",
//         message:
//           "Please, provide a local directory of the valid git repository: ",
//         when: (input: any) => input.source === localGit,
//       });

//       questions.push({
//         type: "input",
//         name: "remoteGit",
//         message: "Please, provide the address of a remote git repository: ",
//         when: (input: any) => input.source === remoteGit,
//       });
//     }
//   }
//   // if both local dir and remote repos are provided
//   else if (options.git && options.dir) {
//     questions.push({
//       type: "list",
//       name: "source",
//       message:
//         "A local git directory and a remote address were both provided. Please, choose either one or those to parse: ",
//       choices: [localGit, remoteGit],
//       default: localGit,
//     });
//   }

//   // if the branch containing the code is not provided
//   if (!options.codeBranch) {
//     questions.push({
//       type: "input",
//       name: "codeBranch",
//       message: "Please, provide the branch with the code commits: ",
//     });
//   }

//   // if the branch containing the setup files is not provided
//   if (!options.setupBranch) {
//     questions.push({
//       type: "input",
//       name: "setupBranch",
//       message:
//         "Please, provide the branch with the setup files (coderoad.yaml and tutorial.md): ",
//     });
//   }

//   const answers: any = await inquirer.prompt(questions);

//   let repo: string;
//   let isLocal: boolean;

//   if (answers.source) {
//     repo = (answers.source === localGit ? options.dir : options.git) || "";
//     isLocal = answers.source === localGit;
//   } else {
//     repo = options.dir || options.git || process.cwd();
//     isLocal = options.git ? false : true;
//   }

//   return {
//     repo,
//     setupBranch: options.setupBranch || answers.setupBranch,
//     codeBranch: options.codeBranch || answers.codeBranch,
//     output: options.output || ".",
//     isLocal,
//   };
// }
