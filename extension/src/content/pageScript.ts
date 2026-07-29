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

function syncTestCasesToBridge() {
  try {
    let bridge = document.getElementById("codevault-testcases-bridge") as HTMLTextAreaElement;
    if (!bridge) {
      bridge = document.createElement("textarea");
      bridge.id = "codevault-testcases-bridge";
      bridge.style.display = "none";
      (document.body || document.documentElement).appendChild(bridge);
    }

    // Do NOT overwrite high quality test cases established by network intercept
    if (bridge.getAttribute("data-quality") === "high" && bridge.value.trim().length > 10) {
      return;
    }

    let testcasesStr = "";

    const candidateEls = Array.from(
      document.querySelectorAll(
        "[data-e2e-locator='console-submission-result'], div[class*='submission-result'], div[class*='result'], div[class*='Result'], [class*='console']"
      )
    );

    for (const el of candidateEls) {
      const reactKey = Object.keys(el).find(
        (k) => k.startsWith("__reactProps") || k.startsWith("__reactFiber")
      );
      if (reactKey) {
        const fiber = (el as any)[reactKey];

        const findDetails = (obj: any, depth = 0): any => {
          if (!obj || depth > 8) return null;
          if (
            (Array.isArray(obj.inputList) && obj.inputList.length > 0) ||
            (Array.isArray(obj.exampleTestcaseList) && obj.exampleTestcaseList.length > 0) ||
            (Array.isArray(obj.codeOutputList) && obj.codeOutputList.length > 0) ||
            (Array.isArray(obj.outputList) && obj.outputList.length > 0)
          ) {
            return obj;
          }
          if (typeof obj === "object") {
            for (const key of Object.keys(obj)) {
              if (
                key === "memoizedProps" ||
                key === "pendingProps" ||
                key === "children" ||
                key === "props" ||
                key === "stateNode" ||
                key === "data" ||
                key === "submissionDetails" ||
                key === "value"
              ) {
                const found = findDetails(obj[key], depth + 1);
                if (found) return found;
              }
            }
          }
          return null;
        };

        const details = findDetails(fiber);
        if (details) {
          const inputs: string[] = details.inputList || details.exampleTestcaseList || details.input_list || [];
          const outputs: string[] = details.outputList || details.codeOutputList || details.code_output || details.stdOutputList || [];
          const expected: string[] = details.expectedOutputList || details.expected_output || details.expectedOutput || [];

          if (inputs.length > 0) {
            testcasesStr = inputs
              .map((inp: string, i: number) => {
                let block = `Case ${i + 1}:\nStatus: Passed\nInput:\n${inp.trim()}`;
                if (outputs[i]) block += `\nOutput = ${outputs[i].trim()}`;
                if (expected[i]) block += `\nExpected = ${expected[i].trim()}`;
                return block;
              })
              .join("\n\n");
            if (outputs.length > 0 || expected.length > 0) {
              bridge.setAttribute("data-quality", "high");
              bridge.setAttribute("data-source", "fiber");
              break;
            }
          }
        }
      }
    }

    // DOM Fallback: Parse whole result container as a single unit (never split input & output into separate cases)
    if (!testcasesStr) {
      const consoleResultPanel = document.querySelector(
        "[data-e2e-locator='console-submission-result'], div[class*='submission-result'], div[class*='result'], div[class*='Result']"
      );
      if (consoleResultPanel) {
        const fullText = consoleResultPanel.textContent || "";
        if (fullText.includes("Input") || fullText.includes("Output") || fullText.includes("Expected")) {
          // Check if individual pre elements exist
          const preEls = Array.from(consoleResultPanel.querySelectorAll("pre")).map((p) => p.textContent?.trim()).filter(Boolean);
          let inputPart = "";
          let outputPart = "";
          let expectedPart = "";

          for (const txt of preEls) {
            if (!txt) continue;
            if (txt.includes("Input:") || (!inputPart && !txt.includes("Output") && !txt.includes("Expected"))) {
              inputPart = txt.replace(/^Input:\s*/i, "").trim();
            } else if (txt.includes("Output:")) {
              outputPart = txt.replace(/^Output:\s*/i, "").trim();
            } else if (txt.includes("Expected:")) {
              expectedPart = txt.replace(/^Expected:\s*/i, "").trim();
            }
          }

          if (inputPart || outputPart || expectedPart) {
            let block = `Case 1:\nStatus: Passed`;
            if (inputPart) block += `\nInput:\n${inputPart}`;
            if (outputPart) block += `\nOutput = ${outputPart}`;
            if (expectedPart) block += `\nExpected = ${expectedPart}`;
            testcasesStr = block;
          }
        }
      }
    }

    if (testcasesStr) {
      bridge.value = testcasesStr;
    }
  } catch (e) {}
}

