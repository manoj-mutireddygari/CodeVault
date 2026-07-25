"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Download } from "lucide-react";

export default function DownloadPage() {
  return (
    <main className="page" style={{ maxWidth: 860 }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <p className="eyebrow">EXTENSION DOWNLOAD CENTER</p>
        <h1 style={{ fontSize: 38, fontWeight: 850, letterSpacing: "-0.04em", margin: "8px 0 12px" }}>
          Download CodeVault Extension
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
          Version 0.1.0 · Compatible with Chrome, Brave, Edge & Arc
        </p>
      </div>

      <div className="glass-card" style={{ padding: 40, borderRadius: 24, marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: 20, marginBottom: 24 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--violet)", background: "var(--violet-soft)", padding: "4px 10px", borderRadius: 12 }}>
              STABLE RELEASE
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 850, margin: "8px 0 0" }}>CodeVault Chrome Extension v0.1.0</h2>
          </div>
          <a
            href="/CodeVault.zip"
            download="CodeVault.zip"
            className="primary"
            style={{ padding: "12px 24px", fontSize: 14, borderRadius: 12 }}
          >
            <Download size={18} />
            Download ZIP Build
          </a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, fontSize: 13, marginBottom: 24 }}>
          <div style={{ padding: 16, background: "var(--violet-soft)", borderRadius: 14, border: "1px solid var(--line)" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>SHA256 CHECKSUM</span>
            <code style={{ display: "block", fontSize: 11, color: "var(--ink)", wordBreak: "break-all", marginTop: 4, background: "var(--card-bg)", padding: 6, borderRadius: 6 }}>
              e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </code>
          </div>
          <div style={{ padding: 16, background: "var(--violet-soft)", borderRadius: 14, border: "1px solid var(--line)" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>REQUIREMENTS</span>
            <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginTop: 4 }}>
              Chrome 100+, Edge, Brave or Arc (Manifest V3)
            </span>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, margin: "0 0 12px" }}>Release Highlights in v0.1.0</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "var(--muted)" }}>
            <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={15} style={{ color: "var(--violet)" }} /> Supabase Identity Integration (Zero PAT credentials needed inside extension)
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={15} style={{ color: "var(--violet)" }} /> Automatic website authentication check & onboarding redirect
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={15} style={{ color: "var(--violet)" }} /> Instant background sync queue with offline storage fallback
            </li>
          </ul>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <Link href="/install" className="outline" style={{ display: "inline-flex", padding: "12px 20px", borderRadius: 12 }}>
          Need installation instructions? Read Step-by-Step Guide <ArrowRight size={15} />
        </Link>
      </div>
    </main>
  );
}
