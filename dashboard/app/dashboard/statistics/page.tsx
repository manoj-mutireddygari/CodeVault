"use client";

export const dynamic = "force-dynamic";
import { useState, useRef, useEffect } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  AreaChart, Area, CartesianGrid
} from "recharts";
import { BookOpen, Code2, Flame, Layers3 } from "lucide-react";
import { useRepository } from "../../../contexts/RepositoryContext";
import { useVault } from "../../../hooks/useVault";
import { EmptyState, ErrorState, LoadingGrid } from "../../../components/StatePanels";
import {
  aggregateSolvesOverTime,
  aggregateDayOfWeekSolves,
  aggregateTopicDistribution,
  calculateAnalyticsSummary,
  type Timeframe
} from "../../../features/analytics/metrics";

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
  const [timeframe, setTimeframe] = useState<Timeframe>("days");
  const [zoomRange, setZoomRange] = useState<{ start: number; end: number } | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartRange, setDragStartRange] = useState<{ start: number; end: number } | null>(null);

  const stats = vault.data?.stats;
  const problems = vault.data?.problems ?? [];

  const timeSeriesData = (stats || problems.length) ? aggregateSolvesOverTime(problems, stats, timeframe) : [];
  const totalPoints = timeSeriesData.length;

  const defaultSpan = Math.min(totalPoints, timeframe === "days" ? 45 : timeframe === "weeks" ? 24 : 12);

  const startIdx = zoomRange
    ? Math.max(0, Math.min(zoomRange.start, Math.max(0, totalPoints - 1)))
    : Math.max(0, totalPoints - defaultSpan);

  const endIdx = zoomRange
    ? Math.max(startIdx, Math.min(zoomRange.end, Math.max(0, totalPoints - 1)))
    : Math.max(0, totalPoints - 1);

  const visibleData = timeSeriesData.slice(startIdx, endIdx + 1);

  const isZoomed = zoomRange !== null && (startIdx > 0 || endIdx < Math.max(0, totalPoints - 1));

  const handleResetZoom = () => setZoomRange(null);

  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
    setZoomRange(null);
  };

  // Non-passive wheel event listener for trackpad & mouse wheel zooming/panning
  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el || totalPoints <= 1) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      setZoomRange((prevRange) => {
        const currentStart = prevRange ? prevRange.start : 0;
        const currentEnd = prevRange ? prevRange.end : totalPoints - 1;
        const currentSpan = currentEnd - currentStart;

        // Horizontal scroll via trackpad deltaX or Shift key with smooth dampening
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
          const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
          const shift = Math.round((delta / 250) * Math.max(1, currentSpan * 0.05));
          if (shift === 0) return prevRange;

          let newStart = currentStart + shift;
          let newEnd = currentEnd + shift;

          if (newStart < 0) {
            newEnd -= newStart;
            newStart = 0;
          }
          if (newEnd >= totalPoints) {
            newStart -= (newEnd - (totalPoints - 1));
            newEnd = totalPoints - 1;
          }
          return {
            start: Math.max(0, newStart),
            end: Math.min(totalPoints - 1, newEnd),
          };
        }

        // Vertical scroll / pinch gesture for smooth, low-speed zoom (4% step per tick)
        const isZoomingIn = e.deltaY < 0;
        const zoomStep = Math.max(1, Math.round(currentSpan * 0.04));

        let newStart = currentStart;
        let newEnd = currentEnd;

        if (isZoomingIn) {
          if (currentSpan <= 2) return prevRange;
          newStart = Math.min(currentEnd - 2, currentStart + Math.ceil(zoomStep / 2));
          newEnd = Math.max(newStart + 2, currentEnd - Math.floor(zoomStep / 2));
        } else {
          if (currentSpan >= totalPoints - 1) return null;
          newStart = Math.max(0, currentStart - Math.ceil(zoomStep / 2));
          newEnd = Math.min(totalPoints - 1, currentEnd + Math.floor(zoomStep / 2));
        }

        return { start: newStart, end: newEnd };
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [totalPoints]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (totalPoints <= 1) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartRange({ start: startIdx, end: endIdx });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRange || !chartContainerRef.current) return;
    const width = chartContainerRef.current.clientWidth || 500;
    const deltaX = e.clientX - dragStartX;
    const span = dragStartRange.end - dragStartRange.start;
    const indexShift = Math.round((-deltaX / width) * span);

    let newStart = dragStartRange.start + indexShift;
    let newEnd = dragStartRange.end + indexShift;

    if (newStart < 0) {
      newEnd -= newStart;
      newStart = 0;
    }
    if (newEnd >= totalPoints) {
      newStart -= (newEnd - (totalPoints - 1));
      newEnd = totalPoints - 1;
    }

    setZoomRange({
      start: Math.max(0, newStart),
      end: Math.min(totalPoints - 1, newEnd),
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  if (!repository) return <main className="page"><EmptyState /></main>;
  if (vault.isLoading) return <main className="page"><LoadingGrid /></main>;
  if (vault.isError) return <main className="page"><ErrorState error={vault.error} retry={() => vault.refetch()} /></main>;

  if (!stats) return <main className="page"><EmptyState /></main>;

  const difficulty = [
    { name: "Easy", value: stats.easy },
    { name: "Medium", value: stats.medium },
    { name: "Hard", value: stats.hard },
  ];
  const languages = Object.entries(stats.languages).map(([name, value]) => ({ name, value }));

  const summary = calculateAnalyticsSummary(stats);
  const dayOfWeekData = aggregateDayOfWeekSolves(problems);
  const topicDistData = aggregateTopicDistribution(stats.topics);

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">ANALYTICS</p>
          <h1>Progress, made visible</h1>
          <p>Executive developer metrics and algorithm insights tracked by your CodeVault repository.</p>
        </div>
      </div>

      {/* Analytics KPI Strip */}
      <section className="stats-kpi-grid">
        <article className="glass-card stats-kpi">
          <div className="stats-kpi-header">
            <div className="stats-kpi-icon"><Layers3 size={18} /></div>
            <small>Vault Preserved</small>
          </div>
          <strong>{summary.totalSolved}</strong>
          <p>Easy {summary.easyPct}% • Med {summary.medPct}% • Hard {summary.hardPct}%</p>
        </article>

        <article className="glass-card stats-kpi">
          <div className="stats-kpi-header">
            <div className="stats-kpi-icon"><BookOpen size={18} /></div>
            <small>Topic Coverage</small>
          </div>
          <strong>{summary.topicCount} <span className="kpi-unit">topics</span></strong>
          <p>Top focus: <b>{summary.topTopic}</b></p>
        </article>

        <article className="glass-card stats-kpi">
          <div className="stats-kpi-header">
            <div className="stats-kpi-icon"><Code2 size={18} /></div>
            <small>Dominant Language</small>
          </div>
          <strong>{summary.topLang}</strong>
          <p>{summary.topLangPct}% of total vault solutions</p>
        </article>

        <article className="glass-card stats-kpi">
          <div className="stats-kpi-header">
            <div className="stats-kpi-icon"><Flame size={18} /></div>
            <small>Streak Velocity</small>
          </div>
          <strong>{summary.currentStreak} <span className="kpi-unit">days</span></strong>
          <p>Personal best: <b>{summary.longestStreak} days</b></p>
        </article>
      </section>

      {/* Primary Chart Grid (Preserved Existing 3 Graphs) */}
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

        {/* Dynamic Solutions Over Time Area Chart */}
        <article className="glass-card chart wide">
          <div className="chart-header">
            <div>
              <h2>Problems solved</h2>
              <p className="chart-subtitle">Use trackpad pinch/scroll, mouse drag, or slider to zoom & pan all dates</p>
            </div>
            <div className="chart-controls">
              {totalPoints > 3 && (
                <div className="chart-zoom-slider">
                  <span className="zoom-label">Zoom</span>
                  <input
                    id="zoom-range-input"
                    type="range"
                    min={3}
                    max={totalPoints}
                    value={visibleData.length}
                    aria-label="Zoom level slider"
                    onChange={(e) => {
                      const newSpan = Number(e.target.value);
                      const center = Math.floor((startIdx + endIdx) / 2);
                      const half = Math.floor(newSpan / 2);
                      let s = Math.max(0, center - half);
                      let endP = s + newSpan - 1;
                      if (endP >= totalPoints) {
                        endP = totalPoints - 1;
                        s = Math.max(0, endP - newSpan + 1);
                      }
                      setZoomRange({ start: s, end: endP });
                    }}
                    className="zoom-slider-input"
                  />
                </div>
              )}
              {isZoomed && (
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="chart-reset-btn"
                >
                  Reset ({visibleData.length}/{totalPoints})
                </button>
              )}
              <select
                id="timeframe-select"
                aria-label="Select timeframe"
                value={timeframe}
                onChange={(e) => handleTimeframeChange(e.target.value as Timeframe)}
                className="chart-select"
              >
                <option value="days">Daily (Days)</option>
                <option value="weeks">Weekly (Weeks)</option>
                <option value="months">Monthly (Months)</option>
                <option value="years">Yearly (Years)</option>
              </select>
            </div>
          </div>

          <div
            ref={chartContainerRef}
            className="interactive-chart-viewport"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={visibleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#6962f7" stopOpacity=".28" />
                    <stop offset="1" stopColor="#6962f7" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef0f7" vertical={false} />
                <XAxis dataKey="shortLabel" fontSize={11} tickLine={false} minTickGap={20} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} fontSize={11} tickLine={false} />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [value, "Problems Solved"]}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  labelFormatter={(_, payload: any) => payload?.[0]?.payload?.label || ""}
                />
                <Area
                  type="monotone"
                  dataKey="solves"
                  stroke="#6962f7"
                  strokeWidth={3}
                  fill="url(#fill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      {/* Additional Professional Statistical Developments */}
      <section className="chart-grid" style={{ marginTop: 24 }}>
        {/* Topic Mastery Breakdown */}
        <article className="glass-card chart">
          <div className="chart-header">
            <div>
              <h2>Topic mastery breakdown</h2>
              <p className="chart-subtitle">Solution volume across algorithmic categories</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart layout="vertical" data={topicDistData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
              <CartesianGrid stroke="#eef0f7" horizontal={false} />
              <XAxis type="number" allowDecimals={false} fontSize={11} />
              <YAxis dataKey="topic" type="category" fontSize={11} width={100} tickLine={false} />
              <Tooltip formatter={(value) => [value, "Problems"]} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="#818cf8" fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        {/* Day-of-Week Productivity Rhythm */}
        <article className="glass-card chart">
          <div className="chart-header">
            <div>
              <h2>Day-of-week rhythm</h2>
              <p className="chart-subtitle">Weekly solution velocity by active day</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <CartesianGrid stroke="#eef0f7" vertical={false} />
              <XAxis dataKey="day" fontSize={11} tickLine={false} />
              <YAxis allowDecimals={false} fontSize={11} tickLine={false} />
              <Tooltip formatter={(value) => [value, "Problems Solved"]} />
              <Bar dataKey="solves" radius={[6, 6, 0, 0]} fill="#38bdf8" fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>
    </main>
  );
}



