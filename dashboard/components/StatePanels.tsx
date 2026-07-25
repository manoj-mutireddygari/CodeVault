import { Wifi, AlertTriangle, ShieldX, FolderOpen, Search } from "lucide-react";

export function LoadingGrid() {
  return (
    <div className="loading-grid">
      {Array.from({ length: 4 }, (_, i) => (
        <div className="skeleton card" key={i} style={{ borderRadius: 16, height: 160 }} />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  body?: string;
  illustration?: "github" | "empty-repo" | "no-problems" | "search-empty" | "offline" | "sync-failed";
  actionLabel?: string;
  onAction?: () => void;
}

const iconBox = (bg: string, color: string, children: React.ReactNode, extra?: React.CSSProperties): React.ReactNode => (
  <div style={{
    width: 64, height: 64, background: bg, color, borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "center",
    justifyContent: "center", marginBottom: 24, ...extra
  }}>
    {children}
  </div>
);

export function EmptyState({
  title,
  body,
  illustration = "no-problems",
  actionLabel,
  onAction
}: EmptyStateProps) {
  const renderIllustration = () => {
    switch (illustration) {
      case "github":
        return (
          <div style={{ position: "relative", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 64, height: 64, background: "#f8fafc", color: "#94a3b8", borderRadius: 16, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>◆</div>
            <div style={{ position: "absolute", bottom: -4, right: -4, background: "#fee2e2", border: "2px solid white", color: "#ef4444", borderRadius: "50%", padding: 4, display: "flex" }}>
              <ShieldX size={13} />
            </div>
          </div>
        );
      case "empty-repo":
        return (
          <div style={{ position: "relative", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {iconBox("#f0f0ff", "#635bff", <FolderOpen size={28} />, { marginBottom: 0 })}
            <div style={{ position: "absolute", bottom: -4, right: -4, background: "#e0e7ff", border: "2px solid white", color: "#635bff", borderRadius: 20, padding: "2px 6px", fontSize: 9, fontWeight: 800 }}>GIT</div>
          </div>
        );
      case "search-empty":
        return iconBox("#f8fafc", "#94a3b8", <Search size={28} />);
      case "offline":
        return iconBox("#f8fafc", "#94a3b8", <Wifi size={28} style={{ opacity: 0.6 }} />);
      case "sync-failed":
        return iconBox("#fffbeb", "#d97706", <AlertTriangle size={28} />);
      default:
        return iconBox("#f8fafc", "#94a3b8", <FolderOpen size={28} />);
    }
  };

  return (
    <section style={{
      border: "1px solid var(--line)", borderRadius: 20, padding: "48px 40px",
      background: "var(--card-bg)", display: "flex", flexDirection: "column",
      alignItems: "center", textAlign: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
    }}>
      {renderIllustration()}
      <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", margin: "0 0 8px" }}>
        {title || "Your vault is ready"}
      </h2>
      <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 340, lineHeight: 1.7, margin: "0 0 24px" }}>
        {body || "Connect your CodeVault extension, then open the dashboard from its popup to view your GitHub-backed solutions."}
      </p>
      {actionLabel && onAction && (
        <button className="primary" onClick={onAction}
          style={{ padding: "10px 22px", borderRadius: 12, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          {actionLabel}
        </button>
      )}
    </section>
  );
}

export function ErrorState({ error, retry }: { error?: Error; retry?: () => void }) {
  const errMsg = error?.message;

  if (errMsg === "unavailable") {
    return (
      <EmptyState
        illustration="github"
        title="GitHub not connected"
        body="Set up your GitHub credentials in Settings to start pushing solutions to your repository."
        actionLabel="Open Settings"
        onAction={() => (window.location.href = "/settings")}
      />
    );
  }

  if (errMsg === "offline") {
    return (
      <EmptyState
        illustration="offline"
        title="You're offline"
        body="CodeVault is unable to reach GitHub right now. Solutions will sync automatically when your connection is restored."
      />
    );
  }

  return (
    <EmptyState
      illustration="sync-failed"
      title="Sync issue detected"
      body={errMsg || "An unexpected error occurred while loading your vault data."}
      actionLabel={retry ? "Retry" : undefined}
      onAction={retry}
    />
  );
}
