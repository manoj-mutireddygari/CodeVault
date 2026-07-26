"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabaseAuth } from "../../services/supabaseAuth";
import { ArrowRight, ArrowLeft, Lock, Mail, User, Check, GitFork, BarChart3, Zap, ShieldCheck, Code2, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // GSAP Refs
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  
  const formCardRef = useRef<HTMLDivElement>(null);
  const formWrapperRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const badge1Ref = useRef<HTMLDivElement>(null);
  const badge2Ref = useRef<HTMLDivElement>(null);
  const badge3Ref = useRef<HTMLDivElement>(null);

  const modalContentRef = useRef<HTMLDivElement>(null);

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

  // GSAP Initial & Ambient Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial Synchronized Entrance Timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (leftPanelRef.current) {
        tl.fromTo(
          leftPanelRef.current,
          { opacity: 0, x: -60 },
          { opacity: 1, x: 0, duration: 0.9 }
        );
      }

      if (logoRef.current) {
        tl.fromTo(
          logoRef.current,
          { opacity: 0, y: -25, scale: 0.85 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
          "-=0.5"
        );
      }

      if (headlineRef.current) {
        tl.fromTo(
          headlineRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.65 },
          "-=0.4"
        );
      }

      if (subtextRef.current) {
        tl.fromTo(
          subtextRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.3"
        );
      }

      if (featuresRef.current && featuresRef.current.children) {
        tl.fromTo(
          Array.from(featuresRef.current.children),
          { opacity: 0, x: -30, scale: 0.95 },
          { opacity: 1, x: 0, scale: 1, duration: 0.55, stagger: 0.09, ease: "back.out(1.3)" },
          "-=0.3"
        );
      }

      if (quoteRef.current) {
        tl.fromTo(
          quoteRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.2"
        );
      }

      if (formCardRef.current) {
        tl.fromTo(
          formCardRef.current,
          { opacity: 0, y: 40, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "power4.out" },
          "-=0.8"
        );
      }

      // Entrance for Floating Decorative Badges
      const badges = [badge1Ref.current, badge2Ref.current, badge3Ref.current].filter(Boolean);
      if (badges.length > 0) {
        gsap.fromTo(
          badges,
          { opacity: 0, scale: 0.7, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "back.out(1.5)", delay: 0.4 }
        );
      }

      // 2. Ambient Continuous Floating Loop for Glowing Orbs
      if (orb1Ref.current) {
        gsap.to(orb1Ref.current, {
          x: "random(-35, 35)",
          y: "random(-35, 35)",
          duration: 6.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
      if (orb2Ref.current) {
        gsap.to(orb2Ref.current, {
          x: "random(-25, 25)",
          y: "random(-25, 25)",
          duration: 7.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
      if (orb3Ref.current) {
        gsap.to(orb3Ref.current, {
          x: "random(-30, 30)",
          y: "random(-30, 30)",
          duration: 5.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // 3. Floating Micro-bobbing for Left Panel Floating Badges
      if (badge1Ref.current) {
        gsap.to(badge1Ref.current, {
          y: -12,
          rotation: 3,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
      if (badge2Ref.current) {
        gsap.to(badge2Ref.current, {
          y: 14,
          rotation: -2.5,
          duration: 4.1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
      if (badge3Ref.current) {
        gsap.to(badge3Ref.current, {
          y: -10,
          rotation: 2,
          duration: 3.7,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, leftPanelRef);

    return () => ctx.revert();
  }, []);

  // GSAP Tab Switch Animation
  useEffect(() => {
    if (formWrapperRef.current) {
      gsap.fromTo(
        formWrapperRef.current,
        { opacity: 0, y: 16, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" }
      );
    }
  }, [tab]);

  // GSAP Shake on Error
  useEffect(() => {
    if (error && errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        { x: -14 },
        { x: 0, duration: 0.55, ease: "elastic.out(1.2, 0.2)" }
      );
    }
  }, [error]);

  // GSAP Modal Pop Animation
  useEffect(() => {
    if (showModal && modalContentRef.current) {
      gsap.fromTo(
        modalContentRef.current,
        { opacity: 0, scale: 0.85, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" }
      );
    }
  }, [showModal]);

  // 3D Parallax Mouse Tracking on Left Branding Panel
  const handleLeftPanelMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!leftPanelRef.current) return;
    const rect = leftPanelRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    if (orb1Ref.current) gsap.to(orb1Ref.current, { x: x * 45, y: y * 45, duration: 0.6, ease: "power2.out" });
    if (orb2Ref.current) gsap.to(orb2Ref.current, { x: x * -40, y: y * -40, duration: 0.6, ease: "power2.out" });
    if (orb3Ref.current) gsap.to(orb3Ref.current, { x: x * 30, y: y * 30, duration: 0.6, ease: "power2.out" });

    if (badge1Ref.current) gsap.to(badge1Ref.current, { x: x * 25, y: y * 25, rotateY: x * 18, rotateX: -y * 18, duration: 0.4, ease: "power2.out" });
    if (badge2Ref.current) gsap.to(badge2Ref.current, { x: x * -20, y: y * -20, rotateY: x * 12, rotateX: -y * 12, duration: 0.4, ease: "power2.out" });
    if (badge3Ref.current) gsap.to(badge3Ref.current, { x: x * 28, y: y * -22, rotateY: x * 22, rotateX: -y * 22, duration: 0.4, ease: "power2.out" });
  };

  const handleLeftPanelMouseLeave = () => {
    if (orb1Ref.current) gsap.to(orb1Ref.current, { x: 0, y: 0, duration: 1.2, ease: "power2.out" });
    if (orb2Ref.current) gsap.to(orb2Ref.current, { x: 0, y: 0, duration: 1.2, ease: "power2.out" });
    if (orb3Ref.current) gsap.to(orb3Ref.current, { x: 0, y: 0, duration: 1.2, ease: "power2.out" });

    if (badge1Ref.current) gsap.to(badge1Ref.current, { x: 0, y: 0, rotateY: 0, rotateX: 0, duration: 0.9, ease: "power2.out" });
    if (badge2Ref.current) gsap.to(badge2Ref.current, { x: 0, y: 0, rotateY: 0, rotateX: 0, duration: 0.9, ease: "power2.out" });
    if (badge3Ref.current) gsap.to(badge3Ref.current, { x: 0, y: 0, rotateY: 0, rotateX: 0, duration: 0.9, ease: "power2.out" });
  };

  // Magnetic Button Hover helper
  const handleMagneticMove = (e: React.MouseEvent<HTMLElement>, intensity = 0.2) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: x * intensity, y: y * intensity, duration: 0.2, ease: "power2.out" });
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
  };

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
            <div
              ref={modalContentRef}
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
                onMouseMove={(e) => handleMagneticMove(e, 0.15)}
                onMouseLeave={handleMagneticLeave}
                style={{
                  width: "100%", padding: "13px 20px",
                  background: "#0f172a", color: "#fff",
                  border: "none", borderRadius: 12,
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1e293b"; }}
              >
                Continue to Sign In <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LEFT PANEL (branding + GSAP ambient effects) ── */}
      <div
        ref={leftPanelRef}
        onMouseMove={handleLeftPanelMouseMove}
        onMouseLeave={handleLeftPanelMouseLeave}
        style={{
          flex: "0 0 480px", background: "#0f172a",
          padding: "56px 52px", display: "flex", flexDirection: "column",
          position: "relative", overflow: "hidden",
          perspective: 1000,
        }}
        className="auth-left-panel"
      >
        {/* GSAP Animated Radial Orbs */}
        <div
          ref={orb1Ref}
          style={{
            position: "absolute", bottom: -100, left: -100, width: 520, height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 65%)",
            pointerEvents: "none",
            filter: "blur(20px)",
          }}
        />
        <div
          ref={orb2Ref}
          style={{
            position: "absolute", top: -80, right: -80, width: 380, height: 380,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)",
            pointerEvents: "none",
            filter: "blur(20px)",
          }}
        />
        <div
          ref={orb3Ref}
          style={{
            position: "absolute", top: "40%", left: "30%", width: 260, height: 260,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
            filter: "blur(15px)",
          }}
        />

        {/* Floating Decorative Glassmorphism Badges (GSAP Animated) */}
        <div
          ref={badge1Ref}
          style={{
            position: "absolute", top: 40, right: 36,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 12, padding: "8px 14px",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            pointerEvents: "none", zIndex: 2,
          }}
        >
          <Code2 size={14} style={{ color: "#60a5fa" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#cbd5e1", fontFamily: "monospace" }}>
            git commit -m "sync"
          </span>
        </div>

        <div
          ref={badge2Ref}
          style={{
            position: "absolute", top: "52%", right: 28,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 12, padding: "8px 14px",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            pointerEvents: "none", zIndex: 2,
          }}
        >
          <Flame size={14} style={{ color: "#f97316" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#cbd5e1" }}>
            365 Day Streak
          </span>
        </div>

        <div
          ref={badge3Ref}
          style={{
            position: "absolute", bottom: 150, right: 45,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 12, padding: "8px 14px",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            pointerEvents: "none", zIndex: 2,
          }}
        >
          <ShieldCheck size={14} style={{ color: "#34d399" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#cbd5e1" }}>
            100% Automated
          </span>
        </div>

        {/* Logo */}
        <Link
          ref={logoRef}
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", marginBottom: "auto", zIndex: 3 }}
        >
          <Image src="/main-logo.png" alt="CodeVault" width={54} height={54} style={{ borderRadius: 10 }} />
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.04em", color: "#fff" }}>CodeVault</span>
        </Link>

        {/* Headline */}
        <div style={{ padding: "48px 0", zIndex: 3 }}>
          <h2
            ref={headlineRef}
            style={{
              fontSize: "clamp(28px, 3vw, 38px)", fontWeight: 900,
              letterSpacing: "-0.04em", color: "#fff",
              margin: "0 0 16px", lineHeight: 1.15,
            }}
          >
            Your commits.<br />
            <span style={{
              background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Your portfolio.
            </span>
          </h2>
          <p
            ref={subtextRef}
            style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.65, margin: "0 0 40px", maxWidth: 340 }}
          >
            Join thousands of developers who use CodeVault to automatically preserve and showcase their LeetCode journey.
          </p>

          {/* Feature list */}
          <div ref={featuresRef} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {features.map((f, i) => (
              <div
                key={i}
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
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div
          ref={quoteRef}
          onMouseMove={(e) => handleMagneticMove(e, 0.08)}
          onMouseLeave={handleMagneticLeave}
          style={{
            padding: "20px 24px", borderRadius: 16,
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.08)",
            marginTop: "auto", zIndex: 3,
            transition: "border-color 0.3s",
          }}
        >
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
            "CodeVault made my GitHub profile look incredible. Every LeetCode solve is automatically committed and organized."
          </p>
          <div style={{ marginTop: 12, fontSize: 12, color: "#64748b", fontWeight: 600 }}>
            — CodeVault user
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div
        className="responsive-hero-section"
        style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "48px 40px", position: "relative",
        }}
      >
        {/* Back button */}
        <div style={{ width: "100%", maxWidth: 420, marginBottom: 24, display: "flex", justifyContent: "flex-start" }}>
          <Link
            href="/"
            onMouseMove={(e) => handleMagneticMove(e, 0.15)}
            onMouseLeave={handleMagneticLeave}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              fontSize: 13, fontWeight: 600, color: "#64748b",
              textDecoration: "none",
              padding: "8px 14px", borderRadius: 10,
              border: "1px solid #e2e8f0",
              background: "#fff",
              transition: "border-color 0.2s, color 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#0f172a"; }}
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>

        <div ref={formCardRef} style={{ width: "100%", maxWidth: 420 }}>
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.04em", color: "#0f172a", margin: "0 0 10px" }}>
              {tab === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p style={{ fontSize: 15, color: "#64748b", margin: 0 }}>
              {tab === "login"
                ? "Sign in to access your CodeVault dashboard."
                : "Start building your LeetCode portfolio today."}
            </p>
          </div>

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

          {/* Form wrapper with GSAP tab transition */}
          <div ref={formWrapperRef}>
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

                {error && (
                  <div ref={errorRef}>
                    <ErrorBox message={error} />
                  </div>
                )}

                <SubmitButton
                  loading={loading}
                  label="Sign In"
                  loadingLabel="Signing in…"
                  onMagneticMove={(e) => handleMagneticMove(e, 0.15)}
                  onMagneticLeave={handleMagneticLeave}
                />
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

                {error && (
                  <div ref={errorRef}>
                    <ErrorBox message={error} />
                  </div>
                )}

                <SubmitButton
                  loading={loading}
                  label="Create Account"
                  loadingLabel="Creating account…"
                  onMagneticMove={(e) => handleMagneticMove(e, 0.15)}
                  onMagneticLeave={handleMagneticLeave}
                />

                <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
                  By creating an account you agree to our{" "}
                  <Link href="/terms" style={{ color: "#635bff", textDecoration: "none", fontWeight: 600 }}>Terms</Link>
                  {" "}and{" "}
                  <Link href="/privacy" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>Privacy Policy</Link>.
                </p>
              </form>
            )}
          </div>

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
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleFocus = () => {
    setFocused(true);
    if (wrapperRef.current) {
      gsap.to(wrapperRef.current, { scale: 1.015, duration: 0.2, ease: "power2.out" });
    }
  };

  const handleBlur = () => {
    setFocused(false);
    if (wrapperRef.current) {
      gsap.to(wrapperRef.current, { scale: 1, duration: 0.2, ease: "power2.out" });
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</label>
        {rightLabel}
      </div>
      <div ref={wrapperRef} style={{ position: "relative" }}>
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
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            width: "100%", padding: "12px 14px 12px 40px",
            background: "#fff",
            border: `1.5px solid ${focused ? "#2563eb" : "#e2e8f0"}`,
            borderRadius: 11, fontSize: 14, color: "#0f172a",
            boxSizing: "border-box", outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.08), 0 4px 12px rgba(37,99,235,0.05)" : "none",
          }}
        />
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "12px 16px", borderRadius: 10, fontSize: 13,
        background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626",
        fontWeight: 500, lineHeight: 1.5,
      }}
    >
      {message}
    </div>
  );
}

function SubmitButton({
  loading,
  label,
  loadingLabel,
  onMagneticMove,
  onMagneticLeave,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
  onMagneticMove?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMagneticLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      onMouseMove={!loading ? onMagneticMove : undefined}
      onMouseLeave={!loading ? onMagneticLeave : undefined}
      style={{
        width: "100%", padding: "13px 20px",
        background: loading ? "#94a3b8" : "#635bff",
        color: "#fff", border: "none", borderRadius: 12,
        fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "background 0.2s, box-shadow 0.2s",
        boxShadow: loading ? "none" : "0 4px 16px rgba(99,91,255,0.3)",
        marginTop: 4,
      }}
      onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#4f46e5"; } }}
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
