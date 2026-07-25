import { acceptedSubmission, isRealSubmission } from "../parser/leetcodeParser";

const injectPageScript = () => {
  if (document.getElementById("codevault-page-script")) return;
  try {
    const script = document.createElement("script");
    script.id = "codevault-page-script";
    script.src = chrome.runtime.getURL("assets/pageScript.js");
    (document.head || document.documentElement).appendChild(script);
  } catch (e) {}
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

// Called 2 seconds after "Accepted" first appears — by then stats should be rendered
const sendSubmission = (): void => {
  const submission = acceptedSubmission();
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
      console.warn("CodeVault Extension: context is invalidated. Please reload LeetCode page.");
    }
  } catch (e) {
    console.warn("CodeVault Extension: failed to send submission. Context invalidated. Please reload page.", e);
  }
};

// Step 1: Check if "Accepted" banner is visible (fast, no stat parsing)
// Step 2: If yes, schedule a 2s delayed capture to let runtime/memory render
const inspect = (): boolean => {
  if (!submitActive || Date.now() - submitTimestamp > 35000) return false;
  if (!isRealSubmission()) return false;

  if (!captureScheduled) {
    captureScheduled = true;
    console.log("[CodeVault Extension] Accepted detected — waiting 5s for runtime/memory to render...");
    setTimeout(() => {
      submitActive = false;
      captureScheduled = false;
      sendSubmission();
      cleanup();
    }, 5000);
  }
  return true; // accepted found — stop polling & observer
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

  // MutationObserver: fires instantly when DOM changes (e.g., Accepted banner appears)
  mutationObserver = new MutationObserver(() => {
    if (inspect()) cleanup(); // stop observing once Accepted is found
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });

  // Fallback poll every 250ms for up to 30 seconds
  let attempts = 0;
  const maxAttempts = 120;
  pollTimer = setInterval(() => {
    attempts++;
    const found = inspect();
    if (found || !submitActive || attempts >= maxAttempts) cleanup();
  }, 250);
};

// Listen for Submit button clicks
document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement | null;
  if (!target) return;

  const button = target.closest("button, div[role='button'], a");
  if (!button) return;

  const txt = (button.textContent || "").trim().toLowerCase();
  const ariaLabel = (button.getAttribute("aria-label") || "").toLowerCase();
  const cls = (button.className || "").toString().toLowerCase();
  const dataTest = (button.getAttribute("data-cy") || "").toLowerCase();

  // Exclude Run button
  if (txt.startsWith("run") || ariaLabel.includes("run")) return;

  // Include Submit button
  if (
    txt.includes("submit") ||
    ariaLabel.includes("submit") ||
    cls.includes("submit") ||
    dataTest.includes("submit")
  ) {
    console.log("[CodeVault Extension] Submit clicked — starting detection...");
    startSubmitPolling();
  }
}, true);

// Listen for Cmd/Ctrl+Enter keyboard shortcut
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    console.log("[CodeVault Extension] Submit shortcut detected (Cmd/Ctrl+Enter).");
    startSubmitPolling();
  }
}, true);

// Cleanup on tab close
window.addEventListener("unload", () => {
  cleanup();
});
