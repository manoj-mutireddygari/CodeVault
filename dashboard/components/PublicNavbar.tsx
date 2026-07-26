"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Cpu,
  Layers,
  Download,
  BookOpen,
  HelpCircle,
  Package,
  MessageSquare,
  ChevronRight,
  Shield,
} from "lucide-react";
import { supabaseAuth } from "../services/supabaseAuth";

const V = "#635bff";
const VS = "#f4f3ff";
const VB = "#ede9fe";

interface PublicNavbarProps {
  activeSection?: string;
}

export default function PublicNavbar({ activeSection }: PublicNavbarProps) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsAuthenticated(Boolean(supabaseAuth.getSession()));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Features", href: pathname === "/" ? "#features" : "/#features", icon: Sparkles, color: "#635bff" },
    { label: "Architecture", href: pathname === "/" ? "#architecture" : "/#architecture", icon: Cpu, color: "#7c3aed" },
    { label: "How It Works", href: pathname === "/" ? "#how-it-works" : "/#how-it-works", icon: Layers, color: "#2563eb" },
    { label: "Download", href: "/download", icon: Download, color: "#059669" },
    { label: "Docs", href: "/docs", icon: BookOpen, color: "#d97706" },
    { label: "FAQ", href: "/faq", icon: HelpCircle, color: "#0284c7" },
    { label: "Install Guide", href: "/install", icon: Package, color: "#9333ea" },
    { label: "Contact", href: "/contact", icon: MessageSquare, color: "#ec4899" },
  ];

  return (
    <>
      {/* ── FIXED TOP NAVBAR (STAYS AT TOP OF VIEWPORT WHILE SCROLLING) ── */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 68,
          background: scrolled ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.85)",
          borderBottom: "1px solid #e2e8f0",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: scrolled ? "0 4px 20px -2px rgba(15, 23, 42, 0.08)" : "none",
          transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            width: "100%",
            height: "100%",
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Brand Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Image src="/main-logo.png" alt="CodeVault" width={38} height={38} style={{ borderRadius: 9 }} />
            <span style={{ fontSize: 18, fontWeight: 850, letterSpacing: "-0.03em", color: "#0f172a" }}>
              CodeVault
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav" style={{ display: "flex", gap: 20, fontSize: 13, fontWeight: 500, color: "#475569" }}>
            {navLinks.map((item) => {
              const isActive = pathname === item.href || (activeSection && item.href.endsWith(`#${activeSection}`));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{
                    textDecoration: "none",
                    color: isActive ? V : "#475569",
                    fontWeight: isActive ? 700 : 500,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = isActive ? V : "#475569")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right CTA Action */}
          <div className="desktop-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/dashboard"
                  style={{
                    background: "linear-gradient(135deg, #635bff 0%, #4f46e5 100%)",
                    color: "#ffffff",
                    padding: "8px 18px",
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 2px 10px rgba(99, 91, 255, 0.25)",
                  }}
                >
                  Dashboard <ArrowRight size={14} />
                </Link>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/login"
                  style={{
                    background: "linear-gradient(135deg, #635bff 0%, #a855f7 100%)",
                    color: "#ffffff",
                    padding: "9px 20px",
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 2px 10px rgba(99, 91, 255, 0.25)",
                  }}
                >
                  Get Started <ArrowRight size={14} />
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Trigger Button */}
          <motion.button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(true)}
            whileTap={{ scale: 0.92 }}
            aria-label="Open mobile menu"
            style={{
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 10,
              background: VS,
              border: `1.5px solid ${VB}`,
              color: V,
              cursor: "pointer",
            }}
          >
            <Menu size={20} />
          </motion.button>
        </div>
      </header>

      {/* ── RIGHT SLIDE-OVER MOBILE DRAWER ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 998,
                background: "rgba(15, 23, 42, 0.5)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            />

            {/* Slide-over Sheet Panel from Right */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                zIndex: 999,
                width: "min(340px, 85vw)",
                background: "#ffffff",
                boxShadow: "-12px 0 40px rgba(15, 23, 42, 0.2)",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
              }}
            >
              {/* Top Drawer Header */}
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#fafbfe",
                }}
              >
                <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                  <Image src="/main-logo.png" alt="CodeVault" width={32} height={32} style={{ borderRadius: 8 }} />
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>CodeVault</span>
                </Link>

                <motion.button
                  onClick={() => setMobileMenuOpen(false)}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close menu"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "#f1f5f9",
                    border: "none",
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Navigation Links Body */}
              <div style={{ flex: 1, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 12px 8px" }}>
                  Navigation Menu
                </div>

                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        borderRadius: 12,
                        textDecoration: "none",
                        background: isActive ? VS : "transparent",
                        color: isActive ? V : "#334155",
                        fontSize: 14,
                        fontWeight: isActive ? 700 : 500,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          background: isActive ? V : `${item.color}14`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={16} style={{ color: isActive ? "#ffffff" : item.color }} />
                      </div>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      <ChevronRight size={14} style={{ color: isActive ? V : "#cbd5e1" }} />
                    </Link>
                  );
                })}
              </div>

              {/* Drawer Bottom Actions */}
              <div style={{ padding: "20px 20px 28px", borderTop: "1px solid #f1f5f9", background: "#fafbfe", display: "flex", flexDirection: "column", gap: 12 }}>
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      background: "linear-gradient(135deg, #635bff 0%, #4f46e5 100%)",
                      color: "#ffffff",
                      padding: "13px 20px",
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      textDecoration: "none",
                      boxShadow: "0 4px 14px rgba(99, 91, 255, 0.3)",
                      textAlign: "center",
                    }}
                  >
                    Go to Dashboard <ArrowRight size={16} />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        background: "linear-gradient(135deg, #635bff 0%, #a855f7 100%)",
                        color: "#ffffff",
                        padding: "13px 20px",
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: 700,
                        textDecoration: "none",
                        boxShadow: "0 4px 14px rgba(99, 91, 255, 0.3)",
                        textAlign: "center",
                      }}
                    >
                      Get Started Free <ArrowRight size={16} />
                    </Link>

                    <Link
                      href="/download"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        background: "#ffffff",
                        color: "#0f172a",
                        padding: "11px 20px",
                        borderRadius: 12,
                        border: "1.5px solid #e2e8f0",
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: "none",
                        textAlign: "center",
                      }}
                    >
                      <Download size={14} style={{ color: V }} /> Download Extension ZIP
                    </Link>
                  </>
                )}

                <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}>
                  <Shield size={12} style={{ color: "#059669" }} />
                  <span>100% Free &amp; Open Source</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media (max-width: 960px) {
          .desktop-nav {
            display: none !important;
          }
          .desktop-actions {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
