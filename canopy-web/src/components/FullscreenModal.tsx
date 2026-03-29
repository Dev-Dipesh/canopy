import { useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface FullscreenModalProps {
  blobUrl: string;
  format: "png" | "svg";
  onClose: () => void;
}

export function FullscreenModal({
  blobUrl,
  onClose,
}: FullscreenModalProps) {
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
              src={blobUrl}
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
        <div className="fullscreen-hint">
          Scroll to zoom · Drag to pan · Double-click to reset · Esc to close
        </div>
      </div>
    </div>
  );
}

