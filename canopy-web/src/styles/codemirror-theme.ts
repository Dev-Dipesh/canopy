import { EditorView } from "@codemirror/view";

export const lightTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#ffffff",
      color: "#1a202c",
      height: "100%",
    },
    ".cm-content": {
      caretColor: "#1565C0",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      fontSize: "13px",
    },
    ".cm-cursor": {
      borderLeftColor: "#1565C0",
    },
    ".cm-activeLine": {
      backgroundColor: "#f0f4ff",
    },
    ".cm-selectionMatch": {
      backgroundColor: "#d7e4f7",
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "#b4d5fe",
    },
    ".cm-gutters": {
      backgroundColor: "#f8f9fa",
      color: "#6b7280",
      borderRight: "1px solid #e5e7eb",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#e8ecf4",
      color: "#1a202c",
    },
    "&.cm-focused .cm-matchingBracket": {
      backgroundColor: "#d7e4f7",
      outline: "1px solid #93b4e0",
    },
    "&.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "#fdd",
      outline: "1px solid #e88",
    },
    ".cm-foldGutter .cm-gutterElement": {
      cursor: "pointer",
      color: "#6b7280",
    },
  },
  { dark: false }
);

export const darkTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#1a1b26",
      color: "#c0caf5",
      height: "100%",
    },
    ".cm-content": {
      caretColor: "#7aa2f7",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      fontSize: "13px",
    },
    ".cm-cursor": {
      borderLeftColor: "#7aa2f7",
    },
    ".cm-activeLine": {
      backgroundColor: "#24283b",
    },
    ".cm-selectionMatch": {
      backgroundColor: "#3b4261",
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "#364a82",
    },
    ".cm-gutters": {
      backgroundColor: "#1a1b26",
      color: "#565f89",
      borderRight: "1px solid #292e42",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#24283b",
      color: "#c0caf5",
    },
    "&.cm-focused .cm-matchingBracket": {
      backgroundColor: "#3b4261",
      outline: "1px solid #7aa2f7",
    },
    "&.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "#4a2030",
      outline: "1px solid #f7768e",
    },
    ".cm-foldGutter .cm-gutterElement": {
      cursor: "pointer",
      color: "#565f89",
    },
  },
  { dark: true }
);
