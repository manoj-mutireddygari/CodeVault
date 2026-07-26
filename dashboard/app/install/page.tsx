"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Download, CheckCircle2,
  FolderOpen, ToggleRight, Plug, Shield,
  AlertCircle, ExternalLink, Clock, Zap,
} from "lucide-react";
import PublicNavbar from "../../components/PublicNavbar";

const V = "#635bff";
const VS = "#f4f3ff";
const VB = "#ede9fe";

const steps = [
  {
    num: "01",
    icon: Download,
    title: "Download the Extension ZIP",
    time: "30 seconds",
    desc: "Download the latest stable release of the CodeVault Chrome extension as a ZIP archive.",
    details: [
      "Click the download button below or visit codevault.app/download",
      "The file CodeVault.zip (~180 KB) will save to your Downloads folder",
      "No account required to download — installation is free",
    ],
    action: (
      <a href="/CodeVault.zip" download="CodeVault.zip" style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "#0f172a", color: "#fff",
        padding: "10px 20px", borderRadius: 10,
        fontSize: 13, fontWeight: 700, textDecoration: "none",
        transition: "all 0.2s", boxShadow: "0 2px 8px rgba(15,23,42,0.15)",
      }}>
        <Download size={14} /> Download ZIP
      </a>
    ),
  },
  {
    num: "02",
    icon: FolderOpen,
    title: "Extract the Archive",
    time: "15 seconds",
    desc: "Unzip the downloaded file to get the extension folder ready for loading.",
    details: [
      "Right-click CodeVault.zip → Extract All (Windows) or double-click (macOS)",
      "Extract to any permanent location — e.g. ~/Documents/CodeVault",
      "You should see a folder containing manifest.json and other files",
    ],
    tip: "Do not move or delete the extracted folder after loading — Chrome references it directly.",
  },
  {
    num: "03",
    icon: ToggleRight,
    title: "Enable Developer Mode",
    time: "10 seconds",
    desc: "Open your browser's extension management page and turn on Developer Mode.",
    details: [
      "Open a new tab and navigate to chrome://extensions",
      "Toggle the Developer mode switch in the top-right corner of the page",
      "This is required to load extensions that are not from the Chrome Web Store",
    ],
    code: "chrome://extensions",
  },
  {
    num: "04",
    icon: Plug,
    title: "Load the Extension Unpacked",
    time: "15 seconds",
    desc: "Use the Load unpacked button to install the extension directly from the extracted folder.",
    details: [
      "Click the Load unpacked button that appears after enabling Developer Mode",
      "Browse to and select the extracted CodeVault folder (the one containing manifest.json)",
      "The CodeVault card will appear in your extensions list with a toggle",
    ],
  },
  {
    num: "05",
    icon: Shield,
    title: "Sign In & Connect GitHub",
    time: "2 minutes",
    desc: "Create your free account and link your GitHub repository through the onboarding wizard.",
    details: [
      "Click the CodeVault icon in your browser toolbar",
      "Sign in or create a free account at codevault.app",
      "Complete the onboarding wizard to link your GitHub repository and PAT",
    ],
  },
];

const browsers = [
  { name: "Google Chrome", version: "100+", supported: true },
  { name: "Microsoft Edge", version: "100+", supported: true },
  { name: "Brave Browser", version: "1.40+", supported: true },
  { name: "Arc Browser", version: "Any", supported: true },
  { name: "Mozilla Firefox", version: "—", supported: false },
  { name: "Safari", version: "—", supported: false },
];

