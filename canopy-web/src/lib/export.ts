import type { OutputFormat } from "../types";

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
