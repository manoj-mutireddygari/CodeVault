"use client";

import { useState } from "react";
import { HelpCircle, Shield, Key, AlertCircle, Download, ChevronRight, HelpCircle as HelpIcon, Terminal } from "lucide-react";
import { useRepository } from "../../../contexts/RepositoryContext";
import { useVault } from "../../../hooks/useVault";

export default function HelpPage() {
  const repository = useRepository();
  const vault = useVault(repository);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);

  const faqs = [
    {
      q: "My extension is showing 'Awaiting handshake', what do I do?",
      a: "This happens when the extension is not yet fully loaded or connected. Open the extension popup panel by clicking its icon in the Chrome toolbar. Make sure you are logged in on the CodeVault dashboard website in an active tab."
    },
    {
      q: "I reached a GitHub rate limit warning, how can I fix it?",
      a: "GitHub limits raw content API calls for unauthenticated requests. CodeVault automatically channels syncing via OAuth, but frequent dashboard refreshes can still trigger limits. Simply wait a few minutes, or reconnect GitHub to refresh the connection."
    },
    {
      q: "Can I host my repository as private on GitHub?",
      a: "Absolutely! CodeVault fully supports sync to private GitHub repositories. The extension only needs write permissions to push solutions. You can review repository access in your GitHub account integration settings."
    },
    {
      q: "How can I backup all my solutions locally?",
      a: "You can download a complete backup bundle of your CodeVault directory directly from this page using the 'Download local JSON dump' utility."
    }
  ];

  const handleDownloadBackup = () => {
    if (!vault.data?.problems) return;
    setDownloading(true);
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vault.data.problems, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `codevault-backup-${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setDownloading(false);
    }, 1000);
  };

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">HELP & SUPPORT</p>
          <h1>Documentation & Troubleshooting</h1>
          <p>Troubleshoot sync engine states, review FAQs, or export local snapshots of your vault.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginTop: 12 }}>
        {/* Main Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Card: FAQ Accordion */}
          <article className="glass-card" style={{ padding: 28, borderRadius: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 650, margin: "0 0 20px" }}>Frequently Asked Questions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    style={{ width: "100%", padding: "16px 20px", background: "none", border: 0, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontWeight: 600, fontSize: 13 }}
                  >
                    <span>{faq.q}</span>
                    <span style={{ color: "var(--violet)", fontSize: 16 }}>{activeFaq === idx ? "−" : "+"}</span>
                  </button>
                  {activeFaq === idx && (
                    <div style={{ padding: "0 20px 16px", fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </article>

          {/* Card: Backups */}
          <article className="glass-card" style={{ padding: 28, borderRadius: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 650, margin: 0 }}>Local Backup & Export</h2>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Export your complete solved problems list as a single JSON data payload.</p>
              </div>
              <button
                disabled={downloading || !vault.data?.problems}
                onClick={handleDownloadBackup}
                className="outline"
                style={{ padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
              >
                <Download size={14} /> {downloading ? "Preparing..." : "Export Solutions JSON"}
              </button>
            </div>
          </article>
        </div>

        {/* Sidebar Diagnostics */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <article className="glass-card" style={{ padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 650, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <Terminal size={18} className="text-violet" /> Connection Check
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: "1px solid #f1f3f9" }}>
                <span style={{ color: "var(--muted)" }}>Supabase Session</span>
                <span style={{ fontWeight: 700, color: "#059669" }}>✓ Authenticated</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: "1px solid #f1f3f9" }}>
                <span style={{ color: "var(--muted)" }}>GitHub Mapping</span>
                <span style={{ fontWeight: 700, color: repository ? "#059669" : "#dc2626" }}>
                  {repository ? "✓ Configured" : "Missing"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--muted)" }}>Sync Service</span>
                <span style={{ fontWeight: 700, color: vault.data ? "#059669" : "#dc2626" }}>
                  {vault.data ? "✓ Active" : "Disconnected"}
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
