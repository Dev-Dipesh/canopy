import { useState, useCallback, useRef, useEffect } from "react";
import type { DiagramType, OutputFormat } from "./types";
import { DIAGRAM_TYPES, OUTPUT_FORMAT, SAMPLE_SOURCES } from "./constants";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { usePerTypeSource } from "./hooks/usePerTypeSource";
import { useTheme } from "./hooks/useTheme";
import { useDiagramRenderer } from "./hooks/useDiagramRenderer";
import { usePanelResize } from "./hooks/usePanelResize";
import { saveToGallery } from "./lib/export";
import { Toolbar } from "./components/Toolbar";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";
import { Divider } from "./components/Divider";
import { FullscreenModal } from "./components/FullscreenModal";
import { StatusBar } from "./components/StatusBar";

function getLabel(id: DiagramType): string {
  return DIAGRAM_TYPES.find((d) => d.id === id)?.label ?? id;
}

export default function App() {
  const [type, setType] = useLocalStorage<DiagramType>("type", "plantuml");
  const [source, setSource] = usePerTypeSource(type);
  const [autoRender, setAutoRender] = useLocalStorage("autoRender", false);
  const [fullscreen, setFullscreen] = useState(false);
  const [goToLine, setGoToLine] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const theme = useTheme();
  const { panelWidth, containerRef, onDragStart } = usePanelResize();
  const renderer = useDiagramRenderer(source, type, autoRender);

  const handleTypeChange = useCallback(
    (newType: DiagramType) => {
      const edited = source !== SAMPLE_SOURCES[type];
      setType(newType);
      if (edited) {
        clearTimeout(toastTimer.current);
        setToast(`${getLabel(type)} diagram saved`);
        toastTimer.current = setTimeout(() => setToast(null), 2000);
      }
    },
    [type, source, setType]
  );

  useEffect(() => {
    return () => clearTimeout(toastTimer.current);
  }, []);

  const handleErrorLineClick = useCallback((line: number) => {
    setGoToLine(line);
    // Reset after a tick so clicking the same line again works
    setTimeout(() => setGoToLine(null), 50);
  }, []);

  const handleSaveToGallery = useCallback(async () => {
    const blob = renderer.result?.blob;
    const fmt = renderer.result?.format;
    if (!blob || !fmt) return;

    const title = window.prompt("Diagram title (optional):");
    if (title === null) return; // cancelled

    try {
      const { galleryUrl } = await saveToGallery(blob, fmt, source, type, title);
      clearTimeout(toastTimer.current);
      setToast(`Saved to gallery`);
      toastTimer.current = setTimeout(() => setToast(null), 3000);
      window.open(galleryUrl, "_blank");
    } catch (err) {
      clearTimeout(toastTimer.current);
      setToast(`Gallery save failed: ${err instanceof Error ? err.message : err}`);
      toastTimer.current = setTimeout(() => setToast(null), 4000);
    }
  }, [renderer.result, source, type]);

  const format: OutputFormat = OUTPUT_FORMAT[type] ?? "png";

  return (
    <div className="app">
      <Toolbar
        type={type}
        onTypeChange={handleTypeChange}
        autoRender={autoRender}
        onAutoRenderChange={setAutoRender}
        onSubmit={renderer.submit}
        themeMode={theme.mode}
        onThemeCycle={theme.cycle}
        resultBlob={renderer.result?.blob ?? null}
        resultFormat={renderer.result?.format ?? null}
        onSaveToGallery={handleSaveToGallery}
      />

      <div
        className="panels"
        ref={containerRef}
        style={{
          gridTemplateColumns: `${panelWidth}% 6px 1fr`,
        }}
      >
        <Editor
          value={source}
          onChange={setSource}
          type={type}
          isDark={theme.resolved === "dark"}
          onSubmit={renderer.submit}
          goToLine={goToLine}
        />
        <Divider onDragStart={onDragStart} />
        <Preview
          status={renderer.status}
          result={renderer.result}
          blobUrl={renderer.blobUrl}
          errorText={renderer.errorText}
          onFullscreen={() => setFullscreen(true)}
          onErrorLineClick={handleErrorLineClick}
        />
      </div>

      <StatusBar
        status={renderer.status}
        duration={renderer.result?.duration ?? null}
        format={renderer.result?.format ?? format}
        errorText={renderer.errorText}
      />

      {fullscreen && renderer.blobUrl && renderer.result && (
        <FullscreenModal
          blobUrl={renderer.blobUrl}
          format={renderer.result.format}
          onClose={() => setFullscreen(false)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
