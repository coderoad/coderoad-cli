import meta from "./meta";

export default {
  title: "Skeleton Schema",
  description:
    "A CodeRoad tutorial config schema. This data is paired up with the markdown to create a tutorial",
  ...meta,
  type: "object",
  properties: {
    version: {
      $ref: "#/definitions/semantic_version",
      description: "The tutorial version. Must be unique for the tutorial.",
      examples: ["0.1.0", "1.0.0"],
    },

    // config
    config: {
      type: "object",
      properties: {
        testRunner: {
          type: "object",
          description: "The test runner configuration",
          properties: {
            command: {
              type: "string",
              description: "Command line to start the test runner",
              examples: ["./node_modules/.bin/mocha"],
            },
            args: {
              type: "object",
              description:
                "A configuration of command line args for your test runner",
              properties: {
                filter: {
                  type: "string",
                  description:
                    "the command line arg for filtering tests with a regex pattern",
                  examples: ["--grep"],
                },
                tap: {
                  type: "string",
                  description:
                    "The command line arg for configuring a TAP reporter. See https://github.com/sindresorhus/awesome-tap for examples.",
                  examples: ["--reporter=mocha-tap-reporter"],
                },
              },
              additionalProperties: false,
              required: ["tap"],
            },
            directory: {
              type: "string",
              description: "An optional folder for the test runner",
              examples: ["coderoad"],
            },
            setup: {
              $ref: "#/definitions/setup_action",
              description:
                "Setup commits or commands used for setting up the test runner on tutorial launch",
            },
          },
          required: ["command", "args"],
        },
        repo: {
          type: "object",
          description: "The repo holding the git commits for the tutorial",
          properties: {
            uri: {
              type: "string",
              description: "The uri source of the tutorial",
              format: "uri",
              examples: ["https://github.com/name/tutorial-name.git"],
            },
            branch: {
              description:
                "The branch of the repo where the tutorial config file exists",
              type: "string",
              examples: ["master"],
            },
          },
          additionalProperties: false,
          required: ["uri", "branch"],
        },

        dependencies: {
          type: "array",
          description: "A list of tutorial dependencies",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description:
                  "The command line process name of the dependency. It will be checked by running `name --version`",
                examples: ["node", "python"],
              },
              version: {
                type: "string",
                description:
                  "The version requirement. See https://github.com/npm/node-semver for options",
                examples: [">=10"],
              },
            },
            required: ["name", "version"],
          },
        },
        appVersions: {
          type: "object",
          description:
            "A list of compatable coderoad versions. Currently only a VSCode extension.",
          properties: {
            vscode: {
              type: "string",
              description:
                "The version range for coderoad-vscode that this tutorial is compatable with",
              examples: [">=0.7.0"],
            },
          },
        },
      },
      additionalProperties: false,
      required: ["testRunner", "repo"],
    },

    // levels
    levels: {
      type: "array",
      description:
        'Levels are the stages a user goes through in the tutorial. A level may contain a group of tasks called "steps" that must be completed to proceed',
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "A level id",
            examples: ["L1", "L11"],
          },
          setup: {
            $ref: "#/definitions/setup_action",
            description:
              "An optional point for loading commits, running commands or opening files",
          },
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "A level id",
                  examples: ["L1S1", "L11S12"],
                },
                setup: {
                  allOf: [
                    {
                      $ref: "#/definitions/setup_action",
                      description:
                        "A point for loading commits. It can also run commands and/or open files",
                    },
                  ],
                },
                solution: {
                  allOf: [
                    {
                      $ref: "#/definitions/setup_action",
                      description:
                        "The solution commits that can be loaded if the user gets stuck. It can also run commands and/or open files",
                    },
                    {
                      required: [],
                    },
                  ],
                },
              },
              required: ["id"],
            },
          },
        },
        required: ["id"],
      },
      minItems: 1,
    },
  },
  additionalProperties: false,
  required: ["version", "config", "levels"],
};
