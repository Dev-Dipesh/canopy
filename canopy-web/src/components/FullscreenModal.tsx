import { useEffect, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface FullscreenModalProps {
  blobUrl: string;
  format: "png" | "svg";
  onClose: () => void;
}

/**
 * Rasterize an SVG blob URL to a high-res PNG data URL so that
 * zoom/pan operates on a bitmap instead of re-rasterizing the SVG
 * on every frame.
 *
 * SVG blob URLs taint the canvas, so we fetch the SVG as text and
 * re-load it as a data: URL which keeps the canvas exportable.
 */
function useSvgRasterized(blobUrl: string, format: "png" | "svg"): string | null {
  const [rasterUrl, setRasterUrl] = useState<string | null>(null);

  useEffect(() => {
    if (format !== "svg") {
      setRasterUrl(blobUrl);
      return;
    }

    let cancelled = false;

    fetch(blobUrl)
      .then((r) => r.text())
      .then((svgText) => {
        if (cancelled) return;

        // Load SVG as a data URL to avoid tainting the canvas
        const dataUrl =
          "data:image/svg+xml;charset=utf-8," +
          encodeURIComponent(svgText);

        const img = new Image();

        img.onload = () => {
          if (cancelled) return;

          // Scale so the longest side fills at least 2x the viewport,
          // giving crisp text at 1:1 and decent quality up to ~2x zoom.
          // Cap at 8192px to stay within browser canvas limits.
          const MAX_DIM = 8192;
          const screenLong = Math.max(window.innerWidth, window.innerHeight) * window.devicePixelRatio;
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
            setRasterUrl(blobUrl);
            return;
          }

          ctx.drawImage(img, 0, 0, w, h);
          setRasterUrl(canvas.toDataURL("image/png"));
        };

        img.onerror = () => {
          if (!cancelled) setRasterUrl(blobUrl);
        };

        img.src = dataUrl;
      })
      .catch(() => {
        if (!cancelled) setRasterUrl(blobUrl);
      });

    return () => { cancelled = true; };
  }, [blobUrl, format]);

  return rasterUrl;
}

export function FullscreenModal({
  blobUrl,
  format,
  onClose,
}: FullscreenModalProps) {
  const imgSrc = useSvgRasterized(blobUrl, format);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fullscreen-overlay" onClick={onClose}>
      <div
        className="fullscreen-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="fullscreen-close" onClick={onClose}>
          &times;
        </button>
        {imgSrc ? (
          <TransformWrapper
            initialScale={1}
            minScale={0.1}
            maxScale={10}
            doubleClick={{ mode: "reset" }}
          >
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <img
                src={imgSrc}
                alt="Fullscreen diagram"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
                draggable={false}
              />
            </TransformComponent>
          </TransformWrapper>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", color: "#888" }}>
            Preparing image…
          </div>
        )}
        <div className="fullscreen-hint">
          Scroll to zoom · Drag to pan · Double-click to reset · Esc to close
        </div>
      </div>
    </div>
  );
}
