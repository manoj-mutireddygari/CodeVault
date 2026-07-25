"use client";

export default function TermsPage() {
  return (
    <main className="page" style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: 36, fontWeight: 850, letterSpacing: "-0.04em" }}>Terms of Service</h1>
      <p style={{ fontSize: 13, color: "var(--muted)" }}>Last updated: July 24, 2026</p>

      <div className="glass-card" style={{ padding: 32, fontSize: 13, color: "var(--muted)", lineHeight: 1.8 }}>
        <p>By downloading or accessing CodeVault Extension and Platform Services, you agree to these Terms of Service.</p>

        <h3 style={{ color: "var(--ink)", margin: "20px 0 8px" }}>1. Acceptance of Terms</h3>
        <p>CodeVault grants you a personal, non-exclusive license to use the client extension and web platform to archive your personal code solutions.</p>

        <h3 style={{ color: "var(--ink)", margin: "20px 0 8px" }}>2. Open Source & Zero Lock-In</h3>
        <p>All data committed to your GitHub repository belongs solely to you. You may disconnect or delete your account at any time without losing your repository history.</p>
      </div>
    </main>
  );
}
