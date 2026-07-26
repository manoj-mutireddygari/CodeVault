import { z } from "zod";
import type { ProblemRecord, SolutionMetadata, VaultStats } from "@codevault/shared";
import type { DetailedProblem, RepositoryContext, VaultData } from "../types/dashboard";
import { extensionBridge } from "./extensionBridge";
import { supabase, supabaseAuth } from "./supabaseAuth";

const problemSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  difficulty: z.string(),
  language: z.string(),
  topics: z.array(z.string()),
  solvedAt: z.string(),
  folderName: z.string()
});

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

const metadataSchema = z.object({
  problemId: z.number(),
  title: z.string(),
  slug: z.string(),
  difficulty: z.string(),
  topics: z.array(z.string()),
  language: z.string(),
  runtime: z.string().optional(),
  memory: z.string().optional(),
  submissionDate: z.string(),
  githubUrl: z.string(),
  leetCodeUrl: z.string(),
  folderName: z.string()
});

const computeStreak = (problems: ProblemRecord[]): number => {
  if (problems.length === 0) return 0;
  const dates = [...new Set(problems.map(p => p.solvedAt.substring(0, 10)))].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().substring(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().substring(0, 10);

  if (!dates.includes(today) && !dates.includes(yesterday)) return 0;

  let current = dates.includes(today) ? new Date() : new Date(Date.now() - 86400000);
  while (true) {
    const key = current.toISOString().substring(0, 10);
    if (dates.includes(key)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

const countBy = (items: ProblemRecord[], fn: (item: ProblemRecord) => string): Record<string, number> => {
  const result: Record<string, number> = {};
  for (const item of items) {
    const key = fn(item);
    if (key) result[key] = (result[key] || 0) + 1;
  }
  return result;
};

const countTopics = (items: ProblemRecord[]): Record<string, number> => {
  const result: Record<string, number> = {};
  for (const item of items) {
    for (const t of item.topics || []) {
      result[t] = (result[t] || 0) + 1;
    }
  }
  return result;
};

const countMonthly = (items: ProblemRecord[]): Record<string, number> => {
  const result: Record<string, number> = {};
  for (const item of items) {
    const month = item.solvedAt.substring(0, 7);
    if (month) result[month] = (result[month] || 0) + 1;
  }
  return result;
};

const raw = (repository: RepositoryContext, path: string) =>
  `https://raw.githubusercontent.com/${repository.owner}/${repository.repo}/main/${path}?t=${Date.now()}`;

async function getJson<T>(url: string, schema: z.ZodType<T>, fallback?: T): Promise<T> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      if (response.status === 404 && fallback !== undefined) {
        return fallback;
      }
      throw new Error(
        response.status === 403 ? "rate-limited" : response.status === 404 ? "unavailable" : "offline"
      );
    }
    return schema.parse(await response.json());
  } catch (err) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw err;
  }
}

const mockProblems = [
  {
    id: 1,
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    language: "python3",
    topics: ["Array", "Hash Table"],
    solvedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    folderName: "0001-two-sum"
  },
  {
    id: 2,
    title: "Add Two Numbers",
    slug: "add-two-numbers",
    difficulty: "Medium",
    language: "java",
    topics: ["Linked List", "Math"],
    solvedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    folderName: "0002-add-two-numbers"
  },
  {
    id: 3,
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "Medium",
    language: "javascript",
    topics: ["Hash Table", "String", "Sliding Window"],
    solvedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    folderName: "0003-longest-substring-without-repeating-characters"
  }
];

const mockStats = {
  totalSolved: 3,
  easy: 1,
  medium: 2,
  hard: 0,
  currentStreak: 3,
  longestStreak: 5,
  languages: { python3: 1, java: 1, javascript: 1 },
  topics: { Array: 1, "Hash Table": 2, "Linked List": 1, Math: 1, String: 1, "Sliding Window": 1 },
  lastSolved: new Date().toISOString(),
  monthlySolves: { [new Date().toISOString().substring(0, 7)]: 3 }
};

