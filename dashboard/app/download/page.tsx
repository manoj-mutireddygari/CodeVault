"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight, ArrowLeft, Download, CheckCircle2,
  Globe, Shield, Zap, Package, Terminal, AlertCircle,
} from "lucide-react";

const V = "#635bff";
const VS = "#f4f3ff";
const VB = "#ede9fe";

const releases = [
  {
    version: "v0.1.0",
    date: "July 2026",
    badge: "STABLE",
    badgeColor: "#059669",
    badgeBg: "#ecfdf5",
    highlights: [
      "Supabase Identity Integration — zero credentials inside extension",
      "Automatic session detection & onboarding redirect",
      "Background sync queue with offline storage fallback",
      "Support for 10+ programming languages with correct file extensions",
      "Auto-generated README.md and metadata.json per solution",
      "Global stats.json index updated on every commit",
    ],
  },
];

const requirements = [
  { icon: Globe, label: "Browser", value: "Chrome 100+ · Edge · Brave · Arc" },
  { icon: Shield, label: "Manifest", value: "Manifest V3 compliant" },
  { icon: Zap, label: "Permissions", value: "Storage · ActiveTab · LeetCode origin" },
  { icon: Package, label: "Size", value: "~180 KB (unpacked)" },
];

const steps = [
  { step: "1", title: "Download the ZIP", desc: "Click the button above to download CodeVault.zip to your computer." },
  { step: "2", title: "Extract the archive", desc: "Unzip the file anywhere on your system. You will get a folder named CodeVault." },
  { step: "3", title: "Open Extensions", desc: "Navigate to chrome://extensions in your browser and enable Developer Mode." },
  { step: "4", title: "Load Unpacked", desc: "Click 'Load unpacked' and select the extracted CodeVault folder." },
  { step: "5", title: "Sign in & Connect", desc: "Visit codevault.app, sign in, and complete the onboarding wizard to link your GitHub repository." },
];

