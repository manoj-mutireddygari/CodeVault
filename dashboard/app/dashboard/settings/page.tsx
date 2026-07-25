"use client";

import { useState, useEffect, useCallback } from "react";
import { useExtension } from "../../../hooks/useExtension";
import { usePreferences } from "../../../contexts/PreferencesContext";
import { supabaseAuth } from "../../../services/supabaseAuth";
import {
  GitFork,
  Palette,
  BellRing,
  Wrench,
  Info,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  Shield,
  Moon,
  Sun,
  Monitor,
  Download,
  RotateCcw,
  User,
  Zap,
  ExternalLink,
  Save,
  Calendar,
  Hash,
  Search,
  Filter,
  ClipboardList,
} from "lucide-react";
import { APP_VERSION } from "../../../constants";

type TabId = "profile" | "github" | "appearance" | "notifications" | "advanced" | "about";

interface SyncLog {
  id: string;
  category: string;
  title: string;
  message: string;
  timestamp: string;
}

const tabs = [
  { id: "profile"       as TabId, label: "Profile",      Icon: User      },
  { id: "github"        as TabId, label: "GitHub",       Icon: GitFork   },
  { id: "appearance"   as TabId, label: "Appearance",   Icon: Palette   },
  { id: "notifications" as TabId, label: "Logs",         Icon: BellRing  },
  { id: "advanced"     as TabId, label: "Advanced",     Icon: Wrench    },
  { id: "about"        as TabId, label: "About",        Icon: Info      },
];

