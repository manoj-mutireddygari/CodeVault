import { acceptedSubmission, isRealSubmission } from "../parser/leetcodeParser";

const injectPageScript = () => {
  if (document.getElementById("codevault-page-script")) return;
  try {
    const script = document.createElement("script");
    script.id = "codevault-page-script";
    script.src = chrome.runtime.getURL("assets/pageScript.js");
    (document.head || document.documentElement).appendChild(script);
  } catch (e) { }
};
injectPageScript();

let lastFingerprint = "";
let lastSyncKey = "";
let lastSyncTime = 0;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let mutationObserver: MutationObserver | null = null;
let submitActive = false;
let submitTimestamp = 0;
let captureScheduled = false; // prevent duplicate delayed captures

const savePendingSubmission = (submission: any) => {
  try {
    localStorage.setItem("codevault_pending_submission", JSON.stringify(submission));
    showReloadToast();
  } catch (e) {}
};

const checkPendingSubmission = () => {
  try {
    const raw = localStorage.getItem("codevault_pending_submission");
    if (raw && chrome.runtime && chrome.runtime.id) {
      const submission = JSON.parse(raw);
      console.log("[CodeVault Extension] Syncing pending submission from localStorage:", submission.title);
      chrome.runtime.sendMessage({ type: "ACCEPTED_SUBMISSION", submission });
      localStorage.removeItem("codevault_pending_submission");
    }
  } catch (e) {}
};

const showReloadToast = () => {
  if (document.getElementById("codevault-reload-toast")) return;
  const toast = document.createElement("div");
  toast.id = "codevault-reload-toast";
  toast.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 999999;
    background: #0f172a;
    color: #ffffff;
    padding: 12px 18px;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid #334155;
  `;
  toast.innerHTML = `
    <span>⚡ CodeVault Extension updated — Please refresh (⌘R or F5) to sync submission.</span>
    <button onclick="location.reload()" style="background:#2563eb;color:#fff;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-weight:700;font-size:12px;">Refresh Now</button>
  `;
  (document.body || document.documentElement).appendChild(toast);
};

// Check for any pending submissions stored during previous extension reloads
checkPendingSubmission();

// Called 3 seconds after "Accepted" first appears
const sendSubmission = async (): Promise<void> => {
  const submission = await acceptedSubmission();
  if (!submission) {
    console.log("[CodeVault Extension] Stats still not ready after delay — submission may be missing runtime/memory.");
    return;
  }

  const key = `${submission.problemId}:${submission.language}`;
  const now = Date.now();
  const fingerprint = `${key}:${submission.sourceCode}`;

  if (fingerprint === lastFingerprint) return; // already sent

  if (key === lastSyncKey && now - lastSyncTime < 3000) {
    if (fingerprint.length <= lastFingerprint.length + 30) return; // de-dup
  }

  lastFingerprint = fingerprint;
  lastSyncKey = key;
  lastSyncTime = now;

  try {
    if (chrome.runtime && chrome.runtime.id) {
      console.log(
        `[CodeVault Extension] Sending submission #${submission.problemId} ${submission.title} (${submission.language}) — Runtime: ${submission.runtime ?? "N/A"}, Memory: ${submission.memory ?? "N/A"}`
      );
      chrome.runtime.sendMessage({ type: "ACCEPTED_SUBMISSION", submission });
    } else {
      console.warn("CodeVault Extension: context is invalidated. Saving to pending storage...");
      savePendingSubmission(submission);
    }
  } catch (e) {
    console.warn("CodeVault Extension: failed to send submission. Saving to pending storage...", e);
    savePendingSubmission(submission);
  }
};

let hasUserSubmitted = false;

// Step 1: Check if "Accepted" banner is visible (fast, no stat parsing)
// Step 2: If yes, schedule a 3s delayed capture to let runtime/memory render
const inspect = (): boolean => {
  if (!hasUserSubmitted) return false;
  if (!isRealSubmission()) return false;

  if (!captureScheduled) {
    captureScheduled = true;
    console.log("[CodeVault Extension] Accepted submission detected — waiting 3s for runtime/memory to render...");
    setTimeout(() => {
      submitActive = false;
      captureScheduled = false;
      sendSubmission();
      cleanup();
      hasUserSubmitted = false; // Reset flag after sending
    }, 3000);
  }
  return true;
};

const cleanup = () => {
  if (pollTimer) clearInterval(pollTimer);
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }
  pollTimer = null;
};

const startSubmitPolling = () => {
  submitActive = true;
  captureScheduled = false;
  submitTimestamp = Date.now();
  cleanup();

  mutationObserver = new MutationObserver(() => {
    if (inspect()) cleanup();
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });

  let attempts = 0;
  const maxAttempts = 120;
  pollTimer = setInterval(() => {
    attempts++;
    const found = inspect();
    if (found || !submitActive || attempts >= maxAttempts) cleanup();
  }, 250);
};

// Listen for clicks on Submit and Run buttons
document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement | null;
  if (!target) return;

  const button = target.closest("button, div[role='button'], a, [data-e2e-locator]");
  if (!button) return;

  const txt = (button.textContent || "").trim().toLowerCase();
  const ariaLabel = (button.getAttribute("aria-label") || "").toLowerCase();
  const cls = (button.className || "").toString().toLowerCase();
  const dataTest = (button.getAttribute("data-cy") || "").toLowerCase();
  const locator = (button.getAttribute("data-e2e-locator") || "").toLowerCase();
  const idStr = (button.id || "").toLowerCase();

  // If Run button is clicked, EXPLICITLY CANCEL any submission sync
  if (
    txt.startsWith("run") ||
    txt === "run code" ||
    ariaLabel.includes("run") ||
    locator.includes("run") ||
    cls.includes("run") ||
    idStr.includes("run")
  ) {
    console.log("[CodeVault Extension] Run button clicked — ignoring (submission sync disabled for Run).");
    hasUserSubmitted = false;
    submitActive = false;
    cleanup();
    return;
  }

  // If Submit button is clicked, ENABLE submission sync
  if (
    txt.includes("submit") ||
    ariaLabel.includes("submit") ||
    cls.includes("submit") ||
    dataTest.includes("submit") ||
    locator.includes("submit") ||
    idStr.includes("submit")
  ) {
    console.log("[CodeVault Extension] Submit button clicked — starting submission detection...");
    hasUserSubmitted = true;
    startSubmitPolling();
  }
}, true);

// Listen for keyboard shortcuts: Cmd/Ctrl+Enter = Submit, Cmd/Ctrl+' = Run
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    console.log("[CodeVault Extension] Submit shortcut detected (Cmd/Ctrl+Enter).");
    hasUserSubmitted = true;
    startSubmitPolling();
  } else if ((e.ctrlKey || e.metaKey) && (e.key === "'" || e.key === "`")) {
    console.log("[CodeVault Extension] Run shortcut detected — ignoring.");
    hasUserSubmitted = false;
    submitActive = false;
    cleanup();
  }
}, true);

// Cleanup on tab close
window.addEventListener("unload", () => {
  cleanup();
});