const mockMetadatas: Record<string, any> = {
  "0001-two-sum": {
    problemId: 1,
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    topics: ["Array", "Hash Table"],
    language: "python3",
    runtime: "32 ms",
    memory: "15.2 MB",
    submissionDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    githubUrl: "https://github.com/octocat/leetcode-vault/blob/main/0001-two-sum/solution.py",
    leetCodeUrl: "https://leetcode.com/problems/two-sum/",
    folderName: "0001-two-sum"
  },
  "0002-add-two-numbers": {
    problemId: 2,
    title: "Add Two Numbers",
    slug: "add-two-numbers",
    difficulty: "Medium",
    topics: ["Linked List", "Math"],
    language: "java",
    runtime: "1 ms",
    memory: "42.5 MB",
    submissionDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    githubUrl: "https://github.com/octocat/leetcode-vault/blob/main/0002-add-two-numbers/solution.java",
    leetCodeUrl: "https://leetcode.com/problems/add-two-numbers/",
    folderName: "0002-add-two-numbers"
  },
  "0003-longest-substring-without-repeating-characters": {
    problemId: 3,
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "Medium",
    topics: ["Hash Table", "String", "Sliding Window"],
    language: "javascript",
    runtime: "68 ms",
    memory: "44.1 MB",
    submissionDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    githubUrl: "https://github.com/octocat/leetcode-vault/blob/main/0003-longest-substring-without-repeating-characters/solution.js",
    leetCodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    folderName: "0003-longest-substring-without-repeating-characters"
  }
};

const extensions: Record<string, string> = {
  python: "py",
  python3: "py",
  java: "java",
  javascript: "js",
  typescript: "ts",
  cpp: "cpp",
  c: "c",
  csharp: "cs",
  go: "go",
  rust: "rs",
  ruby: "rb",
  swift: "swift",
  kotlin: "kt"
};

