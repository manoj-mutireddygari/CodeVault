"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import PublicNavbar from "../../components/PublicNavbar";

const V = "#635bff";
const VS = "#f4f3ff";
const VB = "#ede9fe";
const PAGE_BG = "#fafbfe";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div style={{ background: PAGE_BG, color: "#0f172a", minHeight: "100vh", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>

      {/* ── NAV ── */}
      <PublicNavbar />

      {/* ── HERO ── */}
      <section className="responsive-hero-section" style={{ padding: "80px 48px 56px", background: PAGE_BG, position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(99,91,255,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "60%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,91,255,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: `1px solid ${VB}`, borderRadius: 100, padding: "6px 16px", fontSize: 12, fontWeight: 600, color: V, marginBottom: 24, boxShadow: "0 2px 8px rgba(99,91,255,0.06)" }}>
            Get in Touch
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 18px", color: "#0f172a", lineHeight: 1.1 }}>
            We&apos;re here to help you<br />
            <span style={{ background: `linear-gradient(135deg, ${V}, #a78bfa)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              build your portfolio
            </span>
          </h1>
          <p style={{ fontSize: 17, color: "#64748b", margin: "0 auto", maxWidth: 540, lineHeight: 1.7 }}>
            Have a question, feature request, or technical issue? Drop us a message and our team will get back to you.
          </p>
        </motion.div>
      </section>

      {/* ── MAIN CONTENT (2 Columns) ── */}
      <div className="responsive-page-container" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px 120px" }}>
        <div className="responsive-grid-1col" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 48, alignItems: "start" }}>

          {/* LEFT: Contact Channels */}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", margin: "0 0 8px" }}>
              Contact Channels
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px", lineHeight: 1.6 }}>
              Choose the fastest way to get in touch based on your topic.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 36 }}>
              {[
                {
                  icon: Mail,
                  title: "Direct Email Support",
                  desc: "Send us an email anytime at support@codevault.app.",
                  action: "support@codevault.app",
                  color: V,
                  bg: VS,
                },
                {
                  icon: MessageSquare,
                  title: "GitHub Open Source Issues",
                  desc: "Report bugs or submit feature proposals directly on GitHub.",
                  action: "Open GitHub Issue →",
                  href: "https://github.com",
                  color: "#059669",
                  bg: "#ecfdf5",
                },
                {
                  icon: BookOpen,
                  title: "Documentation & Guides",
                  desc: "Check our architecture docs for self-serve troubleshooting.",
                  action: "Explore Docs →",
                  href: "/docs",
                  color: "#7c3aed",
                  bg: "#f5f3ff",
                },
              ].map((item, i) => (
                <div key={i} style={{ padding: "20px 24px", borderRadius: 16, background: "#fff", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 8px rgba(99,91,255,0.04)", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <item.icon size={20} style={{ color: item.color }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{item.title}</h3>
                    <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 10px", lineHeight: 1.5 }}>{item.desc}</p>
                    {item.href ? (
                      <a href={item.href} target={item.href.startsWith("http") ? "_blank" : "_self"} rel="noreferrer" style={{ fontSize: 13, fontWeight: 700, color: item.color, textDecoration: "none" }}>
                        {item.action}
                      </a>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.action}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* SLA Box */}
            <div style={{ padding: "20px 24px", borderRadius: 16, background: VS, border: `1.5px solid ${VB}`, display: "flex", gap: 14, alignItems: "center" }}>
              <Clock size={20} style={{ color: V, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Average Response Time</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>We aim to respond to all inquiries within <strong>under 24 hours</strong>.</div>
              </div>
            </div>
          </div>

          {/* RIGHT: Contact Form */}
          <div style={{ background: "#fff", border: `1.5px solid ${VB}`, borderRadius: 24, padding: "36px 40px", boxShadow: "0 12px 40px rgba(99,91,255,0.06)" }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", margin: "0 0 6px" }}>
              Send us a Message
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px" }}>
              Fill out the form below and our team will get back to you promptly.
            </p>

            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#ecfdf5", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <CheckCircle2 size={30} style={{ color: "#059669" }} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 10px" }}>Message Received!</h3>
                <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px", lineHeight: 1.6 }}>
                  Thank you for reaching out. We have received your inquiry and will reply to <strong>{email}</strong> shortly.
                </p>
                <button onClick={() => { setSubmitted(false); setName(""); setEmail(""); setSubject(""); setMessage(""); }} style={{ background: VS, color: V, border: `1.5px solid ${VB}`, padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Your Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Manoj Mutireddygari"
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box", transition: "all 0.2s" }}
                    onFocus={e => { e.currentTarget.style.borderColor = V; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(99,91,255,0.1)`; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Email Address</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@developer.dev"
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box", transition: "all 0.2s" }}
                    onFocus={e => { e.currentTarget.style.borderColor = V; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(99,91,255,0.1)`; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Topic</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box", background: "#fff", cursor: "pointer" }}
                  >
                    <option value="general">General Support</option>
                    <option value="bug">Report a Bug</option>
                    <option value="feature">Feature Proposal</option>
                    <option value="github">GitHub Integration Help</option>
                    <option value="security">Security & Privacy Inquiry</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Subject</label>
                  <input
                    required
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Brief summary of your question"
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box", transition: "all 0.2s" }}
                    onFocus={e => { e.currentTarget.style.borderColor = V; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(99,91,255,0.1)`; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Message</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Provide as much details as possible…"
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", transition: "all 0.2s" }}
                    onFocus={e => { e.currentTarget.style.borderColor = V; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(99,91,255,0.1)`; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    background: V, color: "#fff", padding: "14px", borderRadius: 12,
                    fontSize: 15, fontWeight: 700, border: "none", cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: `0 4px 16px rgba(99,91,255,0.35)`, transition: "all 0.2s", marginTop: 6,
                  }}
                  onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#5249e0"; }}
                  onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = V; }}
                >
                  {submitting ? (
                    "Sending message…"
                  ) : (
                    <>
                      Send Message <Send size={15} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* ── FAQ QUICK HELP BANNER ── */}
        <div style={{ marginTop: 80, padding: "40px 48px", borderRadius: 20, background: VS, border: `1.5px solid ${VB}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: "#fff", border: `1px solid ${VB}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <HelpCircle size={24} style={{ color: V }} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Looking for instant answers?</h3>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Check our Frequently Asked Questions for installation, token setup, and troubleshooting.</p>
            </div>
          </div>
          <Link href="/faq" style={{ display: "flex", alignItems: "center", gap: 8, background: V, color: "#fff", padding: "12px 22px", borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: "none", transition: "all 0.2s", boxShadow: `0 4px 14px rgba(99,91,255,0.3)` }}
            onMouseEnter={e => { e.currentTarget.style.background = "#5249e0"; }}
            onMouseLeave={e => { e.currentTarget.style.background = V; }}>
            Explore FAQ <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
