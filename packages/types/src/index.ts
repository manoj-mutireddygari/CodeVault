export type Difficulty = "Easy" | "Medium" | "Hard" | "Unknown";

// Supabase User Profile Schema
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  github_username?: string;
  plan: "free" | "pro" | "developer";
  created_at: string;
  updated_at: string;
}

// Supabase Repository Table Schema
export interface RepositoryRecord {
  id: string;
  user_id: string;
  repository_name: string;
  repository_owner?: string;
  visibility: "public" | "private";
  default_branch: string;
  github_repository_id?: number;
  github_token?: string;
  last_sync?: string;
  created_at: string;
}

// Supabase Settings Table Schema
export interface UserSettings {
  user_id: string;
  theme: "light" | "dark" | "system";
  animations: boolean;
  compact_mode: boolean;
  notifications: boolean;
  default_page: string;
  refresh_interval: number;
  updated_at: string;
}

// Session & OAuth Auth State
export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    githubUsername?: string;
  };
  repository?: {
    owner: string;
    name: string;
    visibility: "public" | "private";
  };
}

// Submission & Vault Data Structures
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
