import type { Submission } from "@codevault/shared";

const text = (selector: string) => document.querySelector(selector)?.textContent?.trim();
const slug = () => location.pathname.match(/\/problems\/([^/]+)/)?.[1] ?? "";

const slugToTitle = (s: string): string => {
  if (!s) return "";
  return s
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getProblemId = (): number => {
  // 1. Try explicit problem title header elements in live DOM (updates on SPA page navigation)
  const titleSelectors = [
    "[data-cy='question-title']",
    "div.text-title-large",
    "a.text-title-large",
    "span.text-title-large",
    "[class*='text-title-large']",
    "div[class*='title__']",
    "a[class*='title__']",
    "div[data-track-load='description_content'] a",
    "div[data-track-load='description_content'] h4",
    "h1",
    "h2",
    "h3"
  ];

  for (const selector of titleSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      const selfText = el.textContent?.trim() || "";
      const parentText = el.parentElement?.textContent?.trim() || "";

      const matchSelf = selfText.match(/^\s*(\d+)\.\s*/);
      if (matchSelf) return Number(matchSelf[1]);

      const matchParent = parentText.match(/^\s*(\d+)\.\s*/);
      if (matchParent) return Number(matchParent[1]);
    }
  }

  // 2. Try document title (updates on SPA navigation, e.g. "3. Longest Substring Without Repeating Characters - LeetCode")
  const docTitle = document.title;
  if (docTitle) {
    const match = docTitle.trim().match(/^\s*(\d+)\.\s*/);
    if (match) return Number(match[1]);
  }

  // 3. Try LeetCode Next.js page JSON payload (only if payload matches the current page URL slug)
  try {
    const nextDataEl = document.getElementById("__NEXT_DATA__");
    if (nextDataEl?.textContent) {
      const raw = nextDataEl.textContent;
      const currentSlug = slug();
      if (!currentSlug || raw.includes(`"${currentSlug}"`) || raw.includes(`:${currentSlug}`)) {
        const match =
          raw.match(/"questionFrontendId"\s*:\s*"(\d+)"/) ||
          raw.match(/"questionFrontendId"\s*:\s*(\d+)/) ||
          raw.match(/"questionId"\s*:\s*"(\d+)"/) ||
          raw.match(/"questionId"\s*:\s*(\d+)/);
        if (match && match[1]) {
          const id = Number(match[1]);
          if (id > 0) return id;
        }
      }
    }
  } catch (e) {
    // Fall back to 0
  }

  return 0;
};

const getProblemTitle = (): string => {
  const currentSlug = slug();

  // 1. Try title header elements in live DOM (updates on SPA page navigation)
  const titleSelectors = [
    "[data-cy='question-title']",
    "div.text-title-large",
    "a.text-title-large",
    "span.text-title-large",
    "[class*='text-title-large']",
    "div[class*='title__']",
    "a[class*='title__']",
    "div[data-track-load='description_content'] a",
    "div[data-track-load='description_content'] h4",
    "h1",
    "h2"
  ];

  for (const selector of titleSelectors) {
    const el = document.querySelector(selector);
    if (el?.textContent) {
      const cleaned = el.textContent.trim().replace(/^\s*\d+\.\s*/, "").trim();
      if (cleaned.length > 0 && !cleaned.includes("LeetCode") && cleaned.length < 150) {
        return cleaned;
      }
    }
  }

  // 2. Try document title (updates on SPA navigation, e.g. "6. Zigzag Conversion - LeetCode")
  const docTitle = document.title;
  if (docTitle && docTitle.includes("- LeetCode")) {
    const cleaned = docTitle.trim().replace(/^\s*\d+\.\s*/, "").split(" - ")[0].trim();
    if (cleaned.length > 0 && cleaned !== "LeetCode") return cleaned;
  }

  // 3. Try LeetCode Next.js page JSON payload (ONLY if matched to current slug)
  try {
    const nextDataEl = document.getElementById("__NEXT_DATA__");
    if (nextDataEl?.textContent) {
      const raw = nextDataEl.textContent;
      if (currentSlug && raw.includes(`"${currentSlug}"`)) {
        const slugIdx = raw.indexOf(`"${currentSlug}"`);
        const snippet = raw.substring(Math.max(0, slugIdx - 600), Math.min(raw.length, slugIdx + 600));
        const match = snippet.match(/"title"\s*:\s*"([^"]+)"/);
        if (match && match[1] && !match[1].includes("LeetCode")) {
          return match[1].trim();
        }
      }
    }
  } catch (e) {
    // Fall back to slug title conversion
  }

  // 4. Fallback to slug title conversion (e.g. "zigzag-conversion" -> "Zigzag Conversion")
  return slugToTitle(currentSlug);
};

