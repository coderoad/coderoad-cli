import { validateSkeleton } from "../src/utils/validateSkeleton";

const validJson = {
  version: "0.1.0",
  config: {
    testRunner: {
      directory: "coderoad",
      setup: {
        commands: [],
      },
      args: {
        filter: "--grep",
        tap: "--reporter=mocha-tap-reporter",
      },
      command: "./node_modules/.bin/mocha",
    },
    repo: {
      uri: "http://github.com/somePath/toRepo.git",
      branch: "codeBranch",
    },
    dependencies: [],
    appVersions: {
      vscode: ">=0.7.0",
    },
  },
  levels: [
    {
      steps: [
        {
          id: "L1S1",
          setup: {
            files: ["package.json"],
          },
          solution: {
            files: ["package.json"],
          },
        },
        {
          id: "L1S2",
          setup: {
            commands: ["npm install"],
          },
          solution: {
            commands: ["npm install"],
          },
        },
        {
          id: "L1S3",
          setup: {
            files: ["package.json"],
            watchers: ["package.json", "node_modules/some-package"],
          },
          solution: {
            files: ["package.json"],
          },
        },
        {
          id: "L1S4",
          setup: {
            commands: [],
            filter: "^Example 2",
            subtasks: true,
          },
        },
      ],
      id: "L1",
    },
  ],
};

describe("validate skeleton", () => {
  it("should fail an empty skeleton file", () => {
    const json = {};

    const valid = validateSkeleton(json);
    expect(valid).toBe(false);
  });
  it("should parse a valid skeleton file", () => {
    const json = { ...validJson };

    const valid = validateSkeleton(json);
    expect(valid).toBe(true);
  });
  it.todo("should fail if version is invalid");
  it.todo("should fail if version is missing");
  it.todo("should fail if config is missing");
  it.todo("should fail if config testRunner is missing");
  it.todo("should fail if config testRunner command is missing");
  it.todo("should fail if config testRunner args tap is missing");
  it.todo("should fail if repo is missing");
  it.todo("should fail if repo uri is missing");
  it.todo("should fail if repo uri is invalid");
  it.todo("should fail if repo branch is missing");
  it.todo("should fial if level is missing id");
  it.todo("should fail if level setup is invalid");
  it.todo("should fail if step is missing id");
  it.todo("should fail if step setup is invalid");
  it.todo("should fail if solution setup is invalid");
});
