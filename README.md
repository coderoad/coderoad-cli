# CodeRoad Buidler - CLI

Command line interface for [CodeRoad](https://marketplace.visualstudio.com/items?itemName=CodeRoad.coderoad).

## Pre-Requisites

- [NodeJS](https://nodejs.org/)
- [Git](https://git-scm.com/downloads)

## Install

Use CodeRoad CLI to set up and build a tutorial configuration file.

```shell
npm install -g @coderoad/cli
```

## Create

Create templates files for building a new tutorial.

```shell
coderoad create
```

Templates for specific coding languages to come.

## Build

Build the configuration file to be used by the extension to run the tutorial.

```shell
coderoad build
```

Defaults assume:

- a `TUTORIAL.md` markdown file (change with `--markdown OTHER.md`)
- a `coderoad.yaml` file (change with `--yaml other.yaml`)
- an output file of `tutorial.json` (change with `--output other.json`)

The configuration file is created by matching the `level` and `step` ids between the `TUTORIAL.md` and `coderoad.yaml` files against git commit messages with the same ids. For example:

**TUTORIAL.md**

```markdown
# Tutorial Title

Tutorial description.

## L1 This is a level with id = 1

This level has two steps...

### L1S1 First step

The first step with id L1S1. The Step id should start with the level id.

### L1S2 The second step

The second step...
```

**coderoad.yaml**

```yaml
---
levels:
  - id: L1
    config: {}
    steps:
      - id: L1S1
        setup:
          files:
            - package.json
          commands:
            - npm install
        solution:
          files:
            - package.json
          commands:
            - npm install
      - id: L1S2
        setup:
          files:
            - src/server.js
          commands:
            - npm install
        solution:
          files:
            - src/server.js
```

... and the commit messages

```text
commit 8e0e3a42ae565050181fdb68298114df21467a74 (HEAD -> v2, origin/v2)
Author: creator <author@email.com>
Date:   Sun May 3 16:16:01 2020 -0700

    L1S1Q setup step 1 for level 1

commit 9499611fc9b311040dcabaf2d98439fc0c356cc9
Author: creator <author@email.com>
Date:   Sun May 3 16:13:37 2020 -0700

    L1S2A checkout solution for level 1, step 2

commit c5c62041282579b495d3589b2eb1fdda2bcd7155
Author: creator <author@email.com>
Date:   Sun May 3 16:11:42 2020 -0700

    L1S2Q setup level 1, step 2
```

Note that the step `L1S2` has two commits, one with the suffix `Q` and another one with `A`. The suffixes mean `Question` and `Answer`, respectively, and refer to the unit tests and the commit that makes them pass.

Steps defined as questions are **required** as they are meant to set the task to be executed by the student. The answer is optional and should be used when a commit must be loaded to verify the student's solution.

If there are multiple commits for a level or step, they are captured in order.
