import { parse } from "../src/utils/parse";

describe("parse", () => {
  // summary
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
        description: "Short description to be shown as a tutorial's subtitle.",
        title: "Insert Tutorial's Title here",
      },
    };
    expect(result.summary).toEqual(expected.summary);
  });

  // levels
  it("should parse a level with no steps", () => {
    const md = `# Title
    
Description.

## L1 Put Level's title here

> Level's summary: a short description of the level's content in one line.

Some text
`;

    const skeleton = {
      levels: [{ id: "L1" }],
    };

    const result = parse({
      text: md,
      skeleton,
      commits: {},
    });
    const expected = {
      levels: [
        {
          id: "L1",
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

## L1 Put Level's title here

> Level's summary: a short description of the level's content in one line.

Some text
`;

    const skeleton = {
      levels: [
        {
          id: "L1",
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
          id: "L1",
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

## L1 Put Level's title here

Some text that becomes the summary
`;

    const skeleton = { levels: [{ id: "L1" }] };
    const result = parse({
      text: md,
      skeleton,
      commits: {},
    });
    const expected = {
      levels: [
        {
          id: "L1",
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

## L1 Put Level's title here

Some text that becomes the summary and goes beyond the maximum length of 80 so that it gets truncated at the end
`;

    const skeleton = { levels: [{ id: "L1" }] };
    const result = parse({
      text: md,
      skeleton,
      commits: {},
    });
    const expected = {
      levels: [
        {
          id: "L1",
          title: "Put Level's title here",
          summary: "Some text that becomes the summary",
          content: "Some text that becomes the summary",
        },
      ],
    };
    expect(result.levels[0].summary).toMatch(/\.\.\.$/);
  });

  it("should match line breaks with double line breaks for proper spacing", () => {
    const md = `# Title
    
Description.

Second description line

## L1 Titles

First line

Second line

Third line
`;

    const skeleton = { levels: [{ id: "L1" }] };
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
          id: "L1",
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

## L1 Title

First line

### L1S1 Step

The first step
`;
    const skeleton = {
      levels: [
        {
          id: "L1",
          steps: [
            {
              id: "L1S1",
            },
          ],
        },
      ],
    };
    const result = parse({
      text: md,
      skeleton,
      commits: {
        L1S1Q: ["abcdefg1"],
      },
    });
    const expected = {
      summary: {
        description: "Description.",
      },
      levels: [
        {
          id: "L1",
          summary: "First line",
          content: "First line",
          steps: [
            {
              id: "L1S1",
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

## L1 Title

First line

### L1S1 Step

The first step
`;
    const skeleton = {
      levels: [
        {
          id: "L1",
          steps: [
            {
              id: "L1S1",
            },
          ],
        },
      ],
    };
    const result = parse({
      text: md,
      skeleton,
      commits: {
        L1S1Q: ["abcdefg1", "123456789"],
      },
    });
    const expected = {
      summary: {
        description: "Description.",
      },
      levels: [
        {
          id: "L1",
          summary: "First line",
          content: "First line",
          steps: [
            {
              id: "L1S1",
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

## L1 Title

First line

### L1S1

The first step
`;
    const skeleton = {
      levels: [
        {
          id: "L1",
        },
      ],
    };
    const result = parse({
      text: md,
      skeleton,
      commits: {
        L1: ["abcdefg1"],
      },
    });
    const expected = {
      summary: {
        description: "Description.",
      },
      levels: [
        {
          id: "L1",
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

  it("should load the full config for a step", () => {
    const md = `# Title
    
Description.

## L1 Title

First line

### L1S1 Step

The first step
`;
    const skeleton = {
      levels: [
        {
          id: "L1",
          steps: [
            {
              id: "L1S1",
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
        L1S1Q: ["abcdefg1", "123456789"],
        L1S1A: ["1gfedcba", "987654321"],
      },
    });
    const expected = {
      summary: {
        description: "Description.",
      },
      levels: [
        {
          id: "L1",
          summary: "First line",
          content: "First line",
          steps: [
            {
              id: "L1S1",
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

## L1 Title 1

First level content.

### L1S1

The first step

### L1S2

The second step

## L2 Title 2

Second level content.

### L2S1

The third step
`;
    const skeleton = {
      levels: [
        {
          id: "L1",
          steps: [
            {
              id: "L1S1",
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
              id: "L1S2",
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
          id: "L2",
          summary: "Second level content.",
          content: "First level content.",
          steps: [
            {
              id: "L2S1",
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
        L1S1Q: ["abcdef1", "123456789"],
        L1S1A: ["1fedcba", "987654321"],
        L1S2Q: ["2abcdef"],
        L1S2A: ["3abcdef"],
        L2S1Q: ["4abcdef"],
        L2S1A: ["5abcdef"],
      },
    });
    const expected = {
      summary: {
        description: "Description.",
      },
      levels: [
        {
          id: "L1",
          title: "Title 1",
          summary: "First level content.",
          content: "First level content.",
          steps: [
            {
              id: "L1S1",
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
              id: "L1S2",
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
          id: "L2",
          title: "Title 2",
          summary: "Second level content.",
          content: "Second level content.",
          steps: [
            {
              id: "L2S1",
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

## L1 Title 1

First level content.

### L1S1

The first step

`;
    const skeleton = {
      levels: [
        {
          id: "L1",
          steps: [
            {
              id: "L1S1",
            },
          ],
        },
      ],
    };
    const result = parse({
      text: md,
      skeleton,
      commits: {
        L1S1Q: ["abcdef1", "123456789"],
      },
    });
    const expected = {
      summary: {
        description: "Description.",
      },
      levels: [
        {
          id: "L1",
          title: "Title 1",
          summary: "First level content.",
          content: "First level content.",
          steps: [
            {
              id: "L1S1",
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

  // config
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

  // hints
  it("should parse hints for a step", () => {
    const md = `# Title
    
Description.

## L1 Title 1

First level content.

### L1S1

The first step

#### Hints

* First Hint
* Second Hint

`;
    const skeleton = {
      levels: [
        {
          id: "L1",
          steps: [
            {
              id: "L1S1",
            },
          ],
        },
      ],
    };
    const result = parse({
      text: md,
      skeleton,
      commits: {
        L1S1Q: ["abcdef1", "123456789"],
      },
    });
    const expected = {
      summary: {
        description: "Description.",
      },
      levels: [
        {
          id: "L1",
          title: "Title 1",
          summary: "First level content.",
          content: "First level content.",
          steps: [
            {
              id: "L1S1",
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

## L1 Title 1

First level content.

### L1S1

The first step

#### Hints

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
          id: "L1",
          steps: [
            {
              id: "L1S1",
            },
          ],
        },
      ],
    };
    const result = parse({
      text: md,
      skeleton,
      commits: {
        L1S1Q: ["abcdef1", "123456789"],
      },
    });
    const expected = {
      summary: {
        description: "Description.",
      },
      levels: [
        {
          id: "L1",
          title: "Title 1",
          summary: "First level content.",
          content: "First level content.",
          steps: [
            {
              id: "L1S1",
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

## L1 Title 1

First level content.

### L1S1

The first step

#### Hints

* First Hint with \`markdown\`. See **bold**
* Second Hint has a codeblock

\`\`\`js
var a = 1;
\`\`\`

And spans multiple lines.

### L1S2A

The second uninterrupted step
`;
    const skeleton = {
      levels: [
        {
          id: "L1",
          steps: [
            {
              id: "L1S1",
            },
            {
              id: "L1S2",
            },
          ],
        },
      ],
    };
    const result = parse({
      text: md,
      skeleton,
      commits: {
        L1S1Q: ["abcdef1", "123456789"],
        L1S2Q: ["fedcba1"],
      },
    });
    const expected = {
      summary: {
        description: "Description.",
      },
      levels: [
        {
          id: "L1",
          title: "Title 1",
          summary: "First level content.",
          content: "First level content.",
          steps: [
            {
              id: "L1S1",
              content: "The first step",
              setup: {
                commits: ["abcdef1", "123456789"],
              },
              hints: [
                "First Hint with `markdown`. See **bold**",
                "Second Hint has a codeblock\n\n```js\nvar a = 1;\n```\n\nAnd spans multiple lines.",
              ],
            },
            {
              id: "L1S2",
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
    expect(result.levels).toEqual(expected.levels);
  });
});
