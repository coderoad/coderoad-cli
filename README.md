# CodeRoad Buidler - CLI

Command line interface for [CodeRoad](https://marketplace.visualstudio.com/items?itemName=CodeRoad.coderoad).

## Pre-Requisites

- [NodeJS](https://nodejs.org/)
- [Git](https://git-scm.com/downloads)

## Install

Use CodeRoad CLI to setup and build a tutorial configuration file.

```shell
npm install -g coderoad-cli
```

## Craete

```shell
$ coderoad create
```

Create templates files in the current folder for the content and setup files.


## Build

```
$ coderoad build [options]

options:

  -g, --git     Tutorial's remote git address. Either --git ot --dir should be provided.
  -d, --dir     Tutorial's local directory. Either --git ot --dir should be provided.
  -c, --code    Branch that contains the code.
  -s, --setup   Branch that contains the TUTORIAL.md and coderoad.yaml files.
  -o, --output  (Optional) Save the configuration in the output file. 
                Log into the console  if not set
  -h, --help    (Optional) Show the help message
``` 

Build the configuration file to be used by the extension to run the tutorial. The configuration file is created by matching the `level` and `step` ids between the `TUTORIAL.md` and `coderoad.yaml` files against git commit messages with the same ids.
