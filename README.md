# CodeRoad Buidler - CLI

Command line interface for [CodeRoad](https://marketplace.visualstudio.com/items?itemName=CodeRoad.coderoad).

## Pre-Requisites

- [NodeJS](https://nodejs.org/)
- [Git](https://git-scm.com/downloads)

## Install

Use CodeRoad CLI to set up and build a tutorial configuration file.

```shell
npm install -g coderoad-cli
```

## Create

```shell
$ coderoad create
```

Create templates files in the current folder for the content and setup files.


## Build

```
$ coderoad build [options]

options:

  -g, --git     Tutorial's remote git address. Either --git or --dir should be provided.
  -d, --dir     Tutorial's local directory. Either --git or --dir should be provided.
  -c, --code    Branch that contains the code.
  -s, --setup   Branch that contains the TUTORIAL.md and coderoad.yaml files.
  -o, --output  (Optional) Save the configuration in the output file. 
                Log into the console  if not set
  -h, --help    (Optional) Show the help message
``` 

Build the configuration file to be used by the extension to run the tutorial. The configuration file is created by matching the `level` and `step` ids between the `TUTORIAL.md` and `coderoad.yaml` files against git commit messages with the same ids. For example:


**TUTORIAL.md**
```markdown
...
## L10 This is a level with id = 10

This level has two steps...


### L10S1 First step

The first step with id L10S1. The Step id should start with the level id.

### L10S2 The second step

The second step...
```

**coderoad.yaml**
```yaml
...
levels:
  - id: L10
    config: {}
    steps:
      - id: L10S1
        setup:
          files:
            - package.json
          commits: []
          watchers:
            - package.json
            - node_modules/express
          commands:
            - npm install
        solution:
          files:
            - package.json
          commits: []
          commands:
            - npm install
      - id: L10S2
        setup:
          files:
            - src/server.js
          commits: []
          commands:
            - npm install
        solution:
          files:
            - src/server.js
          commits: []
```

... and the commit messages

```
commit 8e0e3a42ae565050181fdb68298114df21467a74 (HEAD -> v2, origin/v2)
Author: creator <author@email.com>
Date:   Sun May 3 16:16:01 2020 -0700

    L10S1Q setup step 1 for level 2

commit 9499611fc9b311040dcabaf2d98439fc0c356cc9
Author: creator <author@email.com>
Date:   Sun May 3 16:13:37 2020 -0700

    L10S2A checkout solution for Level 1, step 2

commit c5c62041282579b495d3589b2eb1fdda2bcd7155
Author: creator <author@email.com>
Date:   Sun May 3 16:11:42 2020 -0700

    L10S2Q setup level 1, step 2
```

Note that the step `L10S2` has two commits, one with the suffix `Q` and another one with `A`. The suffixes mean `Question` and `Answer`, respectively.

Steps defined as questions are **required** as they are meant to set the task to be executed by the student. The answer is optional and should be used when a commit must be loaded to verify the student's solution. If there is no need to load commits for `A` steps, the `commits` key should be removed from the `coderoad.yaml` file for that step.

**IMPORTANT**

Only the most recent commit is evaluated for each level/step id.