export default function InstallPage() {
  return (
    <div style={{ background: "#fff", color: "#0f172a", minHeight: "100vh", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>

      {/* ── NAV ── */}
      <PublicNavbar />

      {/* ── HERO ── */}
      <section className="responsive-hero-section" style={{ padding: "80px 48px 64px", background: "#fff", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(99,91,255,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "60%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,91,255,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, background: "linear-gradient(to bottom, transparent, #fff)", pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: VS, border: `1px solid ${VB}`, borderRadius: 100, padding: "6px 16px", fontSize: 12, fontWeight: 600, color: V, marginBottom: 24 }}>
            Step-by-Step Setup Guide
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 18px", color: "#0f172a", lineHeight: 1.1 }}>
            Install CodeVault in<br />
            <span style={{ background: `linear-gradient(135deg, ${V}, #a78bfa)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              under 3 minutes
            </span>
          </h1>
          <p style={{ fontSize: 17, color: "#64748b", margin: "0 auto 40px", maxWidth: 560, lineHeight: 1.7 }}>
            Follow these 5 steps to have the CodeVault extension installed, authenticated, and committing solutions automatically.
          </p>
          {/* Time + complexity badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            {[{ icon: Clock, label: "~3 minutes total" }, { icon: Zap, label: "No coding required" }, { icon: CheckCircle2, label: "5 simple steps" }].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 100, padding: "8px 18px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                <item.icon size={14} style={{ color: V }} /> {item.label}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="responsive-page-container" style={{ maxWidth: 860, margin: "0 auto", padding: "0 48px 120px" }}>

        {/* ── STEPS ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 72 }}>
          {steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="responsive-flex-stack responsive-card"
              style={{ display: "flex", gap: 24, padding: "32px 36px", borderRadius: 20, border: "1.5px solid #f1f5f9", background: "#fff", boxShadow: "0 2px 8px rgba(15,23,42,0.04)", position: "relative", overflow: "hidden" }}>
              {/* Accent left bar */}
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, borderRadius: "20px 0 0 20px", background: `linear-gradient(to bottom, ${V}, #a78bfa)` }} />
              {/* Step number */}
              <div style={{ flexShrink: 0 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: VS, border: `2px solid ${VB}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <step.icon size={20} style={{ color: V }} />
                  <span style={{ fontSize: 9, fontWeight: 800, color: V, letterSpacing: "0.08em", marginTop: 2 }}>{step.num}</span>
                </div>
              </div>
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>{step.title}</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", background: "#f8fafc", border: "1px solid #f1f5f9", padding: "4px 10px", borderRadius: 100 }}>
                      <Clock size={10} style={{ display: "inline", marginRight: 4 }} />{step.time}
                    </span>
                    {step.action}
                  </div>
                </div>
                <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 20px", lineHeight: 1.6 }}>{step.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {step.details.map((d, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#374151", lineHeight: 1.5 }}>
                      <CheckCircle2 size={15} style={{ color: "#059669", flexShrink: 0, marginTop: 1 }} /> {d}
                    </li>
                  ))}
                </ul>
                {step.code && (
                  <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 10, background: "#0f172a", borderRadius: 10, padding: "10px 16px", maxWidth: "100%", overflowX: "auto" }}>
                    <span style={{ fontSize: 13, fontFamily: "ui-monospace, monospace", color: "#a78bfa", fontWeight: 600, wordBreak: "break-all" }}>{step.code}</span>
                    <ExternalLink size={12} style={{ color: "#64748b", flexShrink: 0 }} />
                  </div>
                )}
                {step.tip && (
                  <div style={{ marginTop: 16, display: "flex", gap: 10, padding: "12px 16px", borderRadius: 10, background: "#fffbeb", border: "1px solid #fde68a" }}>
                    <AlertCircle size={15} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 13, color: "#92400e", lineHeight: 1.5 }}><strong>Note:</strong> {step.tip}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── BROWSER COMPATIBILITY ── */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", color: "#0f172a", margin: "0 0 8px" }}>Browser Compatibility</h2>
          <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 28px" }}>CodeVault requires a Chromium-based browser with Manifest V3 support.</p>
          <div className="responsive-grid-1col" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {browsers.map((b, i) => (
              <div key={i} style={{ padding: "18px 20px", borderRadius: 14, background: b.supported ? "#f0fdf4" : "#fafafa", border: `1.5px solid ${b.supported ? "#bbf7d0" : "#f1f5f9"}`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: b.supported ? "#dcfce7" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {b.supported ? <CheckCircle2 size={15} style={{ color: "#059669" }} /> : <span style={{ fontSize: 14, color: "#94a3b8" }}>✕</span>}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: b.supported ? "#0f172a" : "#94a3b8" }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: b.supported ? "#059669" : "#94a3b8", fontWeight: 500 }}>{b.supported ? `v${b.version}` : "Not supported"}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TROUBLESHOOTING ── */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", color: "#0f172a", margin: "0 0 8px" }}>Common Issues</h2>
          <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 24px" }}>Quick fixes for the most frequent installation problems.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { issue: "'Load unpacked' button is missing", fix: "Make sure Developer Mode is enabled — the toggle is in the top-right of chrome://extensions. Reload the page after toggling." },
              { issue: "Extension icon does not appear in toolbar", fix: "Click the puzzle-piece icon (🧩) in the toolbar, find CodeVault, and click the pin icon to pin it." },
              { issue: "Extension shows 'Not connected'", fix: "Sign in to codevault.app in the same browser first. The extension reads your session from the website automatically." },
              { issue: "Error: 'manifest.json is missing'", fix: "You selected the wrong folder during Load unpacked. Make sure you select the extracted CodeVault folder that contains manifest.json — not its parent." },
            ].map((item, i) => (
              <div key={i} style={{ padding: "20px 24px", borderRadius: 14, border: "1.5px solid #f1f5f9", background: "#fff" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>❓ {item.issue}</div>
                <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>→ {item.fix}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="responsive-flex-stack" style={{ padding: "40px 48px", borderRadius: 20, background: "linear-gradient(135deg, #f4f3ff 0%, #ede9fe 100%)", border: `1.5px solid ${VB}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: V, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>All done?</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Create your free account</h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Sign up to connect your GitHub repository and start committing.</p>
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
