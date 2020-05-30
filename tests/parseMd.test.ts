import { parseContent } from "../src/build";

describe("parse", () => {
  it("should parse summary", () => {
    const md = `# Insert Tutorial's Title here

    Short description to be shown as a tutorial's subtitle.

    `;

    const result = parseContent(md);
    const expected = {
      summary: {
        description: "Short description to be shown as a tutorial's subtitle.",
        title: "Insert Tutorial's Title here",
      },
    };
    expect(result).toEqual(expected);
  });
});
