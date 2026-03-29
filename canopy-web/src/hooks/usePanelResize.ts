import { useCallback, useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";

const MIN_PCT = 20;
const MAX_PCT = 80;

export function usePanelResize() {
  const [panelWidth, setPanelWidth] = useLocalStorage("panelWidth", 50);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const startX = e.clientX;
      const startWidth = panelWidth;
      const containerWidth = container.getBoundingClientRect().width;

      const onMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const deltaPct = (dx / containerWidth) * 100;
        const next = Math.min(MAX_PCT, Math.max(MIN_PCT, startWidth + deltaPct));
        setPanelWidth(Math.round(next));
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [panelWidth, setPanelWidth]
  );

  return { panelWidth, containerRef, onDragStart };
}