export default function DownloadPage() {
  return (
    <div style={{ background: "#fff", color: "#0f172a", minHeight: "100vh", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>

      {/* ── NAV ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid #f1f5f9", background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", padding: "0 48px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/main-logo.png" alt="CodeVault" width={26} height={26} style={{ borderRadius: 7 }} />
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.04em", color: "#0f172a" }}>CodeVault</span>
        </Link>
        <div style={{ display: "flex", gap: 24, fontSize: 13, fontWeight: 500, color: "#64748b" }}>
          <Link href="/docs" style={{ textDecoration: "none", color: "inherit" }}>Docs</Link>
          <Link href="/install" style={{ textDecoration: "none", color: "inherit" }}>Install Guide</Link>
          <Link href="/faq" style={{ textDecoration: "none", color: "inherit" }}>FAQ</Link>
        </div>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#64748b", textDecoration: "none", padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 9, background: "#fff", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#c4b5fd"; e.currentTarget.style.color = V; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}>
          <ArrowLeft size={13} /> Back to Home
        </Link>
      </header>

      {/* ── HERO ── */}
      <section style={{ padding: "80px 48px 0", background: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(99,91,255,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "60%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,91,255,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1, paddingBottom: 80 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: VS, border: `1px solid ${VB}`, borderRadius: 100, padding: "6px 16px", fontSize: 12, fontWeight: 600, color: V, marginBottom: 28 }}>
              Extension Download Center
            </div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 20px", color: "#0f172a", lineHeight: 1.1 }}>
              Download CodeVault<br />
              <span style={{ background: `linear-gradient(135deg, ${V}, #a78bfa)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Chrome Extension
              </span>
            </h1>
            <p style={{ fontSize: 17, color: "#64748b", margin: "0 0 40px", lineHeight: 1.7, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
              Version 0.1.0 · Compatible with Chrome, Brave, Edge &amp; Arc · Manifest V3
            </p>
            <a href="/CodeVault.zip" download="CodeVault.zip" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: V, color: "#fff", padding: "16px 36px", fontSize: 16, fontWeight: 700, borderRadius: 14, textDecoration: "none", boxShadow: `0 6px 24px rgba(99,91,255,0.35)`, transition: "all 0.22s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#5249e0"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = V; e.currentTarget.style.transform = "translateY(0)"; }}>
              <Download size={18} /> Download CodeVault.zip
            </a>
            <div style={{ marginTop: 16, fontSize: 12, color: "#94a3b8" }}>Free · No account required to download</div>
          </motion.div>
        </div>
      </section>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 48px 120px" }}>

        {/* ── REQUIREMENTS ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ marginBottom: 64 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {requirements.map((r, i) => (
              <div key={i} style={{ padding: "20px 22px", borderRadius: 16, background: "#f8fafc", border: "1.5px solid #f1f5f9" }}>
                <r.icon size={18} style={{ color: V, marginBottom: 12 }} />
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{r.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", lineHeight: 1.4 }}>{r.value}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── RELEASE NOTES ── */}
        {releases.map((rel, ri) => (
          <motion.section key={ri} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + ri * 0.05 }}
            style={{ marginBottom: 48, border: "1.5px solid #f1f5f9", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid #f1f5f9", background: "#fafbfe", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: rel.badgeColor, background: rel.badgeBg, padding: "4px 12px", borderRadius: 100, letterSpacing: "0.08em" }}>{rel.badge}</span>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#0f172a", letterSpacing: "-0.03em" }}>CodeVault Extension {rel.version}</h2>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Released {rel.date}</span>
              </div>
              <a href="/CodeVault.zip" download="CodeVault.zip" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: V, textDecoration: "none", padding: "9px 18px", border: `1.5px solid ${VB}`, borderRadius: 10, background: VS, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = VB; }}
                onMouseLeave={e => { e.currentTarget.style.background = VS; }}>
                <Download size={14} /> Download ZIP
              </a>
            </div>
            <div style={{ padding: "28px 32px" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 20px" }}>What&apos;s included</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {rel.highlights.map((h, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#374151", lineHeight: 1.5 }}>
                    <CheckCircle2 size={16} style={{ color: "#059669", flexShrink: 0, marginTop: 1 }} /> {h}
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        ))}

        {/* ── INSTALLATION STEPS ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 8px", color: "#0f172a" }}>Installation Instructions</h2>
          <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 32px" }}>After downloading, follow these steps to load the extension in your browser.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 20, padding: "24px 28px", background: i % 2 === 0 ? "#fff" : "#fafbfe", border: "1px solid #f1f5f9", borderRadius: i === 0 ? "16px 16px 0 0" : i === steps.length - 1 ? "0 0 16px 16px" : "0" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: VS, border: `2px solid ${VB}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: V, flexShrink: 0 }}>{s.step}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── NOTE ── */}
        <div style={{ display: "flex", gap: 14, padding: "20px 24px", borderRadius: 16, background: "#fffbeb", border: "1px solid #fde68a" }}>
          <AlertCircle size={18} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 14, color: "#92400e", lineHeight: 1.6 }}>
            <strong>Developer Mode required.</strong> Since CodeVault is not yet on the Chrome Web Store, you must enable Developer Mode in chrome://extensions to load it unpacked. This is safe and widely used for professional extensions.
          </div>
        </div>

        {/* ── NEXT STEP ── */}
        <div style={{ marginTop: 56, padding: "36px 40px", borderRadius: 20, background: "linear-gradient(135deg, #f4f3ff 0%, #ede9fe 100%)", border: `1.5px solid ${VB}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: V, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Next Step</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Create your free account</h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Sign up to connect your GitHub repository and start committing solutions.</p>
          </div>
          <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 8, background: V, color: "#fff", padding: "13px 24px", borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: "none", transition: "all 0.2s", boxShadow: `0 4px 14px rgba(99,91,255,0.3)` }}
            onMouseEnter={e => { e.currentTarget.style.background = "#5249e0"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = V; e.currentTarget.style.transform = "translateY(0)"; }}>
            Get Started Free <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
