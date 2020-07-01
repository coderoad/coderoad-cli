import * as T from "../typings/tutorial";
import tutorialSchema from "../src/schema/tutorial";
import { validateSchema } from "../src/utils/validateSchema";

const validJson: Partial<T.Tutorial> = {
  version: "0.1.0",
  summary: { title: "Title", description: "Description" },
  config: {
    testRunner: {
      command: "aCommand",
      args: {
        filter: "filter",
        tap: "tap",
      },
      directory: "coderoad",
      setup: {
        commits: ["abcdef1"],
        commands: ["npm install"],
      },
    },
    repo: {
      uri: "https://github.com/some-repo.git",
      branch: "someBranch",
    },
    dependencies: [{ name: "name", version: ">=1" }],
    appVersions: {
      vscode: ">=0.7.0",
    },
  },
  levels: [
    {
      id: "1",
      title: "Level 1",
      summary: "The first level",
      content: "The first level",
      steps: [
        {
          id: "1.1",
          content: "The first step",
          setup: { commits: [] },
        },
      ],
    },
  ],
};

const validateTutorial = (json: any) => validateSchema(tutorialSchema, json);

describe("validate tutorial", () => {
  it("should reject an empty tutorial", () => {
    const json = { version: "here" };

    const valid = validateTutorial(json);
    expect(valid).toBe(false);
  });
  it("should return true for a valid tutorial", () => {
    const valid = validateTutorial({ ...validJson });
    expect(valid).toBe(true);
  });
  it("should return true for a tutorial with no level content", () => {
    const json = {
      ...validJson,
      levels: [
        {
          id: "1",
          title: "Level 1",
          summary: "",
          content: "",
          steps: [],
        },
      ],
    };

    const valid = validateTutorial(json);
    expect(valid).toBe(true);
  });
});
