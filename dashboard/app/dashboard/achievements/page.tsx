"use client";
import { Lock, Trophy } from "lucide-react";
import React from "react";
import { useRepository } from "../../../contexts/RepositoryContext";
import { useVault } from "../../../hooks/useVault";
import { achievementProgress } from "../../../features/analytics/metrics";
import { EmptyState, ErrorState, LoadingGrid } from "../../../components/StatePanels";

export default function AchievementsPage() {
  const repository = useRepository();
  const vault = useVault(repository);

  if (!repository) return <main className="page"><EmptyState /></main>;
  if (vault.isLoading) return <main className="page"><LoadingGrid /></main>;
  if (vault.isError) return <main className="page"><ErrorState error={vault.error} retry={() => vault.refetch()} /></main>;

  const items = achievementProgress(vault.data.stats, vault.data.problems);
  const unlockedCount = items.filter((x) => x.value >= x.goal).length;

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">MILESTONES</p>
          <h1>Achievements</h1>
          <p>Small wins, clearly earned. Progress is calculated from your repository.</p>
        </div>
        <div className="achievement-count">
          <Trophy size={18} />
          {unlockedCount} unlocked
        </div>
      </div>

      <section className="achievement-grid">
        {items.map((item) => {
          const unlocked = item.value >= item.goal;
          return (
            <article className={`achievement ${unlocked ? "unlocked" : ""}`} key={item.title}>
              <div className="achievement-icon">
                {unlocked ? item.icon : <Lock size={17} />}
              </div>
              <div>
                <h2>{item.title}</h2>
                <p>{item.detail}</p>
                <div className="progress">
                  <i
                    style={{
                      "--progress": `${Math.min((item.value / item.goal) * 100, 100)}%`,
                    } as React.CSSProperties}
                  />
                </div>
                <small>{Math.min(item.value, item.goal)} / {item.goal}</small>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
