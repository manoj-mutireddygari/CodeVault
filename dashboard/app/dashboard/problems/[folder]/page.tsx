"use client";
import { useParams, useSearchParams } from "next/navigation";
import { ExternalLink, GitFork, ChevronLeft, Terminal, Code2 } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useRepository } from "../../../../contexts/RepositoryContext";
import { useVault, useProblem, useSolutionCode } from "../../../../hooks/useVault";
import { EmptyState, LoadingGrid } from "../../../../components/StatePanels";
import { MacOsCodeViewer } from "../../../../components/MacOsCodeViewer";

export default function ProblemDetail() {
  const folder = useParams<{ folder: string }>().folder;
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const repository = useRepository();
  const vault = useVault(repository);

  // Find all language submissions for this problem folder
  const allSubmissions = useMemo(
    () => vault.data?.problems.filter((p) => p.folderName === folder) ?? [],
    [vault.data, folder]
  );

  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const activeLanguage = useMemo(() => {
    if (selectedLanguage) return selectedLanguage;
    if (langParam && allSubmissions.some((s) => s.language.toLowerCase() === langParam.toLowerCase())) {
      return langParam;
    }
    return allSubmissions[0]?.language ?? "";
  }, [selectedLanguage, langParam, allSubmissions]);

  const activeSubmission = useMemo(
    () =>
      allSubmissions.find((s) => s.language.toLowerCase() === activeLanguage.toLowerCase()) ??
      allSubmissions[0],
    [allSubmissions, activeLanguage]
  );

  const metadata = useProblem(repository, folder, activeSubmission?.language);
  const solutionCode = useSolutionCode(repository, folder, activeSubmission?.language);

  if (!repository) return <main className="page"><EmptyState /></main>;
  if (vault.isLoading || metadata.isLoading) return <main className="page"><LoadingGrid /></main>;

  if (!activeSubmission) {
    return (
      <main className="page">
        <EmptyState title="Problem not found" body="This solution is no longer present in the repository index." />
      </main>
    );
  }

  const m = metadata.data;

  const getSolutionExtension = (lang: string) => {
    const l = lang.toLowerCase();
    if (l.includes("py")) return "py";
    if (l.includes("java") && !l.includes("script")) return "java";
    if (l.includes("js") || l.includes("javascript")) return "js";
    if (l.includes("ts") || l.includes("typescript")) return "ts";
    if (l.includes("cpp") || l.includes("c++")) return "cpp";
    if (l.includes("cs") || l.includes("c#")) return "cs";
    if (l.includes("go")) return "go";
    if (l.includes("rs") || l.includes("rust")) return "rs";
    return "txt";
  };

  const solutionFilePath = `${folder}/solution.${getSolutionExtension(activeSubmission.language)}`;
  const githubFileUrl = m?.githubUrl ?? `https://github.com/${repository.owner}/${repository.repo}/blob/main/${solutionFilePath}`;

  return (
    <main className="page">
      <Link className="back" href="/dashboard/problems">
        <ChevronLeft size={16} /> All problems
      </Link>
      <section className="detail-hero">
        <div>
          <p className="eyebrow">SOLUTION #{String(activeSubmission.id).padStart(4, "0")}</p>
          <h1>{activeSubmission.title}</h1>
          <div className="chips">
            <span className={`badge ${activeSubmission.difficulty.toLowerCase()}`}>{activeSubmission.difficulty}</span>
            {activeSubmission.topics.map(topic => (
              <span key={topic}>{topic}</span>
            ))}
          </div>
        </div>
        <div className="detail-actions">
          <a className="primary" target="_blank" href={githubFileUrl}>
            <GitFork size={15} /> GitHub
          </a>
          <a className="outline" target="_blank" href={m?.leetCodeUrl ?? `https://leetcode.com/problems/${activeSubmission.slug}/`}>
            <ExternalLink size={15} /> LeetCode
          </a>
        </div>
      </section>

      {allSubmissions.length > 1 && (
        <section className="language-selector glass-card" style={{ marginBottom: "1.5rem", padding: "1rem 1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--muted, #888)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Code2 size={16} /> Language Solutions ({allSubmissions.length}):
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {allSubmissions.map((sub) => {
                const isSelected = sub.language.toLowerCase() === activeSubmission.language.toLowerCase();
                return (
                  <button
                    key={sub.language}
                    onClick={() => setSelectedLanguage(sub.language)}
                    style={{
                      padding: "0.4rem 0.85rem",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: isSelected ? "1px solid var(--primary, #6366f1)" : "1px solid rgba(255,255,255,0.1)",
                      background: isSelected ? "rgba(99, 102, 241, 0.15)" : "rgba(255,255,255,0.05)",
                      color: isSelected ? "var(--primary-light, #818cf8)" : "inherit",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {sub.language}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="detail-grid">
        <article className="glass-card">
          <h2>Submission overview</h2>
          <dl>
            <div>
              <dt>Language</dt>
              <dd><b>{activeSubmission.language}</b></dd>
            </div>
            <div>
              <dt>Runtime</dt>
              <dd>{m?.runtime ?? "Not recorded"}</dd>
            </div>
            <div>
              <dt>Memory</dt>
              <dd>{m?.memory ?? "Not recorded"}</dd>
            </div>
            <div>
              <dt>Solved</dt>
              <dd>{new Date(activeSubmission.solvedAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Repository folder</dt>
              <dd>{folder}</dd>
            </div>
          </dl>
        </article>

        <MacOsCodeViewer
          code={solutionCode.data ?? ""}
          language={activeSubmission.language}
          githubUrl={githubFileUrl}
          isLoading={solutionCode.isLoading}
        />
      </section>
    </main>
  );
}
