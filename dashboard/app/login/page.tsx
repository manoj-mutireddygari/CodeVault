"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabaseAuth } from "../../services/supabaseAuth";
import { ArrowRight, ArrowLeft, Lock, Mail, User, Check, GitFork, BarChart3, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await supabaseAuth.signIn(email, password);
    setLoading(false);
    if (res.session) {
      router.push("/dashboard");
    } else {
      setError(res.error || "Invalid credentials. Please try again.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await supabaseAuth.signUp(email, password, fullName || email.split("@")[0]);
    setLoading(false);
    if (res.success) {
      setShowModal(true);
    } else {
      setError(res.error || "Failed to create account.");
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setTab("login");
  };

  const features = [
    { icon: GitFork, text: "Auto-commit accepted solutions to GitHub" },
    { icon: BarChart3, text: "Beautiful analytics & streak tracking" },
    { icon: Zap, text: "Real-time sync — zero manual effort" },
    { icon: Check, text: "Free forever, no credit card required" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#fff", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>

      {/* ── Email Verified Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 9999,
              background: "rgba(15,23,42,0.6)",
              backdropFilter: "blur(12px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{
                maxWidth: 440, width: "100%", background: "#fff",
                borderRadius: 20, padding: 40, textAlign: "center",
                boxShadow: "0 32px 80px rgba(15,23,42,0.2)",
                border: "1px solid #f1f5f9",
              }}
            >
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                marginBottom: 24,
              }}>
                <Mail size={32} style={{ color: "#16a34a" }} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 12px", letterSpacing: "-0.03em" }}>
                Check your inbox
              </h2>
              <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.65, margin: "0 0 32px" }}>
                We sent a verification link to{" "}
                <strong style={{ color: "#0f172a" }}>{email}</strong>.{" "}
                Click the link to activate your account.
              </p>
              <button
                onClick={handleModalClose}
                style={{
                  width: "100%", padding: "13px 20px",
                  background: "#0f172a", color: "#fff",
                  border: "none", borderRadius: 12,
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1e293b"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#0f172a"; }}
              >
                Continue to Sign In <ArrowRight size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LEFT PANEL (branding) ── */}
      <div style={{
        flex: "0 0 480px", background: "#0f172a",
        padding: "56px 52px", display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
      }} className="auth-left-panel">

        {/* Decorative glow */}
        <div style={{
          position: "absolute", bottom: -100, left: -100, width: 500, height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: -80, right: -80, width: 350, height: 350,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", marginBottom: "auto" }}>
          <Image src="/main-logo.png" alt="CodeVault" width={54} height={54} style={{ borderRadius: 10 }} />
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.04em", color: "#fff" }}>CodeVault</span>
        </Link>

        {/* Headline */}
        <div style={{ padding: "48px 0" }}>
          <h2 style={{
            fontSize: "clamp(28px, 3vw, 38px)", fontWeight: 900,
            letterSpacing: "-0.04em", color: "#fff",
            margin: "0 0 16px", lineHeight: 1.15,
          }}>
            Your commits.<br />
            <span style={{
              background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Your portfolio.
            </span>
          </h2>
          <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.65, margin: "0 0 40px", maxWidth: 340 }}>
            Join thousands of developers who use CodeVault to automatically preserve and showcase their LeetCode journey.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                style={{ display: "flex", alignItems: "center", gap: 14 }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <f.icon size={16} style={{ color: "#60a5fa" }} />
                </div>
                <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div style={{
          padding: "20px 24px", borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          marginTop: "auto",
        }}>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
            "CodeVault made my GitHub profile look incredible. Every LeetCode solve is automatically committed and organized."
          </p>
          <div style={{ marginTop: 12, fontSize: 12, color: "#475569", fontWeight: 600 }}>
            — CodeVault user
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 40px", position: "relative",
      }}>

        {/* Back button */}
        <Link
          href="/"
          style={{
            position: "absolute", top: 28, left: 28,
            display: "flex", alignItems: "center", gap: 7,
            fontSize: 13, fontWeight: 600, color: "#64748b",
            textDecoration: "none",
            padding: "8px 14px", borderRadius: 10,
            border: "1px solid #e2e8f0",
            background: "#fff",
            transition: "all 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#0f172a"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 36 }}
          >
            <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.04em", color: "#0f172a", margin: "0 0 10px" }}>
              {tab === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p style={{ fontSize: 15, color: "#64748b", margin: 0 }}>
              {tab === "login"
                ? "Sign in to access your CodeVault dashboard."
                : "Start building your LeetCode portfolio today."}
            </p>
          </motion.div>

          {/* Tab switcher */}
          <div style={{
            display: "flex", background: "#f8fafc",
            border: "1px solid #e2e8f0", borderRadius: 12,
            padding: 4, marginBottom: 28, gap: 4,
          }}>
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); }}
                style={{
                  flex: 1, padding: "9px 16px", fontSize: 14, fontWeight: 700,
                  borderRadius: 9, border: "none", cursor: "pointer",
                  transition: "all 0.2s",
                  background: tab === t ? "#fff" : "transparent",
                  color: tab === t ? "#0f172a" : "#94a3b8",
                  boxShadow: tab === t ? "0 1px 4px rgba(15,23,42,0.08)" : "none",
                }}
              >
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
            >
              {tab === "login" ? (
                <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <InputField
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    icon={<Mail size={15} />}
                  />
                  <InputField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    icon={<Lock size={15} />}
                    rightLabel={
                      <Link href="/forgot-password" style={{ fontSize: 12, color: "#635bff", fontWeight: 600, textDecoration: "none" }}>
                        Forgot password?
                      </Link>
                    }
                  />

                  {error && <ErrorBox message={error} />}

                  <SubmitButton loading={loading} label="Sign In" loadingLabel="Signing in…" />
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <InputField
                    label="Full name"
                    type="text"
                    value={fullName}
                    onChange={setFullName}
                    placeholder="Your name"
                    icon={<User size={15} />}
                  />
                  <InputField
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    icon={<Mail size={15} />}
                  />
                  <InputField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="Min. 6 characters"
                    icon={<Lock size={15} />}
                  />

                  {error && <ErrorBox message={error} />}

                  <SubmitButton loading={loading} label="Create Account" loadingLabel="Creating account…" />

                  <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
                    By creating an account you agree to our{" "}
                    <Link href="/terms" style={{ color: "#635bff", textDecoration: "none", fontWeight: 600 }}>Terms</Link>
                    {" "}and{" "}
                    <Link href="/privacy" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>Privacy Policy</Link>.
                  </p>
                </form>
              )}
            </motion.div>
          </AnimatePresence>


        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .auth-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Sub-components ── */

function InputField({
  label, type, value, onChange, placeholder, icon, rightLabel,
}: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon: React.ReactNode; rightLabel?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</label>
        {rightLabel}
      </div>
      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
          color: focused ? "#2563eb" : "#94a3b8", transition: "color 0.2s",
          pointerEvents: "none",
        }}>
          {icon}
        </div>
        <input
          required
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: "12px 14px 12px 40px",
            background: "#fff",
            border: `1.5px solid ${focused ? "#2563eb" : "#e2e8f0"}`,
            borderRadius: 11, fontSize: 14, color: "#0f172a",
            boxSizing: "border-box", outline: "none",
            transition: "border-color 0.2s",
            boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.08)" : "none",
          }}
        />
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: "12px 16px", borderRadius: 10, fontSize: 13,
        background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626",
        fontWeight: 500, lineHeight: 1.5,
      }}
    >
      {message}
    </motion.div>
  );
}

function SubmitButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: "100%", padding: "13px 20px",
        background: loading ? "#94a3b8" : "#635bff",
        color: "#fff", border: "none", borderRadius: 12,
        fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "all 0.2s",
        boxShadow: loading ? "none" : "0 4px 16px rgba(99,91,255,0.3)",
        marginTop: 4,
      }}
      onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#4f46e5"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
      onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = "#635bff"; e.currentTarget.style.transform = "translateY(0)"; } }}
    >
      {loading ? (
        <>
          <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          {loadingLabel}
        </>
      ) : (
        <>
          {label} <ArrowRight size={16} />
        </>
      )}
    </button>
  );
}
