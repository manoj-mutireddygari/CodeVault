"use client";

export default function FAQPage() {
  const faqs = [
    {
      q: "Where is my source code stored?",
      a: "Your solution code and problem metadata are committed directly to your personal GitHub repository. CodeVault never stores problem code on third-party servers.",
    },
    {
      q: "Do I need to enter GitHub tokens inside the extension?",
      a: "No! Under Phase 4 SaaS architecture, extension authentication is handled automatically via Supabase session and OAuth on the web platform.",
    },
    {
      q: "Is CodeVault free to use?",
      a: "Yes, CodeVault Developer Tier is 100% free forever for personal GitHub repository synchronization.",
    },
    {
      q: "What happens if I lose internet connection while solving?",
      a: "The Chrome extension enqueues accepted solutions locally and drains the sync queue automatically as soon as connection is re-established.",
    },
  ];

  return (
    <main className="page" style={{ maxWidth: 800 }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <p className="eyebrow">HELP CENTER</p>
        <h1 style={{ fontSize: 38, fontWeight: 850, letterSpacing: "-0.04em", margin: "8px 0 12px" }}>
          Frequently Asked Questions
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
          Everything you need to know about CodeVault SaaS platform.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {faqs.map(({ q, a }) => (
          <div key={q} className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 8px" }}>{q}</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{a}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
