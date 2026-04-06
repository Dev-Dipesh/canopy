import type { DiagramType, OutputFormat, RenderResult } from "../types";
import { OUTPUT_FORMAT } from "../constants";

function getOutputFormat(type: DiagramType): OutputFormat {
  return OUTPUT_FORMAT[type] ?? "png";
}

/** Resolve virtual diagram types to their Kroki endpoint type. */
function getKrokiType(type: DiagramType): string {
  if (type === "d2-elk") return "d2";
  return type;
}

const D2_ELK_VARS = `vars: {
  d2-config: {
    layout-engine: elk
  }
}

`;

/** Parse line/column from Kroki error text (e.g. "line 5:12" or "Error at line 3"). */
export function parseErrorLocation(
  text: string
): { line: number; column?: number } | null {
  const match = text.match(/line\s+(\d+)(?::(\d+))?/i);
  if (!match) return null;
  return {
    line: parseInt(match[1], 10),
    column: match[2] ? parseInt(match[2], 10) : undefined,
  };
}

/**
 * Render a diagram via Kroki.
 * POST /kroki/{type}/{format} with raw UTF-8 body.
 */
export async function renderDiagram(
  source: string,
  type: DiagramType,
  signal?: AbortSignal
): Promise<RenderResult> {
  const format = getOutputFormat(type);
  const krokiType = getKrokiType(type);
  const body = type === "d2-elk" ? D2_ELK_VARS + source : source;
  const start = performance.now();

  const res = await fetch(`/kroki/${krokiType}/${format}`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body,
    signal,
  });

  const duration = Math.round(performance.now() - start);
  const contentType = res.headers.get("Content-Type") ?? "";

  if (res.ok) {
    const blob = await res.blob();
    return { blob, format, duration, isErrorImage: false };
  }

  // Error response — check if it's text or an error image
  if (contentType.startsWith("text/") || contentType.includes("json")) {
    const errorText = await res.text();
    throw new KrokiError(errorText, duration);
  }

  // Error rendered as image (HTTP 400 with image body)
  const blob = await res.blob();
  return { blob, format, duration, isErrorImage: true, errorText: undefined };
}

export class KrokiError extends Error {
  duration: number;

  constructor(message: string, duration: number) {
    super(message);
    this.name = "KrokiError";
    this.duration = duration;
  }
}
