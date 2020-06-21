import { validateCommitOrder } from "../src/utils/validateCommits";

describe("commitOrder", () => {
  describe("#.# format", () => {
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
  // @deprecated
  describe("L#S# format", () => {
    it("should return true if order is valid", () => {
      const positions = ["INIT", "L1", "L1S1", "L1S2", "L2", "L2S1"];
      const result = validateCommitOrder(positions);
      expect(result).toBe(true);
    });
    it("should return true if valid with duplicates", () => {
      const positions = [
        "INIT",
        "INIT",
        "L1",
        "L1",
        "L1S1",
        "L1S1",
        "L1S2",
        "L1S2",
        "L2",
        "L2",
        "L2S1",
        "L2S1",
      ];
      const result = validateCommitOrder(positions);
      expect(result).toBe(true);
    });
    it("should return false if INIT is out of order", () => {
      const positions = ["INIT", "L1", "L1S1", "L1S2", "INIT", "L2", "L2S1"];
      const result = validateCommitOrder(positions);
      expect(result).toBe(false);
    });
    it("should return false if level after step is out of order", () => {
      const positions = ["INIT", "L1", "L1S1", "L1S2", "L2S1", "L2"];
      const result = validateCommitOrder(positions);
      expect(result).toBe(false);
    });
    it("should return false if level is out of order", () => {
      const positions = ["INIT", "L1", "L3", "L2"];
      const result = validateCommitOrder(positions);
      expect(result).toBe(false);
    });
    it("should return false if step is out of order", () => {
      const positions = ["INIT", "L1", "L1S1", "L1S3", "L1S2"];
      const result = validateCommitOrder(positions);
      expect(result).toBe(false);
    });
  });
});