const code = (): string => {
  // Trigger immediate refresh request to MAIN world bridge
  try {
    window.dispatchEvent(new CustomEvent("CODEVAULT_REQUEST_CODE"));
  } catch (e) {}

  // 1. Read from DOM bridge created by pageScript (MAIN world context)
  const bridge = document.getElementById("codevault-full-code-bridge") as HTMLTextAreaElement;
  if (bridge && bridge.value && bridge.value.trim().length >= 5) {
    return bridge.value.replace(/\r\n/g, "\n").trim();
  }

  // 2. Try Monaco window instance model text if exposed in current window context
  try {
    const models = (window as any).monaco?.editor?.getModels();
    if (models && models.length > 0) {
      for (const m of models) {
        const codeVal = m.getValue();
        if (codeVal && codeVal.trim().length >= 5) {
          return codeVal.replace(/\r\n/g, "\n").trim();
        }
      }
    }
  } catch (e) {
    // Fall back to DOM view-line extraction
  }

  // 3. Iterate Monaco view-line elements sorted strictly by vertical top position
  const viewLineEls = Array.from(document.querySelectorAll(".view-lines .view-line"));
  if (viewLineEls.length > 0) {
    viewLineEls.sort((a, b) => {
      const elA = a as HTMLElement;
      const elB = b as HTMLElement;

      const topA = elA.offsetTop || (parseFloat(elA.style.top) || 0) || elA.getBoundingClientRect().top;
      const topB = elB.offsetTop || (parseFloat(elB.style.top) || 0) || elB.getBoundingClientRect().top;

      return topA - topB;
    });

    const lines = viewLineEls.map(el => el.textContent || "");
    const fullCode = lines.join("\n").replace(/\r\n/g, "\n").trim();
    if (fullCode.length >= 5) return fullCode;
  }

  // 4. Check monaco view lines container
  const monacoContainer = document.querySelector(".monaco-editor .view-lines");
  if (monacoContainer?.textContent) {
    const fullCode = monacoContainer.textContent.replace(/\r\n/g, "\n").trim();
    if (fullCode.length >= 5) return fullCode;
  }

  // 5. Check fallback textareas
  const textarea = document.querySelector(".monaco-editor textarea, textarea.inputarea, textarea");
  if (textarea && (textarea as HTMLTextAreaElement).value) {
    const fullCode = (textarea as HTMLTextAreaElement).value.replace(/\r\n/g, "\n").trim();
    if (fullCode.length >= 5) return fullCode;
  }

  return "";
};

