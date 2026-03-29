import { useCallback, useRef } from "react";
import type { DiagramType } from "../types";
import { SAMPLE_SOURCES } from "../constants";
import { useLocalStorage } from "./useLocalStorage";

type SourceMap = Partial<Record<DiagramType, string>>;

/**
 * Stores editor source per diagram type.
 * Returns the current source for the active type and a setter.
 */
export function usePerTypeSource(type: DiagramType) {
  const [map, setMap] = useLocalStorage<SourceMap>("sources", {});
  const mapRef = useRef(map);
  mapRef.current = map;

  const source = map[type] ?? SAMPLE_SOURCES[type];

  const setSource = useCallback(
    (value: string) => {
      setMap((prev) => ({ ...prev, [type]: value }));
    },
    [type, setMap]
  );

  return [source, setSource] as const;
}
