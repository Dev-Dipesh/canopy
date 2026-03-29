import { useState, useRef, useCallback, useEffect } from "react";
import type { DiagramType, RenderState } from "../types";
import { renderDiagram, KrokiError, parseErrorLocation } from "../lib/api";

const DEBOUNCE_MS = 600;

export function useDiagramRenderer(
  source: string,
  type: DiagramType,
  autoRender: boolean
) {
  const [state, setState] = useState<RenderState>({
    status: "idle",
    result: null,
    errorText: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const blobUrlRef = useRef<string | null>(null);

  // Revoke previous blob URL on new render
  const revokePrevBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const render = useCallback(
    async (src: string, diagramType: DiagramType) => {
      if (!src.trim()) return;

      // Abort any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState((prev) => ({ ...prev, status: "loading", errorText: null }));

      try {
        const result = await renderDiagram(src, diagramType, controller.signal);
        revokePrevBlob();
        blobUrlRef.current = URL.createObjectURL(result.blob);
        setState({
          status: result.isErrorImage ? "error" : "success",
          result,
          errorText: result.isErrorImage
            ? "Syntax error — see rendered error below"
            : null,
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof KrokiError) {
          setState({
            status: "error",
            result: null,
            errorText: err.message,
          });
        } else {
          setState({
            status: "error",
            result: null,
            errorText:
              err instanceof Error ? err.message : "Unknown render error",
          });
        }
      }
    },
    [revokePrevBlob]
  );

  const submit = useCallback(() => {
    render(source, type);
  }, [render, source, type]);

  // Auto-render with debounce
  useEffect(() => {
    if (!autoRender) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      render(source, type);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [source, type, autoRender, render]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokePrevBlob();
    };
  }, [revokePrevBlob]);

  const blobUrl = blobUrlRef.current;

  const errorLocation = state.errorText
    ? parseErrorLocation(state.errorText)
    : null;

  return { ...state, blobUrl, submit, errorLocation };
}
