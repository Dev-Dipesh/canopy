import { useState, useEffect, useCallback } from "react";
import type { RenderResult } from "../types";

interface PreviewProps {
  status: "idle" | "loading" | "success" | "error";
  result: RenderResult | null;
  blobUrl: string | null;
  errorText: string | null;
  onFullscreen: () => void;
  onErrorLineClick?: (line: number) => void;
}

/** Strip <script> tags from SVG for defense-in-depth. */
function sanitizeSvg(svgText: string): string {
  return svgText.replace(/<script[\s\S]*?<\/script>/gi, "");
}

export function Preview({
  status,
  result,
  blobUrl,
  errorText,
  onFullscreen,
  onErrorLineClick,
}: PreviewProps) {
  if (status === "idle") {
    return (
      <div className="preview-empty">
        <p>Select a diagram type and click Render</p>
        <p className="preview-hint">or press Ctrl+Enter</p>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="preview-loading">
        <div className="spinner" />
        <p>Rendering...</p>
      </div>
    );
  }

  if (status === "error" && result?.isErrorImage && blobUrl) {
    return (
      <div className="preview-content">
        <div className="preview-error-banner">
          Syntax error — see rendered error below
        </div>
        <img
          src={blobUrl}
          alt="Diagram error"
          className="preview-img"
          onClick={onFullscreen}
        />
      </div>
    );
  }

  if (status === "error" && errorText) {
    return (
      <div className="preview-error-full">
        <ErrorDisplay
          text={errorText}
          onLineClick={onErrorLineClick}
        />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="preview-empty preview-error-state">
        <p>Render failed</p>
      </div>
    );
  }

  if (blobUrl && result) {
    if (result.format === "svg") {
      return (
        <div className="preview-content">
          <InlineSvg blobUrl={blobUrl} onClick={onFullscreen} />
        </div>
      );
    }

    return (
      <div className="preview-content">
        <img
          src={blobUrl}
          alt="Rendered diagram"
          className="preview-img"
          onClick={onFullscreen}
        />
      </div>
    );
  }

  return null;
}

/** Full error display with copy button and clickable line numbers. */
function ErrorDisplay({
  text,
  onLineClick,
}: {
  text: string;
  onLineClick?: (line: number) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }, [text]);

  const rendered = renderErrorWithLinks(text, onLineClick);

  return (
    <div className="error-display">
      <div className="error-display-header">
        <span className="error-display-title">Render Error</span>
        <button className="error-display-copy" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="error-display-body">{rendered}</pre>
    </div>
  );
}

/** Render error text with clickable line references. */
function renderErrorWithLinks(
  text: string,
  onLineClick?: (line: number) => void
): React.ReactNode {
  if (!onLineClick) return text;

  const parts = text.split(/(line\s+\d+(?::\d+)?)/gi);
  return parts.map((part, i) => {
    const match = part.match(/line\s+(\d+)/i);
    if (match) {
      const line = parseInt(match[1], 10);
      return (
        <button
          key={i}
          className="error-display-line-link"
          onClick={() => onLineClick(line)}
        >
          {part}
        </button>
      );
    }
    return part;
  });
}

/** Load SVG blob as inline HTML for better scaling. */
function InlineSvg({
  blobUrl,
  onClick,
}: {
  blobUrl: string;
  onClick: () => void;
}) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    fetch(blobUrl)
      .then((r) => r.text())
      .then((text) => setHtml(sanitizeSvg(text)))
      .catch(() => setHtml(null));
  }, [blobUrl]);

  if (!html) {
    return (
      <img
        src={blobUrl}
        alt="Rendered diagram"
        className="preview-img"
        onClick={onClick}
      />
    );
  }

  return (
    <div
      className="preview-svg-inline"
      onClick={onClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