const getLanguage = (): string => {
  // 1. Try Monaco Editor data-mode-id attribute (e.g. data-mode-id="python", "cpp", "java", "javascript")
  const monacoMode = document.querySelector("[data-mode-id]")?.getAttribute("data-mode-id");
  if (monacoMode && monacoMode !== "plaintext" && monacoMode !== "text") {
    return monacoMode;
  }

  // 2. Try LeetCode language selector dropdown buttons
  const langSelectors = [
    "button[id*='lang']",
    "button[id*='language']",
    "[data-cy='lang-select']",
    "div[class*='language-select'] button",
    "button[class*='lang']",
    "button[id='lang-select']"
  ];
  for (const sel of langSelectors) {
    const el = document.querySelector(sel);
    if (el?.textContent) {
      const text = el.textContent.trim();
      if (text && text.length < 25) return text;
    }
  }

  // 3. Try searching all buttons in the editor header for known language names
  const knownLangs = [
    "python3", "python", "c++", "cpp", "java", "javascript", "typescript",
    "c#", "c", "golang", "go", "kotlin", "swift", "rust", "ruby", "php",
    "scala", "racket", "erlang", "elixir", "dart", "pandas", "sql", "mysql", "postgresql"
  ];
  const buttons = Array.from(document.querySelectorAll("button"));
  for (const btn of buttons) {
    const btnText = btn.textContent?.trim().toLowerCase() || "";
    if (knownLangs.includes(btnText)) {
      return btn.textContent!.trim();
    }
  }

  // 4. Try localStorage "global_lang" (LeetCode stores active language e.g. "python3", "cpp")
  try {
    const storedLang = localStorage.getItem("global_lang");
    if (storedLang) return storedLang.replace(/"/g, "").trim();
  } catch {}

  // 5. Code syntax heuristics fallback
  const source = code();
  if (source.includes("def ") || source.includes("class Solution:") || source.includes("self.")) return "python3";
  if (source.includes("#include") || source.includes("std::")) return "cpp";
  if (source.includes("public class Solution") || source.includes("System.out")) return "java";
  if (source.includes("function ") || source.includes("const ") || source.includes("let ")) return "javascript";
  if (source.includes("package main") || source.includes("func ")) return "go";
  if (source.includes("impl Solution") || source.includes("pub fn")) return "rust";

  return "python3";
};

const difficulty = (): Submission["difficulty"] => {
  // 1. Try __NEXT_DATA__ payload
  try {
    const nextDataEl = document.getElementById("__NEXT_DATA__");
    if (nextDataEl?.textContent) {
      const raw = nextDataEl.textContent;
      const currentSlug = slug();
      if (!currentSlug || raw.includes(`"${currentSlug}"`) || raw.includes(`:${currentSlug}`)) {
        const match = raw.match(/"difficulty"\s*:\s*"(Easy|Medium|Hard)"/i);
        if (match && match[1]) {
          const cap = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
          if (cap === "Easy" || cap === "Medium" || cap === "Hard") {
            return cap as Submission["difficulty"];
          }
        }
      }
    }
  } catch (e) {}

  // 2. Try [data-degree] DOM attribute
  const dataDegreeEl = document.querySelector("[data-degree]");
  if (dataDegreeEl) {
    const deg = dataDegreeEl.getAttribute("data-degree")?.toLowerCase();
    if (deg === "easy") return "Easy";
    if (deg === "medium") return "Medium";
    if (deg === "hard") return "Hard";
  }

  // 3. Try LeetCode specific difficulty badge selectors
  const badgeSelectors = [
    "[class*='text-difficulty-']",
    "[class*='text-sd-easy']",
    "[class*='text-sd-medium']",
    "[class*='text-sd-hard']",
    "[class*='text-easy']",
    "[class*='text-medium']",
    "[class*='text-hard']",
    "div[class*='difficulty']",
    "span[class*='difficulty']"
  ];
  for (const selector of badgeSelectors) {
    const el = document.querySelector(selector);
    if (el?.textContent) {
      const txt = el.textContent.trim().toLowerCase();
      if (txt === "easy") return "Easy";
      if (txt === "medium") return "Medium";
      if (txt === "hard") return "Hard";
    }
  }

  // 4. Try leaf DOM elements (nodes without child elements) matching exact difficulty
  const elements = Array.from(document.querySelectorAll("span, div, p, a"));
  for (const el of elements) {
    if (el.children.length === 0) {
      const text = el.textContent?.trim();
      if (text === "Easy" || text === "Medium" || text === "Hard") {
        return text as Submission["difficulty"];
      }
    }
  }

  // 5. Fallback regex on document body inner text
  const bodyText = document.body.innerText || "";
  const match = bodyText.match(/\b(Easy|Medium|Hard)\b/i);
  if (match) {
    const cap = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    if (cap === "Easy" || cap === "Medium" || cap === "Hard") {
      return cap as Submission["difficulty"];
    }
  }

  return "Unknown";
};

export function isRealSubmission(): boolean {
  // 1. Check explicit submission result elements (LeetCode Modern UI)
  const subResultSelectors = [
    "[data-e2e-locator='submission-result']",
    "[data-e2e-locator='submission-result-status']",
    "[data-e2e-locator='console-submission-result']",
    "div[class*='submission-result']",
    "div[class*='submissionResult']",
    "div[data-cy='submission-result']",
    "div[class*='result-container']",
    "div[class*='ResultContainer']",
    "div[class*='statusContainer']",
    "div[class*='status-container']",
    "div[class*='result-state']"
  ];

  for (const sel of subResultSelectors) {
    const el = document.querySelector(sel);
    if (el?.textContent?.includes("Accepted")) {
      return true;
    }
  }

  // 2. Check leaf elements inside any submission result container
  for (const sel of subResultSelectors) {
    const subResult = document.querySelector(sel);
    if (subResult) {
      const statusEls = Array.from(subResult.querySelectorAll("span, div, a, h3, h4"));
      for (const el of statusEls) {
        if (el.children.length === 0 && el.textContent?.trim() === "Accepted") {
          return true;
        }
      }
    }
  }

  // 3. Submission detail page URL
  if (location.pathname.includes("/submissions/detail/") || location.pathname.includes("/submissions/")) {
    if (document.body.innerText.includes("Accepted")) return true;
  }

  // 4. Standalone leaf match: find any element that ONLY contains "Accepted"
  if (location.pathname.match(/\/problems\/[^/]+\//) && !location.pathname.includes("/submissions/list")) {
    const allEls = Array.from(document.querySelectorAll("span, div, h3, h4, p, a"));
    for (const el of allEls) {
      if (el.children.length === 0 && el.textContent?.trim() === "Accepted") {
        const parent = el.parentElement;
        const text = parent?.textContent || document.body.innerText || "";
        // Valid submission result if it has Runtime/Memory/Beats indicators or is in a submission container
        if (
          text.includes("Runtime") ||
          text.includes("Memory") ||
          text.includes("Beats") ||
          text.includes("Submitted") ||
          el.closest("[class*='submission'], [class*='result'], [data-e2e-locator*='submission']")
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Finds a stat value (e.g. "0 ms", "44.5 MB") from LeetCode result panel
 * by locating the exact label element ("Runtime" or "Memory") and checking
 * ONLY its immediate siblings/parent children — never the broader page.
 */
const getStatNearLabel = (label: string, valuePattern: RegExp): string | undefined => {
  const allEls = Array.from(document.querySelectorAll("span, div, p"));

  for (const el of allEls) {
    // Must be a leaf node that exactly matches the label text
    if (el.children.length !== 0 || el.textContent?.trim() !== label) continue;

    const parent = el.parentElement;
    if (!parent) continue;

    // Pass 1: Check direct children of the parent (siblings in the same container)
    // Use children[] to avoid going deep into nested subtrees
    for (const sib of Array.from(parent.children)) {
      if (sib === el) continue;
      // Walk leaf nodes inside this sibling
      const leaves = sib.children.length === 0
        ? [sib]
        : Array.from(sib.querySelectorAll("span, div")).filter(n => n.children.length === 0);
      for (const leaf of leaves) {
        const txt = leaf.textContent?.trim() || "";
        // Guard: value must contain a digit, must NOT equal the label itself
        if (!txt || txt === label || !/\d/.test(txt)) continue;
        const m = txt.match(valuePattern);
        if (m) return (m[1] ?? m[0]).trim();
      }
    }

    // Pass 2: Check adjacent siblings (for flat DOM: label and value are next to each other)
    for (const sibling of [el.nextElementSibling, el.previousElementSibling]) {
      if (!sibling) continue;
      const txt = sibling.textContent?.trim() || "";
      if (!txt || txt === label || !/\d/.test(txt)) continue;
      const m = txt.match(valuePattern);
      if (m) return (m[1] ?? m[0]).trim();
    }
  }

  return undefined;
};

const getRuntime = (): string | undefined => {
  // 1. Try explicit data-e2e-locator attributes (LeetCode old UI)
  const explicitSelectors = [
    "[data-e2e-locator='submission-result-runtime']",
    "[data-e2e-locator='runtime']",
    "div[class*='runtime']",
    "span[class*='runtime']",
  ];
  for (const sel of explicitSelectors) {
    const el = document.querySelector(sel);
    if (el?.textContent) {
      const match = el.textContent.match(/(\d[\d.]*\s*ms)/i);
      if (match) return match[1].trim();
    }
  }

  // 2. Find "Runtime" label and read adjacent value (LeetCode new UI)
  const byLabel = getStatNearLabel("Runtime", /^(\d[\d.]*\s*ms)$/i);
  if (byLabel) return byLabel.trim();

  // 3. Body text regex — handle newline between label and value
  const bodyText = document.body.innerText || "";
  const rtMatch =
    bodyText.match(/Runtime[:\s]*([\s\S]*?)(\d[\d.]*\s*ms)/i) ||
    bodyText.match(/(\d[\d.]*\s*ms)\s*Beats/i);
  if (rtMatch) {
    const val = rtMatch[2] ?? rtMatch[1];
    if (val) return val.trim();
  }

  // 4. Try __NEXT_DATA__ JSON payload
  try {
    const nextDataEl = document.getElementById("__NEXT_DATA__");
    if (nextDataEl?.textContent) {
      const matchJson =
        nextDataEl.textContent.match(/"status_runtime"\s*:\s*"([^"]+)"/i) ||
        nextDataEl.textContent.match(/"runtime"\s*:\s*"([^"]+)"/i);
      if (matchJson && matchJson[1]) return matchJson[1];
    }
  } catch (e) {}

  return undefined;
};

const getMemory = (): string | undefined => {
  // 1. Try explicit data-e2e-locator attributes (LeetCode old UI)
  const explicitSelectors = [
    "[data-e2e-locator='submission-result-memory']",
    "[data-e2e-locator='memory']",
    "div[class*='memory']",
    "span[class*='memory']",
  ];
  for (const sel of explicitSelectors) {
    const el = document.querySelector(sel);
    if (el?.textContent) {
      const match = el.textContent.match(/(\d[\d.]*\s*(?:MB|KB|GB))/i);
      if (match) return match[1].trim();
    }
  }

  // 2. Find "Memory" label and read adjacent value (LeetCode new UI)
  // This avoids accidentally returning the label text itself
  const byLabel = getStatNearLabel("Memory", /^(\d[\d.]*\s*(?:MB|KB|GB))$/i);
  if (byLabel) return byLabel.trim();

  // 3. Body text regex — handle any whitespace/newlines between label and value
  const bodyText = document.body.innerText || "";
  const memMatch =
    bodyText.match(/Memory[:\s]*?([\s\S]*?)(\d[\d.]*\s*(?:MB|KB|GB))/i) ||
    bodyText.match(/(\d[\d.]*\s*(?:MB|KB|GB))\s*Beats/i);
  if (memMatch) {
    const val = memMatch[2] ?? memMatch[1];
    // Guard: must have a digit — never return the bare label text
    if (val && /\d/.test(val)) return val.trim();
  }

  // 4. Broader body scan: find any MB/KB value in the 800 chars after "Accepted"
  const acceptedIdx = bodyText.indexOf("Accepted");
  if (acceptedIdx !== -1) {
    const nearText = bodyText.slice(acceptedIdx, acceptedIdx + 800);
    // Skip any line that is purely a label (no digits)
    const lines = nearText.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      const m = trimmed.match(/^(\d[\d.]*\s*(?:MB|KB|GB))$/i);
      if (m) return m[1].trim();
    }
    // Loose match if line-by-line fails
    const nearMatch = nearText.match(/(\d[\d.]*\s*(?:MB|KB|GB))/i);
    if (nearMatch && /\d/.test(nearMatch[1])) return nearMatch[1].trim();
  }

  // 5. Try __NEXT_DATA__ JSON payload
  try {
    const nextDataEl = document.getElementById("__NEXT_DATA__");
    if (nextDataEl?.textContent) {
      const matchJson =
        nextDataEl.textContent.match(/"status_memory"\s*:\s*"([^"]+)"/i) ||
        nextDataEl.textContent.match(/"memory"\s*:\s*"([^"]+)"/i);
      if (matchJson && matchJson[1]) return matchJson[1];
    }
  } catch (e) {}

  return undefined;
};

const getTopics = (): string[] => {
  const topicsSet = new Set<string>();

  // 1. Try __NEXT_DATA__ payload for topicTags
  try {
    const nextDataEl = document.getElementById("__NEXT_DATA__");
    if (nextDataEl?.textContent) {
      const raw = nextDataEl.textContent;
      const topicMatches = raw.matchAll(/"topicTags"\s*:\s*\[(.*?)\]/g);
      for (const m of topicMatches) {
        const names = m[1].matchAll(/"name"\s*:\s*"([^"]+)"/g);
        for (const n of names) {
          if (n[1]) topicsSet.add(n[1].trim());
        }
      }
    }
  } catch (e) {}

  // 2. Try DOM elements for topic tags
  const selectors = [
    "a[href*='/tag/']",
    "a[href*='/topic/']",
    "a[href*='/problems/tag/']",
    "div[class*='topic'] a",
    "a[class*='topic-tag']",
    "span[class*='topic-tag']",
    "[data-topic]"
  ];
  for (const sel of selectors) {
    const nodes = document.querySelectorAll(sel);
    nodes.forEach(node => {
      const txt = node.textContent?.trim();
      if (txt && txt.length > 0 && txt.length < 50 && !txt.includes("LeetCode")) {
        topicsSet.add(txt);
      }
    });
  }

  return Array.from(topicsSet);
};

const fetchLeetCodeGraphQLDetails = async (problemSlug: string) => {
  if (!problemSlug) return null;
  try {
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1] || "";
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (csrfToken) {
      headers["x-csrftoken"] = csrfToken;
    }

    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        query: `
          query questionData($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              questionFrontendId
              title
              titleSlug
              difficulty
              metaData
              content
              exampleTestcaseList
              exampleTestcases
              sampleTestCase
              topicTags {
                name
              }
            }
          }
        `,
        variables: { titleSlug: problemSlug }
      })
    });

    if (response.ok) {
      const resData = await response.json();
      if (resData?.data?.question) {
        return resData.data.question;
      }
    }
  } catch (e) {}

  try {
    const response = await fetch("/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query questionData($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              questionFrontendId
              title
              titleSlug
              difficulty
              metaData
              content
              exampleTestcaseList
              exampleTestcases
              sampleTestCase
              topicTags {
                name
              }
            }
          }
        `,
        variables: { titleSlug: problemSlug }
      })
    });
    if (response.ok) {
      const resData = await response.json();
      return resData?.data?.question ?? null;
    }
  } catch (e) {}

  return null;
};

const cleanHtmlEntities = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
};

const extractOutputsFromContent = (contentHtml: string): string[] => {
  if (!contentHtml) return [];
  const outputs: string[] = [];

  const preMatches = contentHtml.matchAll(/<pre>[\s\S]*?<\/pre>/gi);
  for (const m of preMatches) {
    const block = m[0].replace(/<[^>]+>/g, "");
    const outMatch = block.match(/Output:\s*([^\n]+)/i);
    if (outMatch && outMatch[1]) {
      outputs.push(cleanHtmlEntities(outMatch[1].trim()));
    }
  }

  if (outputs.length === 0) {
    const plainText = contentHtml.replace(/<[^>]+>/g, "");
    const looseMatches = plainText.matchAll(/Output:\s*([^\n]+)/gi);
    for (const lm of looseMatches) {
      if (lm[1]) outputs.push(cleanHtmlEntities(lm[1].trim()));
    }
  }

  return outputs;
};

const formatTestCasesFromGraphQL = (q: any): string | undefined => {
  if (!q) return undefined;

  let paramNames: string[] = [];
  if (q.metaData) {
    try {
      const meta = typeof q.metaData === "string" ? JSON.parse(q.metaData) : q.metaData;
      if (Array.isArray(meta?.params)) {
        paramNames = meta.params.map((p: any) => p.name).filter(Boolean);
      }
    } catch {}
  }

  const formatInputWithParams = (rawLines: string[]) => {
    if (paramNames.length > 0 && paramNames.length === rawLines.length) {
      return rawLines.map((line, i) => (line.includes("=") ? line : `${paramNames[i]} = ${line}`)).join("\n");
    }
    return rawLines.join("\n");
  };

  const contentOutputs = q.content ? extractOutputsFromContent(q.content) : [];

  if (Array.isArray(q.exampleTestcaseList) && q.exampleTestcaseList.length > 0) {
    return q.exampleTestcaseList
      .map((tc: string, idx: number) => {
        const cleanTcLines = tc.replace(/\\n/g, "\n").replace(/\\"/g, '"').trim().split("\n").map((l: string) => l.trim()).filter(Boolean);
        const formattedInput = formatInputWithParams(cleanTcLines);
        let block = `Case ${idx + 1}:\nStatus: Passed\nInput:\n${formattedInput}`;
        if (contentOutputs[idx]) {
          block += `\nOutput = ${contentOutputs[idx]}\nExpected = ${contentOutputs[idx]}`;
        }
        return block;
      })
      .join("\n\n");
  }

  if (q.exampleTestcases && typeof q.exampleTestcases === "string") {
    const rawLines = q.exampleTestcases.replace(/\\n/g, "\n").replace(/\\"/g, '"').trim().split("\n").map((l: string) => l.trim()).filter(Boolean);
    if (rawLines.length > 0) {
      const step = paramNames.length > 0 ? paramNames.length : 1;
      const cases: string[] = [];
      for (let i = 0; i < rawLines.length; i += step) {
        const groupLines = rawLines.slice(i, i + step);
        const formattedInput = formatInputWithParams(groupLines);
        const cIdx = cases.length;
        let block = `Case ${cIdx + 1}:\nStatus: Passed\nInput:\n${formattedInput}`;
        if (contentOutputs[cIdx]) {
          block += `\nOutput = ${contentOutputs[cIdx]}\nExpected = ${contentOutputs[cIdx]}`;
        }
        cases.push(block);
      }
      return cases.join("\n\n");
    }
  }

  if (q.sampleTestCase && typeof q.sampleTestCase === "string") {
    const rawLines = q.sampleTestCase.replace(/\\n/g, "\n").replace(/\\"/g, '"').trim().split("\n").map((l: string) => l.trim()).filter(Boolean);
    const formattedInput = formatInputWithParams(rawLines);
    if (formattedInput) {
      let block = `Case 1:\nStatus: Passed\nInput:\n${formattedInput}`;
      if (contentOutputs[0]) {
        block += `\nOutput = ${contentOutputs[0]}\nExpected = ${contentOutputs[0]}`;
      }
      return block;
    }
  }

  return undefined;
};

const getTestCasesFromDOM = (): string | undefined => {
  // 1. Read from DOM bridge created by pageScript (MAIN world React Fiber context)
  const bridge = document.getElementById("codevault-testcases-bridge") as HTMLTextAreaElement;
  if (bridge && bridge.value && bridge.value.trim().length > 10) {
    return bridge.value.trim();
  }

  const caseBlocks: string[] = [];

  // 2. Try DOM console submission result panel (contains Input, Output, Expected)
  try {
    const consoleResultPanel = document.querySelector(
      "[data-e2e-locator='console-submission-result'], div[class*='submission-result'], div[class*='result'], div[class*='Result']"
    );
    if (consoleResultPanel) {
      const caseEls = Array.from(
        consoleResultPanel.querySelectorAll("[class*='test-case'], [class*='testcase'], [class*='Case'], pre")
      );
      for (const el of caseEls) {
        const txt = el.textContent?.trim();
        if (txt && (txt.includes("Input") || txt.includes("Output") || txt.includes("Expected"))) {
          if (!caseBlocks.includes(txt) && txt.length < 1500) {
            caseBlocks.push(txt);
          }
        }
      }
    }
  } catch (e) {}

  // 2. Try problem description example pre/code blocks
  try {
    const preEls = Array.from(
      document.querySelectorAll("div[data-track-load='description_content'] pre, [class*='description'] pre, pre, code")
    );
    for (const pre of preEls) {
      const txt = pre.textContent?.trim();
      if (txt && (txt.includes("Input:") || txt.includes("Input :") || txt.includes("Output:"))) {
        let formatted = txt.toLowerCase().includes("status:") ? txt : `Status: Passed\n${txt}`;
        if (formatted.includes("Output:") && !formatted.toLowerCase().includes("expected")) {
          const outMatch = formatted.match(/Output[:=]\s*([^\n]+)/i);
          if (outMatch && outMatch[1]) {
            formatted = formatted + `\nExpected = ${outMatch[1].trim()}`;
          }
        }
        if (!caseBlocks.includes(formatted) && txt.length < 1500) {
          caseBlocks.push(formatted);
        }
      }
    }
  } catch (e) {}

  // 3. Try __NEXT_DATA__ payload for exampleTestcaseList or exampleTestcases or sampleTestCase
  try {
    const nextDataEl = document.getElementById("__NEXT_DATA__");
    if (nextDataEl?.textContent) {
      const raw = nextDataEl.textContent;
      const currentSlug = slug();

      let scopeRaw = raw;
      if (currentSlug && raw.includes(`"${currentSlug}"`)) {
        const idx = raw.indexOf(`"${currentSlug}"`);
        scopeRaw = raw.substring(Math.max(0, idx - 1000), Math.min(raw.length, idx + 2500));
      }

      const listMatch = scopeRaw.match(/"exampleTestcaseList"\s*:\s*(\[[\s\S]*?\])(?:,|\})/) || raw.match(/"exampleTestcaseList"\s*:\s*(\[[\s\S]*?\])(?:,|\})/);
      if (listMatch && listMatch[1]) {
        try {
          const parsedList: string[] = JSON.parse(listMatch[1]);
          if (Array.isArray(parsedList) && parsedList.length > 0) {
            return parsedList.map((tc, idx) => `Case ${idx + 1}:\nStatus: Passed\nInput:\n${tc.trim()}`).join("\n\n");
          }
        } catch {}
      }

      const strMatch = scopeRaw.match(/"exampleTestcases"\s*:\s*"([^"]+)"/) || raw.match(/"exampleTestcases"\s*:\s*"([^"]+)"/);
      if (strMatch && strMatch[1]) {
        const rawCases = strMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').trim();
        if (rawCases.length > 0) {
          return `Case 1:\nStatus: Passed\nInput:\n${rawCases}`;
        }
      }
    }
  } catch (e) {}

  if (caseBlocks.length > 0) {
    return caseBlocks
      .map((blk, i) => (blk.toLowerCase().includes("case ") ? blk : `Case ${i + 1}:\n${blk}`))
      .join("\n\n");
  }

  return undefined;
};

const isCodeHeaderComplete = (src: string): boolean => {
  return Boolean(src && src.trim().length >= 10);
};

const ensureExpectedInTestCases = (text: string | undefined): string | undefined => {
  if (!text || !text.trim()) return text;

  const blocks = text.split(/(?=Case\s+\d+:)/i);
  const processed = blocks.map((block) => {
    if (!block.trim()) return block;
    if (/Output[:=]/i.test(block) && !/Expected[:=]/i.test(block)) {
      const match = block.match(/(Output[:=]\s*([^\n]+))/i);
      if (match && match[2]) {
        const val = match[2].trim();
        return block.replace(match[1], `${match[1]}\nExpected: ${val}`);
      }
    }
    return block;
  });

  return processed.join("");
};

const combineTestCases = (gqlText: string | undefined, domText: string | undefined): string | undefined => {
  if (!gqlText) return domText;
  if (!domText) return gqlText;

  const gqlBlocks = gqlText.split(/(?=Case\s+\d+:)/i).map((b) => b.trim()).filter(Boolean);
  const domBlocks = domText.split(/(?=Case\s+\d+:)/i).map((b) => b.trim()).filter(Boolean);

  if (gqlBlocks.length === 0) return domText;
  if (domBlocks.length === 0) return gqlText;

  const domOutputs: { output?: string; expected?: string }[] = [];
  for (const block of domBlocks) {
    let output: string | undefined;
    let expected: string | undefined;

    const outMatch = block.match(/(?:Output|code_output)[:=]\s*([^\n]+)/i);
    const expMatch = block.match(/(?:Expected|expected_output)[:=]\s*([^\n]+)/i);

    if (outMatch) output = outMatch[1].trim();
    if (expMatch) expected = expMatch[1].trim();

    if (output || expected) {
      domOutputs.push({ output, expected });
    }
  }

  const mergedGqlBlocks = gqlBlocks.map((block, idx) => {
    const domInfo = domOutputs[idx] || (idx === 0 ? domOutputs[0] : undefined);
    let result = block;
    if (domInfo) {
      if (domInfo.output && !result.toLowerCase().includes("output")) {
        result += `\nOutput = ${domInfo.output}`;
      }
      if (domInfo.expected && !result.toLowerCase().includes("expected")) {
        result += `\nExpected = ${domInfo.expected}`;
      }
    }
    return result;
  });

  return mergedGqlBlocks.join("\n\n");
};

export async function acceptedSubmission(): Promise<Submission | undefined> {
  if (!isRealSubmission()) return undefined;

  const problemSlug = slug();
  const sourceCode = code();

  if (!problemSlug || !sourceCode) return undefined;
  if (!isCodeHeaderComplete(sourceCode)) return undefined;

  // 1. Fetch exact metadata and test cases from LeetCode GraphQL API for 100% precision
  const gqlData = await fetchLeetCodeGraphQLDetails(problemSlug);

  const id = gqlData?.questionFrontendId ? Number(gqlData.questionFrontendId) : getProblemId();
  const rawTitle = gqlData?.title || getProblemTitle();
  const problemTitle = (rawTitle === "Two Sum" && problemSlug !== "two-sum") ? slugToTitle(problemSlug) : rawTitle;

  const topics = (gqlData?.topicTags && gqlData.topicTags.length > 0)
    ? gqlData.topicTags.map((t: any) => t.name)
    : getTopics();
  const diff = (gqlData?.difficulty as Submission["difficulty"]) || difficulty();
  const gqlTestCases = formatTestCasesFromGraphQL(gqlData);
  const domTestCases = getTestCasesFromDOM();
  const rawTestCases = combineTestCases(gqlTestCases, domTestCases);
  const testCases = ensureExpectedInTestCases(rawTestCases);

  if (!id || !problemTitle) return undefined;

  const language = getLanguage();
  const runtime = getRuntime();
  const memory = getMemory();

  return {
    problemId: id,
    title: problemTitle,
    slug: problemSlug,
    difficulty: diff,
    topics,
    language,
    runtime,
    memory,
    submittedAt: new Date().toISOString(),
    sourceCode,
    testCases,
    leetCodeUrl: location.href.split("?")[0]
  };
}
