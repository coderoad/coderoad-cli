export default {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "http://coderoad.io/tutorial_version.schema.json",
  title: "Tutorial Version",
  description:
    "A CodeRoad tutorial version. This JSON data is converted into a tutorial with the CodeRoad editor extension",
  definitions: {
    semantic_version: {
      type: "string",
      description:
        'A semantic version, such as "1.0.0". Learn more at https://semver.org/',
      pattern: "^(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)$",
      minLength: 5,
      maxLength: 14,
      examples: ["0.1.0", "1.0.0"],
    },
    sha1_hash: {
      type: "string",
      description: "A SHA1 hash created by Git",
      pattern: "^[0-9a-f]{5,40}$",
      minLength: 5,
      maxLength: 40,
    },
    title: {
      type: "string",
      minLength: 1,
      maxLength: 40,
    },
    file_path: {
      type: "string",
      description: "A path to a file",
      pattern: "(\\\\?([^\\/]*[\\/])*)([^\\/]+)$",
      minLength: 4,
      examples: ["src/file.js"],
    },
    file_array: {
      type: "array",
      description:
        "An array of files which will be opened by the editor when entering the level or step",
      items: {
        $ref: "#/definitions/file_path",
        uniqueItems: true,
      },
    },
    command_array: {
      type: "array",
      description:
        "An array of command line commands that will be called when the user enters the level or step. Currently commands are limited for security purposes",
      items: {
        type: "string",
        enum: ["npm install"],
      },
    },
    commit_array: {
      type: "array",
      description:
        "An array of git commits which will be loaded when the level/step or solution is loaded",
      items: {
        $ref: "#/definitions/sha1_hash",
        uniqueItems: true,
      },
      minItems: 1,
    },
    setup_action: {
      type: "object",
      description:
        "A collection of files/commits/commands that run when a level/step or solution is loaded",
      properties: {
        files: {
          $ref: "#/definitions/file_array",
        },
        commits: {
          $ref: "#/definitions/commit_array",
        },
        commands: {
          $ref: "#/definitions/command_array",
        },
        watchers: {
          type: "array",
          items: {
            $ref: "#/definitions/file_path",
            uniqueItems: true,
          },
          description:
            "An array file paths that, when updated, will trigger the test runner to run",
        },
        filter: {
          type: "string",
          description:
            "A regex pattern that will be passed to the test runner to limit the number of tests running",
          examples: ["^TestSuiteName"],
        },
        subtasks: {
          type: "boolean",
          description:
            'A feature that shows subtasks: all active test names and the status of the tests (pass/fail). Use together with "filter"',
          examples: [true],
        },
      },
      additionalProperties: false,
    },
  },
};
