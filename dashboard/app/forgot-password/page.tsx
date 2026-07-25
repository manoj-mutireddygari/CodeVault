"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabaseAuth } from "../../services/supabaseAuth";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await supabaseAuth.resetPassword(email);
    setLoading(false);
    setMessage(res.message);
  };

  return (
    <main className="page" style={{ maxWidth: 440, minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, background: "var(--violet-soft)", border: "1px solid var(--line)", marginBottom: 14 }}>
          <Image src="/main-logo.png" alt="CodeVault" width={32} height={32} style={{ borderRadius: 6 }} priority />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 850, letterSpacing: "-0.04em", margin: 0 }}>Reset Password</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 0" }}>Enter your registered email to receive a password reset token.</p>
      </div>

      <div className="glass-card" style={{ padding: 28, borderRadius: 20 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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

          {message && (
            <div style={{ padding: 12, borderRadius: 10, fontSize: 12, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46" }}>
              {message}
            </div>
          )}

          <button type="submit" disabled={loading} className="primary" style={{ width: "100%", padding: "11px 16px", borderRadius: 12, fontWeight: 700, fontSize: 13, justifyContent: "center", gap: 8, marginTop: 4 }}>
            {loading ? "Sending link…" : "Send Reset Link"}
            <ArrowRight size={15} />
          </button>
        </form>
      </div>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Link href="/login" style={{ fontSize: 12, color: "var(--violet)", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </main>
  );
}
