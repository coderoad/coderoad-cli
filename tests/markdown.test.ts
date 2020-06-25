import { validateMarkdown } from "../src/utils/validateMarkdown";

describe("validate markdown", () => {
  it("should return false if missing a summary title (#)", () => {
    const md = `
Description.

## 1. Put Level's title here

> Level's summary: a short description of the level's content in one line.

Some text that describes the level`;
    expect(validateMarkdown(md)).toBe(false);
  });

  it("should return false if contains multiple `#` headers", () => {
    const md1 = `# A Title
Description.

# Another Title

## 1. Put Level's title here

> Level's summary: a short description of the level's content in one line.

Some text that describes the level`;

    const md2 = `# A Title
Description.


## 1. Put Level's title here

> Level's summary: a short description of the level's content in one line.

Some text that describes the level

# Another title
`;

    expect(validateMarkdown(md1)).toBe(false);
    expect(validateMarkdown(md2)).toBe(false);
  });

  it("should return false if missing a summary description", () => {
    const md = `# A Title

## 1. Put Level's title here

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

### Missing step id

First step
`;
    expect(validateMarkdown(md)).toBe(false);
  });

  it("should return true for valid markdown", () => {
    const md = `# Title

Description.

## 1. Put Level's title here

> Level's summary: a short description of the level's content in one line.

Some text that describes the level

### 1.1

First Step`;
    expect(validateMarkdown(md)).toBe(true);
  });

  it("should ignore markdown content in codeblocks", () => {
    const md = `# Title

Description.

\`\`\`md
# A codeblock

Should not be a problem
\`\`\`


## 1. Put Level's title here

> Level's summary: a short description of the level's content in one line.

Some text that describes the level

\`\`\`
## 2. Another Level in markdown

Should not be an issue
\`\`\`

### 1.1

First Step`;
    expect(validateMarkdown(md)).toBe(true);
  });
  it("should ignore empty space at the top", () => {
    const md = `

# Title

Description.`;
    expect(validateMarkdown(md)).toBe(true);
  });
  it("should ignore empty space at the bottom", () => {
    const md = `

# Title

Description.





`;
    expect(validateMarkdown(md)).toBe(true);
  });
});
