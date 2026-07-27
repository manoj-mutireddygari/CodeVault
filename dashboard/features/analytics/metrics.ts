import type { ProblemRecord, VaultStats } from "@codevault/shared";

export type Timeframe = "days" | "weeks" | "months" | "years";

export interface ChartDataPoint {
  label: string;
  shortLabel: string;
  solves: number;
  dateKey: string;
}

export const average = (values: number[]) =>
  values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

export const periodLabel = (date: string) =>
  new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(date));

export function chartData(stats: VaultStats) {
  return Object.entries(stats.monthlySolves)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, solves]) => ({ month: periodLabel(`${month}-01`), solves }));
}

function getWeekStartDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(date: Date, timeframe: Timeframe): { key: string; label: string; shortLabel: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if (timeframe === "days") {
    const mStr = String(month + 1).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    return {
      key: `${year}-${mStr}-${dStr}`,
      label: `${monthNames[month]} ${day}, ${year}`,
      shortLabel: `${monthNames[month]} ${day}`,
    };
  }

  if (timeframe === "weeks") {
    const weekStart = getWeekStartDate(date);
    const wsYear = weekStart.getFullYear();
    const wsMonth = weekStart.getMonth();
    const wsDay = weekStart.getDate();
    const mStr = String(wsMonth + 1).padStart(2, "0");
    const dStr = String(wsDay).padStart(2, "0");
    return {
      key: `${wsYear}-${mStr}-${dStr}`,
      label: `Week of ${monthNames[wsMonth]} ${wsDay}, ${wsYear}`,
      shortLabel: `${monthNames[wsMonth]} ${wsDay}`,
    };
  }

  if (timeframe === "years") {
    return {
      key: `${year}`,
      label: `${year}`,
      shortLabel: `${year}`,
    };
  }

  // default: months
  const mStr = String(month + 1).padStart(2, "0");
  return {
    key: `${year}-${mStr}`,
    label: `${monthNames[month]} ${year}`,
    shortLabel: `${monthNames[month]} '${String(year).slice(2)}`,
  };
}

