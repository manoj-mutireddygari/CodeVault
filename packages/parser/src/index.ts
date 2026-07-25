import type { Submission } from "@codevault/types";

export const getFileExtension = (language: string): string => {
  const map: Record<string, string> = {
    cpp: "cpp",
    "c++": "cpp",
    java: "java",
    python: "py",
    python3: "py",
    c: "c",
    csharp: "cs",
    "c#": "cs",
    javascript: "js",
    js: "js",
    typescript: "ts",
    ts: "ts",
    php: "php",
    swift: "swift",
    kotlin: "kt",
    gold: "go",
    go: "go",
    ruby: "rb",
    scala: "scala",
    rust: "rs",
    racket: "rkt",
    erlang: "erl",
    elixir: "ex",
    sql: "sql",
  };
  return map[language.toLowerCase().trim()] || "txt";
};

export const generateReadmeMarkdown = (sub: Submission): string => {
  return `# ${sub.problemId}. ${sub.title}

## Difficulty
**${sub.difficulty}**

## Problem Link
[LeetCode Problem - ${sub.title}](${sub.leetCodeUrl})

## Details
- **Language**: \`${sub.language}\`
${sub.runtime ? `- **Runtime**: ${sub.runtime}` : ""}
${sub.memory ? `- **Memory**: ${sub.memory}` : ""}
- **Submitted**: ${sub.submittedAt}
- **Topics**: ${sub.topics.map((t) => `\`${t}\``).join(", ") || "None"}

---

*Preserved automatically with [CodeVault SaaS](https://codevault.dev).*
`;
};

export const generateMetadataJson = (sub: Submission, githubUrl: string, folderName: string) => {
  return JSON.stringify(
    {
      problemId: sub.problemId,
      title: sub.title,
      slug: sub.slug,
      difficulty: sub.difficulty,
      topics: sub.topics,
      language: sub.language,
      runtime: sub.runtime,
      memory: sub.memory,
      submissionDate: sub.submittedAt,
      leetCodeUrl: sub.leetCodeUrl,
      githubUrl,
      folderName,
    },
    null,
    2
  );
};
