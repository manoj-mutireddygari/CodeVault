// Runs in MAIN world (page context) to access window.monaco model directly
function syncMonacoCodeToBridge() {
  try {
    let fullCode = "";

    // 1. Primary: Try window.monaco editor model instance
    const monaco = (window as any).monaco;
    if (monaco?.editor?.getModels) {
      const models = monaco.editor.getModels();
      if (models && models.length > 0) {
        for (const model of models) {
          const val = model.getValue();
          if (val && val.trim().length >= 5) {
            fullCode = val;
            break;
          }
        }
      }
    }

    // 2. Secondary: Try React fiber on .monaco-editor container
    if (!fullCode) {
      const monacoEl = document.querySelector(".monaco-editor");
      if (monacoEl) {
        const reactKey = Object.keys(monacoEl).find(
          (k) => k.startsWith("__reactProps") || k.startsWith("__reactFiber")
        );
        if (reactKey) {
          const props = (monacoEl as any)[reactKey];
          if (props?.value && typeof props.value === "string") {
            fullCode = props.value;
          }
        }
      }
    }

    if (fullCode) {
      let bridge = document.getElementById("codevault-full-code-bridge") as HTMLTextAreaElement;
      if (!bridge) {
        bridge = document.createElement("textarea");
        bridge.id = "codevault-full-code-bridge";
        bridge.style.display = "none";
        (document.body || document.documentElement).appendChild(bridge);
      }
      bridge.value = fullCode;
    }
  } catch (e) {
    // Ignore error
  }
}

// Continuously update bridge & listen for event requests
setInterval(syncMonacoCodeToBridge, 500);
window.addEventListener("CODEVAULT_REQUEST_CODE", syncMonacoCodeToBridge);
syncMonacoCodeToBridge();
