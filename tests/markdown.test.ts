import * as T from "../typings/tutorial";
import { validateMarkdown } from "../src/utils/validateMarkdown";

describe("validate markdown", () => {
  it.todo("should return false if missing a summary title (#)");
  it.todo("should return false if contains multiple `#` headers");
  it.todo("should return false if missing a summary description");
  it.todo("should return false if `##` doesn't preface a level");
  it.todo("should return false if `###` doesn't preface a step");
  it.todo("should return true for valid markdown");
});
