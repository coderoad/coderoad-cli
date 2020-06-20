import { getArg } from "../src/utils/args";

describe("args", () => {
  it("should capture an arg name from text", () => {
    const args = ["--name", "value"];
    const result = getArg(args, { name: "name" });
    expect(result).toBe("value");
  });
  it("should capture an arg alias from text", () => {
    const args = ["-n", "value"];
    const result = getArg(args, { name: "name", alias: "n" });
    expect(result).toBe("value");
  });
  it("should capture an arg name from text when starting values", () => {
    const args = ["dir", "--name", "value"];
    const result = getArg(args, { name: "name" });
    expect(result).toBe("value");
  });
  it("should capture an arg alias from text", () => {
    const args = ["dir", "-n", "value"];
    const result = getArg(args, { name: "name", alias: "n" });
    expect(result).toBe("value");
  });
  it("should default value to true if no next value", () => {
    const args = ["--someBool"];
    const result = getArg(args, {
      name: "someBool",
      alias: "sb",
      type: "bool",
    });
    expect(result).toBe(true);
  });
  it("should default value to true if next value is param", () => {
    const args = ["--someBool", "--someOtherBool"];
    const result = getArg(args, {
      name: "someBool",
      alias: "sb",
      type: "bool",
    });
    expect(result).toBe(true);
  });
});
