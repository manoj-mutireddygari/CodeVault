"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronDown, Search, MessageSquare, Package, Shield, Zap, GitFork, CreditCard, Settings } from "lucide-react";
import PublicNavbar from "../../components/PublicNavbar";

const V = "#635bff";
const VS = "#f4f3ff";
const VB = "#ede9fe";

const categories = [
  { id: "all", label: "All Questions", icon: MessageSquare },
  { id: "setup", label: "Setup & Install", icon: Package },
  { id: "security", label: "Security", icon: Shield },
  { id: "features", label: "Features", icon: Zap },
  { id: "github", label: "GitHub & Repos", icon: GitFork },
  { id: "billing", label: "Pricing", icon: CreditCard },
  { id: "advanced", label: "Advanced", icon: Settings },
];

const faqs = [
  // Setup
  { cat: "setup", q: "How do I install the CodeVault extension?", a: "Download the ZIP from codevault.app/download, extract the folder, then go to chrome://extensions, enable Developer Mode, click 'Load unpacked', and select the extracted folder. The extension icon will appear in your toolbar." },
  { cat: "setup", q: "Which browsers are supported?", a: "CodeVault works on any Chromium-based browser: Google Chrome (100+), Microsoft Edge, Brave, and Arc. Firefox is not yet supported as it requires a Manifest V2 build." },
  { cat: "setup", q: "Do I need to configure anything inside the extension?", a: "No. The extension automatically reads your session from the CodeVault web platform. Just sign in at codevault.app and the extension inherits your authentication — no separate setup needed inside the popup." },
  { cat: "setup", q: "How do I update the extension when a new version is released?", a: "Download the new ZIP from /download, replace the extracted folder, and click the refresh icon on the extension card in chrome://extensions. Your settings and session are preserved." },
  { cat: "setup", q: "Can I run CodeVault alongside other LeetCode extensions?", a: "Yes, CodeVault is designed to be non-invasive. It only activates on submission events and does not interfere with UI extensions, timers, or note-taking tools." },

  // Security
  { cat: "security", q: "Where is my source code stored?", a: "Your solution code is committed directly to your own GitHub repository. CodeVault never stores, reads, or caches your solution code on its servers at any point." },
  { cat: "security", q: "How is my GitHub Personal Access Token protected?", a: "Your PAT is stored encrypted in Supabase and is only used to make commits via the GitHub Contents API. It is never exposed in client-side JavaScript or browser storage after the initial onboarding." },
  { cat: "security", q: "What GitHub permissions does CodeVault need?", a: "CodeVault only requires the 'repo' scope for private repositories, or 'public_repo' for public-only access. It does not request read:user, admin, or any organisation permissions." },
  { cat: "security", q: "Can CodeVault read my other GitHub repositories?", a: "No. CodeVault only writes to the single repository you designate during onboarding. It uses the GitHub Contents API with a scoped path and cannot list or modify any other repositories." },
  { cat: "security", q: "Is CodeVault open source?", a: "Yes. The full codebase is available on GitHub under the MIT license. You can audit every line of code, self-host the platform, or contribute improvements." },

  // Features
  { cat: "features", q: "Does the extension run in the background?", a: "No. The extension uses a Manifest V3 service worker which only activates when a LeetCode submission event is detected. It has zero idle CPU usage and minimal memory footprint when you are not on LeetCode." },
  { cat: "features", q: "What programming languages are supported?", a: "All major LeetCode languages: Python, Java, C++, JavaScript, TypeScript, Rust, Go, C#, Swift, Kotlin, PHP, Scala, and Ruby — each committed with the correct file extension and folder structure." },
  { cat: "features", q: "What analytics does the dashboard provide?", a: "The dashboard shows total problems solved by difficulty (Easy/Medium/Hard), language breakdown with progress bars, current and longest streak, calendar heat-map, commit timeline, and a tag-based topic analysis." },
  { cat: "features", q: "What happens if I submit multiple solutions for the same problem?", a: "CodeVault overwrites the existing solution file with the newer submission and updates the commit message to note the revision. Your full Git history on GitHub preserves all previous versions." },
  { cat: "features", q: "Does CodeVault work if I lose internet mid-solve?", a: "Yes. The extension enqueues the accepted submission in local storage immediately. When the connection is restored, the queue drains automatically and the commit is made — no solution is lost." },

  // GitHub
  { cat: "github", q: "Can I use a private repository?", a: "Absolutely. CodeVault fully supports private repositories. You choose visibility (public or private) during the onboarding wizard, and you can change it later in GitHub repository settings." },
  { cat: "github", q: "What does my repository look like?", a: "Solutions are organised into easy/, medium/, and hard/ folders. Each problem gets its own subfolder containing solution.ext, README.md (with problem description, tags, and stats), and metadata.json." },
  { cat: "github", q: "Can I use an existing repository or does CodeVault create a new one?", a: "You can use any existing repository — simply enter its name during onboarding. CodeVault will add files without touching your existing content. It does not create repositories automatically." },
  { cat: "github", q: "How do commit messages look?", a: "Commit messages follow the format: feat: add {Problem Title} solution [{Difficulty}]. For example: feat: add Two Sum solution [Easy]. This keeps your Git history clean and readable." },
  { cat: "github", q: "Will CodeVault ever delete files from my repository?", a: "Never. CodeVault only creates and updates files. It has no delete functionality by design." },

  // Billing
  { cat: "billing", q: "Is CodeVault free?", a: "Yes. The core platform — extension, GitHub sync, dashboard analytics, and streak tracking — is completely free, forever. No trial periods, no hidden limits." },
  { cat: "billing", q: "Will there ever be a paid plan?", a: "A Pro tier is planned for team features, advanced analytics exports, and priority support. The free tier will always remain fully functional for individual developers." },
  { cat: "billing", q: "Do I need a credit card to sign up?", a: "No. Creating an account requires only an email address and password. No payment information is ever collected for the free tier." },

  // Advanced
  { cat: "advanced", q: "Can I self-host CodeVault?", a: "Yes. CodeVault is open source and designed to be self-hostable. You will need a Supabase project for the database and auth layer. See the GitHub repository for deployment instructions." },
  { cat: "advanced", q: "Can I customise the commit message format?", a: "Custom commit message templates are on the roadmap for the Pro tier. Currently, messages follow the standard feat: add {Title} [{Difficulty}] format." },
  { cat: "advanced", q: "Does CodeVault support LeetCode Premium problems?", a: "Yes. CodeVault does not depend on LeetCode's problem data — it only reads the submission result and the code you wrote. Premium and free problems are handled identically." },
  { cat: "advanced", q: "Can I connect multiple GitHub accounts?", a: "Currently each CodeVault account supports one GitHub repository. Multi-account support is planned for a future release." },
];

