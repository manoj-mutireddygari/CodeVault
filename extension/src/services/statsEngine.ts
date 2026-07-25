import { emptyStats, type ProblemRecord, type VaultStats } from "@codevault/shared";
const day = (iso: string) => iso.slice(0, 10);
export function updatedStats(previous: VaultStats | undefined, problem: ProblemRecord): VaultStats {
  const stats = structuredClone(previous ?? emptyStats()); const difficulty = problem.difficulty.toLowerCase() as "easy" | "medium" | "hard";
  stats.totalSolved += 1; if (difficulty in stats) stats[difficulty] += 1;
  stats.languages[problem.language] = (stats.languages[problem.language] ?? 0) + 1;
  for (const topic of problem.topics) stats.topics[topic] = (stats.topics[topic] ?? 0) + 1;
  const month = problem.solvedAt.slice(0, 7); stats.monthlySolves[month] = (stats.monthlySolves[month] ?? 0) + 1;
  const previousDay = stats.lastSolved ? day(stats.lastSolved) : undefined; const today = day(problem.solvedAt);
  if (previousDay !== today) { const yesterday = new Date(`${today}T00:00:00Z`); yesterday.setUTCDate(yesterday.getUTCDate() - 1); stats.currentStreak = previousDay === yesterday.toISOString().slice(0, 10) ? stats.currentStreak + 1 : 1; }
  stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak); stats.lastSolved = problem.solvedAt; return stats;
}
