"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabaseAuth } from "../../services/supabaseAuth";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
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
      setError(res.error || "Invalid credentials.");
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

  return (
    <main className="page" style={{ maxWidth: 460, minHeight: "85vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      {/* Verification Email Popup Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 99999,
              background: "rgba(9, 11, 18, 0.7)",
              backdropFilter: "blur(12px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 20
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              style={{
                maxWidth: 420, width: "100%", background: "#ffffff",
                borderRadius: 24, padding: 32, textAlign: "center",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                border: "1px solid var(--line)"
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "var(--violet-soft)", color: "var(--violet)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20
              }}>
                <Mail size={32} />
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 850, color: "var(--ink)", margin: "0 0 10px", letterSpacing: "-0.03em" }}>
                Verify your email address
              </h2>

              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 24px" }}>
                We have sent a verification link to <strong style={{ color: "var(--ink)" }}>{email}</strong>. Please check your inbox and verify your email address to activate your account before signing in.
              </p>

              <button
                onClick={handleModalClose}
                className="primary"
                style={{ width: "100%", padding: "12px 18px", borderRadius: 12, fontWeight: 700, fontSize: 14, justifyContent: "center" }}
              >
                Go to Sign In <ArrowRight size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, background: "var(--violet-soft)", border: "1px solid var(--line)", marginBottom: 12 }}>
          <Image src="/main-logo.png" alt="CodeVault" width={32} height={32} style={{ borderRadius: 6 }} priority />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 850, letterSpacing: "-0.04em", margin: 0 }}>CodeVault Platform</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 0" }}>Sign in or create an account to access your solution vault.</p>
      </div>

      <div className="glass-card" style={{ padding: 28, borderRadius: 24 }}>
        {/* Toggle between Login and Register inside */}
        <div style={{ display: "flex", gap: 6, padding: 4, background: "var(--violet-soft)", border: "1px solid var(--line)", borderRadius: 12, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => { setTab("login"); setError(null); }}
            style={{ flex: 1, padding: "8px 12px", fontSize: 13, fontWeight: 700, borderRadius: 9, border: 0, cursor: "pointer", background: tab === "login" ? "var(--card-bg)" : "transparent", color: tab === "login" ? "var(--violet)" : "var(--muted)", boxShadow: tab === "login" ? "0 2px 8px rgba(99,91,255,0.12)" : "none" }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab("register"); setError(null); }}
            style={{ flex: 1, padding: "8px 12px", fontSize: 13, fontWeight: 700, borderRadius: 9, border: 0, cursor: "pointer", background: tab === "register" ? "var(--card-bg)" : "transparent", color: tab === "register" ? "var(--violet)" : "var(--muted)", boxShadow: tab === "register" ? "0 2px 8px rgba(99,91,255,0.12)" : "none" }}
          >
            Register Account
          </button>
        </div>

        {tab === "login" ? (
          <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@developer.dev"
                  style={{ width: "100%", padding: "10px 14px 10px 38px", background: "var(--violet-soft)", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13, color: "var(--ink)", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: 11, color: "var(--violet)", fontWeight: 700, textDecoration: "none" }}>
                  Forgot?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{ width: "100%", padding: "10px 14px 10px 38px", background: "var(--violet-soft)", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13, color: "var(--ink)", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {error && (
              <div style={{ padding: 12, borderRadius: 10, fontSize: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="primary" style={{ width: "100%", padding: "11px 16px", borderRadius: 12, fontWeight: 700, fontSize: 13, justifyContent: "center", gap: 8, marginTop: 4 }}>
              {loading ? "Signing in…" : "Sign In & Open Dashboard"}
              <ArrowRight size={15} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Manoj Mutireddygari"
                  style={{ width: "100%", padding: "10px 14px 10px 38px", background: "var(--violet-soft)", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13, color: "var(--ink)", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@developer.dev"
                  style={{ width: "100%", padding: "10px 14px 10px 38px", background: "var(--violet-soft)", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13, color: "var(--ink)", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  style={{ width: "100%", padding: "10px 14px 10px 38px", background: "var(--violet-soft)", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13, color: "var(--ink)", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {error && (
              <div style={{ padding: 12, borderRadius: 10, fontSize: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="primary" style={{ width: "100%", padding: "11px 16px", borderRadius: 12, fontWeight: 700, fontSize: 13, justifyContent: "center", gap: 8, marginTop: 4 }}>
              {loading ? "Creating Account…" : "Register Account"}
              <ArrowRight size={15} />
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

