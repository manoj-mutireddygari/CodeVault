import { describe, it, expect } from "vitest";
import { createSolutionReadme } from "../extension/src/services/readmeGenerator";
import type { SolutionMetadata } from "@codevault/shared";

describe("readmeGenerator", () => {
  it("should format markdown correctly with standard problem detail fields", () => {
    const metadata: SolutionMetadata = {
      problemId: 1,
      title: "Two Sum",
      slug: "two-sum",
      difficulty: "Easy",
      topics: ["Array", "Hash Table"],
      language: "python",
      runtime: "32 ms",
      memory: "14.2 MB",
      githubUrl: "https://github.com/octocat/leetcode/blob/main/0001-two-sum/solution.py",
      leetCodeUrl: "https://leetcode.com/problems/two-sum/",
      submissionDate: "2026-07-24T10:00:00Z",
      folderName: "0001-two-sum"
    };

    const readme = createSolutionReadme(metadata);
    expect(readme).toContain("# 1. Two Sum");
    expect(readme).toContain("| Difficulty | Easy |");
    expect(readme).toContain("| Language | python |");
    expect(readme).toContain("| Runtime | 32 ms |");
    expect(readme).toContain("| Memory | 14.2 MB |");
    expect(readme).toContain("`Array` `Hash Table`");
    expect(readme).toContain("[LeetCode problem](https://leetcode.com/problems/two-sum/)");
  });

  it("should fallback gracefully if optional runtime or memory are not provided", () => {
    const metadata: SolutionMetadata = {
      problemId: 45,
      title: "Jump Game II",
      slug: "jump-game-ii",
      difficulty: "Medium",
      topics: [],
      language: "cpp",
      githubUrl: "https://github.com/octocat/leetcode/blob/main/0045-jump-game-ii/solution.cpp",
      leetCodeUrl: "https://leetcode.com/problems/jump-game-ii/",
      submissionDate: "2026-07-24T10:00:00Z",
      folderName: "0045-jump-game-ii"
    };

    const readme = createSolutionReadme(metadata);
    expect(readme).toContain("| Runtime | — |");
    expect(readme).toContain("| Memory | — |");
    expect(readme).toContain("Not available");
  });
});
