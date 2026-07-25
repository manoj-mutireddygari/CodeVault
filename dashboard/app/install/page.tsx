"use client";

import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";

export default function InstallPage() {
  const steps = [
    {
      num: 1,
      title: "Download the Release ZIP",
      desc: "Get the latest compiled extension bundle from our download page.",
      action: <a href="/CodeVault.zip" download="CodeVault.zip" className="primary" style={{ padding: "8px 14px", fontSize: 12, borderRadius: 8 }}>Download ZIP</a>,
    },
    {
      num: 2,
      title: "Unpack the ZIP File",
      desc: "Extract the downloaded archive into a folder on your computer (e.g. ~/Downloads/codevault-extension).",
    },
    {
      num: 3,
      title: "Open Browser Extensions Page",
      desc: "In Google Chrome or any Chromium browser, navigate to chrome://extensions in your URL bar.",
    },
    {
      num: 4,
      title: "Enable Developer Mode & Load Unpacked",
      desc: "Toggle 'Developer mode' in the upper right corner, click 'Load unpacked', and select the extracted folder.",
    },
    {
      num: 5,
      title: "Automatic Onboarding & Auth Detection",
      desc: "Open the extension icon. If you are not logged in, it automatically opens the website login page to authenticate.",
    },
  ];

  return (
    <main className="page" style={{ maxWidth: 860 }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <p className="eyebrow">STEP-BY-STEP SETUP</p>
        <h1 style={{ fontSize: 38, fontWeight: 850, letterSpacing: "-0.04em", margin: "8px 0 12px" }}>
          Installation Guide
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
          Follow these 5 simple steps to get CodeVault running in 60 seconds.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 40 }}>
        {steps.map((step) => (
          <div key={step.num} className="glass-card" style={{ padding: 24, display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--violet-soft)", color: "var(--violet)", display: "grid", placeItems: "center", fontWeight: 850, fontSize: 18, flexShrink: 0 }}>
              {step.num}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 4px" }}>{step.title}</h3>
                {step.action}
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 28, borderRadius: 20, textAlign: "center", background: "var(--violet-soft)" }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>Ready to proceed?</h3>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 20px" }}>Launch the onboarding wizard to complete GitHub linking.</p>
        <Link href="/" className="primary" style={{ display: "inline-flex", padding: "12px 24px", borderRadius: 12 }}>
          Open Dashboard Wizard <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}