function parseAndBridgeSubmissionDetails(data: any) {
  if (!data) return;
  try {
    let target = data;
    if (data?.data?.submissionDetails) target = data.data.submissionDetails;
    if (data?.data?.submissionResult) target = data.data.submissionResult;

    const codeOutputs: string[] = target.code_output || target.codeOutputList || target.outputList || target.code_output_list || [];
    const expectedOutputs: string[] = target.expected_output || target.expectedOutputList || target.expectedOutput || target.expected_output_list || [];
    const rawInputsStr: string = target.input_formatted || target.input || target.last_testcase || "";
    const inputList: string[] = target.inputList || target.input_list || (rawInputsStr ? rawInputsStr.split("\n").filter(Boolean) : []);

    if (inputList.length > 0 || codeOutputs.length > 0 || expectedOutputs.length > 0) {
      const maxLen = Math.max(inputList.length, codeOutputs.length, expectedOutputs.length);
      const blocks: string[] = [];

      for (let i = 0; i < maxLen; i++) {
        let block = `Case ${i + 1}:\nStatus: Passed`;
        if (inputList[i]) block += `\nInput:\n${inputList[i].trim()}`;
        if (codeOutputs[i]) block += `\nOutput = ${codeOutputs[i].trim()}`;
        if (expectedOutputs[i]) block += `\nExpected = ${expectedOutputs[i].trim()}`;
        blocks.push(block);
      }

      if (blocks.length > 0) {
        const formattedResult = blocks.join("\n\n");
        let bridge = document.getElementById("codevault-testcases-bridge") as HTMLTextAreaElement;
        if (!bridge) {
          bridge = document.createElement("textarea");
          bridge.id = "codevault-testcases-bridge";
          bridge.style.display = "none";
          (document.body || document.documentElement).appendChild(bridge);
        }
        bridge.value = formattedResult;
        bridge.setAttribute("data-quality", "high");
        bridge.setAttribute("data-source", "network");
      }
    }
  } catch (e) {}
}

(function interceptLeetCodeNetworkResponses() {
  try {
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const response = await originalFetch.apply(this, args);
      try {
        const url = typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url || "";
        if (url.includes("/check/") || url.includes("/graphql") || url.includes("submission")) {
          const clone = response.clone();
          clone.json().then((data) => {
            parseAndBridgeSubmissionDetails(data);
          }).catch(() => {});
        }
      } catch (e) {}
      return response;
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (...args: any[]) {
      (this as any)._url = args[1];
      return originalOpen.apply(this, args as any);
    };
    XMLHttpRequest.prototype.send = function (...args: any[]) {
      this.addEventListener("load", function () {
        try {
          const url = (this as any)._url || "";
          if (url.includes("/check/") || url.includes("/graphql") || url.includes("submission")) {
            const data = JSON.parse(this.responseText);
            parseAndBridgeSubmissionDetails(data);
          }
        } catch (e) {}
      });
      return originalSend.apply(this, args as any);
    };
  } catch (e) {}
})();

// Continuously update bridge & listen for event requests
setInterval(() => {
  syncMonacoCodeToBridge();
  syncTestCasesToBridge();
}, 500);
window.addEventListener("CODEVAULT_REQUEST_CODE", () => {
  syncMonacoCodeToBridge();
  syncTestCasesToBridge();
});
syncMonacoCodeToBridge();
syncTestCasesToBridge();
