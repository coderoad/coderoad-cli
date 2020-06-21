import { validateCommitOrder } from "../src/utils/validateCommits";

describe("commitOrder", () => {
  it("should return true if order is valid", () => {
    const positions = ["INIT", "1", "1.1", "1.2", "2", "2.1"];
    const result = validateCommitOrder(positions);
    expect(result).toBe(true);
  });
  it("should return true if valid with duplicates", () => {
    const positions = [
      "INIT",
      "INIT",
      "1",
      "1",
      "1.1",
      "1.1",
      "1.2",
      "1.2",
      "2",
      "2",
      "2.1",
      "2.1",
    ];
    const result = validateCommitOrder(positions);
    expect(result).toBe(true);
  });
  it("should return false if INIT is out of order", () => {
    const positions = ["INIT", "1", "1.1", "1.2", "INIT", "2", "2.1"];
    const result = validateCommitOrder(positions);
    expect(result).toBe(false);
  });
  it("should return false if level after step is out of order", () => {
    const positions = ["INIT", "1", "1.1", "1.2", "2.1", "2"];
    const result = validateCommitOrder(positions);
    expect(result).toBe(false);
  });
  it("should return false if level is out of order", () => {
    const positions = ["INIT", "1", "L3", "2"];
    const result = validateCommitOrder(positions);
    expect(result).toBe(false);
  });
  it("should return false if step is out of order", () => {
    const positions = ["INIT", "1", "1.1", "1.3", "1.2"];
    const result = validateCommitOrder(positions);
    expect(result).toBe(false);
  });
});
