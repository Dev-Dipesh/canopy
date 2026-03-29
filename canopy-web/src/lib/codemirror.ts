import type { Extension } from "@codemirror/state";
import type { DiagramType } from "../types";

/** Map diagram types to their CodeMirror language extension loader. */
const LANG_LOADERS: Partial<
  Record<DiagramType, () => Promise<Extension>>
> = {
  excalidraw: async () => {
    const { json } = await import("@codemirror/lang-json");
    return json();
  },
  vega: async () => {
    const { json } = await import("@codemirror/lang-json");
    return json();
  },
  vegalite: async () => {
    const { json } = await import("@codemirror/lang-json");
    return json();
  },
  wavedrom: async () => {
    const { json } = await import("@codemirror/lang-json");
    return json();
  },
  bpmn: async () => {
    const { xml } = await import("@codemirror/lang-xml");
    return xml();
  },
  wireviz: async () => {
    const { yaml } = await import("@codemirror/lang-yaml");
    return yaml();
  },
};

/** Load the CodeMirror language extension for a diagram type. Returns [] for plain text. */
export async function loadLanguageExtension(
  type: DiagramType
): Promise<Extension> {
  const loader = LANG_LOADERS[type];
  if (!loader) return [];
  try {
    return await loader();
  } catch {
    return [];
  }
}
