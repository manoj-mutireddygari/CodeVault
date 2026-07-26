import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { DASHBOARD_URL } from "../constants";
import { vaultStorage } from "../storage/vaultStorage";
import type { UploadState, VaultSettings, QueuedUpload } from "../types";
import logoUrl from "../../public/logo.png";
import "./style.css";


function Popup() {
  const [settings, setSettings] = useState<VaultSettings>();
  const [last, setLast] = useState<UploadState>();
  const [queue, setQueue] = useState<QueuedUpload[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retryingIds, setRetryingIds] = useState<string[]>([]);
  const [isRetryingAll, setIsRetryingAll] = useState(false);

  const loadData = async () => {
    try {
      const s = await vaultStorage.getSettings();
      const l = await vaultStorage.getLastUpload();
      const q = await vaultStorage.getQueue();
      const sess = await vaultStorage.ensureValidSession();
      setSettings(s);
      setLast(l);
      setQueue(q);
      setSession(sess);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 1500);
    return () => clearInterval(interval);
  }, []);

  const authenticated = Boolean(session);
  const isSyncing = isRetryingAll || retryingIds.length > 0 || queue.some((i) => (i.status as string) === "syncing" || i.status === "pending");
  const repoString = settings?.owner && settings?.repository ? `${settings.owner}/${settings.repository}` : "Not mapped";

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
    setSession(null);
    setSettings(undefined);
  };

  const handleRetry = (id?: string) => {
    if (id) {
      setRetryingIds((prev) => [...prev, id]);
    } else {
      setIsRetryingAll(true);
    }

    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage({ type: "RETRY_QUEUE", id }, () => {
        loadData();
        setTimeout(() => {
          if (id) {
            setRetryingIds((prev) => prev.filter((i) => i !== id));
          } else {
            setIsRetryingAll(false);
          }
        }, 1500);
      });
    }
  };

  const handleClearQueue = () => {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage({ type: "CLEAR_QUEUE" }, () => {
        loadData();
      });
    }
  };

  if (loading) {
    return (
      <main className="loading-state">
        <img src={logoUrl} alt="CodeVault" className="logo-spin" />
        <p>Connecting to CodeVault Platform…</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main style={{ position: "relative", minHeight: 330, padding: 0, overflow: "hidden" }}>
        {/* Blurred Background Mock Content */}
        <div style={{ filter: "blur(8px)", opacity: 0.45, pointerEvents: "none", padding: 18, userSelect: "none" }}>
          <header style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <img src={logoUrl} alt="CodeVault" className="logo-img" />
            <div>
              <strong>CodeVault</strong>
              <small>v0.1.0 Phase 4</small>
            </div>
          </header>
          <section className="hero" style={{ padding: 14, marginBottom: 12 }}>
            <span className="dot" />
            <div>
              <b>Not Authenticated</b>
              <small>Please log in on website</small>
            </div>
          </section>
          <section className="stats" style={{ padding: 12, marginBottom: 16 }}>
            <div><b>—</b><small>Last Sync</small></div>
            <div><b>—</b><small>Latest Problem</small></div>
          </section>
          <button style={{ width: "100%", padding: 10 }}>Open Dashboard Platform</button>
        </div>

        {/* Glassmorphic Overlay Content */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(14px) saturate(180%)",
          WebkitBackdropFilter: "blur(14px) saturate(180%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 22, textAlign: "center"
        }}>
          <img
            src={logoUrl}
            alt="CodeVault"
            style={{
              width: 56, height: 56, borderRadius: 16,
              boxShadow: "0 8px 24px rgba(99, 91, 255, 0.25)",
              marginBottom: 12
            }}
          />
          <h2 style={{ fontSize: 18, fontWeight: 850, letterSpacing: "-0.03em", margin: "0 0 6px", color: "#0f172a" }}>
            CodeVault Extension
          </h2>
          <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 16px", lineHeight: 1.5, maxWidth: 260 }}>
            Log in on the web dashboard to activate solution sync from LeetCode directly to your GitHub repository.
          </p>

          <div style={{
            display: "flex", flexDirection: "column", gap: 6, width: "100%",
            background: "rgba(99, 91, 255, 0.05)", border: "1px solid rgba(99, 91, 255, 0.12)",
            borderRadius: 12, padding: "10px 12px", marginBottom: 18, textAlign: "left", fontSize: 11, color: "#475569"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
              <span style={{ color: "#635bff" }}>✦</span> Automatic GitHub Solution Commits
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
              <span style={{ color: "#635bff" }}>✦</span> Analytics & Streak Tracking Handshake
            </div>
          </div>

          <button
            onClick={() => {
              if (typeof chrome !== "undefined" && chrome.tabs) {
                chrome.tabs.create({ url: `${DASHBOARD_URL}/login` });
              }
            }}
            style={{
              width: "100%", padding: "11px 16px",
              background: "linear-gradient(135deg, #635bff, #4f46e5)",
              color: "#ffffff", borderRadius: 12, border: 0,
              fontWeight: 750, fontSize: 13, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(99, 91, 255, 0.35)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6
            }}
          >
            Log In on Web Dashboard →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src={logoUrl} alt="CodeVault" className="logo-img" />
          <div>
            <strong>CodeVault</strong>
            <small>v0.1.0 Phase 4</small>
          </div>
        </div>
      </header>

      {/* Dynamic Active Sync Banner */}
      {isSyncing && (
        <div className="status-banner syncing">
          <span className="spin-icon">⚙</span>
          <span>Syncing solution to GitHub repository...</span>
        </div>
      )}

      {/* Account & Connection Overview */}
      <section className="hero" style={{ padding: 14 }}>
        <span className={isSyncing ? "dot syncing" : authenticated ? "dot live" : "dot"} />
        <div>
          <b>{isSyncing ? "Syncing in Progress..." : authenticated ? "Platform Connected" : "Not Authenticated"}</b>
          <small>{isSyncing ? "Uploading submission to GitHub" : authenticated ? `Repository: ${repoString}` : "Please log in on website"}</small>
        </div>
      </section>

      {/* Sync Queue */}
      {queue.length > 0 && (
        <section className="queue-panel">
          <div className="queue-header">
            <strong>Sync Queue ({queue.length})</strong>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="text-btn" disabled={isRetryingAll} onClick={() => handleRetry()}>
                {isRetryingAll ? <><span className="spin-icon">⟳</span> Retrying All...</> : "Retry All"}
              </button>
              <button className="text-btn" onClick={handleClearQueue} style={{ color: "#dc2626" }}>Clear</button>
            </div>
          </div>
          <ul className="queue-list">
            {queue.map((item) => {
              const isItemRetrying = retryingIds.includes(item.id) || isRetryingAll;
              return (
                <li key={item.id}>
                  <div className="queue-item-info">
                    <span className="q-title">
                      #{item.submission.problemId} {item.submission.title}
                    </span>
                    {item.lastError && (
                      <span className="q-error" title={item.lastError}>
                        {item.lastError}
                      </span>
                    )}
                  </div>
                  <div className="queue-item-actions">
                    <button
                      className="action-btn retry"
                      disabled={isItemRetrying}
                      onClick={() => handleRetry(item.id)}
                    >
                      {isItemRetrying ? <><span className="spin-icon">⟳</span> Retrying...</> : "Retry"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Last Sync Info */}
      <section className="stats">
        <div>
          <b>{last ? new Date(last.syncedAt).toLocaleTimeString() : "—"}</b>
          <small>Last Sync</small>
        </div>
        <div>
          <b>{last?.problemId ? `#${last.problemId}` : "—"}</b>
          <small>Latest Problem</small>
        </div>
      </section>

      <button onClick={() => chrome.tabs.create({ url: DASHBOARD_URL })}>
        Open Dashboard Platform
      </button>

      {authenticated && (
        <button className="secondary" onClick={handleLogout} style={{ marginTop: 6, color: "#dc2626" }}>
          Log Out
        </button>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<Popup />);
