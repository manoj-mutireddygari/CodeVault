"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function PricingPage() {
  return (
    <main className="page" style={{ maxWidth: 860 }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <p className="eyebrow">SIMPLE TRANSPARENT TIERS</p>
        <h1 style={{ fontSize: 38, fontWeight: 850, letterSpacing: "-0.04em", margin: "8px 0 12px" }}>
          Platform Pricing
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
          Start free for personal developer repository portfolio tracking.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Developer Tier - Free */}
        <div className="glass-card" style={{ padding: 36, border: "2px solid var(--violet)", borderRadius: 24, position: "relative" }}>
          <div style={{ position: "absolute", top: -12, right: 24, background: "var(--violet)", color: "white", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 12 }}>
            CURRENT TIER
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 850, margin: "0 0 6px" }}>Developer Tier</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 20px" }}>For individual software engineers & students.</p>
          <div style={{ fontSize: 38, fontWeight: 850, marginBottom: 24 }}>
            $0 <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 600 }}>/ forever</span>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
            {[
              "Unlimited LeetCode submission syncs",
              "Personal GitHub Repository storage",
              "Supabase Cloud Auth & Identity",
              "Full Analytics Dashboard & Trophies",
              "Offline sync queue fallback",
            ].map((item) => (
              <li key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle2 size={16} style={{ color: "var(--violet)" }} />
                {item}
              </li>
            ))}
          </ul>

          <Link href="/" className="primary" style={{ width: "100%", justifyContent: "center", borderRadius: 12 }}>
            Get Started Free
          </Link>
        </div>

        {/* Pro / Team Tier - Future Placeholder */}
        <div className="glass-card" style={{ padding: 36, borderRadius: 24, opacity: 0.85 }}>
          <h2 style={{ fontSize: 24, fontWeight: 850, margin: "0 0 6px" }}>Team & Pro</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 20px" }}>For engineering teams & interview study groups.</p>
          <div style={{ fontSize: 38, fontWeight: 850, marginBottom: 24 }}>
            $9 <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 600 }}>/ month (Future)</span>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "var(--muted)" }}>
            {[
              "Multi-repository destination sync",
              "Team leaderboards & study rooms",
              "Automated Code Quality AI reviews",
              "Custom domain export & badges",
              "Priority 24/7 technical support",
            ].map((item) => (
              <li key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle2 size={16} style={{ color: "var(--muted)" }} />
                {item}
              </li>
            ))}
          </ul>

          <button className="outline" disabled style={{ width: "100%", justifyContent: "center", cursor: "not-allowed", opacity: 0.6, borderRadius: 12 }}>
            Coming Soon (Phase 5)
          </button>
        </div>
      </div>
    </main>
  );
}
