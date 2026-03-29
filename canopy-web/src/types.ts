export type DiagramType =
  | "plantuml"
  | "c4plantuml"
  | "mermaid"
  | "graphviz"
  | "d2"
  | "dbml"
  | "ditaa"
  | "erd"
  | "excalidraw"
  | "blockdiag"
  | "seqdiag"
  | "actdiag"
  | "nwdiag"
  | "packetdiag"
  | "rackdiag"
  | "bpmn"
  | "bytefield"
  | "nomnoml"
  | "pikchr"
  | "structurizr"
  | "svgbob"
  | "symbolator"
  | "tikz"
  | "vega"
  | "vegalite"
  | "wavedrom"
  | "wireviz";

export type OutputFormat = "png" | "svg";

export type ThemeMode = "light" | "dark" | "system";

export interface RenderResult {
  blob: Blob;
  format: OutputFormat;
  duration: number;
  isErrorImage: boolean;
  errorText?: string;
}

export interface RenderState {
  status: "idle" | "loading" | "success" | "error";
  result: RenderResult | null;
  errorText: string | null;
}
