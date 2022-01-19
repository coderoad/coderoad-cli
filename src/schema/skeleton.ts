import meta from "./meta";

export default {
  title: "Skeleton Schema",
  description:
    "A CodeRoad tutorial config schema. This data is paired up with the markdown to create a tutorial",
  ...meta,
  type: "object",
  properties: {
    id: {
      type: "string",
      description: "A unique identifier for your tutorial. Currently no system to create this, so create your own for now",
      examples: ["fcc-learn-npm"]
    },
    
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
          },
          required: ["command", "args"],
        },
        setup: {
          type: "object",
          description:
            "Setup commits or commands used for setting up the test runner on tutorial launch",
          properties: {
            commits: {
              $ref: "#/definitions/commit_array",
            },
            commands: {
              $ref: "#/definitions/command_array",
            },
            vscodeCommands: {
              $ref: "#/definitions/vscode_command_array",
            },
          },
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
        continue: {
          type: "object",
          description: "Configuration options for continuing a tutorial",
          properties: {
            commands: {
              $ref: "#/definitions/command_array",
            },
            vscodeCommands: {
              $ref: "#/definitions/vscode_command_array",
            },
          },
          additionalProperties: false,
        },
        reset: {
          type: "object",
          description: "Configuration options for resetting a tutorial",
          properties: {
            commands: {
              $ref: "#/definitions/command_array",
            },
            vscodeCommands: {
              $ref: "#/definitions/vscode_command_array",
            },
          },
          additionalProperties: false,
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
        webhook: {
          type: "object",
          description:
            "An optional configuration for webhooks triggered by events such as init, step/level/tutorial complete",
          properties: {
            url: {
              type: "string",
              description: "URL for POST restful webhook request",
              examples: ["https://example.com/webhook"],
            },
            events: {
              type: "object",
              description: "An object of events to trigger on",
              properties: {
                init: {
                  type: "boolean",
                  description:
                    "An event triggered on tutorial startup. Sends tutorialId",
                },
                continue: {
                  type: "boolean",
                  description:
                    "An event triggered when continuing a tutorial. Sends tutorialId",
                },
                reset: {
                  type: "boolean",
                  description:
                    "An event triggered on reset of a tutorial. Sends tutorialId",
                },
                step_complete: {
                  type: "boolean",
                  description:
                    "An event triggered on completion of a step. Sends tutorialId, levelId & stepId",
                },
                level_complete: {
                  step_complete: {
                    type: "boolean",
                    description:
                      "An event triggered on completion of a level. Sends tutorialId & levelId",
                  },
                },
                tutorial_complete: {
                  step_complete: {
                    type: "boolean",
                    description:
                      "An event triggered on completion of a tutorial. Sends tutorialId",
                  },
                },
              },
              additionalProperties: false,
            },
          },
          required: ["url", "events"],
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
            examples: ["1", "11"],
          },
          setup: {
            $ref: "#/definitions/setup_action_without_commits",
            description:
              "An optional point for running actions, commands or opening files",
          },
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "A level id",
                  examples: ["1.1", "11.12"],
                },
                setup: {
                  allOf: [
                    {
                      $ref: "#/definitions/setup_action_without_commits",
                      description:
                        "A point for running actions, commands and/or opening files",
                    },
                  ],
                },
                solution: {
                  allOf: [
                    {
                      $ref: "#/definitions/setup_action_without_commits",
                      description:
                        "The solution can be loaded if the user gets stuck. It can run actions, commands and/or open files",
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
  required: ["id", "version", "config", "levels"],
};
