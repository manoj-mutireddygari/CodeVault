"use client";

import React, { useState } from "react";
import { Copy, Check, ExternalLink, FileCode } from "lucide-react";

interface MacOsCodeViewerProps {
  code: string;
  language: string;
  filename?: string;
  githubUrl?: string;
  isLoading?: boolean;
}

export function MacOsCodeViewer({
  code,
  language,
  filename,
  githubUrl,
  isLoading = false,
}: MacOsCodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getExtension = (lang: string) => {
    const l = lang.toLowerCase();
    if (l.includes("py")) return "py";
    if (l.includes("java") && !l.includes("script")) return "java";
    if (l.includes("js") || l.includes("javascript")) return "js";
    if (l.includes("ts") || l.includes("typescript")) return "ts";
    if (l.includes("cpp") || l.includes("c++")) return "cpp";
    if (l.includes("cs") || l.includes("c#")) return "cs";
    if (l.includes("go") || l.includes("golang")) return "go";
    if (l.includes("rs") || l.includes("rust")) return "rs";
    if (l.includes("kt") || l.includes("kotlin")) return "kt";
    if (l.includes("swift")) return "swift";
    if (l.includes("sql")) return "sql";
    return "txt";
  };

  const displayFilename = filename || `solution.${getExtension(language)}`;
  const lines = code ? code.split("\n") : [];

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "480px",
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      {/* macOS Window Title Bar */}
      <div
        style={{
          background: "#f1f5f9",
          borderBottom: "1px solid #e2e8f0",
          height: "40px",
          minHeight: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          userSelect: "none",
          boxSizing: "border-box"
        }}
      >
        {/* Left Section: macOS Dots + File Tab (Aligned to Left) */}
        <div style={{ display: "flex", alignItems: "flex-end", height: "100%", gap: "14px" }}>
          {/* macOS Window Controls (Red, Yellow, Green) */}
          <div style={{ display: "flex", alignItems: "center", gap: "7px", paddingBottom: "13px" }}>
            <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ff5f56", border: "0.5px solid #e0443e", display: "inline-block" }} />
            <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ffbd2e", border: "0.5px solid #dea123", display: "inline-block" }} />
            <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#27c93f", border: "0.5px solid #1aab29", display: "inline-block" }} />
          </div>

          {/* VS Code Active Tab (Positioned to the left next to window dots) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#ffffff",
              borderTop: "2px solid #2563eb",
              borderLeft: "1px solid #e2e8f0",
              borderRight: "1px solid #e2e8f0",
              padding: "0 16px",
              height: "32px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#1e293b",
              borderTopLeftRadius: "6px",
              borderTopRightRadius: "6px"
            }}
          >
            <FileCode size={14} style={{ color: "#2563eb" }} />
            <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontWeight: 600 }}>
              {displayFilename}
            </span>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#94a3b8", marginLeft: "4px" }} />
          </div>
        </div>

        {/* Right Section: Header Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={handleCopy}
            disabled={!code || isLoading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              padding: "5px 11px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#334155",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
            title="Copy source code"
          >
            {copied ? (
              <>
                <Check size={13} style={{ color: "#16a34a" }} />
                <span style={{ color: "#16a34a" }}>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy</span>
              </>
            )}
          </button>
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "5px 9px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#334155",
                textDecoration: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
              }}
              title="View on GitHub"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      {/* Editor Body with Horizontal & Vertical Scrolling */}
      <div
        style={{
          flex: 1,
          background: "#ffffff",
          overflow: "auto",
          display: "flex",
          position: "relative"
        }}
      >
        {isLoading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              padding: "30px",
              color: "#64748b",
              fontSize: "13px",
              gap: "12px"
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                border: "2px solid #e2e8f0",
                borderTopColor: "#2563eb",
                borderRadius: "50%"
              }}
            />
            <span>Fetching solution source code from Supabase...</span>
          </div>
        ) : !code ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              padding: "30px",
              color: "#64748b",
              fontSize: "13px"
            }}
          >
            <p>No source code saved in Supabase for <b>{language}</b>.</p>
          </div>
        ) : (
          <div style={{ display: "flex", minWidth: "100%", minHeight: "100%" }}>
            {/* Line numbers column */}
            <div
              style={{
                padding: "14px 12px",
                textAlign: "right",
                color: "#94a3b8",
                fontSize: "12px",
                fontFamily: 'Consolas, Menlo, Monaco, "Courier New", "Fira Code", monospace',
                lineHeight: "1.6em",
                userSelect: "none",
                borderRight: "1px solid #e2e8f0",
                background: "#ffffff",
                flexShrink: 0
              }}
            >
              {lines.map((_, i) => (
                <div key={i} style={{ height: "1.6em" }}>
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code lines container with horizontal scrolling */}
            <div
              style={{
                padding: "14px 18px",
                color: "#1e293b",
                fontFamily: 'Consolas, Menlo, Monaco, "Courier New", "Fira Code", monospace',
                fontSize: "13.5px",
                lineHeight: "1.6em",
                whiteSpace: "pre",
                overflowX: "auto",
                flex: 1
              }}
            >
              {lines.map((line, i) => (
                <div key={i} style={{ height: "1.6em" }}>
                  {tokenizeLine(line, language)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Tokenize line matching VS Code Light Theme syntax highlighting (Image 2)
function tokenizeLine(line: string, language: string) {
  if (!line) return <span>&nbsp;</span>;

  // Single line comments
  if (line.trim().startsWith("//") || line.trim().startsWith("#")) {
    return <span style={{ color: "#008000", fontStyle: "italic" }}>{line}</span>;
  }

  const declarationKeywords = new Set([
    "class", "public", "private", "protected", "static", "final", "void",
    "def", "func", "function", "var", "val", "let", "const", "package",
    "import", "export", "interface", "struct", "enum", "type", "namespace"
  ]);

  const flowKeywords = new Set([
    "for", "while", "do", "if", "else", "switch", "case", "break",
    "continue", "return", "new", "try", "catch", "finally", "throw",
    "throws", "yield", "await", "async", "in", "of", "range", "pass", "lambda"
  ]);

  const typeKeywords = new Set([
    "int", "long", "short", "byte", "float", "double", "boolean", "bool",
    "char", "string", "String", "void", "any", "unknown", "never", "object",
    "Object", "HashSet", "HashMap", "ArrayList", "List", "Map", "Set",
    "Character", "Integer", "Long", "Double", "Float", "Boolean", "Math",
    "Solution", "Arrays", "vector", "unordered_map", "unordered_set", "pair"
  ]);

  const tokenRegex = /(\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b[a-zA-Z_]\w*\b|[^\s\a-zA-Z0-9_]+|\s+)/g;

  const tokens: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = tokenRegex.exec(line)) !== null) {
    const token = match[0];
    keyIdx++;

    if (token.startsWith("//") || token.startsWith("#")) {
      tokens.push(<span key={keyIdx} style={{ color: "#008000", fontStyle: "italic" }}>{token}</span>);
    } else if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'")) ||
      (token.startsWith("`") && token.endsWith("`"))
    ) {
      tokens.push(<span key={keyIdx} style={{ color: "#a31515" }}>{token}</span>);
    } else if (/^\d+(?:\.\d+)?$/.test(token)) {
      tokens.push(<span key={keyIdx} style={{ color: "#098658" }}>{token}</span>);
    } else if (/^[a-zA-Z_]\w*$/.test(token)) {
      if (declarationKeywords.has(token)) {
        tokens.push(<span key={keyIdx} style={{ color: "#0000ff", fontWeight: 500 }}>{token}</span>);
      } else if (flowKeywords.has(token)) {
        tokens.push(<span key={keyIdx} style={{ color: "#af00db", fontWeight: 500 }}>{token}</span>);
      } else if (typeKeywords.has(token) || /^[A-Z][a-zA-Z0-9_]*$/.test(token)) {
        tokens.push(<span key={keyIdx} style={{ color: "#0891b2", fontWeight: 500 }}>{token}</span>);
      } else {
        const rest = line.slice(tokenRegex.lastIndex);
        if (rest.trim().startsWith("(")) {
          tokens.push(<span key={keyIdx} style={{ color: "#795e26" }}>{token}</span>);
        } else {
          tokens.push(<span key={keyIdx} style={{ color: "#0451a5" }}>{token}</span>);
        }
      }
    } else {
      tokens.push(<span key={keyIdx} style={{ color: "#24292f" }}>{token}</span>);
    }
  }

  return tokens;
}
