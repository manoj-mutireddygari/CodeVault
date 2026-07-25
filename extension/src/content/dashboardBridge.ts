// CodeVault Dashboard Bridge Content Script
window.addEventListener("message", (event) => {
  // Only accept messages from the same window
  if (event.source !== window) return;

  const message = event.data;
  if (!message || message.source !== "codevault-dashboard") return;

  const { id, type, payload } = message;

  // Relay message to Chrome Extension background service worker
  try {
    if (!chrome.runtime || !chrome.runtime.id) {
      window.postMessage({
        source: "codevault-extension",
        id,
        error: "Extension context was invalidated. Please reload the page."
      }, "*");
      return;
    }

    chrome.runtime.sendMessage({ type, payload }, (response) => {
      // Handle cases where background script doesn't respond or throws error
      const error = chrome.runtime.lastError;
      if (error) {
        window.postMessage({
          source: "codevault-extension",
          id,
          error: error.message
        }, "*");
      } else {
        window.postMessage({
          source: "codevault-extension",
          id,
          payload: response
        }, "*");
      }
    });
  } catch (err) {
    window.postMessage({
      source: "codevault-extension",
      id,
      error: "Extension context was invalidated. Please reload the page."
    }, "*");
  }
});

// Let the dashboard know the extension is injected and ready
window.postMessage({ source: "codevault-extension-ready" }, "*");
