"use client";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  AreaChart, Area, CartesianGrid
} from "recharts";
import { useRepository } from "../../../contexts/RepositoryContext";
import { useVault } from "../../../hooks/useVault";
import { EmptyState, ErrorState, LoadingGrid } from "../../../components/StatePanels";
import { chartData } from "../../../features/analytics/metrics";

const colors = ["#6962f7", "#8b87ff", "#b8b5ff", "#e0dfff", "#5bc5c1"];

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
                  <Cell key={i} fill={colors[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend">
            {difficulty.map((item, i) => (
              <span key={item.name}>
                <i style={{ background: colors[i] }} />
                {item.name} <b>{item.value}</b>
              </span>
            ))}
          </div>
        </article>

        {/* Language Bar */}
        <article className="glass-card chart">
          <h2>Languages used</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={languages}>
              <XAxis dataKey="name" fontSize={11} />
              <YAxis allowDecimals={false} fontSize={11} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#6962f7" />
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
