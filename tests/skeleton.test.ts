import { validateSchema } from '../src/utils/validateSchema'
import skeletonSchema from '../src/schema/skeleton'

const validateSkeleton = (json: any) => validateSchema(skeletonSchema, json)

const validJson = {
  version: '0.1.0',
  config: {
    testRunner: {
      directory: 'coderoad',

      args: {
        filter: '--grep',
        tap: '--reporter=mocha-tap-reporter'
      },
      command: './node_modules/.bin/mocha'
    },
    setup: {
      commands: []
    },
    repo: {
      uri: 'http://github.com/somePath/toRepo.git',
      branch: 'codeBranch'
    },
    dependencies: [],
    appVersions: {
      vscode: '>=0.7.0'
    },
    webhook: {
      url: 'https://example.com/webhook',
      events: {
        init: true,
        reset: false,
        step_complete: false,
        level_complete: false,
        tutorial_complete: true,
      }
    },
  },
  levels: [
    {
      steps: [
        {
          id: '1.1',
          setup: {
            files: ['package.json']
          },
          solution: {
            files: ['package.json']
          }
        },
        {
          id: '1.2',
          setup: {
            commands: ['npm install']
          },
          solution: {
            commands: ['npm install']
          }
        },
        {
          id: '1.3',
          setup: {
            files: ['package.json'],
            watchers: ['package.json', 'node_modules/some-package']
          },
          solution: {
            files: ['package.json']
          }
        },
        {
          id: '1.4',
          setup: {
            commands: [],
            filter: '^Example 2',
            subtasks: true
          }
        }
      ],
      id: '1'
    }
  ]
}

describe('validate skeleton', () => {
  it('should fail an empty skeleton file', () => {
    const json = {}

    const valid = validateSkeleton(json)
    expect(valid).toBe(false)
  })
  it('should parse a valid skeleton file', () => {
    const json = { ...validJson }

    const valid = validateSkeleton(json)
    expect(valid).toBe(true)
  })
  it('should fail if version is invalid', () => {
    const json = { ...validJson, version: 'NOT A VERSION' }

    const valid = validateSkeleton(json)
    expect(valid).toBe(false)
  })
  it('should fail if version is missing', () => {
    const json = { ...validJson, version: undefined }

    const valid = validateSkeleton(json)
    expect(valid).toBe(false)
  })
  it('should fail if config is missing', () => {
    const json = { ...validJson, config: undefined }

    const valid = validateSkeleton(json)
    expect(valid).toBe(false)
  })
  it('should fail if config testRunner is missing', () => {
    const json = {
      ...validJson,
      config: { ...validJson.config, testRunner: undefined }
    }

    const valid = validateSkeleton(json)
    expect(valid).toBe(false)
  })
  it('should fail if config testRunner command is missing', () => {
    const json = {
      ...validJson,
      config: {
        ...validJson.config,
        testRunner: { ...validJson.config.testRunner, command: undefined }
      }
    }

    const valid = validateSkeleton(json)
    expect(valid).toBe(false)
  })
  it('should fail if config testRunner args tap is missing', () => {
    const json = {
      ...validJson,
      config: {
        ...validJson.config,
        testRunner: {
          ...validJson.config.testRunner,
          args: { ...validJson.config.testRunner.args, tap: undefined }
        }
      }
    }

    const valid = validateSkeleton(json)
    expect(valid).toBe(false)
  })
  it('should fail if repo is missing', () => {
    const json = {
      ...validJson,
      config: {
        ...validJson.config,
        repo: undefined
      }
    }

    const valid = validateSkeleton(json)
    expect(valid).toBe(false)
  })
  it('should fail if repo uri is missing', () => {
    const json = {
      ...validJson,
      config: {
        ...validJson.config,
        repo: { ...validJson.config.repo, uri: undefined }
      }
    }

    const valid = validateSkeleton(json)
    expect(valid).toBe(false)
  })
  it('should fail if repo uri is invalid', () => {
    const json = {
      ...validJson,
      config: {
        ...validJson.config,
        repo: { ...validJson.config.repo, uri: 'NOT A VALID URI' }
      }
    }

    const valid = validateSkeleton(json)
    expect(valid).toBe(false)
  })
  it('should fail if repo branch is missing', () => {
    const json = {
      ...validJson,
      config: {
        ...validJson.config,
        repo: { ...validJson.config.repo, branch: undefined }
      }
    }

    const valid = validateSkeleton(json)
    expect(valid).toBe(false)
  })
  it('should fail if webhook url is missing', () => {
    const json = {
      ...validJson,
      config: {
        ...validJson.config,
        webhook: {
          events: {}
        }
      }
    }

    const valid = validateSkeleton(json)
    expect(valid).toBe(false)
  })
  it('should fail if webhook events include non-listed events', () => {
    const json = {
      ...validJson,
      config: {
        ...validJson.config,
        webhook: {
          ...validJson.config.webhook,
          events: {
            ...validJson.config.webhook.events,
            not_an_event: true,
          }
        }
      }
    }

    const valid = validateSkeleton(json)
    expect(valid).toBe(false)
  })
  it('should fail if level is missing id', () => {
    const level1 = { ...validJson.levels[0], id: undefined }
    const json = {
      ...validJson,
      levels: [level1]
    }

    const valid = validateSkeleton(json)
    expect(valid).toBe(false)
  })
  it('should fail if level setup is invalid', () => {
    const level1 = { ...validJson.levels[0], setup: { invalidThing: [] } }
    const json = {
      ...validJson,
      levels: [level1]
    }

    const valid = validateSkeleton(json)
    expect(valid).toBe(false)
  })
  it('should fail if step is missing id', () => {
    const step1 = { ...validJson.levels[0].steps[0], id: undefined }
    const level1 = { ...validJson.levels[0], steps: [step1] }
    const json = {
      ...validJson,
      levels: [level1]
    }

    const valid = validateSkeleton(json)
    expect(valid).toBe(false)
  })
  it('should not fail if step setup is missing', () => {
    const step1 = { ...validJson.levels[0].steps[0], setup: undefined }
    const level1 = { ...validJson.levels[0], steps: [step1] }
    const json = {
      ...validJson,
      levels: [level1]
    }

    const valid = validateSkeleton(json)
    expect(valid).toBe(true)
  })
  it('should fail if step setup is invalid', () => {
    const step1 = {
      ...validJson.levels[0].steps[0],
      setup: { invalidThing: [] }
    }
    const level1 = { ...validJson.levels[0], steps: [step1] }
    const json = {
      ...validJson,
      levels: [level1]
    }

    const valid = validateSkeleton(json)
    expect(valid).toBe(false)
  })
  it('should not fail if step solution is missing', () => {
    const step1 = { ...validJson.levels[0].steps[0], solution: undefined }
    const level1 = { ...validJson.levels[0], steps: [step1] }
    const json = {
      ...validJson,
      levels: [level1]
    }

    const valid = validateSkeleton(json)
    expect(valid).toBe(true)
  })
  it('should fail if step solution is invalid', () => {
    const step1 = {
      ...validJson.levels[0].steps[0],
      solution: { invalidThing: [] }
    }
    const level1 = { ...validJson.levels[0], steps: [step1] }
    const json = {
      ...validJson,
      levels: [level1]
    }

    const valid = validateSkeleton(json)
    expect(valid).toBe(false)
  })
})
