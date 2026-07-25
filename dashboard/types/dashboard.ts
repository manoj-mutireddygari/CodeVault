import type { ProblemRecord, SolutionMetadata, VaultStats } from "@codevault/shared";
export type RepositoryContext = { owner: string; repo: string };
export type VaultData = { problems: ProblemRecord[]; stats: VaultStats; repository: RepositoryContext };
export type DetailedProblem = ProblemRecord & Partial<SolutionMetadata>;
export type AppError = "missing-repository" | "unavailable" | "rate-limited" | "offline";
