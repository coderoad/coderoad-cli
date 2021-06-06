import meta from './meta'

export default {
  title: 'Tutorial Schema',
  description:
    'A CodeRoad tutorial schema data. This JSON data is converted into a tutorial with the CodeRoad editor extension',
  ...meta,
  type: 'object',
  properties: {
    version: {
      $ref: '#/definitions/semantic_version',
      description: 'The tutorial version. Must be unique for the tutorial.',
      examples: ['0.1.0', '1.0.0']
    },

    // summary
    summary: {
      type: 'object',
      properties: {
        title: {
          $ref: '#/definitions/title',
          description: 'The title of tutorial'
        },
        description: {
          type: 'string',
          description: 'A summary of the the tutorial',
          minLength: 10,
          maxLength: 400
        }
      },
      additionalProperties: false,
      required: ['title', 'description']
    },

    // config
    config: {
      type: 'object',
      properties: {
        testRunner: {
          type: 'object',
          description: 'The test runner configuration',
          properties: {
            command: {
              type: 'string',
              description: 'Command line to start the test runner',
              examples: ['./node_modules/.bin/mocha']
            },
            args: {
              type: 'object',
              description:
                'A configuration of command line args for your test runner',
              properties: {
                filter: {
                  type: 'string',
                  description:
                    'the command line arg for filtering tests with a regex pattern',
                  examples: ['--grep']
                },
                tap: {
                  type: 'string',
                  description:
                    'The command line arg for configuring a TAP reporter. See https://github.com/sindresorhus/awesome-tap for examples.',
                  examples: ['--reporter=mocha-tap-reporter']
                }
              },
              additionalProperties: false,
              required: ['tap']
            },
            directory: {
              type: 'string',
              description: 'An optional folder for the test runner',
              examples: ['coderoad']
            }
          },
          required: ['command', 'args']
        },
        setup: {
          type: 'object',
          description:
            'Setup commits or commands used for setting up the test runner on tutorial launch',
          properties: {
            commits: {
              $ref: '#/definitions/commit_array'
            },
            commands: {
              $ref: '#/definitions/command_array'
            },
            vscodeCommands: {
              $ref: '#/definitions/vscode_command_array'
            }
          }
        },
        repo: {
          type: 'object',
          description: 'The repo holding the git commits for the tutorial',
          properties: {
            uri: {
              type: 'string',
              description: 'The uri source of the tutorial',
              format: 'uri',
              examples: ['https://github.com/name/tutorial-name.git']
            },
            branch: {
              description:
                'The branch of the repo where the tutorial config file exists',
              type: 'string',
              examples: ['master']
            }
          },
          additionalProperties: false,
          required: ['uri', 'branch']
        },
        reset: {
          type: 'object',
          description: 'Configuration options for resetting a tutorial',
          properties: {
            commands: {
              $ref: '#/definitions/command_array'
            },
            vscodeCommands: {
              $ref: '#/definitions/vscode_command_array'
            }
          },
          additionalProperties: false
        },
        dependencies: {
          type: 'array',
          description: 'A list of tutorial dependencies',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description:
                  'The command line process name of the dependency. It will be checked by running `name --version`',
                examples: ['node', 'python']
              },
              version: {
                type: 'string',
                description:
                  'The version requirement. See https://github.com/npm/node-semver for options',
                examples: ['>=10']
              }
            },
            required: ['name', 'version']
          }
        },
        appVersions: {
          type: 'object',
          description:
            'A list of compatable coderoad versions. Currently only a VSCode extension.',
          properties: {
            vscode: {
              type: 'string',
              description:
                'The version range for coderoad-vscode that this tutorial is compatable with',
              examples: ['>=0.7.0']
            }
          }
        }
      },
      webhooks: {
        type: 'object',
        description: 'Optional configuration for setting up webhook events',
        properties: {
          endpoint: {
            type: 'string',
            description:
              'Webhook endpoint to hit on events. Uses HTTP POST requests',
            examples: ['https://api.com/v1/coderoad']
          },
          headers: {
            type: 'object',
            description: 'Headers for the webhook request in JSON format',
            examples: ['{ x-token: "$CODEROAD_WEBHOOK_TOKEN" }'],
            additionalProperties: true
          },
          events: {
            type: 'object',
            description: 'A configuration of possible events toggled on or off',
            properties: {
              init: {
                type: 'boolean',
                description: 'Trigger webhook when user starts a tutorial'
              },
              reset: {
                type: 'boolean',
                description:
                  'Trigger webhook when user resets a CodeRoad tutorial'
              },
              step_complete: {
                type: 'boolean',
                description: 'Trigger webhook when user completes a step'
              },
              level_complete: {
                type: 'boolean',
                description: 'Trigger webhook when user completes a level'
              },
              tutorial_complete: {
                type: 'boolean',
                description: 'Trigger webhook when user completes a tutorial'
              }
            },
            additionalProperties: false
          }
        }
      },
      additionalProperties: false,
      required: ['testRunner', 'repo']
    },

    // levels
    levels: {
      type: 'array',
      description:
        'Levels are the stages a user goes through in the tutorial. A level may contain a group of tasks called "steps" that must be completed to proceed',
      items: {
        type: 'object',
        properties: {
          title: {
            $ref: '#/definitions/title',
            description: 'A title for the level'
          },
          summary: {
            type: 'string',
            description: 'A high-level summary of the level',
            maxLength: 250
          },
          content: {
            type: 'string',
            description: 'Content for a tutorial written as Markdown'
          },
          setup: {
            $ref: '#/definitions/setup_action',
            description:
              'An optional point for loading commits, running commands or opening files'
          },
          steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description:
                    'The text displayed explaining information about the current task, written as markdown'
                },
                setup: {
                  allOf: [
                    {
                      $ref: '#/definitions/setup_action',
                      description:
                        'A point for loading commits. It can also run commands and/or open files'
                    },
                    {
                      required: ['commits']
                    }
                  ]
                },
                solution: {
                  allOf: [
                    {
                      $ref: '#/definitions/setup_action',
                      description:
                        'The solution commits that can be loaded if the user gets stuck. It can also run commands and/or open files'
                    },
                    {
                      required: []
                    }
                  ]
                }
              },
              hints: {
                type: 'array',
                description:
                  'An optional array of hints to provide helpful feedback to users',
                items: {
                  type: 'string',
                  description: 'A hint to provide to the user',
                  examples: ['Have you tried doing X?']
                }
              },
              required: ['content', 'setup']
            }
          }
        },
        required: ['title', 'summary', 'content']
      }
    }
  },
  additionalProperties: false,
  required: ['version', 'summary', 'config', 'levels']
}
