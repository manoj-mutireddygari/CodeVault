export type Difficulty = "Easy" | "Medium" | "Hard" | "Unknown";

export interface Submission {
  problemId: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
  topics: string[];
  language: string;
  runtime?: string;
  memory?: string;
  submittedAt: string;
  sourceCode: string;
  leetCodeUrl: string;
}

export interface SolutionMetadata extends Omit<Submission, "sourceCode" | "submittedAt"> {
  submissionDate: string;
  githubUrl: string;
  folderName: string;
}

export interface ProblemRecord {
  id: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
  language: string;
  topics: string[];
  solvedAt: string;
  folderName: string;
}

export interface VaultStats {
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  currentStreak: number;
  longestStreak: number;
  languages: Record<string, number>;
  topics: Record<string, number>;
  lastSolved?: string;
  monthlySolves: Record<string, number>;
}

export const folderNameFor = (id: number, slug: string) =>
  `${String(id).padStart(4, "0")}-${slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

export const emptyStats = (): VaultStats => ({
  totalSolved: 0, easy: 0, medium: 0, hard: 0, currentStreak: 0, longestStreak: 0,
  languages: {}, topics: {}, monthlySolves: {}
});
