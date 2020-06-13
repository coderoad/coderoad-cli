type Validation = {
  message: string;
  validate: (t: string) => boolean;
};

const validations: Validation[] = [
  {
    message: "should start with a title",
    validate: (t) => !!t.match(/^#\s.+/),
  },
  {
    message: "should not have multiple `#` headers",
    validate: (t) => !t.match(/[\n\r]#\s/),
  },
  {
    message: "should have a summary description under the title",
    validate: (t) => {
      const [summary] = t.split(/[\n\r]##/) || [""];
      const description = summary
        .split(/\n/)
        .slice(1)
        .filter((l) => l.length);
      return !!description.length;
    },
  },
  {
    message: "should have a level `##` with a format of `L[0-9]+`",
    validate: (t) => {
      const headers = t.match(/^#{2}\s(.+)$/gm) || [];
      console.log("level headers", headers);
      for (const header of headers) {
        if (!header.match(/^#{2}\s(L\d+)\s(.+)$/)) {
          return false;
        }
      }
      return true;
    },
  },
  {
    message: "should have a step `###` with a format of `L[0-9]+S[0-9]+`",
    validate: (t) => {
      const headers = t.match(/^#{3}\s(.+)$/gm) || [];
      console.log("step headers", headers);
      for (const header of headers) {
        if (!header.match(/^#{3}\s(L\d+)S\d+/)) {
          return false;
        }
      }
      return true;
    },
  },
];

const codeBlockRegex = /```[a-z]*\n[\s\S]*?\n```/gm;

export function validateMarkdown(md: string): boolean {
  // remove codeblocks which might contain any valid combinations
  const text = md.replace(codeBlockRegex, "");

  let valid = true;

  for (const v of validations) {
    if (!v.validate(text)) {
      valid = false;
      //   if (process.env.NODE_ENV !== "test") {
      console.warn(v.message);
      //   }
    }
  }

  return valid;
}
