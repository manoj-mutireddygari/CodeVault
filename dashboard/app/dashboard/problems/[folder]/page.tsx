"use client";
import { useParams, useSearchParams } from "next/navigation";
import { ExternalLink, GitFork, ChevronLeft, Code2, Check, X, Layers, Copy } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useRepository } from "../../../../contexts/RepositoryContext";
import { useVault, useProblem, useSolutionCode, useTestCases } from "../../../../hooks/useVault";
import { EmptyState, LoadingGrid } from "../../../../components/StatePanels";
import { MacOsCodeViewer } from "../../../../components/MacOsCodeViewer";

interface ParsedTestCase {
  id: number;
  label: string;
  isPassed: boolean;
  status?: string;
  rawText: string;
  parameters: { key?: string; value: string }[];
  output?: string;
  expected?: string;
}

function parseTestCases(rawText?: string): ParsedTestCase[] {
  if (!rawText || !rawText.trim()) return [];
  const rawStr = rawText.trim();

  const parseBlock = (block: string, idx: number): ParsedTestCase => {
    const lines = block.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    const params: { key?: string; value: string }[] = [];
    let status: string | undefined;
    let output: string | undefined;
    let expected: string | undefined;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();

      if (/^case\s+\d+:?$/i.test(line)) {
        continue;
      }

      if (lower.startsWith("status:")) {
        status = line.replace(/^status:\s*/i, "").trim();
        continue;
      } else if (
        lower.startsWith("expected output:") ||
        lower.startsWith("expected output =") ||
        lower.startsWith("expected:") ||
        lower.startsWith("expected =")
      ) {
        expected = line.replace(/^(expected output|expected)[:=]\s*/i, "").trim();
        continue;
      } else if (lower.startsWith("output:") || lower.startsWith("output =")) {
        output = line.replace(/^output[:=]\s*/i, "").trim();
        continue;
      } else if (lower.startsWith("explanation:")) {
        // Skip explanation per user request
        continue;
      } else if (lower.startsWith("input:") || lower.startsWith("input =") || lower === "input") {
        const rest = line.replace(/^input[:=]?\s*/i, "").trim();
        if (rest) {
          if (rest.includes("=")) {
            const parts = rest.split("=");
            params.push({ key: parts[0].trim(), value: parts.slice(1).join("=").trim() });
          } else {
            params.push({ value: rest });
          }
        }
      } else if (line.includes("=")) {
        const parts = line.split("=");
        const key = parts[0].trim();
        const val = parts.slice(1).join("=").trim();
        if (key.toLowerCase() === "output") {
          output = val;
        } else if (key.toLowerCase() === "expected" || key.toLowerCase() === "expected output") {
          expected = val;
        } else {
          params.push({ key, value: val });
        }
      } else if (line.includes(":")) {
        const parts = line.split(":");
        const key = parts[0].trim();
        const val = parts.slice(1).join(":").trim();
        if (key.toLowerCase() === "output") {
          output = val;
        } else if (key.toLowerCase() === "expected" || key.toLowerCase() === "expected output") {
          expected = val;
        } else if (val) {
          params.push({ key, value: val });
        } else {
          params.push({ value: line });
        }
      } else {
        params.push({ value: line });
      }
    }

    if (output && !expected) expected = output;
    if (expected && !output) output = expected;

    let isPassed = true;
    if (status) {
      const sLower = status.toLowerCase();
      if (sLower.includes("pass") || sLower.includes("accepted") || sLower.includes("ok")) {
        isPassed = true;
      } else if (sLower.includes("fail") || sLower.includes("wrong") || sLower.includes("error") || sLower.includes("limit")) {
        isPassed = false;
      }
    } else if (output && expected) {
      const cleanOut = output.trim().replace(/^["']|["']$/g, "").trim();
      const cleanExp = expected.trim().replace(/^["']|["']$/g, "").trim();
      if (cleanOut !== cleanExp) {
        isPassed = false;
      }
    }

    return {
      id: idx + 1,
      label: `Case ${idx + 1}`,
      isPassed,
      status,
      rawText: block.trim(),
      parameters: params,
      output,
      expected,
    };
  };

  let rawBlocks: string[] = [];
  if (/Case\s+\d+:/i.test(rawStr)) {
    rawBlocks = rawStr.split(/Case\s+\d+:/i).filter((b) => b.trim().length > 0);
  } else {
    rawBlocks = rawStr.split(/\n\s*\n/).filter((b) => b.trim().length > 0);
  }

  const initialCases = rawBlocks.map((block, idx) => parseBlock(block, idx));

  // Post-processing pass 1: Merge orphaned output blocks into preceding input blocks
  const mergedCases: ParsedTestCase[] = [];
  for (let i = 0; i < initialCases.length; i++) {
    const c = initialCases[i];
    const prev = mergedCases[mergedCases.length - 1];

    if (
      prev &&
      prev.parameters.length > 0 &&
      (!prev.output || !prev.expected) &&
      c.parameters.length === 0 &&
      (c.output || c.expected)
    ) {
      if (!prev.output && c.output) prev.output = c.output;
      if (!prev.expected && c.expected) prev.expected = c.expected;
      if (c.status) prev.status = c.status;
      if (prev.status) {
        const sLower = prev.status.toLowerCase();
        if (sLower.includes("pass") || sLower.includes("accepted") || sLower.includes("ok")) {
          prev.isPassed = true;
        } else if (sLower.includes("fail") || sLower.includes("wrong") || sLower.includes("error")) {
          prev.isPassed = false;
        }
      }
      prev.rawText += `\n${c.rawText}`;
    } else {
      mergedCases.push({ ...c, id: mergedCases.length + 1, label: `Case ${mergedCases.length + 1}` });
    }
  }

  // Post-processing pass 2: Global output resolution fallback across cases
  const globalOutput = mergedCases.find((c) => c.output)?.output;
  const globalExpected = mergedCases.find((c) => c.expected)?.expected;

  if (globalOutput || globalExpected) {
    for (const c of mergedCases) {
      if (!c.output && (globalOutput || globalExpected)) {
        c.output = globalOutput || globalExpected;
      }
      if (!c.expected && (globalExpected || globalOutput)) {
        c.expected = globalExpected || globalOutput;
      }
    }
  }

  // Filter out any leftover empty cases (no inputs AND same outputs as prev)
  const finalCases = mergedCases.filter((c, idx) => {
    if (c.parameters.length === 0 && idx > 0) return false;
    return true;
  });

  return finalCases.map((c, idx) => ({
    ...c,
    id: idx + 1,
    label: `Case ${idx + 1}`,
  }));
}

export default function ProblemDetail() {
  const folder = useParams<{ folder: string }>().folder;
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const repository = useRepository();
  const vault = useVault(repository);

  // Find all language submissions for this problem folder
  const allSubmissions = useMemo(
    () => vault.data?.problems.filter((p) => p.folderName === folder) ?? [],
    [vault.data, folder]
  );

  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [copiedCaseId, setCopiedCaseId] = useState<number | null>(null);

  const activeLanguage = useMemo(() => {
    if (selectedLanguage) return selectedLanguage;
    if (langParam && allSubmissions.some((s) => s.language.toLowerCase() === langParam.toLowerCase())) {
      return langParam;
    }
    return allSubmissions[0]?.language ?? "";
  }, [selectedLanguage, langParam, allSubmissions]);

  const activeSubmission = useMemo(
    () =>
      allSubmissions.find((s) => s.language.toLowerCase() === activeLanguage.toLowerCase()) ??
      allSubmissions[0],
    [allSubmissions, activeLanguage]
  );

  const metadata = useProblem(repository, folder, activeSubmission?.language);
  const solutionCode = useSolutionCode(repository, folder, activeSubmission?.language);
  const testCasesQuery = useTestCases(repository, folder, activeSubmission?.language);

  if (!repository) return <main className="page"><EmptyState /></main>;
  if (vault.isLoading || metadata.isLoading) return <main className="page"><LoadingGrid /></main>;

  if (!activeSubmission) {
    return (
      <main className="page">
        <EmptyState title="Problem not found" body="This solution is no longer present in the repository index." />
      </main>
    );
  }

  const m = metadata.data;
  const testCasesData = testCasesQuery.data || m?.testCases || "";

  const getSolutionExtension = (lang: string) => {
    const l = lang.toLowerCase();
    if (l.includes("py")) return "py";
    if (l.includes("java") && !l.includes("script")) return "java";
    if (l.includes("js") || l.includes("javascript")) return "js";
    if (l.includes("ts") || l.includes("typescript")) return "ts";
    if (l.includes("cpp") || l.includes("c++")) return "cpp";
    if (l.includes("cs") || l.includes("c#")) return "cs";
    if (l.includes("go")) return "go";
    if (l.includes("rs") || l.includes("rust")) return "rs";
    return "txt";
  };

  const solutionFilePath = `${folder}/solution.${getSolutionExtension(activeSubmission.language)}`;
  const githubFileUrl = m?.githubUrl ?? `https://github.com/${repository.owner}/${repository.repo}/blob/main/${solutionFilePath}`;

  const parsedTestCases = parseTestCases(testCasesData);
  const currentTestCase = parsedTestCases[selectedCaseIdx] || parsedTestCases[0];

  const handleCopyCase = (text: string, id: number) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCaseId(id);
    setTimeout(() => setCopiedCaseId(null), 2000);
  };

  return (
    <main className="page">
      <Link className="back" href="/dashboard/problems">
        <ChevronLeft size={16} /> All problems
      </Link>
      <section className="detail-hero">
        <div>
          <p className="eyebrow">SOLUTION #{String(activeSubmission.id).padStart(4, "0")}</p>
          <h1>{activeSubmission.title}</h1>
          <div className="chips">
            <span className={`badge ${activeSubmission.difficulty.toLowerCase()}`}>{activeSubmission.difficulty}</span>
            {activeSubmission.topics.map(topic => (
              <span key={topic}>{topic}</span>
            ))}
          </div>
        </div>
        <div className="detail-actions">
          <a className="primary" target="_blank" href={githubFileUrl} rel="noreferrer">
            <GitFork size={15} /> GitHub
          </a>
          <a className="outline" target="_blank" href={m?.leetCodeUrl ?? `https://leetcode.com/problems/${activeSubmission.slug}/`} rel="noreferrer">
            <ExternalLink size={15} /> LeetCode
          </a>
        </div>
      </section>

      {allSubmissions.length > 1 && (
        <section className="language-selector glass-card" style={{ marginBottom: "1.5rem", padding: "1rem 1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--muted, #888)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Code2 size={16} /> Language Solutions ({allSubmissions.length}):
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {allSubmissions.map((sub) => {
                const isSelected = sub.language.toLowerCase() === activeSubmission.language.toLowerCase();
                return (
                  <button
                    key={sub.language}
                    onClick={() => setSelectedLanguage(sub.language)}
                    style={{
                      padding: "0.4rem 0.85rem",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: isSelected ? "1px solid var(--primary, #6366f1)" : "1px solid rgba(255,255,255,0.1)",
                      background: isSelected ? "rgba(99, 102, 241, 0.15)" : "rgba(255,255,255,0.05)",
                      color: isSelected ? "var(--primary-light, #818cf8)" : "inherit",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {sub.language}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="detail-grid" style={{ alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignSelf: "start" }}>
          {/* Submission Overview Card */}
          <article className="glass-card" style={{ padding: "16px 20px", marginBottom: "0" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, marginTop: 0, marginBottom: "12px" }}>Submission Overview</h2>
            <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", margin: 0 }}>
              <div>
                <dt style={{ fontSize: "10.5px", color: "var(--muted, #888)", textTransform: "uppercase", fontWeight: 650, marginBottom: "2px", letterSpacing: "0.5px" }}>Language</dt>
                <dd style={{ margin: 0, fontSize: "13px", fontWeight: 700 }}><b>{activeSubmission.language}</b></dd>
              </div>
              <div>
                <dt style={{ fontSize: "10.5px", color: "var(--muted, #888)", textTransform: "uppercase", fontWeight: 650, marginBottom: "2px", letterSpacing: "0.5px" }}>Runtime</dt>
                <dd style={{ margin: 0, fontSize: "13px", fontWeight: 650 }}>{m?.runtime ?? "Not recorded"}</dd>
              </div>
              <div>
                <dt style={{ fontSize: "10.5px", color: "var(--muted, #888)", textTransform: "uppercase", fontWeight: 650, marginBottom: "2px", letterSpacing: "0.5px" }}>Memory</dt>
                <dd style={{ margin: 0, fontSize: "13px", fontWeight: 650 }}>{m?.memory ?? "Not recorded"}</dd>
              </div>
              <div>
                <dt style={{ fontSize: "10.5px", color: "var(--muted, #888)", textTransform: "uppercase", fontWeight: 650, marginBottom: "2px", letterSpacing: "0.5px" }}>Solved</dt>
                <dd style={{ margin: 0, fontSize: "12.5px", fontWeight: 650 }}>{new Date(activeSubmission.solvedAt).toLocaleDateString()}</dd>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <dt style={{ fontSize: "10.5px", color: "var(--muted, #888)", textTransform: "uppercase", fontWeight: 650, marginBottom: "2px", letterSpacing: "0.5px" }}>Repository Folder</dt>
                <dd style={{ margin: 0, fontSize: "12px", fontFamily: 'Consolas, Menlo, Monaco, "Courier New", monospace', color: "#64748b" }}>{folder}</dd>
              </div>
            </dl>
          </article>

          {/* Test Cases Card matching reference image */}
          <article className="glass-card" style={{ padding: "16px 20px", marginBottom: "0" }}>
            {/* Header Row: TESTCASES label + Case tabs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "12px",
                flexWrap: "wrap"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "6px" }}>
                <Layers size={15} style={{ color: "#6366f1" }} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  TESTCASES:
                </span>
              </div>
              {parsedTestCases.map((c, idx) => {
                const isSelected = selectedCaseIdx === idx;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCaseIdx(idx)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: isSelected ? 650 : 500,
                      cursor: "pointer",
                      border: isSelected ? "1px solid #cbd5e1" : "1px solid #f1f5f9",
                      background: isSelected ? "#ffffff" : "#f8fafc",
                      color: isSelected ? "#0f172a" : "#64748b",
                      transition: "all 0.15s ease",
                      boxShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.06)" : "none"
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "16px",
                        height: "16px",
                        borderRadius: "4px",
                        background: c.isPassed ? "#22c55e" : "#ef4444",
                        color: "#ffffff",
                        marginRight: "7px",
                        flexShrink: 0
                      }}
                    >
                      {c.isPassed ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
                    </span>
                    {c.label}
                  </button>
                );
              })}
            </div>

            {testCasesQuery.isLoading ? (
              <div style={{ padding: "20px 0", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                Loading test cases...
              </div>
            ) : parsedTestCases.length === 0 ? (
              <div style={{ padding: "12px 0", color: "#64748b", fontSize: "13px", lineHeight: 1.5 }}>
                No test cases recorded for this submission yet.
              </div>
            ) : (
              /* Inner Case Details Box matching reference image */
              currentTestCase && (
                <div
                  style={{
                    background: "#fafafa",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px"
                  }}
                >
                  {/* Title & Copy Case Bar */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          background: currentTestCase.isPassed ? "#22c55e" : "#ef4444",
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          display: "inline-block"
                        }}
                      />
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                        {currentTestCase.label} Input Details
                      </span>
                      <span
                        style={{
                          background: currentTestCase.isPassed ? "#dcfce7" : "#fee2e2",
                          color: currentTestCase.isPassed ? "#16a34a" : "#dc2626",
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 9px",
                          borderRadius: "10px"
                        }}
                      >
                        {currentTestCase.isPassed ? "Passed" : "Failed"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyCase(currentTestCase.rawText, currentTestCase.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        background: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#334155",
                        cursor: "pointer",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
                      }}
                    >
                      {copiedCaseId === currentTestCase.id ? (
                        <>
                          <Check size={12} style={{ color: "#16a34a" }} />
                          <span style={{ color: "#16a34a" }}>Copied Case</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy Case</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Input Parameter Boxes */}
                  {currentTestCase.parameters.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "12px", fontWeight: 650, color: "#64748b" }}>
                        Input
                      </label>
                      <div
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          padding: "12px 16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                        }}
                      >
                        {currentTestCase.parameters.map((param, pIdx) => (
                          <div key={pIdx}>
                            {param.key && (
                              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, marginBottom: "3px" }}>
                                {param.key} =
                              </div>
                            )}
                            <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: "13.5px", color: "#0f172a", wordBreak: "break-all" }}>
                              {param.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Output Box */}
                  {currentTestCase.output && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#2563eb" }}>
                        Output =
                      </label>
                      <div
                        style={{
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          borderRadius: "8px",
                          padding: "12px 16px",
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          fontSize: "13.5px",
                          fontWeight: 600,
                          color: "#1d4ed8",
                          wordBreak: "break-all"
                        }}
                      >
                        {currentTestCase.output}
                      </div>
                    </div>
                  )}

                  {/* Expected Output Box */}
                  {currentTestCase.expected && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#16a34a" }}>
                        Expected Output =
                      </label>
                      <div
                        style={{
                          background: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          borderRadius: "8px",
                          padding: "12px 16px",
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          fontSize: "13.5px",
                          fontWeight: 600,
                          color: "#15803d",
                          wordBreak: "break-all"
                        }}
                      >
                        {currentTestCase.expected}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </article>
        </div>

        {/* Source Code Viewer */}
        <MacOsCodeViewer
          code={solutionCode.data ?? ""}
          language={activeSubmission.language}
          githubUrl={githubFileUrl}
          isLoading={solutionCode.isLoading}
        />
      </section>
    </main>
  );
}
