"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, GitFork, Shield, Zap, Code2,
  Database, Settings, BookOpen, Terminal, ChevronRight,
  FileText, Globe, Lock, Package, Puzzle,
} from "lucide-react";

const V = "#635bff";
const VS = "#f4f3ff";
const VB = "#ede9fe";

const sections = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "architecture", label: "Architecture", icon: Puzzle },
  { id: "authentication", label: "Authentication", icon: Shield },
  { id: "sync-engine", label: "Sync Engine", icon: Zap },
  { id: "repository", label: "Repository Structure", icon: GitFork },
  { id: "extension", label: "Chrome Extension", icon: Package },
  { id: "api", label: "API Reference", icon: Code2 },
  { id: "configuration", label: "Configuration", icon: Settings },
  { id: "troubleshooting", label: "Troubleshooting", icon: Terminal },
];

function Code({ children }: { children: string }) {
  return (
    <code style={{ background: VS, border: `1px solid ${VB}`, padding: "2px 8px", borderRadius: 6, fontSize: 12, fontFamily: "ui-monospace, monospace", color: V }}>
      {children}
    </code>
  );
}

function Block({ children }: { children: React.ReactNode }) {
  return (
    <pre style={{ background: "#0f172a", borderRadius: 14, padding: "20px 24px", fontSize: 13, color: "#e2e8f0", fontFamily: "ui-monospace, monospace", lineHeight: 1.7, overflowX: "auto", margin: "20px 0" }}>
      {children}
    </pre>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", color: "#0f172a", margin: "0 0 16px", paddingTop: 8 }}>{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em", color: "#0f172a", margin: "28px 0 12px" }}>{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.8, margin: "0 0 16px" }}>{children}</p>;
}
function Divider() {
  return <div style={{ height: 1, background: "#f1f5f9", margin: "40px 0" }} />;
}

export default function DocsPage() {
  const [active, setActive] = useState("overview");

  return (
    <div style={{ background: "#fff", color: "#0f172a", minHeight: "100vh", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>

      {/* ── NAV ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid #f1f5f9", background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/main-logo.png" alt="CodeVault" width={26} height={26} style={{ borderRadius: 7 }} />
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.04em", color: "#0f172a" }}>CodeVault</span>
          <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 400, marginLeft: 4 }}>/ Docs</span>
        </Link>
        <div style={{ display: "flex", gap: 20, fontSize: 13, fontWeight: 500, color: "#64748b" }}>
          <Link href="/download" style={{ textDecoration: "none", color: "inherit" }}>Download</Link>
          <Link href="/faq" style={{ textDecoration: "none", color: "inherit" }}>FAQ</Link>
        </div>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#64748b", textDecoration: "none", padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 9 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = VB; e.currentTarget.style.color = V; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}>
          <ArrowLeft size={13} /> Back to Home
        </Link>
      </header>

      <div style={{ display: "flex", maxWidth: 1280, margin: "0 auto" }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width: 260, flexShrink: 0, padding: "40px 0 40px 40px", position: "sticky", top: 64, height: "calc(100vh - 64px)", overflowY: "auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Documentation</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {sections.map(sec => (
              <button key={sec.id} onClick={() => setActive(sec.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                borderRadius: 9, border: "none", cursor: "pointer", textAlign: "left", width: "100%",
                background: active === sec.id ? VS : "transparent",
                color: active === sec.id ? V : "#475569",
                fontSize: 14, fontWeight: active === sec.id ? 700 : 500,
                transition: "all 0.15s",
              }}
                onMouseEnter={e => { if (active !== sec.id) e.currentTarget.style.background = "#f8fafc"; }}
                onMouseLeave={e => { if (active !== sec.id) e.currentTarget.style.background = "transparent"; }}>
                <sec.icon size={14} style={{ flexShrink: 0 }} />
                {sec.label}
                {active === sec.id && <ChevronRight size={12} style={{ marginLeft: "auto" }} />}
              </button>
            ))}
          </nav>
          <div style={{ marginTop: 40, padding: "16px 18px", borderRadius: 14, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Need help?</div>
            <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px", lineHeight: 1.5 }}>Can&apos;t find what you&apos;re looking for?</p>
            <Link href="/faq" style={{ fontSize: 12, fontWeight: 700, color: V, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              Visit FAQ <ArrowRight size={11} />
            </Link>
          </div>
        </aside>

        {/* ── CONTENT ── */}
        <main style={{ flex: 1, padding: "48px 56px", maxWidth: 780, minHeight: "calc(100vh - 64px)" }}>
          <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>

            {active === "overview" && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: V, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Getting Started</div>
                <H2>CodeVault Documentation</H2>
                <P>Welcome to the official CodeVault documentation. CodeVault is an open-source platform that automatically syncs your accepted LeetCode submissions to a personal GitHub repository — keeping a permanent, beautiful record of your coding journey.</P>
                <P>This documentation covers architecture, authentication, configuration, the sync engine, and the Chrome extension in detail.</P>
                <Divider />
                <H3>What is CodeVault?</H3>
                <P>CodeVault consists of two parts working together:</P>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "16px 0 24px" }}>
                  {[
                    { icon: Globe, title: "Web Platform", desc: "Handles authentication, settings, repository binding, and analytics visualisation.", color: V },
                    { icon: Package, title: "Chrome Extension", desc: "Listens for accepted LeetCode submissions and triggers commits to your GitHub repository.", color: "#059669" },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: "20px 22px", borderRadius: 14, background: "#f8fafc", border: "1.5px solid #f1f5f9" }}>
                      <item.icon size={18} style={{ color: item.color, marginBottom: 10 }} />
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
                <H3>Quick Start</H3>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {["Download the Chrome extension ZIP from /download", "Create an account at codevault.app/login", "Complete the onboarding wizard to link your GitHub repository", "Solve problems on LeetCode — accepted solutions are committed automatically"].map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, padding: "16px 20px", background: i % 2 === 0 ? "#fff" : "#fafbfe", border: "1px solid #f1f5f9", borderRadius: i === 0 ? "12px 12px 0 0" : i === 3 ? "0 0 12px 12px" : "0" }}>
                      <span style={{ width: 24, height: 24, borderRadius: "50%", background: VS, border: `1.5px solid ${VB}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: V, flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: 14, color: "#374151", lineHeight: 1.5, paddingTop: 2 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {active === "architecture" && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: V, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>System Design</div>
                <H2>Architecture Overview</H2>
                <P>CodeVault separates execution client responsibilities from platform services. The Chrome extension acts as a lightweight observer while the web platform handles all stateful operations.</P>
                <Block>{`┌─────────────────────────────────────────────────────┐
│                   CODEVAULT SYSTEM                    │
│                                                       │
│  ┌─────────────────┐       ┌─────────────────────┐  │
│  │ Chrome Extension│──────▶│   Web Platform      │  │
│  │                 │◀──────│   (codevault.app)   │  │
│  │ • Detects submit│ Auth  │                     │  │
│  │ • Parses code   │ Sync  │ • Supabase Auth      │  │
│  │ • Queues commit │       │ • Repository config  │  │
│  └─────────────────┘       │ • Analytics + UI     │  │
│           │                └─────────────────────┘  │
│           │ GitHub API (PAT)                          │
│           ▼                                           │
│  ┌─────────────────┐                                 │
│  │  GitHub Repo    │                                 │
│  │  (your account) │                                 │
│  └─────────────────┘                                 │
└─────────────────────────────────────────────────────┘`}</Block>
                <H3>Data Flow</H3>
                <P>1. User submits a solution on LeetCode and it is accepted.</P>
                <P>2. The Chrome extension detects the accepted verdict via the LeetCode submission API.</P>
                <P>3. The extension parses the source code, title, difficulty, tags, and language.</P>
                <P>4. A commit is queued locally and sent to GitHub via the GitHub Contents API using the user&apos;s PAT.</P>
                <P>5. The web platform reflects updated stats on next dashboard load.</P>
              </>
            )}

            {active === "authentication" && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: V, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Security</div>
                <H2>Authentication</H2>
                <P>CodeVault uses Supabase as its identity provider. User profiles, repository mappings, and settings are stored in Supabase. Your solution code is never stored on CodeVault servers.</P>
                <H3>Supabase Tables</H3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "0 0 24px" }}>
                  {[
                    { table: "profiles", desc: "User identity, full name, username, plan tier, creation date" },
                    { table: "repositories", desc: "GitHub owner, repo name, encrypted PAT, visibility preference" },
                    { table: "settings", desc: "Theme, density, motion preferences, notification config" },
                  ].map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px", borderRadius: 12, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                      <Database size={15} style={{ color: V, flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <code style={{ fontSize: 13, fontWeight: 700, color: V, background: VS, padding: "2px 8px", borderRadius: 6 }}>{t.table}</code>
                        <div style={{ fontSize: 13, color: "#64748b", marginTop: 6, lineHeight: 1.5 }}>{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <H3>Session Handling</H3>
                <P>The Chrome extension reads the Supabase session from <Code>localStorage</Code> on the codevault.app domain. This means the extension automatically inherits authentication — no separate login required inside the extension popup.</P>
                <H3>GitHub PAT Scope</H3>
                <P>Your Personal Access Token requires only the <Code>repo</Code> scope (or <Code>public_repo</Code> for public repos). No other GitHub data is accessed.</P>
                <Block>{`Required GitHub PAT scopes:
  ✓ repo         (for private repositories)
  ✓ public_repo  (for public repositories only)

  NOT required:
  ✗ read:user
  ✗ admin:repo_hook
  ✗ delete_repo`}</Block>
              </>
            )}

            {active === "sync-engine" && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: V, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Core Engine</div>
                <H2>GitHub Sync Engine</H2>
                <P>When an accepted submission is detected, CodeVault generates a structured set of files and commits them atomically to your repository using the GitHub Contents API.</P>
                <H3>Commit Structure</H3>
                <P>Each accepted solution generates the following files inside your repository:</P>
                <Block>{`{repository}/
├── easy/
│   └── two-sum/
│       ├── solution.py        ← your code
│       ├── README.md          ← problem description + stats
│       └── metadata.json      ← title, difficulty, tags, time
├── medium/
│   └── longest-substring/
│       ├── solution.cpp
│       ├── README.md
│       └── metadata.json
├── stats.json                 ← global progress index
└── README.md                  ← auto-generated vault overview`}</Block>
                <H3>Queue System</H3>
                <P>Submissions are enqueued in <Code>localStorage</Code> before commit to prevent race conditions and handle offline scenarios. The queue drains sequentially — one commit per submission — preventing repository corruption.</P>
                <H3>Conflict Resolution</H3>
                <P>If a solution already exists (e.g. you re-submit an improved solution), CodeVault will overwrite the existing file and update the commit message to reflect the revision.</P>
              </>
            )}

            {active === "repository" && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: V, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Output Format</div>
                <H2>Repository Structure</H2>
                <P>CodeVault generates a professional, readable repository structure that serves as a living portfolio of your LeetCode journey.</P>
                <H3>Auto-Generated README.md</H3>
                <P>Each problem folder contains a <Code>README.md</Code> with the problem title, difficulty badge, tags, your solution language, and submission stats.</P>
                <Block>{`# Two Sum · Easy

![Easy](https://img.shields.io/badge/Difficulty-Easy-brightgreen)
![Python](https://img.shields.io/badge/Language-Python-blue)

**Tags:** Array · Hash Table

## Problem
Given an array of integers nums and an integer target, return indices
of the two numbers such that they add up to target.

## Solution
\`\`\`python
class Solution:
    def twoSum(self, nums, target):
        seen = {}
        for i, n in enumerate(nums):
            if target - n in seen:
                return [seen[target - n], i]
            seen[n] = i
\`\`\`

**Runtime:** 48ms · **Memory:** 17.2MB`}</Block>
                <H3>metadata.json</H3>
                <Block>{`{
  "title": "Two Sum",
  "slug": "two-sum",
  "difficulty": "easy",
  "language": "python",
  "tags": ["array", "hash-table"],
  "submittedAt": "2026-07-25T18:30:00Z",
  "runtime": "48ms",
  "memory": "17.2MB"
}`}</Block>
              </>
            )}

            {active === "extension" && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: V, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Chrome Extension</div>
                <H2>Chrome Extension</H2>
                <P>The CodeVault Chrome extension is a Manifest V3 extension that detects LeetCode submission results and triggers the GitHub commit pipeline.</P>
                <H3>Permissions</H3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "0 0 24px" }}>
                  {[
                    { perm: "storage", desc: "Queue pending commits for offline support" },
                    { perm: "activeTab", desc: "Read the current LeetCode tab content" },
                    { perm: "scripting", desc: "Inject content script on LeetCode pages" },
                    { perm: "host: leetcode.com", desc: "Intercept submission API responses" },
                  ].map((p, i) => (
                    <div key={i} style={{ padding: "14px 18px", borderRadius: 12, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                      <Code>{p.perm}</Code>
                      <div style={{ fontSize: 13, color: "#64748b", marginTop: 8, lineHeight: 1.5 }}>{p.desc}</div>
                    </div>
                  ))}
                </div>
                <H3>manifest.json overview</H3>
                <Block>{`{
  "manifest_version": 3,
  "name": "CodeVault",
  "version": "0.1.0",
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["https://leetcode.com/*"],
  "content_scripts": [{
    "matches": ["https://leetcode.com/*"],
    "js": ["content/index.js"]
  }],
  "background": {
    "service_worker": "background.js"
  }
}`}</Block>
              </>
            )}

            {active === "api" && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: V, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Developer Reference</div>
                <H2>API Reference</H2>
                <P>CodeVault communicates with two external APIs: the Supabase REST API for user data and the GitHub Contents API for file commits.</P>
                <H3>GitHub Contents API</H3>
                <P>Files are created and updated using the GitHub Contents API endpoint:</P>
                <Block>{`PUT https://api.github.com/repos/{owner}/{repo}/contents/{path}

Headers:
  Authorization: Bearer {PAT}
  Content-Type: application/json

Body:
  {
    "message": "feat: add Two Sum solution [Easy]",
    "content": "{base64-encoded-file-content}",
    "sha": "{existing-sha-if-updating}"
  }`}</Block>
                <H3>Supabase Auth</H3>
                <P>Session tokens are issued by Supabase Auth and stored in <Code>localStorage</Code>. The extension reads these tokens to verify the user is authenticated before attempting commits.</P>
                <Block>{`// Reading session in extension
const session = JSON.parse(
  localStorage.getItem('codevault_supabase_session') || '{}'
);
const token = session?.access_token;`}</Block>
              </>
            )}

            {active === "configuration" && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: V, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Setup</div>
                <H2>Configuration</H2>
                <P>All configuration is done through the CodeVault web platform. No configuration files need to be edited manually.</P>
                <H3>Repository Settings</H3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "0 0 24px" }}>
                  {[
                    { field: "GitHub Username", desc: "Your GitHub account username (e.g. johndev)" },
                    { field: "Repository Name", desc: "Target repo name (e.g. leetcode-solutions)" },
                    { field: "Personal Access Token", desc: "Your GitHub PAT with repo or public_repo scope" },
                    { field: "Visibility", desc: "Public or Private — determines repository access" },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: "16px 20px", borderRadius: 12, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{item.field}</div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
                <H3>Generating a GitHub PAT</H3>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {["Go to github.com → Settings → Developer settings", "Select Personal access tokens → Tokens (classic)", "Click Generate new token (classic)", "Set expiration and check the repo scope", "Copy the token and paste it into CodeVault settings"].map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, padding: "14px 18px", background: i % 2 === 0 ? "#fff" : "#fafbfe", border: "1px solid #f1f5f9", borderRadius: i === 0 ? "12px 12px 0 0" : i === 4 ? "0 0 12px 12px" : "0" }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: VS, border: `1.5px solid ${VB}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: V, flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: 14, color: "#374151", lineHeight: 1.5, paddingTop: 1 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {active === "troubleshooting" && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: V, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Help</div>
                <H2>Troubleshooting</H2>
                <P>Common issues and how to resolve them.</P>
                {[
                  { issue: "Extension not detecting submissions", fix: "Make sure Developer Mode is enabled and the extension is loaded. Refresh the LeetCode page after installing. Check that you are signed in to codevault.app in the same browser." },
                  { issue: "Commits not appearing on GitHub", fix: "Verify your GitHub PAT has the correct scope (repo or public_repo). Check that the repository owner and name are correct in Settings. Try revoking and regenerating your PAT." },
                  { issue: "Authentication error on dashboard", fix: "Clear localStorage for codevault.app and sign in again. If the issue persists, try a different browser or incognito mode to rule out extension conflicts." },
                  { issue: "Duplicate commits or missing files", fix: "This can occur if the queue drained before the GitHub API confirmed the commit. Check your repository history. If files are missing, resubmit the solution on LeetCode." },
                  { issue: "Extension popup shows 'Not connected'", fix: "This means the extension cannot read a valid session from localStorage. Sign in to codevault.app first, then refresh the LeetCode tab." },
                ].map((item, i) => (
                  <div key={i} style={{ marginBottom: 20, padding: "22px 24px", borderRadius: 16, border: "1.5px solid #f1f5f9", background: "#fff" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                      <Terminal size={15} style={{ color: V }} /> {item.issue}
                    </div>
                    <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.7 }}>{item.fix}</p>
                  </div>
                ))}
              </>
            )}

          </motion.div>

          {/* ── Navigation footer ── */}
          <div style={{ marginTop: 60, paddingTop: 32, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              onClick={() => { const idx = sections.findIndex(s => s.id === active); if (idx > 0) setActive(sections[idx - 1].id); }}
              style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 9, padding: "9px 16px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = VB; e.currentTarget.style.color = V; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}>
              <ArrowLeft size={13} /> Previous
            </button>
            <button
              onClick={() => { const idx = sections.findIndex(s => s.id === active); if (idx < sections.length - 1) setActive(sections[idx + 1].id); }}
              style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#fff", background: "#0f172a", border: "none", borderRadius: 9, padding: "9px 16px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1e293b"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#0f172a"; }}>
              Next <ArrowRight size={13} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