export default function SettingsPage() {
  const extension = useExtension();
  const preferences = usePreferences();
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  // Profile
  const [fullName, setFullName] = useState("");
  const [username, setUsername]  = useState("");
  const [email, setEmail]        = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  // GitHub
  const [token, setToken]       = useState("");
  const [owner, setOwner]       = useState("");
  const [repo, setRepo]         = useState("");
  const [autoSync, setAutoSync] = useState(true);
  const [extNotifications, setExtNotifications] = useState(true);
  const [refreshMinutes, setRefreshMinutes]      = useState(5);
  const [showToken, setShowToken]                = useState(false);

  const [isValidating, setIsValidating]       = useState(false);
  const [validationResult, setValidationResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving]               = useState(false);
  const [saveResult, setSaveResult]           = useState<{ ok: boolean; message: string } | null>(null);

  // Logs (from Supabase DB — full persistent history)
  const [dbLogs, setDbLogs]               = useState<SyncLog[]>([]);
  const [logsLoading, setLogsLoading]     = useState(false);
  const [logsError, setLogsError]         = useState<string | null>(null);
  const [logFilter, setLogFilter]         = useState<"all" | "sync" | "error" | "system">("all");
  const [logSearch, setLogSearch]         = useState("");
  const [isClearingLogs, setIsClearingLogs] = useState(false);

  const fetchDbLogs = useCallback(async () => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const logs = await supabaseAuth.getSyncLogs();
      setDbLogs(logs);
    } catch (e: any) {
      setLogsError(e.message || "Failed to load logs");
    } finally {
      setLogsLoading(false);
    }
  }, []);


  // General
  const [dateFormat, setDateFormat]   = useState("YYYY-MM-DD");
  const [numberFormat, setNumberFormat] = useState("commas");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDateFormat(localStorage.getItem("codevault:date-format") || "YYYY-MM-DD");
    setNumberFormat(localStorage.getItem("codevault:number-format") || "commas");

    const profile = supabaseAuth.getProfile();
    const savedRepo = supabaseAuth.getRepository();
    const savedToken = localStorage.getItem("codevault:github_token") || "";

    if (profile) {
      setFullName(profile.full_name || "");
      setUsername(profile.username  || "");
      setEmail(profile.email        || "");
    }
    if (savedToken) setToken(savedToken);
    if (savedRepo) {
      setRepo(savedRepo.repository_name || "");
      setOwner(savedRepo.repository_owner || "");
    }
  }, []);

  useEffect(() => {
    if (extension.settings) {
      if (extension.settings.token) setToken(extension.settings.token);
      if (extension.settings.owner) setOwner(extension.settings.owner);
      if (extension.settings.repository) setRepo(extension.settings.repository);
      setAutoSync(extension.settings.autoSync ?? true);
      setExtNotifications(extension.settings.notifications ?? true);
      setRefreshMinutes(extension.settings.refreshMinutes || 5);
    }
  }, [extension.settings]);

  // Fetch DB logs whenever the Logs tab is opened
  useEffect(() => {
    if (activeTab === "notifications") {
      fetchDbLogs();
    }
  }, [activeTab, fetchDbLogs]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    supabaseAuth.saveProfile({ full_name: fullName, username, email });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleValidateConnection = async () => {
    setIsValidating(true);
    setValidationResult(null);
    try {
      if (token.startsWith("sb_") || token === "mock_token") {
        setValidationResult({ ok: true, message: "Connected (Simulated Repo) · visibility: Public" });
        return;
      }
      const res = await extension.validateGitHub({ token, owner, repository: repo });
      setValidationResult(res.ok
        ? { ok: true, message: `Connected · visibility: ${res.repo?.private ? "Private" : "Public"}` }
        : { ok: false, message: res.message || "Failed to validate repository." }
      );
    } catch (err: any) {
      setValidationResult({ ok: false, message: err.message || "Network error." });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveGitHubSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveResult(null);
    try {
      const res = await extension.saveSettings({
        token, owner, repository: repo, autoSync,
        notifications: extNotifications, refreshMinutes,
        theme: preferences.theme, compactMode: preferences.compact,
      });
      if (res.ok) {
        setSaveResult({ ok: true, message: "GitHub configuration saved." });
        localStorage.setItem("codevault:repository", JSON.stringify({ owner, repo }));
        localStorage.setItem("codevault:github_token", token);
        supabaseAuth.saveRepository({ repository_name: repo, repository_owner: owner, github_token: token });
        
        // Sync to extension
        const { syncStateToExtension } = await import("../../../services/supabaseAuth");
        await syncStateToExtension();
      } else {
        setSaveResult({ ok: false, message: res.message || "Failed to save settings." });
      }
    } catch (err: any) {
      setSaveResult({ ok: false, message: err.message || "Bridge error." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("codevault:date-format",   dateFormat);
    localStorage.setItem("codevault:number-format", numberFormat);
    alert("Preferences saved.");
  };

  const handleResetSettings = async () => {
    if (confirm("Clear all settings? This will disconnect GitHub and sign you out.")) {
      await extension.saveSettings({
        token: "", owner: "", repository: "leetcode",
        autoSync: true, notifications: true,
        compactMode: false, refreshMinutes: 5, theme: "system",
      });
      await supabaseAuth.signOut();
      window.location.href = "/login";
    }
  };

  const profile = supabaseAuth.getProfile();

  return (
    <main className="page">

      {/* ── Page Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p className="eyebrow">CONTROL CABINET</p>
          <h1 style={{ margin: "6px 0 4px", fontSize: 28, fontWeight: 900 }}>Settings</h1>
          <p style={{ color: "var(--muted)", margin: 0, fontSize: 14 }}>Configure your profile, GitHub connection, appearance, and preferences.</p>
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 12px", borderRadius: 20,
          background: "var(--violet-soft)", border: "1px solid rgba(109,106,254,0.2)",
          color: "var(--violet)", fontSize: 12, fontWeight: 700,
        }}>
          <Zap size={14} />
          <span>v{APP_VERSION}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* ── Vertical Tab Rail ── */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 3, width: 172, flexShrink: 0, position: "sticky", top: 88 }}>
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: activeTab === id ? "10px 14px 10px 12px" : "10px 14px",
                borderRadius: 10, border: 0,
                borderLeft: activeTab === id ? "3px solid var(--violet)" : "3px solid transparent",
                background: activeTab === id ? "var(--violet-soft)" : "transparent",
                color: activeTab === id ? "var(--violet)" : "var(--muted)",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                textAlign: "left", width: "100%",
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* ── Content Pane ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ════ PROFILE ════ */}
          {activeTab === "profile" && (
            <section className="settings-section">
              <div className="settings-section-header">
                <div className="settings-section-icon" style={{ background: "rgba(99,91,255,0.12)", color: "#635bff" }}>
                  <User size={18} />
                </div>
                <div>
                  <h2>Your Profile</h2>
                  <p>Update your display name, username, and contact email.</p>
                </div>
              </div>

              {profile && (
                <div className="settings-profile-card">
                  <div className="settings-avatar">{(fullName || email || "U")[0].toUpperCase()}</div>
                  <div>
                    <strong>{fullName || "CodeVault User"}</strong>
                    <span>{email}</span>
                  </div>
                  <div className={`settings-plan-badge ${profile.plan}`}>{profile.plan}</div>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="settings-form">
                <div className="settings-grid-2">
                  <div className="settings-field">
                    <label className="settings-label"><span>Full Name</span></label>
                    <input value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="Your full name" className="settings-input" />
                  </div>
                  <div className="settings-field">
                    <label className="settings-label"><span>Username</span></label>
                    <input value={username} onChange={e => setUsername(e.target.value)}
                      placeholder="your-handle" className="settings-input" />
                  </div>
                </div>
                <div className="settings-field">
                  <label className="settings-label"><span>Email</span></label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" className="settings-input" />
                </div>
                <div className="settings-actions">
                  <button type="submit" className="primary settings-btn">
                    <Save size={14} /> Save profile
                  </button>
                  {profileSaved && (
                    <span className="settings-saved"><CheckCircle size={13} /> Saved</span>
                  )}
                </div>
              </form>
            </section>
          )}

          {/* ════ GITHUB ════ */}
          {activeTab === "github" && (
            <section className="settings-section">
              <div className="settings-section-header">
                <div className="settings-section-icon" style={{ background: "rgba(109,106,254,0.12)", color: "#6d6afe" }}>
                  <GitFork size={18} />
                </div>
                <div>
                  <h2>GitHub Connection</h2>
                  <p>Configure the credentials the extension uses to commit solutions to your repo.</p>
                </div>
                <span className={`connection-badge${extension.isInstalled ? " live" : ""}`}>
                  {extension.isInstalled ? "Extension active" : "Extension offline"}
                </span>
              </div>

              {!extension.isInstalled && (
                <div className="settings-alert warn">
                  <AlertTriangle size={15} />
                  <div>
                    <strong>Extension Unavailable</strong>
                    <span>Settings cannot be synced until the browser extension is running.</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveGitHubSettings} className="settings-form">
                <div className="settings-field">
                  <label className="settings-label">
                    <span>Personal Access Token</span>
                    <button type="button" onClick={() => setShowToken(!showToken)} className="settings-label-action">
                      {showToken ? <><EyeOff size={11} /> Hide</> : <><Eye size={11} /> Show</>}
                    </button>
                  </label>
                  <div className="settings-input-wrap">
                    <Shield size={14} className="settings-input-icon" />
                    <input
                      required
                      type={showToken ? "text" : "password"}
                      value={token}
                      onChange={e => setToken(e.target.value)}
                      placeholder="github_pat_xxxxxxxxxxxxxxxxxxxx"
                      className="settings-input with-icon"
                    />
                  </div>
                  <span className="settings-hint">
                    Generate at GitHub → Settings → Developer settings → Personal access tokens
                    <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noreferrer" className="settings-hint-link">
                      <ExternalLink size={10} /> Open GitHub
                    </a>
                  </span>
                </div>

                <div className="settings-grid-2">
                  <div className="settings-field">
                    <label className="settings-label"><span>Repository Owner</span></label>
                    <input required value={owner} onChange={e => setOwner(e.target.value)}
                      placeholder="e.g. octocat" className="settings-input" />
                  </div>
                  <div className="settings-field">
                    <label className="settings-label"><span>Repository Name</span></label>
                    <input required value={repo} onChange={e => setRepo(e.target.value)}
                      placeholder="e.g. leetcode-vault" className="settings-input" />
                  </div>
                </div>

                <div className="settings-toggles">
                  <label className="settings-toggle">
                    <div>
                      <span>Auto-upload on acceptance</span>
                      <small>Upload solutions automatically when LeetCode shows "Accepted"</small>
                    </div>
                    <input type="checkbox" checked={autoSync} onChange={e => setAutoSync(e.target.checked)} className="settings-checkbox" />
                  </label>
                  <label className="settings-toggle">
                    <div>
                      <span>System notifications</span>
                      <small>Show desktop notifications on upload success or failure</small>
                    </div>
                    <input type="checkbox" checked={extNotifications} onChange={e => setExtNotifications(e.target.checked)} className="settings-checkbox" />
                  </label>
                </div>

                <div className="settings-field">
                  <label className="settings-label"><span>Background Check Interval</span></label>
                  <select value={refreshMinutes} onChange={e => setRefreshMinutes(Number(e.target.value))} className="settings-select">
                    <option value={1}>Every 1 minute</option>
                    <option value={5}>Every 5 minutes</option>
                    <option value={15}>Every 15 minutes</option>
                    <option value={30}>Every 30 minutes</option>
                  </select>
                </div>

                {validationResult && (
                  <div className={`settings-alert ${validationResult.ok ? "ok" : "err"}`}>
                    {validationResult.ok ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
                    <span>{validationResult.message}</span>
                  </div>
                )}
                {saveResult && (
                  <div className={`settings-alert ${saveResult.ok ? "ok" : "err"}`}>
                    <CheckCircle size={15} /><span>{saveResult.message}</span>
                  </div>
                )}

                <div className="settings-actions">
                  <button type="submit" disabled={isSaving || !extension.isInstalled} className="primary settings-btn">
                    {isSaving ? <><RefreshCw size={13} className="spin" /> Saving…</> : <><Save size={14} /> Save configuration</>}
                  </button>
                  <button type="button" onClick={handleValidateConnection}
                    disabled={isValidating} className="outline settings-btn">
                    {isValidating && <RefreshCw size={13} className="spin" />}
                    Validate connection
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* ════ APPEARANCE ════ */}
          {activeTab === "appearance" && (
            <section className="settings-section">
              <div className="settings-section-header">
                <div className="settings-section-icon" style={{ background: "rgba(251,191,36,0.12)", color: "#f59e0b" }}>
                  <Palette size={18} />
                </div>
                <div>
                  <h2>Interface Customization</h2>
                  <p>Choose your color theme and configure layout density and animations.</p>
                </div>
              </div>

              <form onSubmit={handleSaveGeneralSettings} className="settings-form">
                <div className="settings-field">
                  <label className="settings-label"><span>Color Theme</span></label>
                  <div className="theme-picker">
                    {([
                      { id: "light" as const, label: "Light", Icon: Sun },
                      { id: "dark"  as const, label: "Dark",  Icon: Moon },
                      { id: "system" as const, label: "System", Icon: Monitor },
                    ]).map(({ id, label, Icon }) => (
                      <button key={id} type="button" onClick={() => preferences.setTheme(id)}
                        className={`theme-option${preferences.theme === id ? " active" : ""}`}>
                        <Icon size={20} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-toggles">
                  <label className="settings-toggle">
                    <div>
                      <span>Compact Density Layout</span>
                      <small>Reduces margins and list heights for data density.</small>
                    </div>
                    <input type="checkbox" checked={preferences.compact}
                      onChange={e => preferences.setCompact(e.target.checked)} className="settings-checkbox" />
                  </label>
                  <label className="settings-toggle">
                    <div>
                      <span>Enable Micro-Animations</span>
                      <small>Toggle card hover offsets and page transitions.</small>
                    </div>
                    <input type="checkbox" checked={preferences.motion}
                      onChange={e => preferences.setMotion(e.target.checked)} className="settings-checkbox" />
                  </label>
                </div>

                <div className="settings-grid-2">
                  <div className="settings-field">
                    <label className="settings-label">
                      <Calendar size={12} /><span>Date Format</span>
                    </label>
                    <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className="settings-select">
                      <option value="YYYY-MM-DD">YYYY-MM-DD (2026-07-24)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (07/24/2026)</option>
                      <option value="DD MMM YYYY">DD MMM YYYY (24 Jul 2026)</option>
                    </select>
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">
                      <Hash size={12} /><span>Number Format</span>
                    </label>
                    <select value={numberFormat} onChange={e => setNumberFormat(e.target.value)} className="settings-select">
                      <option value="commas">Commas — 1,234</option>
                      <option value="dots">Dots — 1.234</option>
                      <option value="raw">Raw — 1234</option>
                    </select>
                  </div>
                </div>

                <div className="settings-actions">
                  <button type="submit" className="primary settings-btn">
                    <Save size={14} /> Save preferences
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* ════ LOGS ════ */}
          {activeTab === "notifications" && (() => {
            const filtered = dbLogs.filter(log => {
              const matchCat = logFilter === "all" || log.category === logFilter;
              const matchSearch = !logSearch || 
                log.title.toLowerCase().includes(logSearch.toLowerCase()) ||
                log.message.toLowerCase().includes(logSearch.toLowerCase());
              return matchCat && matchSearch;
            });

            return (
              <section className="settings-section">
                <div className="settings-section-header">
                  <div className="settings-section-icon" style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}>
                    <ClipboardList size={18} />
                  </div>
                  <div>
                    <h2>Sync Logs</h2>
                    <p>Full history of all synchronization activities stored in the database.</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                    <button
                      onClick={fetchDbLogs}
                      disabled={logsLoading}
                      className="outline settings-btn"
                      style={{ padding: "6px 12px", fontSize: 12 }}
                    >
                      <RefreshCw size={12} className={logsLoading ? "spin" : ""} />
                      Refresh
                    </button>
                    {dbLogs.length > 0 && (
                      <button
                        onClick={async () => {
                          if (!confirm("Clear all sync logs from the database?")) return;
                          setIsClearingLogs(true);
                          await supabaseAuth.clearSyncLogs();
                          await fetchDbLogs();
                          setIsClearingLogs(false);
                        }}
                        disabled={isClearingLogs}
                        className="settings-danger-btn"
                      >
                        <Trash2 size={13} />
                        {isClearingLogs ? "Clearing…" : "Clear all"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Search + Filter bar */}
                <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
                    <input
                      value={logSearch}
                      onChange={e => setLogSearch(e.target.value)}
                      placeholder="Search logs…"
                      className="settings-input"
                      style={{ paddingLeft: 32 }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {(["all", "sync", "error", "system"] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setLogFilter(cat)}
                        style={{
                          padding: "5px 11px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                          border: logFilter === cat ? "1px solid var(--violet)" : "1px solid var(--line)",
                          background: logFilter === cat ? "var(--violet-soft)" : "transparent",
                          color: logFilter === cat ? "var(--violet)" : "var(--muted)",
                          cursor: "pointer",
                          textTransform: "capitalize",
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Log count */}
                {!logsLoading && (
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
                    Showing {filtered.length} of {dbLogs.length} log{dbLogs.length !== 1 ? "s" : ""}
                  </div>
                )}

                {/* Content */}
                {logsLoading ? (
                  <div className="settings-empty">
                    <RefreshCw size={24} className="spin" />
                    <p>Loading logs from database…</p>
                  </div>
                ) : logsError ? (
                  <div className="settings-alert err" style={{ marginBottom: 0 }}>
                    <AlertTriangle size={15} />
                    <span>{logsError}</span>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="settings-empty">
                    <ClipboardList size={28} />
                    <p>{dbLogs.length === 0 ? "No sync logs recorded yet." : "No logs match your filter."}</p>
                    {dbLogs.length === 0 && (
                      <small style={{ fontSize: 12, color: "var(--muted)", opacity: 0.7 }}>
                        Logs are written to the database when the extension syncs a submission.
                      </small>
                    )}
                  </div>
                ) : (
                  <div className="notif-log">
                    {filtered.map((log) => (
                      <div key={log.id} className="notif-row">
                        <div className="notif-row-body">
                          <div className="notif-row-top">
                            <span className={`notif-badge ${log.category}`}>{log.category}</span>
                            <strong>{log.title}</strong>
                            <time style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)" }}>
                              {new Date(log.timestamp).toLocaleString()}
                            </time>
                          </div>
                          <p>{log.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })()}

          {/* ════ ADVANCED ════ */}
          {activeTab === "advanced" && (
            <section className="settings-section">
              <div className="settings-section-header">
                <div className="settings-section-icon" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                  <Wrench size={18} />
                </div>
                <div>
                  <h2>Advanced Settings</h2>
                  <p>Export credentials, clean cache, or perform a factory reset.</p>
                </div>
              </div>

              <div className="adv-cards">
                <div className="adv-card">
                  <div className="adv-card-icon"><Download size={18} /></div>
                  <div className="adv-card-body">
                    <span>Export Settings Data</span>
                    <small>Download a JSON file containing all settings (excluding your secret PAT).</small>
                  </div>
                  <button
                    onClick={() => {
                      if (!extension.settings) return;
                      const { token: _t, ...safe } = extension.settings;
                      const blob = new Blob([JSON.stringify(safe, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = "codevault_settings.json"; a.click();
                    }}
                    disabled={!extension.isInstalled}
                    className="outline settings-btn"
                  >
                    Export JSON
                  </button>
                </div>

                <div className="adv-card danger">
                  <div className="adv-card-icon danger"><RotateCcw size={18} /></div>
                  <div className="adv-card-body">
                    <span>Factory Reset</span>
                    <small>Clears all settings from Chrome storage, signs you out, and resets all connection parameters.</small>
                  </div>
                  <button onClick={handleResetSettings} className="settings-btn danger-fill">
                    Reset &amp; Sign out
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ════ ABOUT ════ */}
          {activeTab === "about" && (
            <section className="settings-section">
              <div className="settings-section-header">
                <div className="settings-section-icon" style={{ background: "rgba(99,91,255,0.1)", color: "#635bff" }}>
                  <Info size={18} />
                </div>
                <div>
                  <h2>About CodeVault</h2>
                  <p>Version info, open source license, and technology stack.</p>
                </div>
              </div>

              <div className="about-hero">
                <div className="about-logo">◇</div>
                <div>
                  <h3>CodeVault Developer Suite</h3>
                  <p>Version {APP_VERSION} · Phase 3 Release</p>
                </div>
              </div>

              <p className="about-desc">
                CodeVault is an offline-first solution manager for developers who want absolute ownership of
                their algorithms portfolio. It commits clean code, difficulty metadata, topic tags, streak records,
                and index trackers directly to your personal GitHub repository.
              </p>

              <div className="about-meta">
                {[
                  ["License",    "MIT Open Source"],
                  ["Storage",    "Supabase + Chrome Sandbox"],
                  ["Framework",  "Next.js 15 + React"],
                  ["Extension",  "Chrome MV3"],
                  ["Version",    APP_VERSION],
                  ["Release",    "Phase 3"],
                ].map(([k, v]) => (
                  <div key={k} className="about-meta-item">
                    <span>{k}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </main>
  );
}
