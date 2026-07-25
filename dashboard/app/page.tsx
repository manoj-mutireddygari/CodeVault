"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Download,
  GitFork,
  BookOpen,
  CheckCircle,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  Shield,
  HelpCircle,
  Code,
  ExternalLink,
  ChevronDown,
  Layers3,
  Flame,
  Target,
  Calendar,
} from "lucide-react";
import { supabaseAuth } from "../services/supabaseAuth";

export default function LandingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const session = supabaseAuth.getSession();
    setIsAuthenticated(Boolean(session));
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/register");
    }
  };

  const handleDownloadExtension = () => {
    if (isAuthenticated) {
      router.push("/dashboard/help");
    } else {
      router.push("/register");
    }
  };

  const faqs = [
    {
      q: "How does CodeVault connect to my GitHub account?",
      a: "CodeVault connects safely using the Personal Access Token (PAT) you define, communicating securely through the browser handshake. It only requires repository access to create and upload your solutions, keeping your other profile data untouched and safe."
    },
    {
      q: "Can I use CodeVault with a private repository?",
      a: "Yes! CodeVault supports both public and private repositories. You can choose the visibility of your repository during the simple onboarding setup wizard."
    },
    {
      q: "Does the extension run in the background?",
      a: "No. The Chrome extension is designed to be extremely lightweight and active only when you submit code on LeetCode. It doesn't run background processes or consume memory when you aren't using LeetCode."
    },
    {
      q: "What programming languages are supported?",
      a: "All major LeetCode languages are fully supported, including Python, Java, C++, JavaScript, TypeScript, Rust, Go, C#, Swift, and Kotlin, with correct extensions and organized catalog structures."
    }
  ];

  return (
    <div style={{ background: "#ffffff", color: "#0f172a", minHeight: "100vh", fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
      
      {/* Light Accent Glows */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 800, height: 600, background: "radial-gradient(circle, rgba(99, 91, 255, 0.04) 0%, transparent 65%)", zIndex: 0, pointerEvents: "none" }} />

      {/* Navigation Header */}
      <header style={{
        borderBottom: "1px solid #e2e8f0",
        padding: "16px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image
            src="/main-logo.png"
            alt="CodeVault Logo"
            width={26}
            height={26}
            style={{ borderRadius: 6 }}
          />
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.04em", color: "#0f172a" }}>CodeVault</span>
        </div>
        <nav style={{ display: "flex", gap: 24, fontSize: 13, fontWeight: 600, color: "#64748b" }} className="landing-nav">
          <Link href="/download" style={{ textDecoration: "none", color: "inherit" }}>Download</Link>
          <Link href="/install" style={{ textDecoration: "none", color: "inherit" }}>Install</Link>
          <Link href="/docs" style={{ textDecoration: "none", color: "inherit" }}>Docs</Link>
          <Link href="/faq" style={{ textDecoration: "none", color: "inherit" }}>FAQ</Link>
        </nav>
        <div style={{ display: "flex", gap: 12 }}>
          {isAuthenticated ? (
            <Link href="/dashboard" style={{
              background: "linear-gradient(135deg, #6d6afe, #a78bfa)",
              color: "#ffffff", padding: "8px 18px", fontSize: 13,
              fontWeight: 700, borderRadius: 10, textDecoration: "none",
              boxShadow: "0 4px 12px rgba(109, 106, 254, 0.2)",
            }}>
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/login" style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              color: "#0f172a", padding: "8px 18px", fontSize: 13,
              fontWeight: 700, borderRadius: 10, textDecoration: "none",
              transition: "all 0.2s",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; }}
            >
              Log In
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: "100px 32px 80px", textAlign: "center", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span style={{
              fontSize: 11, fontWeight: 800, color: "#6d6afe",
              background: "rgba(109, 106, 254, 0.08)",
              border: "1px solid rgba(109, 106, 254, 0.15)",
              padding: "6px 14px", borderRadius: 20,
              letterSpacing: "0.08em", textTransform: "uppercase"
            }}>
              Automatic GitHub Solution Sync
            </span>
            <h1 style={{
              fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 900,
              letterSpacing: "-0.04em", margin: "24px 0 16px",
              lineHeight: 1.15, color: "#0f172a"
            }}>
              Preserve your LeetCode journey.<br />
              <span style={{ background: "linear-gradient(135deg, #6d6afe, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Own your clean portfolio.
              </span>
            </h1>
            <p style={{ fontSize: 16, color: "#64748b", margin: "0 auto 36px", maxWidth: 640, lineHeight: 1.6 }}>
              Automatically commit accepted LeetCode submissions directly to your personal GitHub repository. 
              Review beautiful analytics, streak calendars, and code logs in one premium dashboard.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}
          >
            <button onClick={handleGetStarted} style={{
              background: "linear-gradient(135deg, #6d6afe, #a78bfa)",
              color: "#ffffff", padding: "14px 32px", fontSize: 14,
              fontWeight: 700, borderRadius: 12, border: 0, cursor: "pointer",
              boxShadow: "0 8px 24px rgba(109, 106, 254, 0.25)",
              display: "flex", alignItems: "center", gap: 8, transition: "transform 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Get Started Free <ArrowRight size={16} />
            </button>
            <button onClick={handleDownloadExtension} style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              color: "#0f172a", padding: "14px 28px", fontSize: 14,
              fontWeight: 700, borderRadius: 12, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; }}
            >
              <Download size={16} /> Setup Extension
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: "80px 32px", borderTop: "1px solid #f1f5f9", background: "#fafbfe" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.15em", fontWeight: 800, color: "#6d6afe", textTransform: "uppercase", marginBottom: 6 }}>PRODUCT OVERVIEW</p>
            <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: "#0f172a" }}>Core Platform Features</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {[
              { title: "Safe Bridge Authorization", desc: "No complex configuration settings inside Chrome extension. Safely complete the handshake through the site and write changes directly to GitHub.", Icon: Shield },
              { title: "Smart Upload Queue", desc: "Locks accepted solutions inside local sandbox storage and syncs sequentially. Prevents repository upload collisions and file corruption.", Icon: Terminal },
              { title: "Developer Dashboard", desc: "Understand solves dynamically by tags, difficulty cards, and calendar streak trackers, displaying complete portfolio logs.", Icon: Activity },
              { title: "Clean Vault Structure", desc: "Fills the repository with descriptive markdown, solution lists, difficulty badges, and clean directory indexing.", Icon: GitFork },
              { title: "Premium Theme Modes", desc: "Designed with clean modern aesthetics, dynamic layout preferences, and custom responsive micro-animations.", Icon: Sparkles },
              { title: "Structured Guides", desc: "Complete guide sheets for browser unpacked load settings, token configuration, and troubleshooting.", Icon: BookOpen }
            ].map((f, i) => (
              <div key={i} style={{
                padding: 28, borderRadius: 20,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)",
                transition: "all 0.2s",
              }}
              className="feature-card"
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#6d6afe"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(109,106,254,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)"; }}
              >
                <div style={{ width: 44, height: 44, background: "rgba(109, 106, 254, 0.08)", color: "#6d6afe", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <f.Icon size={20} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 10px", color: "#0f172a" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / Handshake Workflow */}
      <section style={{ padding: "80px 32px", borderTop: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.15em", fontWeight: 800, color: "#6d6afe", textTransform: "uppercase", marginBottom: 6 }}>WORKFLOW</p>
            <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: "#0f172a" }}>Simple Handshake Setup</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {[
              { step: "01", title: "Install the Client Extension", desc: "Download the Chrome ZIP package, extract the files, and load it unpacked inside developer extensions." },
              { step: "02", title: "Complete Platform Handshake", desc: "Login to the website. The client extension detects the active session automatically." },
              { step: "03", title: "Target Repo Mapping", desc: "Map your target repository in settings to set the destination. Visibility settings can be set as public/private." },
              { step: "04", title: "Submit Solves", desc: "Solve problems on LeetCode. Once accepted, solutions are captured, structured, and committed in real-time." }
            ].map((s, i) => (
              <div key={i} style={{
                display: "flex", gap: 24, alignItems: "flex-start",
                padding: 24, borderRadius: 16,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.01)"
              }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#6d6afe", background: "rgba(109,106,254,0.06)", width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {s.step}
                </span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 6px", color: "#0f172a" }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mock Dashboard Preview Container */}
      <section style={{ padding: "80px 32px", borderTop: "1px solid #f1f5f9", background: "#fafbfe", textAlign: "center" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.15em", fontWeight: 800, color: "#6d6afe", textTransform: "uppercase", marginBottom: 6 }}>DASHBOARD PREVIEW</p>
            <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: "#0f172a" }}>Clean Developer Analytics</h2>
            <p style={{ fontSize: 14, color: "#64748b", marginTop: 8 }}>Vibrant stats, Streak tracker, and catalogs compiled dynamically from your repository.</p>
          </div>

          {/* Premium Light Dashboard Card */}
          <div style={{
            padding: 32, borderRadius: 24,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            textAlign: "left",
            boxShadow: "0 20px 40px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#6d6afe", textTransform: "uppercase", letterSpacing: "0.05em" }}>SOLUTION PROFILE OVERVIEW</span>
                <h3 style={{ fontSize: 20, fontWeight: 850, margin: "4px 0 0", color: "#0f172a" }}>CodeVault Analytics</h3>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ background: "#ecfdf5", color: "#059669", border: "1px solid rgba(16, 185, 129, 0.15)", padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>45 Easy</span>
                <span style={{ background: "#fffbeb", color: "#d97706", border: "1px solid rgba(245, 158, 11, 0.15)", padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>82 Medium</span>
                <span style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid rgba(239, 68, 68, 0.15)", padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>12 Hard</span>
              </div>
            </div>

            {/* Simple Graphic Bar Mock */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { lang: "Python", val: 78, col: "#6d6afe" },
                  { lang: "C++", val: 44, col: "#a78bfa" },
                  { lang: "JavaScript", val: 17, col: "#818cf8" }
                ].map((g, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 4, color: "#0f172a" }}>
                      <span>{g.lang}</span>
                      <span style={{ color: "#64748b" }}>{g.val} solved</span>
                    </div>
                    <div style={{ width: "100%", height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${g.val}%`, height: "100%", background: g.col, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini Stats Summary card */}
              <div style={{
                padding: 20, borderRadius: 16,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12
              }}>
                {[
                  { label: "Total Solved", val: "139", icon: Layers3 },
                  { label: "Current Streak", val: "8 Days", icon: Flame },
                  { label: "Longest Streak", val: "24 Days", icon: Target },
                  { label: "Languages", val: "3", icon: Calendar },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ color: "#6d6afe", display: "flex", alignItems: "center" }}><item.icon size={14} /></div>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{item.label}</span>
                    <strong style={{ fontSize: 16, color: "#0f172a", fontWeight: 750 }}>{item.val}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section style={{ padding: "80px 32px", borderTop: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.15em", fontWeight: 800, color: "#6d6afe", textTransform: "uppercase", marginBottom: 6 }}>SUPPORT</p>
            <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: "#0f172a" }}>Frequently Asked Questions</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                overflow: "hidden",
                background: "#ffffff"
              }}>
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  style={{
                    width: "100%", padding: "18px 24px",
                    background: "none", border: 0, textAlign: "left",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    cursor: "pointer", fontWeight: 700, fontSize: 14,
                    color: "#0f172a"
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={16} style={{
                    color: "#6d6afe", transition: "transform 0.2s",
                    transform: activeFaq === idx ? "rotate(180deg)" : "rotate(0)"
                  }} />
                </button>
                {activeFaq === idx && (
                  <div style={{ padding: "0 24px 20px", fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e2e8f0", padding: "70px 32px 48px", background: "#f8fafc" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Image
                src="/main-logo.png"
                alt="CodeVault Logo"
                width={22}
                height={22}
                style={{ borderRadius: 4 }}
              />
              <span style={{ fontSize: 15, fontWeight: 850, letterSpacing: "-0.03em", color: "#0f172a" }}>CodeVault</span>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", maxWidth: 280, lineHeight: 1.6 }}>
              Open-source solution preservation catalog. Your vault, hosted safely in your own profile.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 16px", color: "#0f172a" }}>Guides</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#64748b" }}>
              <li><Link href="/download" style={{ textDecoration: "none", color: "inherit" }}>Download ZIP</Link></li>
              <li><Link href="/install" style={{ textDecoration: "none", color: "inherit" }}>Installation Steps</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 16px", color: "#0f172a" }}>Resources</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#64748b" }}>
              <li><Link href="/docs" style={{ textDecoration: "none", color: "inherit" }}>API Documentation</Link></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>GitHub Project</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 16px", color: "#0f172a" }}>Legal</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#64748b" }}>
              <li><Link href="/privacy" style={{ textDecoration: "none", color: "inherit" }}>Privacy Policy</Link></li>
              <li><Link href="/terms" style={{ textDecoration: "none", color: "inherit" }}>Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div style={{ maxWidth: 1040, margin: "40px auto 0", paddingTop: 24, borderTop: "1px solid #e2e8f0", textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
          © {new Date().getFullYear()} CodeVault. MIT Open Source License.
        </div>
      </footer>
    </div>
  );
}
