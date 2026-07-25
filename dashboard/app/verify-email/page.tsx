"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { supabaseAuth } from "../../services/supabaseAuth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const session = supabaseAuth.getSession();
    if (session?.user?.email) {
      setEmail(session.user.email);
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleSimulateVerification = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      // Automatically navigate to onboarding
      router.push("/onboarding");
    }, 1500);
  };

  return (
    <main className="auth-shell" style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 20 }}>
      <div className="glass-card" style={{ maxWidth: 440, width: "100%", padding: 40, borderRadius: 24, background: "white", border: "1px solid var(--line)", textAlign: "center", boxShadow: "var(--card-shadow)" }}>
        <div style={{ width: 64, height: 64, background: "var(--violet-soft)", color: "var(--violet)", borderRadius: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <Mail size={32} />
        </div>
        
        <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
          Verify your email
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, margin: "0 0 28px" }}>
          We sent a verification link to <strong style={{ color: "var(--ink)" }}>{email || "your address"}</strong>. Please click the link to confirm your account.
        </p>

        <button
          onClick={handleSimulateVerification}
          disabled={checking}
          className="primary"
          style={{ width: "100%", padding: "13px", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14 }}
        >
          {checking ? (
            <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          ) : (
            <>
              Check Verification Status <ArrowRight size={16} />
            </>
          )}
        </button>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </main>
  );
}
