"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Lock,
  Database,
  Eye,
  Server,
  Cookie,
  UserCheck,
  RefreshCw,
  Mail,
  CheckCircle2,
} from "lucide-react";

const V = "#635bff";
const VS = "#f4f3ff";
const VB = "#ede9fe";

const sections = [
  { id: "collection", title: "1. Information We Collect", icon: Database },
  { id: "use", title: "2. How We Use Information", icon: Eye },
  { id: "github", title: "3. GitHub & Security", icon: Lock },
  { id: "retention", title: "4. Data Storage & Retention", icon: Server },
  { id: "thirdparty", title: "5. Third-Party Services", icon: UserCheck },
  { id: "cookies", title: "6. Cookies & Local Storage", icon: Cookie },
  { id: "rights", title: "7. Your Rights & GDPR", icon: Shield },
  { id: "changes", title: "8. Changes to Policy", icon: RefreshCw },
  { id: "contact", title: "9. Contact Privacy Team", icon: Mail },
];

function Section({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div id={id} style={{ paddingTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: VS,
            border: `1px solid ${VB}`,
            display: "flex",
            alignItems: "center",
            justify: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={16} style={{ color: V }} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
          {title}
        </h2>
      </div>
      <div style={{ fontSize: 15, color: "#475569", lineHeight: 1.85 }}>{children}</div>
      <div style={{ height: 1, background: "#f1f5f9", margin: "40px 0" }} />
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "0 0 14px" }}>{children}</p>;
}

function UL({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 14px", display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <CheckCircle2 size={16} style={{ color: "#059669", flexShrink: 0, marginTop: 4 }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <div style={{ background: "#fff", color: "#0f172a", minHeight: "100vh", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>

      {/* ── NAV ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid #f1f5f9", background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", padding: "0 48px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/main-logo.png" alt="CodeVault" width={26} height={26} style={{ borderRadius: 7 }} />
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.04em", color: "#0f172a" }}>CodeVault</span>
          <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 400, marginLeft: 4 }}>/ Privacy Policy</span>
        </Link>
        <div style={{ display: "flex", gap: 24, fontSize: 13, fontWeight: 500, color: "#64748b" }}>
          <Link href="/terms" style={{ textDecoration: "none", color: "inherit" }}>Terms of Service</Link>
          <Link href="/faq" style={{ textDecoration: "none", color: "inherit" }}>FAQ</Link>
        </div>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#64748b", textDecoration: "none", padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 9 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = VB; e.currentTarget.style.color = V; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}>
          <ArrowLeft size={13} /> Back to Home
        </Link>
      </header>

      {/* ── HERO ── */}
      <section style={{ padding: "64px 48px 48px", borderBottom: "1px solid #f1f5f9", background: "#fafbfe" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: VS, border: `1px solid ${VB}`, borderRadius: 100, padding: "6px 16px", fontSize: 12, fontWeight: 600, color: V, marginBottom: 24 }}>
              Data & Security Guidelines
            </div>
            <h1 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 16px", color: "#0f172a", lineHeight: 1.1 }}>
              Privacy Policy
            </h1>
            <p style={{ fontSize: 16, color: "#64748b", margin: "0 0 28px", lineHeight: 1.7, maxWidth: 620 }}>
              At CodeVault, we adhere to a strict zero-code-storage policy. Your LeetCode solutions are committed directly to your personal GitHub repository — never stored on our servers.
            </p>
            <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#94a3b8", flexWrap: "wrap" }}>
              <span>Last updated: <strong style={{ color: "#64748b" }}>July 25, 2026</strong></span>
              <span>Effective: <strong style={{ color: "#64748b" }}>July 25, 2026</strong></span>
              <span>Version: <strong style={{ color: "#64748b" }}>1.0</strong></span>
            </div>
          </div>
        </motion.div>
      </section>

      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 0 }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width: 260, flexShrink: 0, padding: "48px 0 48px 48px", position: "sticky", top: 64, height: "calc(100vh - 64px)", overflowY: "auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Table of Contents</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {sections.map(sec => (
              <a key={sec.id} href={`#${sec.id}`} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                borderRadius: 9, fontSize: 13, fontWeight: 500, color: "#475569",
                textDecoration: "none", transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = VS; e.currentTarget.style.color = V; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#475569"; }}>
                <sec.icon size={13} style={{ flexShrink: 0 }} /> {sec.title}
              </a>
            ))}
          </nav>
          <div style={{ marginTop: 32, padding: "16px 18px", borderRadius: 14, background: VS, border: `1px solid ${VB}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: V, marginBottom: 6 }}>Privacy Question?</div>
            <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 10px", lineHeight: 1.5 }}>Our privacy team is available to answer any questions.</p>
            <Link href="/contact" style={{ fontSize: 12, fontWeight: 700, color: V, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              Contact support <ArrowRight size={11} />
            </Link>
          </div>
        </aside>

        {/* ── CONTENT ── */}
        <main style={{ flex: 1, padding: "48px 56px 80px" }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

            {/* Summary banner */}
            <div style={{ padding: "24px 28px", borderRadius: 16, background: "#f0fdf4", border: "1.5px solid #bbf7d0", marginBottom: 48, display: "flex", gap: 16 }}>
              <Shield size={22} style={{ color: "#059669", flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#065f46", marginBottom: 6 }}>Zero-Code-Storage Guarantee</div>
                <p style={{ fontSize: 14, color: "#064e3b", margin: 0, lineHeight: 1.7 }}>
                  CodeVault never retains your solution source code on our servers. When you submit a problem, the extension sends your code directly to GitHub via your own access token. We only store basic account metadata to render your dashboard.
                </p>
              </div>
            </div>

            <Section id="collection" title="1. Information We Collect" icon={Database}>
              <P>To provide the CodeVault dashboard and extension services, we collect minimal necessary metadata:</P>
              <UL items={[
                "Account Data: Your full name, email address, and authentication user ID (processed via Supabase Auth).",
                "Repository Bindings: GitHub username, target repository name, and repo visibility settings.",
                "Encrypted Access Tokens: GitHub Personal Access Tokens (PATs) used exclusively to commit solutions on your behalf.",
                "Preference Settings: Theme preferences, dashboard layout density, and notification configurations.",
              ]} />
              <P><strong>What we NEVER collect:</strong> Your LeetCode password, your personal solution code history on our backend database, your browser browsing history, or payment card numbers.</P>
            </Section>

            <Section id="use" title="2. How We Use Information" icon={Eye}>
              <P>We use the limited metadata we collect solely for the following operational purposes:</P>
              <UL items={[
                "To authenticate your session across the CodeVault website and Chrome extension.",
                "To route accepted LeetCode submissions to your designated GitHub repository.",
                "To generate interactive dashboard analytics (stats, heat-maps, language breakdowns) by querying your repository metadata.",
                "To communicate critical system updates, release notes, or security alerts.",
              ]} />
              <P>We do not use your data for advertising, profiling, or automated decision-making.</P>
            </Section>

            <Section id="github" title="3. GitHub & Security" icon={Lock}>
              <P>Security is embedded into every layer of CodeVault&apos;s architecture:</P>
              <UL items={[
                "Row Level Security (RLS): Supabase tables enforce strict access controls so only you can read or update your repository mapping.",
                "Token Encryption: Personal Access Tokens are encrypted at rest using AES-256 standards.",
                "Scoped Access: We recommend granting PAT access only to your dedicated LeetCode repository (public or private).",
                "HTTPS Enforcement: All communication between the browser extension, web platform, and GitHub API occurs over TLS 1.3 encrypted connections.",
              ]} />
            </Section>

            <Section id="retention" title="4. Data Storage & Retention" icon={Server}>
              <P>Your account settings and repository configuration are stored in secure Supabase databases located in North America / Europe.</P>
              <P>You maintain complete ownership of your data. If you choose to delete your CodeVault account:</P>
              <UL items={[
                "All account profile records, repository settings, and encrypted PATs are permanently deleted from our servers immediately.",
                "Your GitHub repository and all existing solution commits remain completely untouched on GitHub.",
                "No residual backups of your personal data are retained after deletion.",
              ]} />
            </Section>

            <Section id="thirdparty" title="5. Third-Party Services" icon={UserCheck}>
              <P>CodeVault integrates with a minimal set of trusted third-party infrastructure providers:</P>
              <UL items={[
                "Supabase: Identity provider and cloud PostgreSQL database host for user settings.",
                "GitHub API: Target destination for committing code solutions and fetching public commit metadata.",
                "Vercel / Netlify: Web application hosting for the codevault.app dashboard.",
              ]} />
              <P>Each provider complies with strict data protection standards (GDPR, SOC2, CCPA).</P>
            </Section>

            <Section id="cookies" title="6. Cookies & Local Storage" icon={Cookie}>
              <P>CodeVault uses minimal browser storage mechanisms strictly necessary for core functionality:</P>
              <UL items={[
                "Session Cookies: Essential Supabase authentication JWT tokens to keep you signed in.",
                "Local Storage: Used by the Chrome extension to temporarily queue pending solution commits if your network connection drops.",
                "Zero Tracking Cookies: We do not use third-party tracking pixels, Google Analytics, or marketing cookies.",
              ]} />
            </Section>

            <Section id="rights" title="7. Your Rights & GDPR" icon={Shield}>
              <P>Under global privacy regulations (including GDPR and CCPA), you hold the following rights regarding your data:</P>
              <UL items={[
                "Right of Access: Request a copy of all personal metadata associated with your CodeVault account.",
                "Right to Rectification: Update or correct your name, email, or repository configuration at any time in Settings.",
                "Right to Erasure (Right to be Forgotten): Delete your account with one click in settings to purge all data.",
                "Right to Data Portability: Since all solutions reside in your GitHub repo, your data is inherently portable and unlocked.",
              ]} />
            </Section>

            <Section id="changes" title="8. Changes to Policy" icon={RefreshCw}>
              <P>We may update this Privacy Policy from time to time to reflect changes in our service or legal requirements.</P>
              <P>When updates occur, we will revise the &quot;Last updated&quot; timestamp at the top of this page. For significant updates, we will notify registered users via an in-app alert on the dashboard.</P>
            </Section>

            <Section id="contact" title="9. Contact Privacy Team" icon={Mail}>
              <P>If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please get in touch:</P>
              <UL items={[
                "Contact Form: codevault.app/contact",
                "Email Support: privacy@codevault.app",
                "GitHub Issues: Open an issue on our open-source GitHub repository",
              ]} />
              <P>We respond to all privacy-related inquiries within 48 hours.</P>
            </Section>

            {/* Footer nav */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <Link href="/terms" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: V, textDecoration: "none", padding: "11px 20px", border: `1.5px solid ${VB}`, borderRadius: 10, background: VS, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = VB; }}
                onMouseLeave={e => { e.currentTarget.style.background = VS; }}>
                <ArrowLeft size={14} /> Terms of Service
              </Link>
              <Link href="/contact" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", padding: "11px 20px", borderRadius: 10, background: V, transition: "all 0.2s", boxShadow: `0 4px 14px rgba(99,91,255,0.3)` }}
                onMouseEnter={e => { e.currentTarget.style.background = "#5249e0"; }}
                onMouseLeave={e => { e.currentTarget.style.background = V; }}>
                Contact Support <ArrowRight size={14} />
              </Link>
            </div>

          </motion.div>
        </main>
      </div>
    </div>
  );
}
