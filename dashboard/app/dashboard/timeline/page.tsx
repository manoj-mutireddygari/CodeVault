"use client";

export const dynamic = "force-dynamic";
import { GitFork } from "lucide-react";
import { useRepository } from "../../../contexts/RepositoryContext";
import { useVault } from "../../../hooks/useVault";
import { EmptyState, ErrorState, LoadingGrid } from "../../../components/StatePanels";

export default function TimelinePage() {
  const repository = useRepository();
  const vault = useVault(repository);

  if (!repository) return <main className="page"><EmptyState /></main>;
  if (vault.isLoading) return <main className="page"><LoadingGrid /></main>;
  if (vault.isError) return <main className="page"><ErrorState error={vault.error} retry={() => vault.refetch()} /></main>;

  const groups = Object.entries(
    vault.data.problems.reduce<Record<string, typeof vault.data.problems>>((all, item) => {
      const key = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(
        new Date(item.solvedAt)
      );
      (all[key] ??= []).push(item);
      return all;
    }, {})
  );

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">ACTIVITY LOG</p>
          <h1>Your solution timeline</h1>
          <p>Every timestamped sync, straight from GitHub.</p>
        </div>
      </div>

      {groups.length ? (
        <div className="timeline">
          {groups.map(([period, items]) => (
            <section key={period}>
              <h2>{period}</h2>
              {items.map((item, idx) => (
                <article key={`${item.id}-${item.folderName}-${item.language}-${idx}`}>
                  <i />
                  <div>
                    <span className={`badge ${item.difficulty.toLowerCase()}`}>
                      {item.difficulty}
                    </span>
                    <h3>#{item.id} · {item.title}</h3>
                    <p>{item.language} · {item.topics.join(", ") || "No topics"}</p>
                    <time>{new Date(item.solvedAt).toLocaleString()}</time>
                  </div>
                  <a
                    aria-label="Open on GitHub"
                    target="_blank"
                    href={`https://github.com/${repository.owner}/${repository.repo}/tree/main/${item.folderName}`}
                  >
                    <GitFork size={17} />
                  </a>
                </article>
              ))}
            </section>
          ))}
        </div>
      ) : (
        <EmptyState title="No activity yet" />
      )}
    </main>
  );
}