export const githubVault = {
  async getVault(repository: RepositoryContext): Promise<VaultData> {
    // 1. Primary Source: Supabase Database submissions table
    const session = supabaseAuth.getSession();

    if (supabase && session?.user?.id) {
      try {
        const { data, error } = await supabase
          .from("submissions")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const problems: ProblemRecord[] = data.map((sub: any) => ({
            id: sub.problem_id,
            title: sub.title,
            slug: sub.slug,
            difficulty: sub.difficulty || "Unknown",
            language: sub.language,
            topics: sub.topics || [],
            solvedAt: sub.submitted_at,
            folderName: sub.folder_name || `${String(sub.problem_id).padStart(4, "0")}-${sub.slug}`
          }));

          const stats: VaultStats = {
            totalSolved: problems.length,
            easy: problems.filter(p => p.difficulty === "Easy").length,
            medium: problems.filter(p => p.difficulty === "Medium").length,
            hard: problems.filter(p => p.difficulty === "Hard").length,
            currentStreak: computeStreak(problems),
            longestStreak: computeStreak(problems),
            languages: countBy(problems, p => p.language),
            topics: countTopics(problems),
            lastSolved: problems[0]?.solvedAt,
            monthlySolves: countMonthly(problems)
          };

          return { problems, stats, repository };
        }
      } catch (e) {
        console.warn("Failed to fetch vault data from Supabase DB, falling back to GitHub raw:", e);
      }
    }

    if (repository.owner === "octocat") {
      try {
        const isInstalled = await extensionBridge.ping();
        if (isInstalled) {
          const extProblems = await extensionBridge.send<string>("GET_MOCK_FILE", { owner: repository.owner, repo: repository.repo, path: "problems.json" });
          const extStats = await extensionBridge.send<string>("GET_MOCK_FILE", { owner: repository.owner, repo: repository.repo, path: "stats.json" });
          if (extProblems && extStats) {
            return {
              problems: JSON.parse(extProblems) as ProblemRecord[],
              stats: JSON.parse(extStats) as VaultStats,
              repository
            };
          }
        }
      } catch (e) {
        console.warn("Failed to get mock repo data from extension:", e);
      }
      return { problems: mockProblems as ProblemRecord[], stats: mockStats as VaultStats, repository };
    }
    const [problems, stats] = await Promise.all([
      getJson(raw(repository, "problems.json"), z.array(problemSchema), []),
      getJson(raw(repository, "stats.json"), statsSchema, {
        totalSolved: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        currentStreak: 0,
        longestStreak: 0,
        languages: {},
        topics: {},
        monthlySolves: {}
      })
    ]);
    return { problems: problems as ProblemRecord[], stats: stats as VaultStats, repository };
  },
  
  async getProblem(repository: RepositoryContext, folderName: string, language?: string): Promise<Partial<SolutionMetadata>> {
    // 1. Primary Source: Supabase Database submissions table
    const session = supabaseAuth.getSession();

    if (supabase && session?.user?.id) {
      try {
        let query = supabase
          .from("submissions")
          .select("*")
          .eq("folder_name", folderName);

        if (language) {
          query = query.eq("language", language);
        }

        const { data } = await query
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          return {
            problemId: data.problem_id,
            title: data.title,
            slug: data.slug,
            difficulty: data.difficulty,
            topics: data.topics || [],
            language: data.language,
            runtime: data.runtime,
            memory: data.memory,
            submissionDate: data.submitted_at,
            githubUrl: data.github_url || `https://github.com/${repository.owner}/${repository.repo}/blob/main/${folderName}`,
            leetCodeUrl: `https://leetcode.com/problems/${data.slug}/`,
            folderName: data.folder_name || folderName
          };
        }
      } catch (e) {}
    }

    if (repository.owner === "octocat") {
      try {
        const isInstalled = await extensionBridge.ping();
        if (isInstalled) {
          const extMeta = await extensionBridge.send<string>("GET_MOCK_FILE", { owner: repository.owner, repo: repository.repo, path: `${folderName}/metadata.json` });
          if (extMeta) {
            return JSON.parse(extMeta) as Partial<SolutionMetadata>;
          }
        }
      } catch (e) {
        console.warn("Failed to get mock problem meta from extension:", e);
      }
      return (mockMetadatas[folderName] || {
        problemId: 999,
        title: folderName.replace(/^\d+-/, "").replace(/-/g, " "),
        slug: folderName.replace(/^\d+-/, ""),
        difficulty: "Medium",
        topics: ["Algorithms"],
        language: "python3",
        runtime: "45 ms",
        memory: "16.8 MB",
        submissionDate: new Date().toISOString(),
        githubUrl: `https://github.com/octocat/leetcode-vault/blob/main/${folderName}/solution.py`,
        leetCodeUrl: `https://leetcode.com/problems/${folderName.replace(/^\d+-/, "")}/`,
        folderName
      }) as Partial<SolutionMetadata>;
    }
    return getJson(raw(repository, `${folderName}/metadata.json`), metadataSchema) as Promise<Partial<SolutionMetadata>>;
  },
  
  async getReadme(repository: RepositoryContext, folderName: string) {
    if (repository.owner === "octocat") {
      try {
        const isInstalled = await extensionBridge.ping();
        if (isInstalled) {
          const extReadme = await extensionBridge.send<string>("GET_MOCK_FILE", { owner: repository.owner, repo: repository.repo, path: `${folderName}/README.md` });
          if (extReadme) {
            return extReadme;
          }
        }
      } catch (e) {
        console.warn("Failed to get mock readme from extension:", e);
      }
      return `# ${folderName.replace(/^\d+-/, "").replace(/-/g, " ")}\n\nEasy to trace and beautiful solutions committed automatically by CodeVault.`;
    }
    const response = await fetch(raw(repository, `${folderName}/README.md`), { cache: "no-store" });
    return response.ok ? response.text() : "README unavailable.";
  },
  
  async getSolution(repository: RepositoryContext, folderName: string, language: string) {
    // 1. Primary Source: Supabase Database submissions table
    const session = supabaseAuth.getSession();

    if (supabase && session?.user?.id) {
      try {
        const slug = folderName.replace(/^\d+-/, "");
        let query = supabase
          .from("submissions")
          .select("source_code")
          .or(`folder_name.eq.${folderName},slug.eq.${slug}`);

        if (language) {
          query = query.ilike("language", language);
        }

        const { data } = await query
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data?.source_code) {
          return data.source_code;
        }
      } catch (e) {
        console.warn("Failed to fetch solution code from Supabase:", e);
      }
    }

    if (repository.owner === "octocat") {
      try {
        const isInstalled = await extensionBridge.ping();
        if (isInstalled) {
          const ext = extensions[language.toLowerCase()] ?? "txt";
          const extSol = await extensionBridge.send<string>("GET_MOCK_FILE", { owner: repository.owner, repo: repository.repo, path: `${folderName}/solution.${ext}` });
          if (extSol) {
            return extSol;
          }
        }
      } catch (e) {
        console.warn("Failed to get mock solution from extension:", e);
      }
      if (language.toLowerCase() === "python3" || language.toLowerCase() === "python") {
        return `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Simulated Solution\n        pass`;
      }
      return `// Simulated CodeVault Solution\nconsole.log("Hello from CodeVault!");`;
    }
    const response = await fetch(
      raw(repository, `${folderName}/solution.${extensions[language.toLowerCase()] ?? "txt"}`),
      { cache: "no-store" }
    );
    return response.ok ? response.text() : "Solution source unavailable.";
  }
};
