"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabaseAuth } from "../../services/supabaseAuth";
import { ArrowRight, CheckCircle2, Lock, Mail, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await supabaseAuth.signUp(email, password, fullName);
    setLoading(false);

    if (res.success) {
      setShowModal(true);
    } else {
      setError(res.error || "Failed to register account.");
    }
  };

  const handleProceedToLogin = () => {
    setShowModal(false);
    router.push("/login");
  };

  return (
    <main className="page" style={{ maxWidth: 440, minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
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
                We have sent a verification link to <strong style={{ color: "var(--ink)" }}>{email}</strong>. Please check your inbox and verify your email to activate your account.
              </p>

              <button
                onClick={handleProceedToLogin}
                className="primary"
                style={{ width: "100%", padding: "12px 18px", borderRadius: 12, fontWeight: 700, fontSize: 14, justifyContent: "center" }}
              >
                Go to Sign In <ArrowRight size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, background: "var(--violet-soft)", border: "1px solid var(--line)", marginBottom: 14 }}>
          <Image src="/main-logo.png" alt="CodeVault" width={32} height={32} style={{ borderRadius: 6 }} priority />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 850, letterSpacing: "-0.04em", margin: 0 }}>Create CodeVault Account</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 0" }}>Initialize your personal algorithm repository portfolio.</p>
      </div>

      <div className="glass-card" style={{ padding: 28, borderRadius: 20 }}>
        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
            {loading ? "Creating account…" : "Create Free Account"}
            <ArrowRight size={15} />
          </button>
        </form>
      </div>

      <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--muted)" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--violet)", fontWeight: 700, textDecoration: "none" }}>
          Sign in →
        </Link>
      </div>
    </main>
  );
}

