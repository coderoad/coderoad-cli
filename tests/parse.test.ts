import { parse } from "../src/utils/parse";

describe("parse", () => {
  describe("summary", () => {
    it("should parse summary", () => {
      const md = `# Insert Tutorial's Title here

Short description to be shown as a tutorial's subtitle.

`;

      const skeleton = { version: "0.1.0" };
      const result = parse({
        text: md,
        skeleton,
        commits: {},
      });
      const expected = {
        summary: {
          description:
            "Short description to be shown as a tutorial's subtitle.",
          title: "Insert Tutorial's Title here",
        },
      };
      expect(result.summary).toEqual(expected.summary);
    });
  });

  describe("levels", () => {
    it("should parse a level with no steps", () => {
      const md = `# Title
    
Description.

## 1. Put Level's title here

> Level's summary: a short description of the level's content in one line.

Some text
`;

      const skeleton = {
        levels: [{ id: "1" }],
      };

      const result = parse({
        text: md,
        skeleton,
        commits: {},
      });
      const expected = {
        levels: [
          {
            id: "1",
            title: "Put Level's title here",
            summary:
              "Level's summary: a short description of the level's content in one line.",
            content: "Some text",
            steps: [],
          },
        ],
      };
      expect(result.levels).toEqual(expected.levels);
    });

    it("should parse a level with a step", () => {
      const md = `# Title
    
Description.

## 1. Put Level's title here

> Level's summary: a short description of the level's content in one line.

Some text
`;

      const skeleton = {
        levels: [
          {
            id: "1",
            setup: { files: [], commits: [] },
            solution: { files: [], commits: [] },
            steps: [],
          },
        ],
      };
      const result = parse({
        text: md,
        skeleton,
        commits: {},
      });
      const expected = {
        levels: [
          {
            id: "1",
            title: "Put Level's title here",
            summary:
              "Level's summary: a short description of the level's content in one line.",
            content: "Some text",
            setup: { files: [], commits: [] },
            solution: { files: [], commits: [] },
            steps: [],
          },
        ],
      };
      expect(result.levels).toEqual(expected.levels);
    });

    it("should parse a level with no level description", () => {
      const md = `# Title
    
Description.

## 1. Put Level's title here

Some text that becomes the summary
`;

      const skeleton = { levels: [{ id: "1" }] };
      const result = parse({
        text: md,
        skeleton,
        commits: {},
      });
      const expected = {
        levels: [
          {
            id: "1",
            title: "Put Level's title here",
            summary: "Some text that becomes the summary",
            content: "Some text that becomes the summary",
            steps: [],
          },
        ],
      };
      expect(result.levels).toEqual(expected.levels);
    });

    it("should truncate a level description", () => {
      const md = `# Title
    
Description.

## 1. Put Level's title here

Some text that becomes the summary and goes beyond the maximum length of 80 so that it gets truncated at the end
`;

      const skeleton = { levels: [{ id: "1" }] };
      const result = parse({
        text: md,
        skeleton,
        commits: {},
      });
      const expected = {
        levels: [
          {
            id: "1",
            title: "Put Level's title here",
            summary: "Some text that becomes the summary",
            content: "Some text that becomes the summary",
          },
        ],
      };
      expect(result.levels[0].summary).toMatch(/\.\.\.$/);
    });

    it("should only truncate the first line of a level description", () => {
      const md = `# Title
    
Description.

## 1. Put Level's title here

Some text.

But not including this line.
`;

      const skeleton = { levels: [{ id: "1" }] };
      const result = parse({
        text: md,
        skeleton,
        commits: {},
      });
      const expected = {
        levels: [
          {
            id: "1",
            title: "Put Level's title here",
            summary: "Some text.",
            content: "Some text.\n\nBut not including this line.",
            steps: [],
          },
        ],
      };
      expect(result.levels[0]).toEqual(expected.levels[0]);
    });

    it("should truncate a level with an empty summary", () => {
      const md = `# Title

Description.

## 1. Put Level's title here

>

Some text.

But not including this line.
`;

      const skeleton = { levels: [{ id: "1" }] };
      const result = parse({
        text: md,
        skeleton,
        commits: {},
      });
      const expected = {
        levels: [
          {
            id: "1",
            title: "Put Level's title here",
            summary: "Some text.",
            content: "Some text.\n\nBut not including this line.",
            steps: [],
          },
        ],
      };
      expect(result.levels[0]).toEqual(expected.levels[0]);
    });

    it("should match line breaks with double line breaks for proper spacing", () => {
      const md = `# Title
    
Description.

Second description line

## 1. Titles

First line

Second line

Third line
`;

      const skeleton = { levels: [{ id: "1" }] };
      const result = parse({
        text: md,
        skeleton,
        commits: {},
      });
      const expected = {
        summary: {
          description: "Description.\n\nSecond description line",
        },
        levels: [
          {
            id: "1",
            summary: "Some text that becomes the summary",
            content: "First line\n\nSecond line\n\nThird line",
          },
        ],
      };
      expect(result.summary.description).toBe(expected.summary.description);
      expect(result.levels[0].content).toBe(expected.levels[0].content);
    });

    it("should load a single commit for a step", () => {
      const md = `# Title
    
Description.

## 1. Title

First line

### 1.1

The first step
`;
      const skeleton = {
        levels: [
          {
            id: "1",
            steps: [
              {
                id: "1.1",
              },
            ],
          },
        ],
      };
      const result = parse({
        text: md,
        skeleton,
        commits: {
          "1.1:T": ["abcdefg1"],
        },
      });
      const expected = {
        summary: {
          description: "Description.",
        },
        levels: [
          {
            id: "1",
            summary: "First line",
            content: "First line",
            steps: [
              {
                id: "1.1",
                content: "The first step",
                setup: {
                  commits: ["abcdefg1"],
                },
              },
            ],
          },
        ],
      };
      expect(result.levels[0].steps[0]).toEqual(expected.levels[0].steps[0]);
    });

    it("should load multiple commits for a step", () => {
      const md = `# Title
    
Description.

## 1. Title

First line

### 1.1 Step

The first step
`;
      const skeleton = {
        levels: [
          {
            id: "1",
            steps: [
              {
                id: "1.1",
              },
            ],
          },
        ],
      };
      const result = parse({
        text: md,
        skeleton,
        commits: {
          "1.1:T": ["abcdefg1", "123456789"],
        },
      });
      const expected = {
        summary: {
          description: "Description.",
        },
        levels: [
          {
            id: "1",
            summary: "First line",
            content: "First line",
            steps: [
              {
                id: "1.1",
                content: "The first step",
                setup: {
                  commits: ["abcdefg1", "123456789"],
                },
              },
            ],
          },
        ],
      };
      expect(result.levels[0].steps[0]).toEqual(expected.levels[0].steps[0]);
    });

    it("should load a single commit for a level", () => {
      const md = `# Title
    
Description.

## 1. Title

First line

### 1.1

The first step
`;
      const skeleton = {
        levels: [
          {
            id: "1",
          },
        ],
      };
      const result = parse({
        text: md,
        skeleton,
        commits: {
          "1": ["abcdefg1"],
        },
      });
      const expected = {
        summary: {
          description: "Description.",
        },
        levels: [
          {
            id: "1",
            summary: "First line",
            content: "First line",
            setup: {
              commits: ["abcdefg1"],
            },
          },
        ],
      };
      expect(result.levels[0].setup).toEqual(expected.levels[0].setup);
    });

    it("should load multi-line step content", () => {
      const md = `# Title
    
Description.

## 1. Title

First line

### 1.1

The first step

A codeblock:

\`\`\`js
var a = 1;
\`\`\`

Another line
`;
      const skeleton = {
        levels: [
          {
            id: "1",
            steps: [
              {
                id: "1.1",
              },
            ],
          },
        ],
      };
      const result = parse({
        text: md,
        skeleton,
        commits: {
          "1": ["abcdefg1"],
          "1.1:T": ["12345678"],
        },
      });
      const expected = {
        id: "1.1",
        setup: {
          commits: ["12345678"],
        },
        content:
          "The first step\n\nA codeblock:\n\n```js\nvar a = 1;\n```\n\nAnother line",
      };
      expect(result.levels[0].steps[0]).toEqual(expected);
    });

    it("should load the full config for a step", () => {
      const md = `# Title
    
Description.

## 1. Title

First line

### 1.1 Step

The first step
`;
      const skeleton = {
        levels: [
          {
            id: "1",
            steps: [
              {
                id: "1.1",
                setup: {
                  commands: ["npm install"],
                  files: ["someFile.js"],
                  watchers: ["someFile.js"],
                  filter: "someFilter",
                  subtasks: true,
                },
                solution: {
                  commands: ["npm install"],
                  files: ["someFile.js"],
                },
              },
            ],
          },
        ],
      };
      const result = parse({
        text: md,
        skeleton,
        commits: {
          "1.1:T": ["abcdefg1", "123456789"],
          "1.1:S": ["1gfedcba", "987654321"],
        },
      });
      const expected = {
        summary: {
          description: "Description.",
        },
        levels: [
          {
            id: "1",
            summary: "First line",
            content: "First line",
            steps: [
              {
                id: "1.1",
                content: "The first step",
                setup: {
                  commits: ["abcdefg1", "123456789"],
                  commands: ["npm install"],
                  files: ["someFile.js"],
                  watchers: ["someFile.js"],
                  filter: "someFilter",
                  subtasks: true,
                },
                solution: {
                  commits: ["1gfedcba", "987654321"],
                  commands: ["npm install"],
                  files: ["someFile.js"],
                },
              },
            ],
          },
        ],
      };
      expect(result.levels[0].steps[0]).toEqual(expected.levels[0].steps[0]);
    });

    it("should load the full config for multiple levels & steps", () => {
      const md = `# Title
    
Description.

## 1. Title 1

First level content.

### 1.1

The first step

### 1.2

The second step

## 2. Title 2

Second level content.

### 2.1

The third step
`;
      const skeleton = {
        levels: [
          {
            id: "1",
            steps: [
              {
                id: "1.1",
                setup: {
                  commands: ["npm install"],
                  files: ["someFile.js"],
                  watchers: ["someFile.js"],
                  filter: "someFilter",
                  subtasks: true,
                },
                solution: {
                  commands: ["npm install"],
                  files: ["someFile.js"],
                },
              },
              {
                id: "1.2",
                setup: {
                  commands: ["npm install"],
                  files: ["someFile.js"],
                  watchers: ["someFile.js"],
                  filter: "someFilter",
                  subtasks: true,
                },
                solution: {
                  commands: ["npm install"],
                  files: ["someFile.js"],
                },
              },
            ],
          },
          {
            id: "2",
            summary: "Second level content.",
            content: "First level content.",
            steps: [
              {
                id: "2.1",
                setup: {
                  commands: ["npm install"],
                  files: ["someFile.js"],
                  watchers: ["someFile.js"],
                  filter: "someFilter",
                  subtasks: true,
                },
                solution: {
                  commands: ["npm install"],
                  files: ["someFile.js"],
                },
              },
            ],
          },
        ],
      };
      const result = parse({
        text: md,
        skeleton,
        commits: {
          "1.1:T": ["abcdef1", "123456789"],
          "1.1:S": ["1fedcba", "987654321"],
          "1.2:T": ["2abcdef"],
          "1.2:S": ["3abcdef"],
          "2.1:T": ["4abcdef"],
          "2.1:S": ["5abcdef"],
        },
      });
      const expected = {
        summary: {
          description: "Description.",
        },
        levels: [
          {
            id: "1",
            title: "Title 1",
            summary: "First level content.",
            content: "First level content.",
            steps: [
              {
                id: "1.1",
                content: "The first step",
                setup: {
                  commits: ["abcdef1", "123456789"],
                  commands: ["npm install"],
                  files: ["someFile.js"],
                  watchers: ["someFile.js"],
                  filter: "someFilter",
                  subtasks: true,
                },
                solution: {
                  commits: ["1fedcba", "987654321"],
                  commands: ["npm install"],
                  files: ["someFile.js"],
                },
              },
              {
                id: "1.2",
                content: "The second step",
                setup: {
                  commits: ["2abcdef"],
                  commands: ["npm install"],
                  files: ["someFile.js"],
                  watchers: ["someFile.js"],
                  filter: "someFilter",
                  subtasks: true,
                },
                solution: {
                  commits: ["3abcdef"],
                  commands: ["npm install"],
                  files: ["someFile.js"],
                },
              },
            ],
          },
          {
            id: "2",
            title: "Title 2",
            summary: "Second level content.",
            content: "Second level content.",
            steps: [
              {
                id: "2.1",
                content: "The third step",
                setup: {
                  commits: ["4abcdef"],
                  commands: ["npm install"],
                  files: ["someFile.js"],
                  watchers: ["someFile.js"],
                  filter: "someFilter",
                  subtasks: true,
                },
                solution: {
                  commits: ["5abcdef"],
                  commands: ["npm install"],
                  files: ["someFile.js"],
                },
              },
            ],
          },
        ],
      };
      expect(result.levels).toEqual(expected.levels);
    });

    it("should handle steps with no solution", () => {
      const md = `# Title
    
Description.

## 1. Title 1

First level content.

### 1.1

The first step

`;
      const skeleton = {
        levels: [
          {
            id: "1",
            steps: [
              {
                id: "1.1",
              },
            ],
          },
        ],
      };
      const result = parse({
        text: md,
        skeleton,
        commits: {
          "1.1:T": ["abcdef1", "123456789"],
        },
      });
      const expected = {
        summary: {
          description: "Description.",
        },
        levels: [
          {
            id: "1",
            title: "Title 1",
            summary: "First level content.",
            content: "First level content.",
            steps: [
              {
                id: "1.1",
                content: "The first step",
                setup: {
                  commits: ["abcdef1", "123456789"],
                },
              },
            ],
          },
        ],
      };
      expect(result.levels).toEqual(expected.levels);
    });
  });

  describe("config", () => {
    it("should parse the tutorial config", () => {
      const md = `# Title
  
Description.
`;

      const skeleton = {
        config: {
          testRunner: {
            command: "./node_modules/.bin/mocha",
            args: {
              filter: "--grep",
              tap: "--reporter=mocha-tap-reporter",
            },
            directory: "coderoad",
            setup: {
              commands: [],
            },
          },
          appVersions: {
            vscode: ">=0.7.0",
          },
          repo: {
            uri: "https://path.to/repo",
            branch: "aBranch",
          },
          dependencies: [
            {
              name: "node",
              version: ">=10",
            },
          ],
        },
      };
      const result = parse({
        text: md,
        skeleton,
        commits: {},
      });
      const expected = {
        summary: {
          description: "Description.\n\nSecond description line",
        },
        config: {
          testRunner: {
            command: "./node_modules/.bin/mocha",
            args: {
              filter: "--grep",
              tap: "--reporter=mocha-tap-reporter",
            },
            directory: "coderoad",
            setup: {
              commands: [],
            },
          },
          repo: {
            uri: "https://path.to/repo",
            branch: "aBranch",
          },
          dependencies: [
            {
              name: "node",
              version: ">=10",
            },
          ],
          appVersions: {
            vscode: ">=0.7.0",
          },
        },
      };
      expect(result.config).toEqual(expected.config);
    });

    it("should parse the tutorial config with INIT commits", () => {
      const md = `# Title
  
Description.
`;

      const skeleton = {
        config: {
          testRunner: {
            command: "./node_modules/.bin/mocha",
            args: {
              filter: "--grep",
              tap: "--reporter=mocha-tap-reporter",
            },
            directory: "coderoad",
          },
          appVersions: {
            vscode: ">=0.7.0",
          },
          repo: {
            uri: "https://path.to/repo",
            branch: "aBranch",
          },
          dependencies: [
            {
              name: "node",
              version: ">=10",
            },
          ],
        },
      };
      const result = parse({
        text: md,
        skeleton,
        commits: {
          INIT: ["abcdef1", "123456789"],
        },
      });
      const expected = {
        summary: {
          description: "Description.\n\nSecond description line",
        },
        config: {
          testRunner: {
            command: "./node_modules/.bin/mocha",
            args: {
              filter: "--grep",
              tap: "--reporter=mocha-tap-reporter",
            },
            directory: "coderoad",
            setup: {
              commits: ["abcdef1", "123456789"],
            },
          },
          repo: {
            uri: "https://path.to/repo",
            branch: "aBranch",
          },
          dependencies: [
            {
              name: "node",
              version: ">=10",
            },
          ],
          appVersions: {
            vscode: ">=0.7.0",
          },
        },
      };
      expect(result.config).toEqual(expected.config);
    });
  });

  describe("hints", () => {
    it("should parse hints for a step with '*", () => {
      const md = `# Title
    
Description.

## 1. Title 1

First level content.

### 1.1

The first step

#### HINTS

* First Hint
* Second Hint

`;
      const skeleton = {
        levels: [
          {
            id: "1",
            steps: [
              {
                id: "1.1",
              },
            ],
          },
        ],
      };
      const result = parse({
        text: md,
        skeleton,
        commits: {
          "1.1:T": ["abcdef1", "123456789"],
        },
      });
      const expected = {
        summary: {
          description: "Description.",
        },
        levels: [
          {
            id: "1",
            title: "Title 1",
            summary: "First level content.",
            content: "First level content.",
            steps: [
              {
                id: "1.1",
                content: "The first step",
                setup: {
                  commits: ["abcdef1", "123456789"],
                },
                hints: ["First Hint", "Second Hint"],
              },
            ],
          },
        ],
      };
      expect(result.levels).toEqual(expected.levels);
    });

    it("should parse hints for a step with '-'", () => {
      const md = `# Title
    
Description.

## 1. Title 1

First level content.

### 1.1

The first step

#### HINTS

- First Hint
- Second Hint

`;
      const skeleton = {
        levels: [
          {
            id: "1",
            steps: [
              {
                id: "1.1",
              },
            ],
          },
        ],
      };
      const result = parse({
        text: md,
        skeleton,
        commits: {
          "1.1:T": ["abcdef1", "123456789"],
        },
      });
      const expected = {
        summary: {
          description: "Description.",
        },
        levels: [
          {
            id: "1",
            title: "Title 1",
            summary: "First level content.",
            content: "First level content.",
            steps: [
              {
                id: "1.1",
                content: "The first step",
                setup: {
                  commits: ["abcdef1", "123456789"],
                },
                hints: ["First Hint", "Second Hint"],
              },
            ],
          },
        ],
      };
      expect(result.levels).toEqual(expected.levels);
    });

    it("should parse hints for a step", () => {
      const md = `# Title
    
Description.

## 1. Title 1

First level content.

### 1.1

The first step

#### HINTS

* First Hint with \`markdown\`. See **bold**
* Second Hint has a codeblock

\`\`\`js
var a = 1;
\`\`\`

And spans multiple lines.
`;
      const skeleton = {
        levels: [
          {
            id: "1",
            steps: [
              {
                id: "1.1",
              },
            ],
          },
        ],
      };
      const result = parse({
        text: md,
        skeleton,
        commits: {
          "1.1:T": ["abcdef1", "123456789"],
        },
      });
      const expected = {
        summary: {
          description: "Description.",
        },
        levels: [
          {
            id: "1",
            title: "Title 1",
            summary: "First level content.",
            content: "First level content.",
            steps: [
              {
                id: "1.1",
                content: "The first step",
                setup: {
                  commits: ["abcdef1", "123456789"],
                },
                hints: [
                  "First Hint with `markdown`. See **bold**",
                  "Second Hint has a codeblock\n\n```js\nvar a = 1;\n```\n\nAnd spans multiple lines.",
                ],
              },
            ],
          },
        ],
      };
      expect(result.levels).toEqual(expected.levels);
    });

    it("should parse hints and not interrupt next step", () => {
      const md = `# Title
    
Description.

## 1. Title 1

First level content.

### 1.1

The first step

#### HINTS

* First Hint with \`markdown\`. See **bold**
* Second Hint has a codeblock

\`\`\`js
var a = 1;
\`\`\`

And spans multiple lines.

### 1.2

The second uninterrupted step
`;
      const skeleton = {
        levels: [
          {
            id: "1",
            steps: [
              {
                id: "1.1",
              },
              {
                id: "1.2",
              },
            ],
          },
        ],
      };
      const result = parse({
        text: md,
        skeleton,
        commits: {
          "1.1:T": ["abcdef1"],
          "1.1:S": ["123456789"],
          "1.2:T": ["fedcba1"],
        },
      });
      const expected = {
        summary: {
          description: "Description.",
        },
        levels: [
          {
            id: "1",
            title: "Title 1",
            summary: "First level content.",
            content: "First level content.",
            steps: [
              {
                id: "1.1",
                content: "The first step",
                setup: {
                  commits: ["abcdef1"],
                },
                solution: {
                  commits: ["123456789"],
                },
                hints: [
                  "First Hint with `markdown`. See **bold**",
                  "Second Hint has a codeblock\n\n```js\nvar a = 1;\n```\n\nAnd spans multiple lines.",
                ],
              },
              {
                id: "1.2",
                content: "The second uninterrupted step",
                setup: {
                  commits: ["fedcba1"],
                },
              },
            ],
          },
          {},
        ],
      };
      expect(result.levels[0]).toEqual(expected.levels[0]);
    });
  });
});
