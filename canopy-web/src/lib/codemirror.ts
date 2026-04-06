import { StateField, type Extension, type Text } from "@codemirror/state";
import { foldService } from "@codemirror/language";
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

/**
 * Diagram types that use brace-based nesting but have no CodeMirror grammar.
 * These get the bracketFold service for folding support.
 */
const BRACE_TYPES: ReadonlySet<DiagramType> = new Set([
  "d2", "d2-elk", "plantuml", "c4plantuml", "graphviz",
  "mermaid", "blockdiag", "seqdiag", "actdiag", "nwdiag",
  "nomnoml", "structurizr", "erd",
]);

const OPEN = 0x7B; // {
const CLOSE = 0x7D; // }

/**
 * Build a map of opening brace positions to their matching closing brace.
 * The index is recomputed only when the document changes.
 */
function buildBracePairIndex(doc: Text): ReadonlyMap<number, number> {
  const bracePairs = new Map<number, number>();
  const openStack: number[] = [];
  const content = doc.sliceString(0);

  for (let pos = 0; pos < content.length; pos++) {
    const ch = content.charCodeAt(pos);
    if (ch === OPEN) {
      openStack.push(pos);
      continue;
    }
    if (ch === CLOSE) {
      const openPos = openStack.pop();
      if (openPos != null) {
        bracePairs.set(openPos, pos);
      }
    }
  }

  return bracePairs;
}

const bracePairField = StateField.define<ReadonlyMap<number, number>>({
  create(state) {
    return buildBracePairIndex(state.doc);
  },
  update(value, transaction) {
    if (!transaction.docChanged) return value;
    return buildBracePairIndex(transaction.state.doc);
  },
});

/**
 * Fold service that reads precomputed {} pairs for languages without a grammar.
 */
const bracketFold = foldService.of((state, lineStart, lineEnd) => {
  const line = state.doc.sliceString(lineStart, lineEnd);
  const braceIdx = line.indexOf("{");
  if (braceIdx === -1) return null;

  const openPos = lineStart + braceIdx;
  const closePos = state.field(bracePairField).get(openPos);
  if (closePos == null) return null;

  const foldFrom = openPos + 1;
  const startLine = state.doc.lineAt(foldFrom).number;
  const endLine = state.doc.lineAt(closePos).number;
  if (endLine <= startLine) return null;

  return { from: foldFrom, to: closePos };
});

const braceFoldExtension: Extension = [bracePairField, bracketFold];

/** Load the CodeMirror language extension for a diagram type. Returns [] for plain text. */
export async function loadLanguageExtension(
  type: DiagramType
): Promise<Extension> {
  const loader = LANG_LOADERS[type];
  if (loader) {
    try {
      return await loader();
    } catch {
      return [];
    }
  }
  // No grammar — add bracket fold for brace-based types
  if (BRACE_TYPES.has(type)) return braceFoldExtension;
  return [];
}

/** Whether the current diagram type should expose the fold gutter. */
export function supportsFolding(type: DiagramType): boolean {
  return BRACE_TYPES.has(type) || Object.prototype.hasOwnProperty.call(LANG_LOADERS, type);
}
