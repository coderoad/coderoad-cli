import * as T from "../typings/tutorial";
import { validateSchema } from "../src/utils/validateSchema";

describe("validate", () => {
  it("should reject an empty tutorial", () => {
    const json = { version: "here" };

    const valid = validateSchema(json);
    expect(valid).toBe(false);
  });
  it("should return true for a valid tutorial", () => {
    const json: Partial<T.Tutorial> = {
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
          id: "L1",
          title: "Level 1",
          summary: "The first level",
          content: "The first level",
          steps: [],
        },
      ],
    };

    const valid = validateSchema(json);
    expect(valid).toBe(true);
  });
});
