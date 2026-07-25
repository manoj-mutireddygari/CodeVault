import type { ProblemRecord, VaultStats } from "@codevault/shared";

export const average = (values: number[]) =>
  values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

export const periodLabel = (date: string) =>
  new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(date));

export function chartData(stats: VaultStats) {
  return Object.entries(stats.monthlySolves)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, solves]) => ({ month: periodLabel(`${month}-01`), solves }));
}

export function achievementProgress(stats: VaultStats, problems: ProblemRecord[]) {
  return [
    { title: "First commit", detail: "Save your first solution", value: stats.totalSolved, goal: 1, icon: "✦" },
    { title: "Tenfold", detail: "Solve 10 problems", value: stats.totalSolved, goal: 10, icon: "10" },
    { title: "Week on fire", detail: "Reach a 7-day streak", value: stats.currentStreak, goal: 7, icon: "7" },
    { title: "Explorer", detail: "Use 5 distinct topics", value: Object.keys(stats.topics).length, goal: 5, icon: "◎" },
    { title: "Polyglot", detail: "Use 3 languages", value: Object.keys(stats.languages).length, goal: 3, icon: "⌘" },
    { title: "Hard solver", detail: "Solve 5 hard problems", value: stats.hard, goal: 5, icon: "H" }
  ];
}
