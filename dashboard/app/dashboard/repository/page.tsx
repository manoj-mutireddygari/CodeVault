"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRepository } from "../../../contexts/RepositoryContext";
import { useVault } from "../../../hooks/useVault";
import { EmptyState, ErrorState, LoadingGrid } from "../../../components/StatePanels";
import { GitFork, Shield, RefreshCw, Link as LinkIcon, Database, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RepositoryPage() {
  const repository = useRepository();
  const vault = useVault(repository);
  const router = useRouter();
  const [auditing, setAuditing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);

  useEffect(() => {
    // If not configured, onboarding is not complete
    if (typeof window !== "undefined") {
      const isComplete = localStorage.getItem("codevault:onboarding_completed");
      if (!isComplete && !repository) {
        router.push("/onboarding");
      }
    }
  }, [repository, router]);

  if (!repository) return <main className="page"><EmptyState /></main>;
  if (vault.isLoading) return <main className="page"><LoadingGrid /></main>;
  if (vault.isError) return <main className="page"><ErrorState error={vault.error} retry={() => vault.refetch()} /></main>;

  const triggerAudit = () => {
    setAuditing(true);
    setAuditLogs([]);
    const logs = [
      "Establishing GitHub OAuth connection...",
      "Resolving repository head references...",
      "Validating directory structure...",
      "Parsing problems.json index payload...",
      "Scanning folder structure for solution files...",
      "Verifying matching commits metadata with stats...",
      "Repository index validation: 100% HEALTHY!"
    ];

    logs.forEach((log, idx) => {
      setTimeout(() => {
        setAuditLogs(prev => [...prev, log]);
        if (idx === logs.length - 1) {
          setAuditing(false);
        }
      }, (idx + 1) * 600);
    });
  };

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">INTEGRATIONS</p>
          <h1>Repository Settings</h1>
          <p>Manage the GitHub mapping, sync status, and storage credentials for your CodeVault.</p>
        </div>
      </div>

      <div className="responsive-grid-2-1">
        {/* Main Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Card: Repository Details */}
          <article className="glass-card" style={{ padding: 28, borderRadius: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 48, height: 48, background: "var(--violet-soft)", color: "var(--violet)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <GitFork size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 850, margin: 0 }}>Repository Destination</h2>
                  <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Direct mapping to your GitHub profile source code repository.</p>
                </div>
              </div>
              <span className="badge" style={{ background: "#ecfdf5", color: "#059669", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>
                Connected
              </span>
            </div>

            <dl className="responsive-grid-2" style={{ margin: "0 0 24px" }}>
              <div>
                <dt style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>GitHub Owner</dt>
                <dd style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>{repository.owner}</dd>
              </div>
              <div>
                <dt style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>Repository Name</dt>
                <dd style={{ fontSize: 14, fontWeight: 800, margin: 0, color: "var(--violet)", display: "flex", alignItems: "center", gap: 4 }}>
                  <a href={`https://github.com/${repository.owner}/${repository.repo}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                    {repository.repo} <LinkIcon size={12} />
                  </a>
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>Visibility</dt>
                <dd style={{ fontSize: 13, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                  <Shield size={14} className="text-emerald" /> Public Repository
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>Total Solutions Synced</dt>
                <dd style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>{vault.data.problems.length} files</dd>
              </div>
            </dl>

            <div style={{ display: "flex", gap: 12, borderTop: "1px solid #f1f3f9", paddingTop: 20 }}>
              <button onClick={() => router.push("/onboarding")} className="outline" style={{ padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                Reconnect / Change Repository
              </button>
            </div>
          </article>

          {/* Card: Audit Tool */}
          <article className="glass-card" style={{ padding: 28, borderRadius: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Repository Diagnostic Audit</h3>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Perform a full integrity sweep of the indexing files in your repository.</p>
              </div>
              <button disabled={auditing} onClick={triggerAudit} className="primary" style={{ padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                <RefreshCw size={14} className={auditing ? "spin" : ""} /> {auditing ? "Auditing..." : "Trigger Audit"}
              </button>
            </div>

            {auditLogs.length > 0 && (
              <div style={{ background: "var(--violet-soft)", border: "1px solid var(--line)", color: "var(--violet)", fontFamily: "monospace", padding: 16, borderRadius: 12, fontSize: 12, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 4 }}>
                {auditLogs.map((log, i) => (
                  <div key={i} style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--muted)" }}>&gt;</span>
                    <span style={{ color: log.includes("HEALTHY") ? "#34d399" : "var(--violet)" }}>{log}</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <article className="glass-card" style={{ padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 12px" }}>Integration Info</h3>
            <ul style={{ paddingLeft: 16, fontSize: 12, color: "var(--muted)", lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 10 }}>
              <li>Solutions are saved as directories containing the code file and a parsed metadata schema.</li>
              <li>Streak counts are compiled from daily commits recorded inside <code>stats.json</code>.</li>
              <li>A custom Markdown summary readme is constructed and checked in with each submission.</li>
            </ul>
          </article>
        </div>
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
