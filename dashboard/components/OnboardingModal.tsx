"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Download, Puzzle, GitFork, CheckCircle2,
  ArrowRight, ExternalLink, Loader2, X, Zap, ShieldCheck,
} from "lucide-react";
import { supabaseAuth } from "../services/supabaseAuth";

const ONBOARDING_KEY = "codevault:onboarding_completed";

function useResolvedTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const el = document.documentElement;
    const updateTheme = () => {
      const active = el.getAttribute("data-theme") || "light";
      setTheme(active as "light" | "dark");
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

export function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const [mounted,     setMounted]     = useState(false);
  const [step,        setStep]        = useState(1);
  const [owner,       setOwner]       = useState("");
  const [repo,        setRepo]        = useState("");
  const [token,       setToken]       = useState("");
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [ping,        setPing]        = useState<"idle" | "checking" | "ok" | "missing">("idle");

  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  // detect extension on step 2
  useEffect(() => {
    if (step !== 2) return;
    setPing("checking");
    
    let active = true;
    const check = async () => {
      try {
        const { extensionBridge } = await import("../services/extensionBridge");
        const isInstalled = await extensionBridge.ping();
        if (active) {
          setPing(isInstalled ? "ok" : "missing");
        }
      } catch {
        if (active) setPing("missing");
      }
    };
    check();
    
    return () => {
      active = false;
    };
  }, [step]);

  const handleSave = async () => {
    if (!owner.trim() || !repo.trim() || !token.trim()) {
      setError("All three fields are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Bypass validation check if token is mock
      if (token.startsWith("sb_") || token === "mock_token") {
        supabaseAuth.saveProfile({ github_username: owner });
        supabaseAuth.saveRepository({
          repository_name: repo,
          repository_owner: owner,
          visibility: "public",
          default_branch: "main",
          github_token: token,
        });
        localStorage.setItem("codevault:repository", JSON.stringify({ owner, repo }));
        localStorage.setItem("codevault:github_token", token);
        
        // Sync to extension
        const { syncStateToExtension } = await import("../services/supabaseAuth");
        await syncStateToExtension();
        
        setStep(4);
        return;
      }

      // 1. Verify token & get authenticated user info
      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json"
        }
      });
      if (!userRes.ok) {
        setError("Invalid GitHub token. Please verify and try again.");
        setSaving(false);
        return;
      }
      const userData = await userRes.json();
      const tokenUser = userData.login;

      // 2. Check if repository exists
      let repoDetails: { private: boolean; default_branch: string } | null = null;
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
      });

      if (res.ok) {
        const data = await res.json();
        repoDetails = {
          private: data.private,
          default_branch: data.default_branch || "main"
        };
      } else if (res.status === 404) {
        // Attempt auto-creation of repository
        const isUserRepo = tokenUser.toLowerCase() === owner.toLowerCase();
        const createEndpoint = isUserRepo ? "https://api.github.com/user/repos" : `https://api.github.com/orgs/${owner}/repos`;
        
        const createRes = await fetch(createEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: repo,
            private: false,
            auto_init: true,
            description: "LeetCode solutions synced by CodeVault"
          })
        });

        if (createRes.ok) {
          const data = await createRes.json();
          repoDetails = {
            private: data.private,
            default_branch: data.default_branch || "main"
          };
        } else {
          setError(`Repository not found and auto-creation failed. Check token scopes.`);
          setSaving(false);
          return;
        }
      } else {
        setError("Lacks repository read/write permissions.");
        setSaving(false);
        return;
      }

      // 3. Save profile and repository mapping
      supabaseAuth.saveProfile({ github_username: owner });
      supabaseAuth.saveRepository({
        repository_name: repo,
        repository_owner: owner,
        visibility: repoDetails.private ? "private" : "public",
        default_branch: repoDetails.default_branch,
        github_token: token,
      });

      localStorage.setItem("codevault:repository", JSON.stringify({ owner, repo }));
      localStorage.setItem("codevault:github_token", token);

      // Sync to extension
      const { syncStateToExtension } = await import("../services/supabaseAuth");
      await syncStateToExtension();

      setStep(4);
    } catch {
      setError("Network error — check your connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    onComplete();
  };

  const progress = ((step - 1) / 3) * 100;

  const colors = {
    cardBg: isDark ? "#0d0e12" : "#ffffff",
    border: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
    shadow: isDark
      ? "0 24px 64px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0px rgba(255, 255, 255, 0.05)"
      : "0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04)",
    inputBg: isDark ? "rgba(255, 255, 255, 0.02)" : "#ffffff",
    inputBorder: isDark ? "rgba(255, 255, 255, 0.08)" : "#cbd5e1",
    subCardBg: isDark ? "rgba(255, 255, 255, 0.02)" : "#f8fafc",
    subCardBorder: isDark ? "rgba(255, 255, 255, 0.06)" : "#e2e8f0",
    stepDotBg: isDark ? "rgba(255, 255, 255, 0.02)" : "#f1f5f9",
    stepDotBorder: isDark ? "rgba(255, 255, 255, 0.06)" : "#e2e8f0",
    stepDotColor: isDark ? "#64748b" : "#94a3b8",
  };

  const s = {
    backdrop: {
      position: "fixed" as const, inset: 0, zIndex: 9999,
      background: "rgba(9, 11, 18, 0.65)",
      backdropFilter: "blur(14px) saturate(190%)",
      WebkitBackdropFilter: "blur(14px) saturate(190%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      overflowY: "auto" as const,
    },
    card: {
      background: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: 24,
      boxShadow: colors.shadow,
      width: "100%", maxWidth: 480, overflow: "hidden",
      maxHeight: "calc(100vh - 48px)",
      display: "flex", flexDirection: "column" as const,
      margin: "auto",
    },
    header: {
      display: "flex", alignItems: "center", gap: 14,
      padding: "24px 28px 20px",
      borderBottom: `1px solid ${colors.border}`,
    },
    logoBox: {
      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 4px 12px rgba(109,106,254,0.15)", overflow: "hidden",
    },
    body: { padding: 28, display: "flex", flexDirection: "column" as const, gap: 16, minHeight: 280, overflowY: "auto" as const },
    stepIcon: (color: string, bg: string) => ({
      width: 52, height: 52, borderRadius: 14,
      background: bg, color,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1)",
    }),
    input: {
      width: "100%", padding: "11px 14px", borderRadius: 9,
      border: `1.5px solid ${colors.inputBorder}`, background: colors.inputBg,
      color: "var(--ink)", fontSize: 13, fontFamily: "inherit",
      outline: "none", boxSizing: "border-box" as const,
      transition: "border-color 0.2s, box-shadow 0.2s",
    },
    label: { fontSize: 11, fontWeight: 700, color: "var(--muted)",
      textTransform: "uppercase" as const, letterSpacing: "0.05em",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginBottom: 6 },
    btnPrimary: {
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: "10px 22px", borderRadius: 9, border: 0,
      background: "linear-gradient(135deg, #6d6afe, #a78bfa)",
      color: "#fff", fontSize: 13, fontWeight: 700,
      cursor: "pointer", textDecoration: "none",
      boxShadow: "0 4px 14px rgba(109,106,254,0.3)",
      transition: "all 0.2s",
    },
    btnGhost: {
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: "10px 18px", borderRadius: 9,
      border: `1px solid ${colors.border}`, background: isDark ? "rgba(255, 255, 255, 0.03)" : "transparent",
      color: "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer",
      transition: "all 0.2s",
    },
    actions: { display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" as const },
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div style={s.backdrop}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div style={s.card}
          initial={{ opacity: 0, scale: 0.93, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 24 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}>

          {/* Header */}
          <div style={s.header}>
            <div style={s.logoBox}>
              <Image
                src="/main-logo.png"
                alt="CodeVault Logo"
                width={38}
                height={38}
                style={{ borderRadius: 8 }}
              />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", margin: 0 }}>
                Set up CodeVault
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                Complete in under 2 minutes
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: "var(--line)", position: "relative" }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                position: "absolute", left: 0, top: 0, height: "100%",
                background: "linear-gradient(90deg,#6d6afe,#a78bfa)",
                borderRadius: "0 2px 2px 0",
              }} />
          </div>

          {/* Step dots */}
          <div style={{ display: "flex", gap: 8, padding: "14px 26px", borderBottom: `1px solid ${colors.border}` }}>
            {[1, 2, 3, 4].map(n => {
              const done   = step > n;
              const active = step === n;
              return (
                <div key={n} style={{
                  width: 28, height: 28, borderRadius: "50%",
                  border: `2px solid ${done ? "#34d399" : active ? "#6d6afe" : colors.stepDotBorder}`,
                  background: done ? "rgba(52,211,153,0.1)" : active ? "rgba(109,106,254,0.08)" : colors.stepDotBg,
                  color: done ? "#34d399" : active ? "#6d6afe" : colors.stepDotColor,
                  fontSize: 11, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: active ? "0 0 0 4px rgba(109,106,254,0.12)" : "none",
                }}>
                  {done ? <CheckCircle2 size={13} /> : n}
                </div>
              );
            })}
          </div>

          {/* Step body */}
          <div style={s.body}>
            <AnimatePresence mode="wait">

              {/* ── Step 1: Download ── */}
              {step === 1 && (
                <motion.div key="s1" style={{ display: "flex", flexDirection: "column", gap: 14 }}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div style={s.stepIcon("#6d6afe", "rgba(109,106,254,0.1)")}><Download size={26} /></div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>Download the Extension</div>
                  <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
                    CodeVault works via a Chrome extension that captures accepted LeetCode submissions and pushes them to GitHub.
                  </p>
                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px",
                    background: colors.subCardBg, border: `1px solid ${colors.subCardBorder}`,
                    borderRadius: 10, fontSize: 13,
                  }}>
                    <ShieldCheck size={16} style={{ color: "#6d6afe", flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 3, color: "var(--ink)" }}>Open source & transparent</div>
                      <div style={{ color: "var(--muted)" }}>Only reads leetcode.com — nothing else.</div>
                    </div>
                  </div>
                  <div style={s.actions}>
                    <a href="/CodeVault.zip" download="CodeVault.zip" style={s.btnPrimary as React.CSSProperties}
                      onClick={() => setTimeout(() => setStep(2), 300)}>
                      <Download size={14} /> Download ZIP
                    </a>
                    <button style={s.btnGhost} onClick={() => setStep(2)}>
                      Already have it <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Install ── */}
              {step === 2 && (
                <motion.div key="s2" style={{ display: "flex", flexDirection: "column", gap: 14 }}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div style={s.stepIcon("#a78bfa", "rgba(167,139,250,0.1)")}><Puzzle size={26} /></div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>Install the Extension</div>
                  <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                    {["Open chrome://extensions", "Enable Developer Mode (top-right toggle)", "Click Load unpacked & select the folder", "CodeVault icon appears in your toolbar"].map((txt, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--ink)" }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                          background: "linear-gradient(135deg,#6d6afe,#a78bfa)",
                          color: "#fff", fontSize: 11, fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>{i + 1}</span>
                        {txt}
                      </li>
                    ))}
                  </ol>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                    borderRadius: 9, fontSize: 12, fontWeight: 500,
                    border: `1px solid ${colors.border}`, background: colors.inputBg,
                    color: ping === "ok" ? "#10b981" : ping === "missing" ? "#dc2626" : ping === "checking" ? "#6d6afe" : "var(--muted)",
                  }}>
                    {ping === "checking" && <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />}
                    {ping === "ok"       && <CheckCircle2 size={14} />}
                    {ping === "missing"  && <X size={14} />}
                    {ping === "idle"     && <Zap size={14} />}
                    {ping === "checking" ? "Detecting extension…"
                      : ping === "ok"    ? "Extension detected! Ready to continue."
                      : ping === "missing" ? "Not detected — install it and refresh."
                      : "Waiting for extension…"}
                  </div>
                  <div style={s.actions}>
                    <a href="chrome://extensions" target="_blank" rel="noreferrer"
                      style={{ ...s.btnGhost, border: "1px solid rgba(109,106,254,0.3)", color: "var(--violet)" } as React.CSSProperties}>
                      Open Chrome Extensions <ExternalLink size={13} />
                    </a>
                    <button style={s.btnPrimary as React.CSSProperties} onClick={() => setStep(3)}>
                      Continue <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: GitHub ── */}
              {step === 3 && (
                <motion.div key="s3" style={{ display: "flex", flexDirection: "column", gap: 14 }}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div style={s.stepIcon("#34d399", "rgba(52,211,153,0.1)")}><GitFork size={26} /></div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>Connect GitHub</div>
                  <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
                    Create a Personal Access Token and point CodeVault at your vault repository.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { label: "GitHub Username / Org", val: owner, set: setOwner, ph: "octocat" },
                      { label: "Repository Name",        val: repo,  set: setRepo,  ph: "leetcode-vault" },
                    ].map(({ label, val, set, ph }) => (
                      <div key={label}>
                        <div style={s.label}><span>{label}</span></div>
                        <input value={val} onChange={e => set(e.target.value)}
                          placeholder={ph} style={s.input} />
                      </div>
                    ))}
                    <div>
                      <div style={s.label}>
                        <span>Personal Access Token</span>
                        <a href="https://github.com/settings/tokens/new?scopes=repo&description=CodeVault"
                          target="_blank" rel="noreferrer"
                          style={{ fontSize: 11, color: "#6d6afe", textDecoration: "none", fontWeight: 500,
                            display: "flex", alignItems: "center", gap: 3, textTransform: "none", letterSpacing: "normal" }}>
                          Generate token <ExternalLink size={10} />
                        </a>
                      </div>
                      <input type="password" value={token} onChange={e => setToken(e.target.value)}
                        placeholder="github_pat_xxxx…" style={s.input} />
                    </div>
                    {error && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                        borderRadius: 9, fontSize: 12, fontWeight: 500,
                        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                        color: "#dc2626",
                      }}>
                        <X size={13} /> {error}
                      </div>
                    )}
                  </div>
                  <div style={s.actions}>
                    <button style={s.btnGhost} onClick={() => setStep(2)}>Back</button>
                    <button style={{ ...s.btnPrimary, opacity: saving ? 0.6 : 1 } as React.CSSProperties}
                      onClick={handleSave} disabled={saving}>
                      {saving ? <><Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> Verifying…</> : <>Verify & Save <ArrowRight size={14} /></>}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 4: Done ── */}
              {step === 4 && (
                <motion.div key="s4"
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center", padding: "12px 0" }}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <motion.div
                    style={{
                      width: 72, height: 72, borderRadius: "50%",
                      background: "rgba(52,211,153,0.12)", color: "#34d399",
                      border: "2px solid rgba(52,211,153,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}>
                    <CheckCircle2 size={36} />
                  </motion.div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)" }}>You&apos;re all set! 🎉</div>
                  <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, margin: 0, maxWidth: 340 }}>
                    Connected to <strong>{owner}/{repo}</strong>. Every accepted submission will be committed automatically.
                  </p>
                  <div style={{
                    display: "flex", flexDirection: "column", gap: 8,
                    background: colors.subCardBg, border: `1px solid ${colors.subCardBorder}`,
                    borderRadius: 12, padding: "14px 20px", width: "100%",
                  }}>
                    {["Extension installed", "GitHub connected", "Repository mapped"].map(t => (
                      <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, color: "#059669" }}>
                        <CheckCircle2 size={14} /> {t}
                      </div>
                    ))}
                  </div>
                  <button style={{ ...s.btnPrimary, padding: "13px 28px", fontSize: 15 } as React.CSSProperties}
                    onClick={handleFinish}>
                    Open Dashboard <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
