import type { DiagramType, OutputFormat } from "../types";

/** Save a blob using the OS file picker, falling back to direct download. */
export async function saveAs(blob: Blob, filename: string): Promise<void> {
  // Use File System Access API if available (Chromium browsers)
  if ("showSaveFilePicker" in window) {
    try {
      const ext = filename.split(".").pop() ?? "png";
      const mimeType = blob.type || (ext === "svg" ? "image/svg+xml" : "image/png");
      const handle = await window.showSaveFilePicker!({
        suggestedName: filename,
        types: [
          {
            description: `${ext.toUpperCase()} Image`,
            accept: { [mimeType]: [`.${ext}`] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      // User cancelled the picker — do nothing
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
  }

  // Fallback: direct download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Copy a rendered diagram to the clipboard. */
export async function copyToClipboard(
  blob: Blob,
  format: OutputFormat
): Promise<void> {
  if (format === "svg") {
    const text = await blob.text();
    await navigator.clipboard.writeText(text);
  } else {
    // PNG — use ClipboardItem
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob }),
    ]);
  }
}

/** Resolve virtual diagram types to their Kroki type for the gallery registry. */
function resolveType(type: DiagramType): string {
  if (type === "d2-elk") return "d2";
  return type;
}

/** Save a diagram to the Canopy gallery via the MCP server. */
export async function saveToGallery(
  blob: Blob,
  format: OutputFormat,
  source: string,
  type: DiagramType,
  title?: string,
): Promise<{ id: string; previewUrl: string; galleryUrl: string }> {
  const buffer = await blob.arrayBuffer();
  const binary = new Uint8Array(buffer);
  let base64 = "";
  for (let i = 0; i < binary.length; i += 8192) {
    base64 += String.fromCharCode(...binary.subarray(i, i + 8192));
  }
  base64 = btoa(base64);

  const res = await fetch("/canopy/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image: base64,
      format,
      source,
      type: resolveType(type),
      title: title || undefined,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Save failed" }));
    throw new Error(err.error ?? "Save failed");
  }

  return res.json();
}

/** Rasterize an SVG blob to a PNG blob via canvas. */
export async function svgToPngBlob(svgBlob: Blob): Promise<Blob> {
  const svgText = await svgBlob.text();
  const dataUrl =
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText);

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const MAX_DIM = 8192;
      const screenLong =
        Math.max(window.innerWidth, window.innerHeight) *
        window.devicePixelRatio;
      const target = Math.min(screenLong * 2, MAX_DIM);
      const longest = Math.max(img.naturalWidth, img.naturalHeight);
      const scale = Math.max(target / longest, 1);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context unavailable"));
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
        "image/png"
      );
    };

    img.onerror = () => reject(new Error("Failed to load SVG for rasterization"));
    img.src = dataUrl;
  });
}
