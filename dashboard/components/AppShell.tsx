"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, BookOpen, Code2, GitFork, GitCommitHorizontal,
  LayoutDashboard, Menu, Settings, Trophy, ChartNoAxesCombined,
  X, Check, Trash2, LogOut, ChevronRight, ChevronDown, ExternalLink,
  Zap, Mail, Calendar, User, Palette, BellRing, Wrench, Info,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRepository } from "../contexts/RepositoryContext";
import { useExtension } from "../hooks/useExtension";
import { supabaseAuth, syncStateToExtension } from "../services/supabaseAuth";

const DESKTOP_NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/dashboard/problems", label: "Problems", Icon: Code2 },
  { href: "/dashboard/statistics", label: "Statistics", Icon: ChartNoAxesCombined },
  { href: "/dashboard/timeline", label: "Timeline", Icon: GitCommitHorizontal },
  { href: "/dashboard/achievements", label: "Achievements", Icon: Trophy },
  { href: "/dashboard/repository", label: "Repository", Icon: GitFork },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings },
  { href: "/dashboard/help", label: "Help & Docs", Icon: BookOpen },
];

const MOBILE_NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard, tab: null },
  { href: "/dashboard/repository", label: "Repository", Icon: GitFork, tab: null },
  { href: "/dashboard/settings?tab=profile", label: "Profile", Icon: User, tab: "profile" },
  { href: "/dashboard/settings?tab=github", label: "GitHub", Icon: GitFork, tab: "github" },
  { href: "/dashboard/settings?tab=appearance", label: "Appearance", Icon: Palette, tab: "appearance" },
  { href: "/dashboard/settings?tab=notifications", label: "Logs", Icon: BellRing, tab: "notifications" },
  { href: "/dashboard/settings?tab=advanced", label: "Advanced", Icon: Wrench, tab: "advanced" },
  { href: "/dashboard/settings?tab=about", label: "About", Icon: Info, tab: "about" },
  { href: "/dashboard/help", label: "Help & Docs", Icon: BookOpen, tab: null },
];

const MOBILE_BOTTOM_NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/dashboard/problems", label: "Problems", Icon: Code2 },
  { href: "/dashboard/statistics", label: "Statistics", Icon: ChartNoAxesCombined },
  { href: "/dashboard/timeline", label: "Timeline", Icon: GitCommitHorizontal },
  { href: "/dashboard/achievements", label: "Achievements", Icon: Trophy },
];

const PLAN_STYLE: Record<string, { bg: string; color: string }> = {
  free: { bg: "rgba(100,116,139,0.12)", color: "#64748b" },
  pro: { bg: "rgba(109,106,254,0.15)", color: "#6d6afe" },
  developer: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
};