export default function FAQPage() {
  const [active, setActive] = useState("all");
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = faqs.filter(f =>
    (active === "all" || f.cat === active) &&
    (!search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ background: "#fff", color: "#0f172a", minHeight: "100vh", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>

      {/* ── NAV ── */}
      <PublicNavbar />

      {/* ── HERO ── */}
      <section className="responsive-hero-section" style={{ padding: "80px 48px 64px", background: "#fff", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(99,91,255,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "60%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,91,255,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, background: "linear-gradient(to bottom, transparent, #fff)", pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: VS, border: `1px solid ${VB}`, borderRadius: 100, padding: "6px 16px", fontSize: 12, fontWeight: 600, color: V, marginBottom: 24 }}>Help Center</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 18px", color: "#0f172a", lineHeight: 1.1 }}>
            Frequently Asked<br />
            <span style={{ background: `linear-gradient(135deg, ${V}, #a78bfa)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Questions</span>
          </h1>
          <p style={{ fontSize: 17, color: "#64748b", margin: "0 auto 40px", maxWidth: 520, lineHeight: 1.7 }}>
            Everything you need to know about CodeVault. Can&apos;t find your answer? Contact our support team.
          </p>
          {/* Search */}
          <div style={{ maxWidth: 520, margin: "0 auto", position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions…"
              style={{ width: "100%", padding: "14px 18px 14px 44px", borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 15, color: "#0f172a", background: "#fff", outline: "none", boxSizing: "border-box", boxShadow: "0 2px 8px rgba(15,23,42,0.06)", transition: "border-color 0.2s" }}
              onFocus={e => { e.currentTarget.style.borderColor = V; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(99,91,255,0.1)`; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,0.06)"; }}
            />
          </div>
        </motion.div>
      </section>

      <div className="responsive-page-container" style={{ maxWidth: 1000, margin: "0 auto", padding: "0 48px 120px" }}>

        {/* ── CATEGORY TABS ── */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 48, overflowX: "auto", paddingBottom: 4 }}>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => { setActive(cat.id); setOpenIdx(null); }} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 100,
              border: `1.5px solid ${active === cat.id ? V : "#e2e8f0"}`,
              background: active === cat.id ? VS : "#fff",
              color: active === cat.id ? V : "#64748b",
              fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}>
              <cat.icon size={13} /> {cat.label}
            </button>
          ))}
        </div>

        {/* ── FAQ LIST ── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
              <Search size={40} style={{ margin: "0 auto 16px", display: "block", opacity: 0.4 }} />
              <div style={{ fontSize: 16, fontWeight: 600 }}>No results found</div>
              <div style={{ fontSize: 14, marginTop: 6 }}>Try a different search term or category</div>
            </div>
          )}
          {filtered.map((faq, idx) => (
            <div key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                style={{ width: "100%", padding: "22px 0", background: "none", border: 0, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: V, flexShrink: 0, marginTop: 7 }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.4 }}>{faq.q}</span>
                </div>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: openIdx === idx ? "#0f172a" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                  <ChevronDown size={14} style={{ color: openIdx === idx ? "#fff" : "#64748b", transform: openIdx === idx ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s" }} />
                </div>
              </button>
              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }}>
                    <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.8, margin: "0 0 24px", paddingLeft: 21, paddingRight: 16 }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* ── STATS ── */}
        <div className="responsive-grid-1col" style={{ marginTop: 72, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, textAlign: "center" }}>
          {[{ val: `${faqs.length}+`, label: "Questions answered" }, { val: "7", label: "Topic categories" }, { val: "< 24h", label: "Support response time" }].map((s, i) => (
            <div key={i} style={{ padding: "28px 24px", borderRadius: 16, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em", marginBottom: 6 }}>{s.val}</div>
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── CONTACT CTA ── */}
        <div className="responsive-flex-stack" style={{ marginTop: 48, padding: "32px 36px", borderRadius: 20, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.03em" }}>Still have questions?</h3>
            <p style={{ fontSize: 15, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
              Can&apos;t find what you&apos;re looking for? Our team is here to help.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/docs" style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", color: "#94a3b8", padding: "12px 22px", borderRadius: 11, fontSize: 14, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
              Read the Docs
            </Link>
            <Link href="/contact" style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", color: "#0f172a", padding: "12px 22px", borderRadius: 11, fontSize: 14, fontWeight: 700, textDecoration: "none", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
              Contact Support <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
