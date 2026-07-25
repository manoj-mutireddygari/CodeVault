"use client";

export default function PrivacyPage() {
  return (
    <main className="page" style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: 36, fontWeight: 850, letterSpacing: "-0.04em" }}>Privacy Policy</h1>
      <p style={{ fontSize: 13, color: "var(--muted)" }}>Last updated: July 24, 2026</p>

      <div className="glass-card" style={{ padding: 32, fontSize: 13, color: "var(--muted)", lineHeight: 1.8 }}>
        <p>CodeVault operates under an offline-first privacy paradigm. We believe developers should maintain complete control over their source code and solution history.</p>

        <h3 style={{ color: "var(--ink)", margin: "20px 0 8px" }}>1. Data Storage & Ownership</h3>
        <p>Your accepted LeetCode submissions, source code, runtimes, and memory statistics are written directly to your personal GitHub repository. We do not store your code on our servers.</p>

        <h3 style={{ color: "var(--ink)", margin: "20px 0 8px" }}>2. Authentication Metadata</h3>
        <p>Supabase authentication handles account sessions, profile names, email addresses, and repository mapping parameters using Row Level Security (RLS).</p>
      </div>
    </main>
  );
}
