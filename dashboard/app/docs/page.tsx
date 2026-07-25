"use client";

import { GitFork, Shield, Zap } from "lucide-react";

export default function DocsPage() {
  return (
    <main className="page" style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: 40 }}>
        <p className="eyebrow">DOCUMENTATION</p>
        <h1 style={{ fontSize: 38, fontWeight: 850, letterSpacing: "-0.04em", margin: "8px 0 12px" }}>
          CodeVault Architecture & Docs
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
          System design overview, Supabase identity provider, and GitHub sync engine specification.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <section className="glass-card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 10 }}>
            <Zap size={20} style={{ color: "var(--violet)" }} />
            1. Client-Platform Relationship
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
            CodeVault separates execution client responsibilities from platform services. The Chrome extension listens for accepted LeetCode submissions and parses source code metadata, while the web platform handles Supabase authentication, user settings, repository binding, and analytics visualization.
          </p>
        </section>

        <section className="glass-card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 10 }}>
            <Shield size={20} style={{ color: "var(--violet)" }} />
            2. Supabase Identity Provider
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
            User profiles, repository mappings, and dashboard preferences are stored inside Supabase tables (<code style={{ background: "var(--violet-soft)", padding: "2px 6px", borderRadius: 4 }}>profiles</code>, <code style={{ background: "var(--violet-soft)", padding: "2px 6px", borderRadius: 4 }}>repositories</code>, <code style={{ background: "var(--violet-soft)", padding: "2px 6px", borderRadius: 4 }}>settings</code>). Solved problems and source code solutions remain stored exclusively on GitHub.
          </p>
        </section>

        <section className="glass-card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 10 }}>
            <GitFork size={20} style={{ color: "var(--violet)" }} />
            3. GitHub Sync Engine
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
            When a submission is accepted, the parser generates a clean folder structure containing <code style={{ background: "var(--violet-soft)", padding: "2px 6px", borderRadius: 4 }}>solution.ext</code>, <code style={{ background: "var(--violet-soft)", padding: "2px 6px", borderRadius: 4 }}>README.md</code>, and <code style={{ background: "var(--violet-soft)", padding: "2px 6px", borderRadius: 4 }}>metadata.json</code>, along with updating global <code style={{ background: "var(--violet-soft)", padding: "2px 6px", borderRadius: 4 }}>stats.json</code>.
          </p>
        </section>
      </div>
    </main>
  );
}
