import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { vaultStorage } from "../storage/vaultStorage";
import { DASHBOARD_URL } from "../constants";
import type { VaultSettings, UploadState } from "../types";
import "./style.css";

function Options() {
  const [settings, setSettings] = useState<VaultSettings>();
  const [lastUpload, setLastUpload] = useState<UploadState>();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    vaultStorage.getSettings().then(setSettings);
    vaultStorage.getLastUpload().then(setLastUpload);
    vaultStorage.ensureValidSession().then(setSession);
  }, []);

  const authenticated = Boolean(session);
  const repoName = settings?.owner && settings?.repository ? `${settings.owner}/${settings.repository}` : "No repository mapped";

  const handleLogout = async () => {
    await vaultStorage.saveSession(null);
    await vaultStorage.saveProfile(null);
    await vaultStorage.saveRepository(null);
    await vaultStorage.saveSettings({
      token: "",
      owner: "",
      repository: "leetcode",
      theme: "system",
      autoSync: true,
      notifications: true,
      compactMode: false,
      refreshMinutes: 5,
    });
    chrome.tabs.create({ url: `${DASHBOARD_URL}/login` });
  };

  if (!settings) return null;

  if (!authenticated) {
    return (
      <main style={{ maxWidth: 400, margin: "100px auto", padding: 32, textAlign: "center", fontFamily: "Inter, sans-serif" }}>
        <span style={{ fontSize: 48, color: "#635bff" }}>◆</span>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 16 }}>CodeVault</h2>
        <p style={{ color: "#64748b", fontSize: 14, margin: "12px 0 24px" }}>Please log in to CodeVault to continue.</p>
        <button
          onClick={() => chrome.tabs.create({ url: `${DASHBOARD_URL}/login` })}
          style={{ width: "100%", padding: "12px", background: "#635bff", color: "white", borderRadius: 12, border: 0, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          Log In on Website →
        </button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 540, margin: "40px auto", padding: 32, fontFamily: "Inter, sans-serif" }}>
      <div className="eyebrow" style={{ fontSize: 10, letterSpacing: "0.15em", fontWeight: 800, color: "#635bff" }}>
        CODEVAULT PLATFORM CLIENT
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 850, letterSpacing: "-0.04em", margin: "4px 0 12px" }}>
        Extension Status & Settings
      </h1>
      <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 24px" }}>
        All repository configurations and access control are managed through the CodeVault web dashboard platform.
      </p>

      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingBottom: 10, borderBottom: "1px solid #e2e8f0" }}>
          <span style={{ color: "#64748b", fontWeight: 600 }}>Connection Status</span>
          <strong style={{ color: authenticated ? "#059669" : "#dc2626" }}>
            {authenticated ? "● Connected via Supabase Platform" : "○ Unauthenticated"}
          </strong>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingBottom: 10, borderBottom: "1px solid #e2e8f0" }}>
          <span style={{ color: "#64748b", fontWeight: 600 }}>Mapped Repository</span>
          <strong style={{ color: "#0f172a" }}>{repoName}</strong>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingBottom: 10, borderBottom: "1px solid #e2e8f0" }}>
          <span style={{ color: "#64748b", fontWeight: 600 }}>Last Successful Sync</span>
          <strong style={{ color: "#0f172a" }}>
            {lastUpload ? new Date(lastUpload.syncedAt).toLocaleString() : "No uploads yet"}
          </strong>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "#64748b", fontWeight: 600 }}>Client Build Version</span>
          <strong style={{ color: "#0f172a" }}>v0.1.0 (Phase 4 SaaS)</strong>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => chrome.tabs.create({ url: DASHBOARD_URL })}
          style={{ flex: 1, padding: "12px 18px", background: "#635bff", color: "white", borderRadius: 12, border: 0, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          Manage in Dashboard Platform →
        </button>

        {authenticated && (
          <button
            onClick={handleLogout}
            style={{ padding: "12px 18px", background: "white", color: "#dc2626", borderRadius: 12, border: "1px solid #fecaca", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            Sign Out
          </button>
        )}
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<Options />);
