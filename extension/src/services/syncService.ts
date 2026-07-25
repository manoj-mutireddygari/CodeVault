import { folderNameFor, type ProblemRecord, type SolutionMetadata, type Submission, type VaultStats } from "@codevault/shared";
import { GitHubClient, GitHubValidationError } from "../github/GitHubClient";
import { vaultStorage } from "../storage/vaultStorage";
import { createSolutionReadme } from "./readmeGenerator";
import { updatedStats } from "./statsEngine";
import type { SyncResult } from "../types";
import { logger } from "../utils/logger";
import { z } from "zod";

export const extensionFor = (language: string): string => {
  if (!language) return "txt";
  const norm = language.toLowerCase().trim();

  if (norm.includes("python") || norm === "py" || norm === "py3") return "py";
  if (norm.includes("c++") || norm.includes("cpp") || norm === "g++") return "cpp";
  if (norm.includes("javascript") || norm === "js") return "js";
  if (norm.includes("typescript") || norm === "ts") return "ts";
  if (norm.includes("java") && !norm.includes("javascript")) return "java";
  if (norm.includes("c#") || norm.includes("csharp") || norm === "cs") return "cs";
  if (norm === "c") return "c";
  if (norm.includes("golang") || norm === "go") return "go";
  if (norm.includes("rust") || norm === "rs") return "rs";
  if (norm.includes("ruby") || norm === "rb") return "rb";
  if (norm.includes("swift")) return "swift";
  if (norm.includes("kotlin") || norm === "kt") return "kt";
  if (norm.includes("scala")) return "scala";
  if (norm.includes("php")) return "php";
  if (norm.includes("sql") || norm.includes("mysql") || norm.includes("postgres") || norm.includes("oracle")) return "sql";
  if (norm.includes("pandas")) return "py";
  if (norm.includes("dart")) return "dart";
  if (norm === "r") return "r";
  if (norm.includes("elixir") || norm === "ex") return "ex";
  if (norm.includes("erlang") || norm === "erl") return "erl";
  if (norm.includes("racket") || norm === "rkt") return "rkt";
  if (norm.includes("html")) return "html";

  return "txt";
};

// Zod schemas for file validation to prevent corruption
const problemSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard", "Unknown"]),
  language: z.string(),
  topics: z.array(z.string()),
  solvedAt: z.string(),
  folderName: z.string()
});

const problemsArraySchema = z.array(problemSchema);

const statsSchema = z.object({
  totalSolved: z.number(),
  easy: z.number(),
  medium: z.number(),
  hard: z.number(),
  currentStreak: z.number(),
  longestStreak: z.number(),
  languages: z.record(z.string(), z.number()),
  topics: z.record(z.string(), z.number()),
  lastSolved: z.string().optional(),
  monthlySolves: z.record(z.string(), z.number())
});

const parseProblems = (content: string | undefined): ProblemRecord[] => {
  if (!content) return [];
  try {
    const raw = JSON.parse(content);
    const parsed = problemsArraySchema.safeParse(raw);
    if (parsed.success) return parsed.data;
    logger.warn("repository:invalid-problems-schema", parsed.error);
    return [];
  } catch (e) {
    logger.warn("repository:invalid-problems-json", e);
    return [];
  }
};

const parseStats = (content: string | undefined): VaultStats | undefined => {
  if (!content) return undefined;
  try {
    const raw = JSON.parse(content);
    const parsed = statsSchema.safeParse(raw);
    if (parsed.success) return parsed.data as VaultStats;
    logger.warn("repository:invalid-stats-schema", parsed.error);
    return undefined;
  } catch (e) {
    logger.warn("repository:invalid-stats-json", e);
    return undefined;
  }
};

const validSubmission = (submission: Submission) =>
  Number.isInteger(submission.problemId) &&
  submission.problemId > 0 &&
  submission.title.length <= 240 &&
  submission.slug.length <= 180 &&
  submission.sourceCode.length > 0 &&
  submission.sourceCode.length < 1_000_000;