export function aggregateSolvesOverTime(
  problems: ProblemRecord[] = [],
  stats?: VaultStats,
  timeframe: Timeframe = "days"
): ChartDataPoint[] {
  const validDates: Date[] = [];
  const rawCounts = new Map<string, number>();

  for (const p of problems) {
    if (!p.solvedAt) continue;
    const d = new Date(p.solvedAt);
    if (!isNaN(d.getTime())) {
      validDates.push(d);
    }
  }

  let minDate: Date;
  let maxDate: Date = new Date();

  if (validDates.length > 0) {
    validDates.sort((a, b) => a.getTime() - b.getTime());
    minDate = new Date(validDates[0]);
    const lastDate = validDates[validDates.length - 1];
    if (lastDate > maxDate) maxDate = new Date(lastDate);
  } else if (stats && stats.monthlySolves && Object.keys(stats.monthlySolves).length > 0) {
    const keys = Object.keys(stats.monthlySolves).sort();
    minDate = new Date(`${keys[0]}-01`);
    const lastKey = keys[keys.length - 1];
    const lastDate = new Date(`${lastKey}-01`);
    if (lastDate > maxDate) maxDate = lastDate;
  } else {
    minDate = new Date();
    minDate.setMonth(minDate.getMonth() - 5);
  }

  minDate = new Date(minDate);
  maxDate = new Date(maxDate);

  if (timeframe === "days") {
    const diffDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24);
    if (diffDays < 365) {
      minDate = new Date(maxDate);
      minDate.setDate(maxDate.getDate() - 365);
    }
  } else if (timeframe === "weeks") {
    const diffWeeks = (maxDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24 * 7);
    if (diffWeeks < 104) {
      minDate = new Date(maxDate);
      minDate.setDate(maxDate.getDate() - (104 * 7));
    }
  } else if (timeframe === "months") {
    const diffMonths = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth());
    if (diffMonths < 36) {
      minDate = new Date(maxDate);
      minDate.setMonth(maxDate.getMonth() - 36);
    }
  } else if (timeframe === "years") {
    const diffYears = maxDate.getFullYear() - minDate.getFullYear();
    if (diffYears < 5) {
      minDate = new Date(maxDate);
      minDate.setFullYear(maxDate.getFullYear() - 5);
    }
  }

  if (validDates.length > 0) {
    for (const p of problems) {
      if (!p.solvedAt) continue;
      const d = new Date(p.solvedAt);
      if (isNaN(d.getTime())) continue;
      const { key } = formatDateKey(d, timeframe);
      rawCounts.set(key, (rawCounts.get(key) || 0) + 1);
    }
  } else if (stats && stats.monthlySolves) {
    if (timeframe === "years") {
      for (const [mKey, solves] of Object.entries(stats.monthlySolves)) {
        const yKey = mKey.slice(0, 4);
        rawCounts.set(yKey, (rawCounts.get(yKey) || 0) + solves);
      }
    } else {
      for (const [mKey, solves] of Object.entries(stats.monthlySolves)) {
        rawCounts.set(mKey, solves);
      }
    }
  }

  const result: ChartDataPoint[] = [];

  if (timeframe === "days") {
    const curr = new Date(minDate);
    curr.setHours(0, 0, 0, 0);
    const end = new Date(maxDate);
    end.setHours(23, 59, 59, 999);

    while (curr <= end) {
      const { key, label, shortLabel } = formatDateKey(curr, "days");
      result.push({
        label,
        shortLabel,
        solves: rawCounts.get(key) || 0,
        dateKey: key,
      });
      curr.setDate(curr.getDate() + 1);
    }
  } else if (timeframe === "weeks") {
    let curr = getWeekStartDate(minDate);
    const end = maxDate;

    while (curr <= end) {
      const { key, label, shortLabel } = formatDateKey(curr, "weeks");
      result.push({
        label,
        shortLabel,
        solves: rawCounts.get(key) || 0,
        dateKey: key,
      });
      curr = new Date(curr.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  } else if (timeframe === "months") {
    const curr = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

    while (curr <= end) {
      const { key, label, shortLabel } = formatDateKey(curr, "months");
      result.push({
        label,
        shortLabel,
        solves: rawCounts.get(key) || 0,
        dateKey: key,
      });
      curr.setMonth(curr.getMonth() + 1);
    }
  } else if (timeframe === "years") {
    let y = minDate.getFullYear();
    const endY = maxDate.getFullYear();

    while (y <= endY) {
      const curr = new Date(y, 0, 1);
      const { key, label, shortLabel } = formatDateKey(curr, "years");
      result.push({
        label,
        shortLabel,
        solves: rawCounts.get(key) || 0,
        dateKey: key,
      });
      y++;
    }
  }

  return result;
}

export function aggregateDayOfWeekSolves(problems: ProblemRecord[] = []) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts: Record<string, number> = {
    Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
  };

  for (const p of problems) {
    if (!p.solvedAt) continue;
    const d = new Date(p.solvedAt);
    if (isNaN(d.getTime())) continue;
    const dayName = days[d.getDay()];
    if (counts[dayName] !== undefined) {
      counts[dayName] += 1;
    }
  }

  const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return order.map((day) => ({ day, solves: counts[day] || 0 }));
}

export function aggregateTopicDistribution(topics: Record<string, number> = {}) {
  const entries = Object.entries(topics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  return entries.map(([topic, count]) => ({ topic, count }));
}

export function calculateAnalyticsSummary(stats: VaultStats) {
  const total = stats.totalSolved || 0;
  const easyPct = total ? Math.round((stats.easy / total) * 100) : 0;
  const medPct = total ? Math.round((stats.medium / total) * 100) : 0;
  const hardPct = total ? Math.round((stats.hard / total) * 100) : 0;

  const topicCount = Object.keys(stats.topics || {}).length;
  const topTopicEntry = Object.entries(stats.topics || {}).sort((a, b) => b[1] - a[1])[0];
  const topTopic = topTopicEntry ? topTopicEntry[0] : "N/A";

  const langCount = Object.keys(stats.languages || {}).length;
  const topLangEntry = Object.entries(stats.languages || {}).sort((a, b) => b[1] - a[1])[0];
  const topLang = topLangEntry ? topLangEntry[0] : "N/A";
  const topLangCount = topLangEntry ? topLangEntry[1] : 0;
  const topLangPct = total ? Math.round((topLangCount / total) * 100) : 0;

  return {
    totalSolved: total,
    easyPct,
    medPct,
    hardPct,
    topicCount,
    topTopic,
    langCount,
    topLang,
    topLangPct,
    currentStreak: stats.currentStreak || 0,
    longestStreak: stats.longestStreak || 0,
  };
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


