"use client";
import { motion } from "framer-motion";
import { CalendarDays, Flame, Layers3, Target } from "lucide-react";
import { ProblemTable } from "../../components/ProblemTable";
import { EmptyState, ErrorState, LoadingGrid } from "../../components/StatePanels";
import { useRepository } from "../../contexts/RepositoryContext";
import { useVault } from "../../hooks/useVault";
import { OnboardingModal } from "../../components/OnboardingModal";
import { useState, useEffect } from "react";

const ONBOARDING_KEY = "codevault:onboarding_completed";

const cards = (s: {
  totalSolved: number;
  currentStreak: number;
  longestStreak: number;
  languages: Record<string, number>;
}) =>
  [
    ["Total solved", s.totalSolved, Layers3, "All time"],
    ["Current streak", s.currentStreak, Flame, "Days in a row"],
    ["Longest streak", s.longestStreak, Target, "Personal best"],
    ["Languages", Object.keys(s.languages).length, CalendarDays, "In your vault"],
  ] as const;

export default function DashboardPage() {
  const repository = useRepository();
  const vault = useVault(repository);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY) === "true";
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    window.location.reload();
  };

  if (vault.isLoading) return (
    <>
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      <main className="page"><LoadingGrid /></main>
    </>
  );

  if (vault.isError) return (
    <>
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      <main className="page"><ErrorState error={vault.error} retry={() => vault.refetch()} /></main>
    </>
  );

  if (!repository) {
    return (
      <>
        {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
        <main className="page" style={{ filter: showOnboarding ? "blur(4px)" : "none", transition: "filter 0.3s" }}>
          <EmptyState
            title="GitHub Not Connected"
            body="Complete the setup wizard to connect your GitHub repository."
            illustration="github"
          />
        </main>
      </>
    );
  }

  const { stats, problems } = vault.data;

  return (
    <>
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      <main className="page" style={{ filter: showOnboarding ? "blur(4px)" : "none", transition: "filter 0.3s", pointerEvents: showOnboarding ? "none" : "auto" }}>
        {/* Hero */}
        <section className="hero">
          <div>
            <p className="eyebrow">YOUR DEVELOPER JOURNEY</p>
            <h1>Ship solutions.<br /><em>See momentum.</em></h1>
            <p>Every accepted LeetCode submission, organized and measured from your GitHub vault.</p>
          </div>
          <div className="hero-orbit">
            <span>{stats.totalSolved}</span>
            <small>problems preserved</small>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="kpi-grid">
          {cards(stats).map(([label, value, Icon, detail], index) => (
            <motion.article
              className="glass-card kpi"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              key={label}
            >
              <div className="kpi-icon"><Icon size={18} /></div>
              <small>{label}</small>
              <strong>{value}</strong>
              <p>{detail}</p>
            </motion.article>
          ))}
        </section>

        {/* Dashboard Grid */}
        <section className="dashboard-grid">
          <article className="glass-card insight">
            <header>
              <div>
                <p className="eyebrow">AT A GLANCE</p>
                <h2>Solution profile</h2>
              </div>
            </header>
            <div className="profile-stats">
              <div><b>{stats.easy}</b><span>Easy</span></div>
              <div><b>{stats.medium}</b><span>Medium</span></div>
              <div><b>{stats.hard}</b><span>Hard</span></div>
            </div>
            <div className="topic-list">
              {Object.entries(stats.topics)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([topic, count]) => (
                  <span key={topic}>{topic}<b>{count}</b></span>
                ))}
            </div>
          </article>

          <article className="glass-card insight activity">
            <p className="eyebrow">LATEST SYNC</p>
            {problems[0] ? (
              <>
                <h2>{problems[0].title}</h2>
                <p>Saved to <b>{repository.repo}</b> on GitHub</p>
                <a href={`https://github.com/${repository.owner}/${repository.repo}`} target="_blank">
                  View repository →
                </a>
              </>
            ) : (
              <EmptyState
                title="No submissions yet"
                body="Your accepted LeetCode submissions will appear here after the first sync."
              />
            )}
          </article>
        </section>

        {/* Recent Solutions */}
        <section className="section-head">
          <div>
            <p className="eyebrow">RECENT WORK</p>
            <h2>Latest solutions</h2>
          </div>
        </section>

        {problems.length ? (
          <div className="glass-card">
            <ProblemTable problems={problems} compact />
          </div>
        ) : (
          <EmptyState title="Ready for your first solution" />
        )}
      </main>
    </>
  );
}