export async function syncSubmission(submission: Submission): Promise<SyncResult> {
  if (!validSubmission(submission)) {
    return { ok: false, message: "Submission data is incomplete. It was not uploaded." };
  }

  const settings = await vaultStorage.getSettings();

  if (!settings.token) {
    return { ok: false, message: "GitHub Personal Access Token is required to commit solutions. Please add your GitHub PAT in CodeVault Settings." };
  }

  const identity = `${submission.problemId}:${submission.language}:${submission.sourceCode}`;
  const last = await vaultStorage.getLastUpload();
  if (last?.key === identity) {
    return { ok: false, message: "Duplicate Submission Ignored" };
  }

  const client = new GitHubClient(settings.token);
  let tokenUser: { login: string; avatar_url: string };
  try {
    tokenUser = await client.validateToken();
  } catch (err: any) {
    return { ok: false, message: `GitHub Token Error: ${err.message || "Invalid token"}. Please check your PAT in Settings.` };
  }

  // Auto-discover correct owner from token if it's blank or looks like a UUID
  let resolvedOwner = settings.owner;
  const isUuid = (s?: string) => !s || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s) || s.startsWith("usr_") || s.startsWith("gh_usr_");
  if (isUuid(resolvedOwner) && tokenUser.login) {
    resolvedOwner = tokenUser.login;
    logger.debug("sync:resolved-owner-from-token", { owner: resolvedOwner });
    await vaultStorage.saveSettings({ ...settings, owner: resolvedOwner });
  }

  if (!resolvedOwner) {
    return { ok: false, message: "GitHub Username/Owner is missing. Please set your GitHub Username in Settings." };
  }

  if (!settings.repository) {
    return { ok: false, message: "Target Repository Name is missing. Please set your Repository Name in Settings." };
  }

  // Auto-discover correct repository name if the configured one doesn't exist
  let resolvedRepo = settings.repository;
  try {
    await client.getRepository(resolvedOwner, resolvedRepo);
  } catch {
    // Repo not found — list user's repos and find best match
    logger.debug("sync:repo-not-found-auto-discovering", { owner: resolvedOwner, repo: resolvedRepo });
    const userRepos = await client.getUserRepositories();
    if (userRepos.length === 0) {
      return { ok: false, message: `No repositories found on GitHub account '${resolvedOwner}'. Please create one and update Settings.` };
    }
    // 1. Exact name match
    // 2. Case-insensitive match
    // 3. Common LeetCode repo names
    // 4. If only 1 repo, use it
    const lowerConf = resolvedRepo.toLowerCase();
    const leetcodeKeywords = ["leetcode", "leet-code", "lc", "solutions", "algorithms", "dsa", "competitive"];
    const exact = userRepos.find(r => r.name === resolvedRepo);
    const caseInsensitive = userRepos.find(r => r.name.toLowerCase() === lowerConf);
    const keywordMatch = userRepos.find(r => leetcodeKeywords.some(k => r.name.toLowerCase().includes(k)));
    const autoPickedRepo = exact || caseInsensitive || (userRepos.length === 1 ? userRepos[0] : null) || keywordMatch;
    if (!autoPickedRepo) {
      const names = userRepos.slice(0, 5).map(r => r.name).join(", ");
      return { ok: false, message: `Repository '${resolvedRepo}' not found. Your GitHub repos: [${names}]. Update the Repository Name in Settings.` };
    }
    resolvedRepo = autoPickedRepo.name;
    logger.debug("sync:auto-discovered-repo", { repo: resolvedRepo });
    // Persist the discovered repo name back to storage
    await vaultStorage.saveSettings({ ...settings, owner: resolvedOwner, repository: resolvedRepo });
  }

  const folderName = folderNameFor(submission.problemId, submission.slug);
  const solutionPath = `${folderName}/solution.${extensionFor(submission.language)}`;
  const githubUrl = client.repositoryUrl(resolvedOwner, resolvedRepo, solutionPath);

  // Check if identical solution already exists on GitHub
  const existingSolutionFile = await client.getFile(resolvedOwner, resolvedRepo, solutionPath);
  if (existingSolutionFile && existingSolutionFile.content.trim() === submission.sourceCode.trim()) {
    logger.debug("sync:identical-solution-exists", { problemId: submission.problemId });
    return { ok: true, message: "Solution already up-to-date on GitHub", url: githubUrl };
  }

  const isUpdate = Boolean(existingSolutionFile);

  const metadata: SolutionMetadata = {
    ...submission,
    submissionDate: submission.submittedAt,
    folderName,
    githubUrl
  };

  const record: ProblemRecord = {
    id: submission.problemId,
    title: submission.title,
    slug: submission.slug,
    difficulty: submission.difficulty,
    language: submission.language,
    topics: submission.topics,
    solvedAt: submission.submittedAt,
    folderName
  };

  const maxRetries = 3;
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < maxRetries) {
    try {
      logger.debug("sync:attempt-start", { attempt, problemId: submission.problemId });

      // Fetch index files inside retry loop to ensure optimistic concurrency consistency
      const [problemsFile, statsFile, rootReadme] = await Promise.all([
        client.getFile(resolvedOwner, resolvedRepo, "problems.json"),
        client.getFile(resolvedOwner, resolvedRepo, "stats.json"),
        client.getFile(resolvedOwner, resolvedRepo, "README.md")
      ]);

      const previous = parseProblems(problemsFile?.content);
      const problems = [
        ...previous.filter(item => !(item.id === record.id && item.language.toLowerCase() === record.language.toLowerCase())),
        record
      ].sort((a, b) => a.id - b.id);
      const stats = updatedStats(parseStats(statsFile?.content), record);

      const message = isUpdate
        ? `feat: update ${folderName} (${submission.language})`
        : `feat: add ${folderName} (${submission.language})`;
      const files = [
        { path: solutionPath, content: submission.sourceCode },
        { path: `${folderName}/metadata.json`, content: JSON.stringify(metadata, null, 2) },
        { path: `${folderName}/README.md`, content: createSolutionReadme(metadata) },
        { path: "problems.json", content: JSON.stringify(problems, null, 2) },
        { path: "stats.json", content: JSON.stringify(stats, null, 2) }
      ];

      if (!rootReadme) {
        files.push({
          path: "README.md",
          content:
            "# LeetCode Solutions\n\nThis repository is maintained by [CodeVault](https://github.com). Each accepted LeetCode submission is saved with its source, metadata, and a focused problem README.\n"
        });
      }

      await client.commitFiles(resolvedOwner, resolvedRepo, message, files);
      logger.debug("sync:committed", { problemId: submission.problemId });

      // Update local storage status
      await vaultStorage.saveLastUpload({
        key: identity,
        syncedAt: new Date().toISOString(),
        problemId: submission.problemId
      });

      return { ok: true, message: "Upload Successful", url: githubUrl };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (error instanceof GitHubValidationError) {
        logger.warn("sync:conflict-detected", { attempt, message: error.message });
        attempt++;
        // Short jittered delay before retrying: 200ms - 500ms
        const delay = 200 + Math.random() * 300;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // If it is another type of error, fail fast and don't retry
      throw error;
    }
  }

  throw new Error(`Sync failed after ${maxRetries} conflict attempts. Last error: ${lastError?.message}`);
}
