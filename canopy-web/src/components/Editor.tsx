import { useRef, useEffect, useCallback } from "react";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { indentOnInput, foldGutter, foldKeymap, bracketMatching, indentUnit } from "@codemirror/language";
import type { DiagramType } from "../types";
import { loadLanguageExtension, supportsFolding } from "../lib/codemirror";
import { lightTheme, darkTheme } from "../styles/codemirror-theme";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  type: DiagramType;
  isDark: boolean;
  onSubmit: () => void;
  goToLine?: number | null;
}

export function Editor({
  value,
  onChange,
  type,
  isDark,
  onSubmit,
  goToLine,
}: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const langCompartment = useRef(new Compartment());
  const foldCompartment = useRef(new Compartment());
  const themeCompartment = useRef(new Compartment());
  const onChangeRef = useRef(onChange);
  const onSubmitRef = useRef(onSubmit);
  onChangeRef.current = onChange;
  onSubmitRef.current = onSubmit;

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const submitKeymap = keymap.of([
      {
        key: "Ctrl-Enter",
        mac: "Cmd-Enter",
        run: () => {
          onSubmitRef.current();
          return true;
        },
      },
    ]);

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        bracketMatching(),
        indentOnInput(),
        indentUnit.of("  "),
        history(),
        keymap.of([
          indentWithTab,
          ...foldKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
        ]),
        submitKeymap,
        langCompartment.current.of([]),
        foldCompartment.current.of(supportsFolding(type) ? foldGutter() : []),
        themeCompartment.current.of(isDark ? darkTheme : lightTheme),
        updateListener,
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value → editor (e.g., when switching diagram type)
  const prevValueRef = useRef(value);
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (value !== currentDoc && value !== prevValueRef.current) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      });
    }
    prevValueRef.current = value;
  }, [value]);

  // Switch language mode
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: foldCompartment.current.reconfigure(
        supportsFolding(type) ? foldGutter() : []
      ),
    });
    loadLanguageExtension(type).then((ext) => {
      view.dispatch({
        effects: langCompartment.current.reconfigure(ext),
      });
    });
  }, [type]);

  // Switch theme
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: themeCompartment.current.reconfigure(
        isDark ? darkTheme : lightTheme
      ),
    });
  }, [isDark]);

  // Go to line (from error click)
  const scrollToLine = useCallback((line: number) => {
    const view = viewRef.current;
    if (!view) return;
    const docLines = view.state.doc.lines;
    if (line < 1 || line > docLines) return;
    const lineInfo = view.state.doc.line(line);
    view.dispatch({
      selection: { anchor: lineInfo.from },
      effects: EditorView.scrollIntoView(lineInfo.from, { y: "center" }),
    });
    view.focus();
  }, []);

  useEffect(() => {
    if (goToLine != null) {
      scrollToLine(goToLine);
    }
  }, [goToLine, scrollToLine]);

  return <div ref={containerRef} className="editor-container" />;
}
