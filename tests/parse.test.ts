import { parse } from "../src/utils/parse";

describe("parse", () => {
  it("should parse summary", () => {
    const md = `# Insert Tutorial's Title here

    Short description to be shown as a tutorial's subtitle.

    `;

    const yaml = `version: "0.1.0"`;
    const result = parse(md, yaml);
    const expected = {
      summary: {
        description: "Short description to be shown as a tutorial's subtitle.",
        title: "Insert Tutorial's Title here",
      },
    };
    expect(result.summary).toEqual(expected.summary);
  });

  it("should parse a level with no steps", () => {
    const md = `# Title
    
Description.

## L1 Put Level's title here

> Level's summary: a short description of the level's content in one line.

Some text
`;

    const yaml = `version: "0.1.0"
levels:
- id: L1
`;
    const result = parse(md, yaml);
    const expected = {
      levels: [
        {
          id: "L1",
          title: "Put Level's title here",
          summary:
            "Level's summary: a short description of the level's content in one line.",
          content: "Some text",
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

    const yaml = `version: "0.1.0"
levels:
- id: L1
  setup:
    files: []
    commits: []
  solution:
    files: []
    commits: []
`;
    const result = parse(md, yaml);
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

    const yaml = `version: "0.1.0"
levels:
- id: L1
`;
    const result = parse(md, yaml);
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
    expect(result.levels).toEqual(expected.levels);
  });

  it("should truncate a level description", () => {
    const md = `# Title
    
Description.

## L1 Put Level's title here

Some text that becomes the summary and goes beyond the maximum length of 80 so that it gets truncated at the end
`;

    const yaml = `version: "0.1.0"
levels:
- id: L1
`;
    const result = parse(md, yaml);
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

    const yaml = `version: "0.1.0"
levels:
- id: L1
`;
    const result = parse(md, yaml);
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

  it("should parse the tutorial config", () => {
    const md = `# Title
    
Description.
`;
    const yaml = `
config:
  testRunner:
    command: ./node_modules/.bin/mocha
    args:
      filter: --grep
      tap: --reporter=mocha-tap-reporter
    directory: coderoad
    setup:
      commits:
      - abcdefg1
      commands: []
  appVersions:
    vscode: '>=0.7.0'
  repo:
    uri: https://path.to/repo
    branch: aBranch
  dependencies:
    - name: node
      version: '>=10'
`;
    const result = parse(md, yaml);
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
            commits: ["abcdefg1"],
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
});
