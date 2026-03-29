import type { OutputFormat } from "../types";

interface StatusBarProps {
  status: "idle" | "loading" | "success" | "error";
  duration: number | null;
  format: OutputFormat | null;
  errorText: string | null;
}

export function StatusBar({
  status,
  duration,
  format,
  errorText,
}: StatusBarProps) {
  return (
    <div className={`status-bar ${errorText ? "status-bar-error" : ""}`}>
      <div className="status-bar-left">
        {status === "loading" && <span className="status-dot status-dot-loading" />}
        {status === "success" && <span className="status-dot status-dot-success" />}
        {status === "error" && <span className="status-dot status-dot-error" />}
        {status === "idle" && <span className="status-dot" />}

        {errorText ? (
          <span>Render error</span>
        ) : status === "success" && duration != null ? (
          <span>Rendered in {duration}ms</span>
        ) : status === "loading" ? (
          <span>Rendering...</span>
        ) : (
          <span>Ready</span>
        )}
      </div>

      <div className="status-bar-right">
        {format && (
          <span className="status-format-badge">{format.toUpperCase()}</span>
        )}
      </div>
    </div>
  );
}
