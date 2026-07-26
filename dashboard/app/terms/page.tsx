"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Scale, Shield, Code2, AlertCircle, UserCheck, Globe, Lock, RefreshCw } from "lucide-react";
import PublicNavbar from "../../components/PublicNavbar";

const V = "#635bff";
const VS = "#f4f3ff";
const VB = "#ede9fe";

const sections = [
  { id: "acceptance", title: "1. Acceptance of Terms", icon: UserCheck },
  { id: "use", title: "2. Permitted Use", icon: Code2 },
  { id: "account", title: "3. Account & Authentication", icon: Lock },
  { id: "data", title: "4. Your Data & Content", icon: Shield },
  { id: "opensource", title: "5. Open Source & License", icon: Globe },
  { id: "liability", title: "6. Limitation of Liability", icon: Scale },
  { id: "changes", title: "7. Changes to Terms", icon: RefreshCw },
  { id: "contact", title: "8. Contact", icon: AlertCircle },
];

function Section({ id, title, icon: Icon, children }: { id: string; title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div id={id} style={{ paddingTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: VS, border: `1px solid ${VB}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={16} style={{ color: V }} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>{title}</h2>
      </div>
      <div style={{ fontSize: 15, color: "#475569", lineHeight: 1.85, paddingLeft: 0 }}>{children}</div>
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
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: V, flexShrink: 0, marginTop: 8 }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TermsPage() {
  return (
    <div style={{ background: "#fff", color: "#0f172a", minHeight: "100vh", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>

      {/* ── NAV ── */}
      <PublicNavbar />

      {/* ── HERO ── */}
      <section className="responsive-hero-section" style={{ padding: "64px 48px 48px", borderBottom: "1px solid #f1f5f9", background: "#fafbfe" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: VS, border: `1px solid ${VB}`, borderRadius: 100, padding: "6px 16px", fontSize: 12, fontWeight: 600, color: V, marginBottom: 24 }}>Legal</div>
            <h1 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 16px", color: "#0f172a", lineHeight: 1.1 }}>Terms of Service</h1>
            <p style={{ fontSize: 16, color: "#64748b", margin: "0 0 28px", lineHeight: 1.7, maxWidth: 600 }}>
              Please read these terms carefully before using the CodeVault platform and Chrome extension. By accessing or using CodeVault, you agree to be bound by these terms.
            </p>
            <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#94a3b8", flexWrap: "wrap" }}>
              <span>Last updated: <strong style={{ color: "#64748b" }}>July 25, 2026</strong></span>
              <span>Effective: <strong style={{ color: "#64748b" }}>July 25, 2026</strong></span>
              <span>Version: <strong style={{ color: "#64748b" }}>1.0</strong></span>
            </div>
          </div>
        </motion.div>
      </section>

      <div className="responsive-sidebar-layout" style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 0 }}>

        {/* ── SIDEBAR ── */}
        <aside className="responsive-sidebar" style={{ width: 260, flexShrink: 0, padding: "48px 0 48px 48px", position: "sticky", top: 64, height: "calc(100vh - 64px)", overflowY: "auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Table of Contents</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2, flexWrap: "wrap" }}>
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
            <div style={{ fontSize: 12, fontWeight: 700, color: V, marginBottom: 6 }}>Questions?</div>
            <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 10px", lineHeight: 1.5 }}>Contact us if you have any questions about these terms.</p>
            <Link href="/contact" style={{ fontSize: 12, fontWeight: 700, color: V, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              Contact us <ArrowRight size={11} />
            </Link>
          </div>
        </aside>

        {/* ── CONTENT ── */}
        <main className="responsive-main-content" style={{ flex: 1, padding: "48px 56px 80px" }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

            {/* Summary box */}
            <div style={{ padding: "24px 28px", borderRadius: 16, background: "#f0fdf4", border: "1.5px solid #bbf7d0", marginBottom: 48, display: "flex", gap: 16 }}>
              <Shield size={22} style={{ color: "#059669", flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#065f46", marginBottom: 6 }}>Summary in plain English</div>
                <p style={{ fontSize: 14, color: "#064e3b", margin: 0, lineHeight: 1.7 }}>
                  CodeVault is a free, open-source tool. Your code and data are yours — we only store authentication and repository configuration. You can delete your account at any time and all your solutions remain safely in your own GitHub repository.
                </p>
              </div>
            </div>

            <Section id="acceptance" title="1. Acceptance of Terms" icon={UserCheck}>
              <P>By downloading, installing, or using the CodeVault Chrome Extension (&quot;Extension&quot;) or accessing the CodeVault web platform at codevault.app (&quot;Platform&quot;), you (&quot;User&quot;) agree to these Terms of Service (&quot;Terms&quot;) in full.</P>
              <P>If you do not agree with any part of these Terms, you must not use the Extension or Platform. Use of CodeVault constitutes acceptance of these Terms, as updated from time to time.</P>
              <P>These Terms apply to all users of CodeVault, including visitors, registered accounts, and contributors to the open-source project.</P>
            </Section>

            <Section id="use" title="2. Permitted Use" icon={Code2}>
              <P>CodeVault grants you a personal, non-exclusive, non-transferable, revocable license to:</P>
              <UL items={[
                "Install and use the Chrome Extension on your personal devices",
                "Access the CodeVault web platform for personal, non-commercial use",
                "Commit your own LeetCode solutions to your personal GitHub repositories",
                "View and interact with your own analytics dashboard data",
              ]} />
              <P>You agree not to:</P>
              <UL items={[
                "Use CodeVault to commit code that you do not own or have rights to",
                "Attempt to reverse engineer, decompile, or extract proprietary components beyond what the open-source license permits",
                "Use automated means to create multiple accounts or abuse the platform",
                "Use CodeVault in any way that violates LeetCode&apos;s Terms of Service or GitHub&apos;s Acceptable Use Policy",
              ]} />
            </Section>

            <Section id="account" title="3. Account & Authentication" icon={Lock}>
              <P>To access the full features of CodeVault, you must create an account using a valid email address and password. You are responsible for:</P>
              <UL items={[
                "Maintaining the confidentiality of your account credentials",
                "All activity that occurs under your account",
                "Notifying CodeVault immediately if you suspect unauthorised access",
                "Ensuring your GitHub Personal Access Token (PAT) is kept secure",
              ]} />
              <P>CodeVault uses Supabase for authentication. Your password is never stored in plain text — it is hashed using industry-standard bcrypt encryption.</P>
              <P>You may delete your account at any time through the account settings. Deletion removes your profile, repository binding, and preferences from CodeVault servers. Your GitHub repository and all committed code are not affected.</P>
            </Section>

            <Section id="data" title="4. Your Data & Content" icon={Shield}>
              <P><strong>Your code is yours.</strong> CodeVault does not store, read, or transmit your LeetCode solution code. All solution data flows directly from your browser to your personal GitHub repository via the GitHub Contents API.</P>
              <P>CodeVault stores the following data on its servers:</P>
              <UL items={[
                "Your account profile (name, email address, username)",
                "Your GitHub repository configuration (owner, repository name)",
                "Your encrypted GitHub Personal Access Token",
                "Your platform preferences (theme, layout density, notification settings)",
              ]} />
              <P>CodeVault does not sell, rent, or share your personal data with third parties for marketing purposes. See our Privacy Policy for full details on data handling.</P>
              <P>You grant CodeVault permission to use your repository configuration solely to perform the GitHub commit operations you have authorised through the onboarding wizard.</P>
            </Section>

            <Section id="opensource" title="5. Open Source & License" icon={Globe}>
              <P>CodeVault is released under the <strong>MIT License</strong>. The full source code is available on GitHub. You are free to:</P>
              <UL items={[
                "View, fork, and modify the codebase for personal or commercial use",
                "Self-host your own instance of the CodeVault platform",
                "Contribute improvements via pull requests to the open-source repository",
                "Distribute modified versions under the terms of the MIT License",
              ]} />
              <P>The MIT License requires that the original copyright notice and license text are preserved in all copies or substantial portions of the software.</P>
              <P>Third-party libraries used by CodeVault retain their own respective licenses. A full list of dependencies and their licenses is available in the project&apos;s <code style={{ background: VS, padding: "2px 6px", borderRadius: 5, fontSize: 13, color: V }}>package.json</code>.</P>
            </Section>

            <Section id="liability" title="6. Limitation of Liability" icon={Scale}>
              <P>CodeVault is provided <strong>&quot;as is&quot;</strong> without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</P>
              <P>To the fullest extent permitted by applicable law, CodeVault and its contributors shall not be liable for:</P>
              <UL items={[
                "Any loss of data, including GitHub commits that fail due to network errors or API rate limits",
                "Any indirect, incidental, special, consequential, or punitive damages",
                "Any interruption or cessation of the service",
                "Any unauthorised access to your GitHub account or repository caused by a compromised PAT",
                "Any violations of LeetCode&apos;s or GitHub&apos;s terms caused by your use of CodeVault",
              ]} />
              <P>You use CodeVault at your own risk. We strongly recommend keeping a backup of your GitHub Personal Access Token scope settings and revoking unused tokens regularly.</P>
            </Section>

            <Section id="changes" title="7. Changes to Terms" icon={RefreshCw}>
              <P>CodeVault reserves the right to modify these Terms at any time. When changes are made:</P>
              <UL items={[
                "The 'Last updated' date at the top of this page will be revised",
                "Significant changes will be communicated via an in-app notification on your dashboard",
                "Continued use of CodeVault after changes constitutes acceptance of the updated Terms",
              ]} />
              <P>We encourage you to review these Terms periodically. If you disagree with any changes, you may delete your account at any time through the account settings page.</P>
              <P>These Terms are governed by and construed in accordance with applicable international software laws. Disputes shall be resolved through good-faith negotiation before any formal proceedings.</P>
            </Section>

            <Section id="contact" title="8. Contact" icon={AlertCircle}>
              <P>If you have any questions, concerns, or requests regarding these Terms of Service, you may reach us through:</P>
              <UL items={[
                "The contact form at codevault.app/contact",
                "Opening an issue on the CodeVault GitHub repository",
                "Submitting a pull request with suggested corrections to the legal documents",
              ]} />
              <P>We aim to respond to all legal enquiries within 5 business days.</P>
            </Section>

            {/* Footer nav */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <Link href="/privacy" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: V, textDecoration: "none", padding: "11px 20px", border: `1.5px solid ${VB}`, borderRadius: 10, background: VS, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = VB; }}
                onMouseLeave={e => { e.currentTarget.style.background = VS; }}>
                <ArrowLeft size={14} /> Privacy Policy
              </Link>
              <Link href="/contact" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", padding: "11px 20px", borderRadius: 10, background: V, transition: "all 0.2s", boxShadow: `0 4px 14px rgba(99,91,255,0.3)` }}
                onMouseEnter={e => { e.currentTarget.style.background = "#5249e0"; }}
                onMouseLeave={e => { e.currentTarget.style.background = V; }}>
                Contact Us <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
