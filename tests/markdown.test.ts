import { validateMarkdown } from "../src/utils/validateMarkdown";

describe("validate markdown", () => {
  it("should return false if missing a summary title (#)", () => {
    const md = `
Description.

## L1 Put Level's title here

> Level's summary: a short description of the level's content in one line.

Some text that describes the level`;
    expect(validateMarkdown(md)).toBe(false);
  });

  it("should return false if contains multiple `#` headers", () => {
    const md1 = `# A Title
Description.

# Another Title

## L1 Put Level's title here

> Level's summary: a short description of the level's content in one line.

Some text that describes the level`;

    const md2 = `# A Title
Description.


## L1 Put Level's title here

> Level's summary: a short description of the level's content in one line.

Some text that describes the level

# Another title
`;
    expect(validateMarkdown(md1)).toBe(false);
    expect(validateMarkdown(md2)).toBe(false);
  });

  it("should return false if missing a summary description", () => {
    const md = `# A Title

## L1 Put Level's title here

> Level's summary: a short description of the level's content in one line.

Some text that describes the level
`;
    expect(validateMarkdown(md)).toBe(false);
  });

  it("should return false if `##` doesn't preface a level", () => {
    const md = `# A Title

A description

## Put Level's title here

> Level's summary: a short description of the level's content in one line.

Some text that describes the level
`;
    expect(validateMarkdown(md)).toBe(false);
  });

  it("should return false if `###` doesn't preface a step", () => {
    const md = `# A Title

A description

## Put Level's title here

> Level's summary: a short description of the level's content in one line.

Some text that describes the level

### A Step

First step
`;
  });

  it("should return true for valid markdown", () => {
    const md = `# Title

Description.

## L1 Put Level's title here

> Level's summary: a short description of the level's content in one line.

Some text that describes the level

### L1S1

First Step`;
    expect(validateMarkdown(md)).toBe(true);
  });
});
