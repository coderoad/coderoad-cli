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
});
