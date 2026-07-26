"use client";

export const dynamic = "force-dynamic";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  AreaChart, Area, CartesianGrid
} from "recharts";
import { useRepository } from "../../../contexts/RepositoryContext";
import { useVault } from "../../../hooks/useVault";
import { EmptyState, ErrorState, LoadingGrid } from "../../../components/StatePanels";
import { chartData } from "../../../features/analytics/metrics";

/* ── Difficulty colours ─────────────────────────────────────────── */
const diffColors = ["#22c55e", "#f59e0b", "#f43f5e"];

/* ── Language brand colours + devicon logos ─────────────────────── */
const LANG_META: Record<string, { color: string; icon: string }> = {
  python:     { color: "#00ACD7", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  python3:    { color: "#00ACD7", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  javascript: { color: "#F7DF1E", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
  typescript: { color: "#3178C6", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  java:       { color: "#ED8B00", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
  "c++":      { color: "#00599C", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" },
  cpp:        { color: "#00599C", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" },
  c:          { color: "#A8B9CC", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" },
  "c#":       { color: "#9B4F96", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg" },
  csharp:     { color: "#9B4F96", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg" },
  go:         { color: "#38BDF8", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg" },
  golang:     { color: "#38BDF8", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg" },
  rust:       { color: "#CE422B", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg" },
  ruby:       { color: "#CC342D", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg" },
  swift:      { color: "#FA7343", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg" },
  kotlin:     { color: "#7F52FF", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg" },
  scala:      { color: "#DC322F", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scala/scala-original.svg" },
  dart:       { color: "#0175C2", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg" },
  php:        { color: "#777BB4", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
  r:          { color: "#276DC3", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/r/r-original.svg" },
};

function getLangMeta(name: string) {
  const key = name.toLowerCase().replace(/\s+/g, "");
  return LANG_META[key] ?? { color: "#6366f1", icon: "" };
}

/* ── Custom X-axis tick with logo ───────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LangTick({ x, y, payload }: { x?: any; y?: any; payload?: { value: string } }) {
  const meta = getLangMeta(payload?.value ?? "");
  const cx = Number(x ?? 0);
  const cy = Number(y ?? 0);

  return (
    <g transform={`translate(${cx},${cy})`}>
      {meta.icon ? (
        <image
          href={meta.icon}
          x={-14}
          y={6}
          width={28}
          height={28}
          style={{ borderRadius: 4 }}
        />
      ) : (
        <text
          x={0}
          y={16}
          textAnchor="middle"
          fontSize={10}
          fill="#888"
        >
          {payload?.value}
        </text>
      )}
    </g>
  );
}

export default function StatisticsPage() {
  const repository = useRepository();
  const vault = useVault(repository);

  if (!repository) return <main className="page"><EmptyState /></main>;
  if (vault.isLoading) return <main className="page"><LoadingGrid /></main>;
  if (vault.isError) return <main className="page"><ErrorState error={vault.error} retry={() => vault.refetch()} /></main>;

  const { stats } = vault.data;
  const difficulty = [
    { name: "Easy", value: stats.easy },
    { name: "Medium", value: stats.medium },
    { name: "Hard", value: stats.hard },
  ];
  const languages = Object.entries(stats.languages).map(([name, value]) => ({ name, value }));

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">ANALYTICS</p>
          <h1>Progress, made visible</h1>
          <p>Read-only insights from the stats tracked by your CodeVault repository.</p>
        </div>
      </div>

      <section className="chart-grid">
        {/* Difficulty Donut */}
        <article className="glass-card chart">
          <h2>Difficulty distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={difficulty}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
              >
                {difficulty.map((_, i) => (
                  <Cell key={i} fill={diffColors[i]} fillOpacity={0.85} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend">
            {difficulty.map((item, i) => (
              <span key={item.name}>
                <i style={{ background: diffColors[i] }} />
                {item.name} <b>{item.value}</b>
              </span>
            ))}
          </div>
        </article>

        {/* Language Bar */}
        <article className="glass-card chart">
          <h2>Languages used</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={languages} margin={{ bottom: 32 }}>
              <XAxis
                dataKey="name"
                tick={(props) => <LangTick {...props} />}
                interval={0}
                height={48}
              />
              <YAxis allowDecimals={false} fontSize={11} />
              <Tooltip
                formatter={(value, name) => [value, name]}
                labelFormatter={(label) => label}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fillOpacity={0.85}>
                {languages.map((entry) => (
                  <Cell key={entry.name} fill={getLangMeta(entry.name).color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>

        {/* Monthly Area */}
        <article className="glass-card chart wide">
          <h2>Monthly solutions</h2>
          <ResponsiveContainer width="100%" height={265}>
            <AreaChart data={chartData(stats)}>
              <defs>
                <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#6962f7" stopOpacity=".28" />
                  <stop offset="1" stopColor="#6962f7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#eef0f7" vertical={false} />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis allowDecimals={false} fontSize={11} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="solves"
                stroke="#6962f7"
                strokeWidth={3}
                fill="url(#fill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </article>
      </section>
    </main>
  );
}