/* ════════════════════════════════════════════════════════════
   PROFILE MODAL  (Premium Glassmorphic Variant)
════════════════════════════════════════════════════════════ */
function ProfileModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const router = useRouter();
  const profile = supabaseAuth.getProfile();
  const repo = useRepository();
  const extension = useExtension();

  const name = profile?.full_name || profile?.username || "CodeVault User";
  const email = profile?.email || "";
  const initial = (name[0] || "U").toUpperCase();
  const plan = profile?.plan || "free";

  const planGradient: Record<string, string> = {
    free: "linear-gradient(135deg, #64748b, #475569)",
    pro: "linear-gradient(135deg, #6d6afe, #4f46e5)",
    developer: "linear-gradient(135deg, #f59e0b, #d97706)",
  };

  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  const handleSignOut = async () => {
    onClose();
    await supabaseAuth.signOut();
    router.replace("/login");
  };

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
        overflowY: "auto",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="profile-modal-content"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 18, right: 18,
            width: 28, height: 28, borderRadius: "50%",
            border: "1px solid #e2e8f0", background: "rgba(255, 255, 255, 0.8)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#64748b", transition: "all 0.2s",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#f4f3ff";
            e.currentTarget.style.color = "#635bff";
            e.currentTarget.style.borderColor = "#c7d2fe";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)";
            e.currentTarget.style.color = "#64748b";
            e.currentTarget.style.borderColor = "#e2e8f0";
          }}
        >
          <X size={14} />
        </button>

        {/* Hero Section */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, #6d6afe, #a78bfa)",
            color: "#fff", fontSize: 20, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 24px rgba(109,106,254,0.25)", flexShrink: 0,
          }}>
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", margin: 0 }}>
              {name}
            </h2>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
              @{profile?.username || "user"}
            </span>
          </div>
          <span style={{
            padding: "4px 10px", borderRadius: 20,
            fontSize: 9, fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "0.08em",
            background: planGradient[plan] || planGradient.free,
            color: "#ffffff", flexShrink: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}>
            {plan}
          </span>
        </div>

        {/* Info Rows */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 12,
          padding: 16, borderRadius: 16,
          background: "rgba(248, 250, 252, 0.85)",
          border: "1px solid #e2e8f0",
        }}>
          {[
            { Icon: Mail, content: email || "No email set" },
            profile?.github_username
              ? { Icon: GitFork, content: `github.com/${profile.github_username}`, href: `https://github.com/${profile.github_username}` }
              : null,
            repo
              ? { Icon: Code2, content: `${repo.owner}/${repo.repo}`, href: `https://github.com/${repo.owner}/${repo.repo}` }
              : null,
            { Icon: Calendar, content: `Member since ${profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}` },
          ].filter(Boolean).map((row, i) => {
            const Icon = row!.Icon;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--muted)" }}>
                <Icon size={14} style={{ color: "var(--violet)", flexShrink: 0 }} />
                {row!.href ? (
                  <a href={row!.href} target="_blank" rel="noreferrer"
                    style={{ color: "var(--violet)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
                    {row!.content} <ExternalLink size={11} />
                  </a>
                ) : (
                  <span>{row!.content}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Extension Connection */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
            background: extension.isInstalled ? "#10b981" : "var(--muted)",
            boxShadow: extension.isInstalled ? "0 0 0 3px rgba(16,185,129,0.2)" : "none",
          }} />
          {extension.isInstalled ? "Extension connected" : "Extension not detected"}
          {!extension.isInstalled && (
            <Link href="/dashboard/help" onClick={onClose}
              style={{
                marginLeft: "auto", fontSize: 11, color: "#6d6afe", textDecoration: "none", fontWeight: 600,
                display: "flex", alignItems: "center", gap: 3
              }}>
              Install guide <ChevronRight size={11} />
            </Link>
          )}
        </div>

        {/* Bottom Actions */}
        {confirmingSignOut ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              borderRadius: 16,
              border: "1.5px solid rgba(239,68,68,0.25)",
              background: "rgba(239,68,68,0.05)",
              padding: "18px 20px",
              display: "flex", flexDirection: "column", gap: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "rgba(239,68,68,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <LogOut size={15} style={{ color: "#ef4444" }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Sign out?</p>
                <p style={{ margin: 0, fontSize: 11, color: "var(--muted)", marginTop: 2 }}>You'll need to log in again to access your vault.</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setConfirmingSignOut(false)}
                style={{
                  flex: 1, padding: "9px 16px", borderRadius: 10,
                  border: "1.5px solid var(--line)", background: "var(--card-bg)",
                  color: "var(--ink)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--violet-soft)"; e.currentTarget.style.color = "var(--violet)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--card-bg)"; e.currentTarget.style.color = "var(--ink)"; }}
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                style={{
                  flex: 1, padding: "9px 16px", borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(239,68,68,0.45)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(239,68,68,0.3)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Yes, sign me out
              </button>
            </div>
          </motion.div>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/dashboard/settings" onClick={onClose}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "11px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0",
                background: "#ffffff", color: "#0f172a", fontSize: 13, fontWeight: 700,
                textDecoration: "none", cursor: "pointer", transition: "all 0.2s",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f4f3ff"; e.currentTarget.style.color = "#635bff"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#0f172a"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
            >
              <Settings size={14} /> Settings
            </Link>
            <button
              onClick={() => setConfirmingSignOut(true)}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "11px 16px", borderRadius: 12, border: "1.5px solid rgba(239,68,68,0.25)",
                background: "#fff5f5", color: "#ef4444", fontSize: 13, fontWeight: 700,
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: "0 2px 6px rgba(239,68,68,0.06)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "#fca5a5"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"; }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}

/* ════════════════════════════════════════════════════════════
   APPSHELL
════════════════════════════════════════════════════════════ */
export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "profile";
  const repository = useRepository();
  const extension = useExtension();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);

  // ── Auth Guard ──────────
  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      const isPlatform = path.startsWith("/dashboard") || path === "/onboarding";
      const isAuthPage = path === "/login" || path === "/register";

      const session = await supabaseAuth.ensureValidSession();
      if (cancelled) return;

      if (isPlatform && !session) {
        setAuthChecked(false);
        router.replace("/login");
        return;
      }
      if (isAuthPage && session) {
        router.replace("/dashboard");
        return;
      }

      setAuthChecked(true);
    };

    checkAuth();
    return () => { cancelled = true; };
  }, [path, router]);

  // Sync state to extension once authenticated
  useEffect(() => {
    if (authChecked) {
      const loadRepoConfig = async () => {
        const session = supabaseAuth.getSession();
        if (session?.user?.id) {
          try {
            const { supabase } = await import("../services/supabaseAuth");
            if (supabase) {
              const { data: repoData } = await supabase
                .from("repositories")
                .select("*")
                .eq("user_id", session.user.id)
                .maybeSingle();

              if (repoData) {
                localStorage.setItem("codevault_supabase_repository", JSON.stringify(repoData));
                localStorage.setItem("codevault:repository", JSON.stringify({ owner: repoData.repository_owner || repoData.user_id, repo: repoData.repository_name }));
                if (repoData.github_token) {
                  localStorage.setItem("codevault:github_token", repoData.github_token);
                }
                localStorage.setItem("codevault:onboarding_completed", "true");
              }
            }
          } catch (e) {
            console.error("Failed to load repository config from Supabase:", e);
          }
        }
        await syncStateToExtension();
      };

      loadRepoConfig();
    }
  }, [authChecked]);

  // ── Click-outside for notifications ───────────────────────
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setShowNotifications(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const isPlatformRoute = path.startsWith("/dashboard") || path === "/onboarding";

  // Loading screen while checking auth or redirecting unauthenticated users
  if (isPlatformRoute && (!authChecked || !supabaseAuth.getSession())) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 14, background: "var(--bg)", color: "var(--muted)", fontSize: 13,
      }}>
        <div style={{
          width: 28, height: 28,
          border: "2.5px solid var(--line)", borderTopColor: "var(--violet)",
          borderRadius: "50%", animation: "spin 0.7s linear infinite",
        }} />
        Verifying session…
      </div>
    );
  }

  if (!path.startsWith("/dashboard")) return <>{children}</>;

  const unreadCount = extension.notifications.filter(n => !n.read).length;
  const closeAll = () => { setMenuOpen(false); setShowNotifications(false); };
  const profile = supabaseAuth.getProfile();
  const initial = (profile?.full_name || profile?.email || "CV")[0].toUpperCase();

  const currentLabel = (() => {
    if (path.startsWith("/dashboard/settings")) {
      const sub = MOBILE_NAV.find(s => s.tab === currentTab);
      return sub ? `Settings — ${sub.label}` : "Settings";
    }
    const item = DESKTOP_NAV.find(n =>
      n.href === path || (n.href !== "/dashboard" && path.startsWith(n.href))
    );
    return item?.label ?? "Dashboard";
  })();

  return (
    <>
      {/* ── Profile Modal ── */}
      <AnimatePresence>
        {showProfile && (
          <ProfileModal key="profile-modal" onClose={() => setShowProfile(false)} />
        )}
      </AnimatePresence>

      <div className="shell">

        {/* ══ SIDEBAR ══════════════════════════════════════ */}
        <aside className={menuOpen ? "open" : ""}>

          {/* Brand */}
          <Link href="/dashboard" className="brand" onClick={closeAll}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              textDecoration: "none", padding: "0 4px 24px", color: "var(--ink)"
            }}>
            <Image
              src="/main-logo.png"
              alt="CodeVault"
              width={72}
              height={72}
              style={{ borderRadius: 12, flexShrink: 0 }}
              priority
            />
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.04em" }}>
              CodeVault
            </span>
          </Link>

          {/* Nav links */}
          <nav className="shell-nav">
            {/* Desktop Nav Items */}
            <div className="desktop-nav-group">
              {DESKTOP_NAV.map(({ href, label, Icon }) => {
                const active = href === "/dashboard" ? path === href : path.startsWith(href);
                return (
                  <Link key={href} href={href} onClick={closeAll}
                    className={active ? "active" : ""}>
                    <Icon size={16} />
                    <span>{label}</span>
                    {active && <motion.i layoutId="active-nav-desktop" />}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Nav Items */}
            <div className="mobile-nav-group">
              {MOBILE_NAV.map(({ href, label, Icon, tab }) => {
                const active = tab
                  ? path.startsWith("/dashboard/settings") && currentTab === tab
                  : href === "/dashboard"
                    ? path === href
                    : path.startsWith(href);
                return (
                  <Link key={href} href={href} onClick={closeAll}
                    className={active ? "active" : ""}>
                    <Icon size={16} />
                    <span>{label}</span>
                    {active && <motion.i layoutId="active-nav-mobile" />}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User row → opens Profile Modal */}
          <button
            onClick={() => setShowProfile(true)}
            aria-label="View profile"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", marginTop: "auto",
              borderRadius: 12, cursor: "pointer", width: "100%",
              border: "1px solid var(--line)",
              background: "var(--violet-soft)", textAlign: "left",
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#6d6afe,#a78bfa)",
              color: "#fff", fontSize: 12, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {initial}
            </div>
            <div className="user-btn-text" style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: "var(--ink)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                }}>
                  {profile?.full_name || profile?.username || "CodeVault User"}
                </div>
                <div style={{
                  fontSize: 11, color: "var(--muted)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                }}>
                  {profile?.email || ""}
                </div>
              </div>
              <ChevronRight size={13} style={{ color: "var(--muted)", flexShrink: 0 }} />
            </div>
          </button>
        </aside>

        {/* Mobile scrim */}
        <AnimatePresence>
          {menuOpen && (
            <motion.button className="scrim" aria-label="Close"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeAll} />
          )}
        </AnimatePresence>

        {/* ══ MAIN ═════════════════════════════════════════ */}
        <div className="main">

          {/* Topbar */}
          <header className="topbar">
            <div className="topbar-left">
              <button className="menu" aria-label="Toggle menu"
                onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <span className="topbar-title">
                {currentLabel}
              </span>
            </div>

            <div className="top-meta">
              {/* Repo pill */}
              {repository && (
                (() => {
                  const isUuid = (s?: string) => Boolean(s && (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s) || s.startsWith("usr_") || s.startsWith("gh_usr_")));
                  const ownerName = !isUuid(repository.owner) ? repository.owner : (profile?.github_username || profile?.username || "configure-owner");
                  return (
                    <a href={`https://github.com/${ownerName}/${repository.repo}`}
                      target="_blank" rel="noreferrer"
                      className="responsive-repo-pill">
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "#10b981",
                        boxShadow: "0 0 0 3px rgba(16,185,129,0.18)", flexShrink: 0,
                      }} />
                      <span className="responsive-repo-text">{ownerName}/{repository.repo}</span>
                      <ExternalLink size={10} style={{ flexShrink: 0 }} />
                    </a>
                  );
                })()
              )}

              {/* Notifications */}
              <div style={{ position: "relative" }} ref={notifRef}>
                <button
                  onClick={() => {
                    const opening = !showNotifications;
                    setShowNotifications(opening);
                    // Auto-mark all as read when opening the notification panel
                    if (opening && unreadCount > 0) {
                      extension.markAllNotificationsRead();
                    }
                  }}
                  aria-label="Notifications"
                  className={`icon-btn${showNotifications ? " active" : ""}${unreadCount > 0 ? " has-badge" : ""}`}
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span className="notif-dot">{unreadCount}</span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div className="dropdown notif-dropdown"
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.13 }}>

                      <div className="dropdown-header">
                        <strong>Notifications</strong>
                        {unreadCount > 0 && (
                          <button className="dropdown-action"
                            onClick={() => extension.markAllNotificationsRead()}>
                            <Check size={11} /> Mark all read
                          </button>
                        )}
                      </div>

                      {extension.notifications.length === 0 ? (
                        <div className="dropdown-empty-state">
                          <Bell size={26} strokeWidth={1.5} />
                          <span>No notifications yet</span>
                          <small style={{ fontSize: 11, color: "var(--muted)", opacity: 0.7 }}>Sync events will appear here</small>
                        </div>
                      ) : (
                        <div className="dropdown-list">
                          {extension.notifications.slice(0, 6).map(log => (
                            <div key={log.id} className={`dropdown-item${log.read ? "" : " unread"}`}>
                              <div className="dropdown-item-body">
                                <div className="dropdown-item-top">
                                  <span className={`notif-badge ${log.category}`}>{log.category}</span>
                                  <span className="dropdown-item-title">{log.title}</span>
                                </div>
                                <p>{log.message}</p>
                              </div>
                              <button className="dropdown-dismiss"
                                onClick={() => extension.dismissNotification(log.id)}>✕</button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="dropdown-footer">
                        <Link href="/dashboard/settings" className="dropdown-link"
                          onClick={() => setShowNotifications(false)}>
                          View all logs →
                        </Link>
                        {extension.notifications.length > 0 && (
                          <button className="dropdown-danger"
                            onClick={() => extension.clearNotifications()}>
                            <Trash2 size={11} /> Clear all
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Avatar → Profile Modal */}
              <button
                onClick={() => setShowProfile(true)}
                aria-label="Open profile"
                style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "linear-gradient(135deg,#6d6afe,#a78bfa)",
                  color: "#fff", fontSize: 13, fontWeight: 800,
                  border: 0, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {initial}
              </button>
            </div>
          </header>

          {/* Page content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={path}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              style={{ willChange: "opacity, transform" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>

          {/* Mobile bottom nav */}
          <div className="mobile-nav">
            {MOBILE_BOTTOM_NAV.map(({ href, label, Icon }) => {
              const active = href === "/dashboard" ? path === href : path.startsWith(href);
              return (
                <Link key={href} href={href} aria-label={label} onClick={closeAll}
                  className={active ? "active" : ""}>
                  <Icon size={18} />
                  <small>{label}</small>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
