"use client";

export default function ContactPage() {
  return (
    <main className="page" style={{ maxWidth: 600 }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h1 style={{ fontSize: 36, fontWeight: 850, letterSpacing: "-0.04em" }}>Contact Support</h1>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>Have questions or feature suggestions? Get in touch with our team.</p>
      </div>

      <div className="glass-card" style={{ padding: 32 }}>
        <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Your Name</label>
            <input required placeholder="Manoj Mutireddygari" style={{ width: "100%", padding: "10px 14px", background: "var(--violet-soft)", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Email Address</label>
            <input required type="email" placeholder="you@developer.dev" style={{ width: "100%", padding: "10px 14px", background: "var(--violet-soft)", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Message</label>
            <textarea required rows={4} placeholder="Describe your question or feedback…" style={{ width: "100%", padding: "10px 14px", background: "var(--violet-soft)", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <button type="submit" className="primary" style={{ justifyContent: "center", padding: "12px", borderRadius: 12 }}>
            Send Message
          </button>
        </form>
      </div>
    </main>
  );
}
