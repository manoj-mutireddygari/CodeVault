"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseAuth } from "../../../services/supabaseAuth";
import type { UserProfile, RepositoryRecord } from "@codevault/types";
import { useRepository } from "../../../contexts/RepositoryContext";
import { useVault } from "../../../hooks/useVault";
import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  GitFork,
  LogOut,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const repoCtx = useRepository();
  const vault = useVault(repoCtx);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [repository, setRepository] = useState<RepositoryRecord | null>(null);

  useEffect(() => {
    const p = supabaseAuth.getProfile();
    const r = supabaseAuth.getRepository();
    setProfile(p);
    setRepository(r);
  }, []);

  const handleSignOut = async () => {
    await supabaseAuth.signOut();
    router.push("/login");
  };

  const totalSolved = vault.data?.stats.totalSolved ?? 0;

  return (
    <main className="page" style={{ maxWidth: 860 }}>
      <div className="page-title">
        <div>
          <p className="eyebrow">ACCOUNT & IDENTITY</p>
          <h1>User Profile</h1>
          <p>Manage your Supabase identity, connected repository mapping, and subscription tier.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>
        {/* Profile Card Sidebar */}
        <div className="glass-card" style={{ padding: 24, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--violet), #b5adff)",
              color: "white",
              display: "grid",
              placeItems: "center",
              fontSize: 28,
              fontWeight: 850,
              marginBottom: 14,
              boxShadow: "0 8px 24px rgba(99,91,255,0.25)",
            }}
          >
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "CV"}
          </div>

          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{profile?.full_name || "CodeVault User"}</h2>
          <p style={{ margin: "4px 0 14px", fontSize: 12, color: "var(--muted)" }}>{profile?.email || "user@codevault.dev"}</p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 800,
              background: "var(--violet-soft)",
              color: "var(--violet)",
              border: "1px solid var(--line)",
              marginBottom: 20,
            }}
          >
            <Sparkles size={12} />
            {(profile?.plan || "PRO").toUpperCase()} DEVELOPER PLAN
          </div>

          <button
            onClick={handleSignOut}
            className="outline"
            style={{ width: "100%", padding: "10px", borderRadius: 12, fontSize: 12, fontWeight: 700, color: "#dc2626", justifyContent: "center", gap: 6 }}
          >
            <LogOut size={14} />
            Sign Out Session
          </button>
        </div>

        {/* Detailed Meta Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Identity Info */}
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
              <User size={16} style={{ color: "var(--violet)" }} />
              Identity Metadata
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 13 }}>
              <div>
                <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Email Address</span>
                <strong style={{ display: "block", color: "var(--ink)", marginTop: 2 }}>{profile?.email || "user@codevault.dev"}</strong>
              </div>
              <div>
                <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>GitHub Username</span>
                <strong style={{ display: "block", color: "var(--ink)", marginTop: 2 }}>
                  {profile?.github_username || repoCtx?.owner || "Not linked"}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Account Created</span>
                <strong style={{ display: "block", color: "var(--ink)", marginTop: 2 }}>
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Jul 2026"}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Auth Identity Provider</span>
                <strong style={{ display: "block", color: "var(--ink)", marginTop: 2 }}>Supabase Cloud Auth</strong>
              </div>
            </div>
          </div>

          {/* Repository Mapping */}
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
              <GitFork size={16} style={{ color: "var(--violet)" }} />
              Connected Code Vault
            </h3>

            {repoCtx ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ padding: 14, background: "var(--violet-soft)", border: "1px solid var(--line)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ fontSize: 14, color: "var(--ink)", display: "block" }}>{repoCtx.owner} / {repoCtx.repo}</strong>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>Main GitHub repository storage branch</span>
                  </div>
                  <a
                    href={`https://github.com/${repoCtx.owner}/${repoCtx.repo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="primary"
                    style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12 }}
                  >
                    View Repo <ExternalLink size={12} />
                  </a>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 12, textAlign: "center" }}>
                  <div style={{ padding: 12, background: "var(--card-bg)", border: "1px solid var(--line)", borderRadius: 10 }}>
                    <span style={{ color: "var(--muted)", fontSize: 10, fontWeight: 700 }}>SOLVED PROBLEMS</span>
                    <strong style={{ display: "block", fontSize: 18, color: "var(--ink)", marginTop: 2 }}>{totalSolved}</strong>
                  </div>
                  <div style={{ padding: 12, background: "var(--card-bg)", border: "1px solid var(--line)", borderRadius: 10 }}>
                    <span style={{ color: "var(--muted)", fontSize: 10, fontWeight: 700 }}>STORAGE TYPE</span>
                    <strong style={{ display: "block", fontSize: 13, color: "var(--ink)", marginTop: 4 }}>GitHub JSON</strong>
                  </div>
                  <div style={{ padding: 12, background: "var(--card-bg)", border: "1px solid var(--line)", borderRadius: 10 }}>
                    <span style={{ color: "var(--muted)", fontSize: 10, fontWeight: 700 }}>SYNC STATUS</span>
                    <strong style={{ display: "block", fontSize: 13, color: "#059669", marginTop: 4 }}>Live Sync</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: "center", border: "1px dashed var(--line)", borderRadius: 12, fontSize: 12, color: "var(--muted)" }}>
                No GitHub repository connected yet.
                <div style={{ marginTop: 10 }}>
                  <Link href="/onboarding" className="primary" style={{ display: "inline-flex", padding: "8px 14px", borderRadius: 8 }}>
                    Run Onboarding Wizard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
