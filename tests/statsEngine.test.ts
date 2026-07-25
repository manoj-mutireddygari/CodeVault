import { describe, it, expect } from "vitest";
import { updatedStats } from "../extension/src/services/statsEngine";
import type { ProblemRecord, VaultStats } from "@codevault/shared";

describe("statsEngine", () => {
  const baseStats: VaultStats = {
    totalSolved: 1,
    easy: 1,
    medium: 0,
    hard: 0,
    currentStreak: 1,
    longestStreak: 1,
    languages: { python: 1 },
    topics: { array: 1 },
    lastSolved: "2026-07-23T12:00:00.000Z",
    monthlySolves: { "2026-07": 1 }
  };

  it("should initialize default empty stats on undefined previous state", () => {
    const record: ProblemRecord = {
      id: 1,
      title: "Two Sum",
      slug: "two-sum",
      difficulty: "Easy",
      language: "python",
      topics: ["array", "hash-table"],
      solvedAt: "2026-07-24T10:00:00.000Z",
      folderName: "0001-two-sum"
    };

    const next = updatedStats(undefined, record);
    expect(next.totalSolved).toBe(1);
    expect(next.easy).toBe(1);
    expect(next.languages.python).toBe(1);
    expect(next.topics.array).toBe(1);
    expect(next.topics["hash-table"]).toBe(1);
  });

  it("should increment difficulty counts correctly", () => {
    const record: ProblemRecord = {
      id: 2,
      title: "Add Two Numbers",
      slug: "add-two-numbers",
      difficulty: "Medium",
      language: "javascript",
      topics: ["linked-list"],
      solvedAt: "2026-07-24T12:00:00.000Z",
      folderName: "0002-add-two-numbers"
    };

    const next = updatedStats(baseStats, record);
    expect(next.totalSolved).toBe(2);
    expect(next.easy).toBe(1);
    expect(next.medium).toBe(1);
    expect(next.languages.python).toBe(1);
    expect(next.languages.javascript).toBe(1);
  });

  it("should increment streak if solved on the consecutive day", () => {
    const record: ProblemRecord = {
      id: 3,
      title: "Longest Substring",
      slug: "longest-substring",
      difficulty: "Medium",
      language: "python",
      topics: ["string"],
      solvedAt: "2026-07-24T15:00:00.000Z",
      folderName: "0003-longest-substring"
    };

    const next = updatedStats(baseStats, record);
    expect(next.currentStreak).toBe(2);
    expect(next.longestStreak).toBe(2);
  });

  it("should reset current streak if solved after a gap of multiple days", () => {
    const record: ProblemRecord = {
      id: 4,
      title: "Median of Sorted",
      slug: "median-sorted",
      difficulty: "Hard",
      language: "cpp",
      topics: ["binary-search"],
      solvedAt: "2026-07-26T18:00:00.000Z",
      folderName: "0004-median-sorted"
    };

    const next = updatedStats(baseStats, record);
    expect(next.currentStreak).toBe(1);
    expect(next.longestStreak).toBe(1); // keeps old best of 1
  });
});
