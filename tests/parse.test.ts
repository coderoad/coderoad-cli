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

  it("should parse a level with a summary", () => {
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
});
