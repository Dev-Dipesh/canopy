import { useState, useRef, useEffect } from "react";
import type { DiagramType, OutputFormat } from "../types";
import { DIAGRAM_TYPES, OUTPUT_FORMAT } from "../constants";
import { saveAs, copyToClipboard, svgToPngBlob } from "../lib/export";

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
  onSaveToGallery: () => void;
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
  onSaveToGallery,
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

  const handleSave = async (asFormat?: OutputFormat) => {
    if (!resultBlob) return;
    setExportOpen(false);
    const targetFormat = asFormat ?? resultFormat ?? format;
    const blob =
      targetFormat === "png" && resultFormat === "svg"
        ? await svgToPngBlob(resultBlob)
        : resultBlob;
    await saveAs(blob, `diagram.${targetFormat}`);
  };

  const handleCopy = async (asFormat?: OutputFormat) => {
    if (!resultBlob || !resultFormat) return;
    setExportOpen(false);
    const targetFormat = asFormat ?? resultFormat;
    try {
      if (targetFormat === "png" && resultFormat === "svg") {
        // Pass the promise directly to ClipboardItem so the write
        // starts within the user gesture (awaiting first would expire it).
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": svgToPngBlob(resultBlob) }),
        ]);
      } else {
        await copyToClipboard(resultBlob, resultFormat);
      }
    } catch {
      // Clipboard API may not be available
    }
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
            {resultFormat === "svg" ? (
              <>
                <button onClick={() => handleSave("svg")} className="toolbar-dropdown-item">
                  Save as SVG
                </button>
                <button onClick={() => handleSave("png")} className="toolbar-dropdown-item">
                  Save as PNG
                </button>
                <button onClick={() => handleCopy("svg")} className="toolbar-dropdown-item">
                  Copy SVG
                </button>
                <button onClick={() => handleCopy("png")} className="toolbar-dropdown-item">
                  Copy PNG
                </button>
                <hr className="toolbar-dropdown-sep" />
                <button onClick={() => { setExportOpen(false); onSaveToGallery(); }} className="toolbar-dropdown-item">
                  Save to Gallery
                </button>
              </>
            ) : (
              <>
                <button onClick={() => handleSave()} className="toolbar-dropdown-item">
                  Save as file
                </button>
                <button onClick={() => handleCopy()} className="toolbar-dropdown-item">
                  Copy to clipboard
                </button>
                <hr className="toolbar-dropdown-sep" />
                <button onClick={() => { setExportOpen(false); onSaveToGallery(); }} className="toolbar-dropdown-item">
                  Save to Gallery
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <button onClick={onThemeCycle} className="toolbar-btn" title="Toggle theme">
        {themeIcon === "sun" ? "\u2600" : themeIcon === "moon" ? "\u263E" : "\u25D0"}
      </button>
    </div>
  );
}
