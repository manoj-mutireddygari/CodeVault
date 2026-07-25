"use client";
import { Grid2X2, List, Search } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRepository } from "../../../contexts/RepositoryContext";
import { useVault } from "../../../hooks/useVault";
import { EmptyState, ErrorState, LoadingGrid } from "../../../components/StatePanels";
import { ProblemTable } from "../../../components/ProblemTable";

export default function ProblemsPage() {
  const repository = useRepository();
  const vault = useVault(repository);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [view, setView] = useState<"table" | "grid">("table");

  const problems = useMemo(
    () =>
      vault.data?.problems.filter(
        (p) =>
          (difficulty === "All" || p.difficulty === difficulty) &&
          `${p.title} ${p.slug} ${p.language} ${p.topics.join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase())
      ) ?? [],
    [vault.data, query, difficulty]
  );

  if (!repository) return <main className="page"><EmptyState /></main>;
  if (vault.isLoading) return <main className="page"><LoadingGrid /></main>;
  if (vault.isError) return <main className="page"><ErrorState error={vault.error} retry={() => vault.refetch()} /></main>;

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">SOLUTION LIBRARY</p>
          <h1>Explore your work</h1>
          <p>{problems.length} of {vault.data.problems.length} solutions shown</p>
        </div>
      </div>

      <div className="controls">
        <label>
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems, topics, languages…"
          />
        </label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          aria-label="Filter difficulty"
        >
          {["All", "Easy", "Medium", "Hard"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <button
          aria-label="Table view"
          className={view === "table" ? "selected" : ""}
          onClick={() => setView("table")}
        >
          <List size={17} />
        </button>
        <button
          aria-label="Grid view"
          className={view === "grid" ? "selected" : ""}
          onClick={() => setView("grid")}
        >
          <Grid2X2 size={17} />
        </button>
      </div>

      {!problems.length ? (
        <EmptyState title="No matching problems" body="Try a different search or filter." />
      ) : view === "table" ? (
        <div className="glass-card">
          <ProblemTable problems={problems} />
        </div>
      ) : (
        <section className="problem-grid">
          {problems.map((problem, index) => (
            <Link
              className="problem-card"
              href={`/dashboard/problems/${problem.folderName}?lang=${encodeURIComponent(problem.language)}`}
              key={`${problem.id}-${problem.language}-${index}`}
            >
              <span className={`badge ${problem.difficulty.toLowerCase()}`}>
                {problem.difficulty}
              </span>
              <small>#{String(problem.id).padStart(4, "0")}</small>
              <h2>{problem.title}</h2>
              <p>{problem.topics.join(" · ") || "No topics"}</p>
              <footer>
                <span>{problem.language}</span>
                <span>{new Date(problem.solvedAt).toLocaleDateString()}</span>
              </footer>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
