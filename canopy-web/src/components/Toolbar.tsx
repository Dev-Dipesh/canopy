import { useState, useRef, useEffect } from "react";
import type { DiagramType, OutputFormat } from "../types";
import { DIAGRAM_TYPES, OUTPUT_FORMAT } from "../constants";
import { saveAs, copyToClipboard } from "../lib/export";

interface ToolbarProps {
  type: DiagramType;
  onTypeChange: (type: DiagramType) => void;
  autoRender: boolean;
  onAutoRenderChange: (value: boolean) => void;
  onSubmit: () => void;
  themeMode: string;
  onThemeCycle: () => void;
  resultBlob: Blob | null;
  resultFormat: OutputFormat | null;
}

export function Toolbar({
  type,
  onTypeChange,
  autoRender,
  onAutoRenderChange,
  onSubmit,
  themeMode,
  onThemeCycle,
  resultBlob,
  resultFormat,
}: ToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exportOpen) return;
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [exportOpen]);

  const format: OutputFormat = OUTPUT_FORMAT[type] ?? "png";

  const handleSave = async () => {
    if (!resultBlob) return;
    setExportOpen(false);
    await saveAs(resultBlob, `diagram.${resultFormat ?? format}`);
  };

  const handleCopy = async () => {
    if (!resultBlob || !resultFormat) return;
    try {
      await copyToClipboard(resultBlob, resultFormat);
    } catch {
      // Clipboard API may not be available
    }
    setExportOpen(false);
  };

  const themeIcon =
    themeMode === "light" ? "sun" : themeMode === "dark" ? "moon" : "auto";

  return (
    <div className="toolbar">
      <select
        value={type}
        onChange={(e) => onTypeChange(e.target.value as DiagramType)}
        className="toolbar-select"
      >
        {DIAGRAM_TYPES.map((dt) => (
          <option key={dt.id} value={dt.id}>
            {dt.label}
          </option>
        ))}
      </select>

      <span className="toolbar-badge">{format.toUpperCase()}</span>

      <button onClick={onSubmit} className="toolbar-btn toolbar-btn-primary">
        Render
      </button>

      <label className="toolbar-toggle">
        <input
          type="checkbox"
          checked={autoRender}
          onChange={(e) => onAutoRenderChange(e.target.checked)}
        />
        <span>Auto</span>
      </label>

      <div className="toolbar-spacer" />

      <div className="toolbar-export-wrap" ref={exportRef}>
        <button
          onClick={() => setExportOpen(!exportOpen)}
          className="toolbar-btn"
          disabled={!resultBlob}
        >
          Export
        </button>
        {exportOpen && (
          <div className="toolbar-dropdown">
            <button onClick={handleSave} className="toolbar-dropdown-item">
              Save as file
            </button>
            <button onClick={handleCopy} className="toolbar-dropdown-item">
              Copy to clipboard
            </button>
          </div>
        )}
      </div>

      <button onClick={onThemeCycle} className="toolbar-btn" title="Toggle theme">
        {themeIcon === "sun" ? "\u2600" : themeIcon === "moon" ? "\u263E" : "\u25D0"}
      </button>
    </div>
  );
}
