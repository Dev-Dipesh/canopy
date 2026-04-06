import type { DiagramType, OutputFormat } from "./types";

export interface DiagramTypeInfo {
  id: DiagramType;
  label: string;
}

/** All 27 supported Kroki diagram types. */
export const DIAGRAM_TYPES: DiagramTypeInfo[] = [
  { id: "plantuml", label: "PlantUML" },
  { id: "c4plantuml", label: "C4 PlantUML" },
  { id: "mermaid", label: "Mermaid" },
  { id: "graphviz", label: "Graphviz" },
  { id: "d2", label: "D2 - Dagre" },
  { id: "d2-elk", label: "D2 - ELK" },
  { id: "dbml", label: "DBML" },
  { id: "ditaa", label: "Ditaa" },
  { id: "erd", label: "ERD" },
  { id: "excalidraw", label: "Excalidraw" },
  { id: "blockdiag", label: "BlockDiag" },
  { id: "seqdiag", label: "SeqDiag" },
  { id: "actdiag", label: "ActDiag" },
  { id: "nwdiag", label: "NwDiag" },
  { id: "packetdiag", label: "PacketDiag" },
  { id: "rackdiag", label: "RackDiag" },
  { id: "bpmn", label: "BPMN" },
  { id: "bytefield", label: "Bytefield" },
  { id: "nomnoml", label: "Nomnoml" },
  { id: "pikchr", label: "Pikchr" },
  { id: "structurizr", label: "Structurizr" },
  { id: "svgbob", label: "Svgbob" },
  { id: "symbolator", label: "Symbolator" },
  { id: "tikz", label: "TikZ" },
  { id: "vega", label: "Vega" },
  { id: "vegalite", label: "Vega-Lite" },
  { id: "wavedrom", label: "WaveDrom" },
  { id: "wireviz", label: "WireViz" },
];

/**
 * SVG-only diagram types. All others default to PNG.
 * Source of truth: lib/renderer.cjs:20-30
 */
export const OUTPUT_FORMAT: Partial<Record<DiagramType, OutputFormat>> = {
  bpmn: "svg",
  bytefield: "svg",
  d2: "svg",
  "d2-elk": "svg",
  dbml: "svg",
  excalidraw: "svg",
  nomnoml: "svg",
  pikchr: "svg",
  svgbob: "svg",
  wavedrom: "svg",
};

/** Sample diagram sources for each type. */
export const SAMPLE_SOURCES: Record<DiagramType, string> = {
  plantuml: `@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response
Alice -> Bob: Another authentication Request
Alice <-- Bob: Another authentication Response
@enduml`,

  c4plantuml: `@startuml
!include <C4/C4_Container>

Person(user, "User", "A user of the system")
System_Boundary(sys, "System") {
  Container(web, "Web App", "React", "Delivers the UI")
  Container(api, "API", "Node.js", "Handles requests")
  ContainerDb(db, "Database", "PostgreSQL", "Stores data")
}

Rel(user, web, "Uses", "HTTPS")
Rel(web, api, "Calls", "JSON/HTTPS")
Rel(api, db, "Reads/Writes", "SQL")
@enduml`,

  mermaid: `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B`,

  graphviz: `digraph D {
  subgraph cluster_p {
    label = "Kroki";
    subgraph cluster_c1 {
      label = "Server";
      Filebeat;
      subgraph cluster_gc_1 {
        label = "Docker/Server";
        Java;
      }
      subgraph cluster_gc_2 {
        label = "Docker/Mermaid";
        "Node.js";
        "Puppeteer";
        "Chrome";
      }
    }
    subgraph cluster_c2 {
      label = "CLI";
      Golang;
    }
  }
}`,

  d2: `D2 Parser: {
  shape: class

  +reader: io.RuneReader
  readerPos: d2ast.Position
  -lookahead: "[]rune"

  +peek(): (r rune, eof bool)
  rewind()
  commit()
}

"github.com/terrastruct/d2parser.git" -> D2 Parser`,

  "d2-elk": `D2 Parser: {
  shape: class

  +reader: io.RuneReader
  readerPos: d2ast.Position
  -lookahead: "[]rune"

  +peek(): (r rune, eof bool)
  rewind()
  commit()
}

"github.com/terrastruct/d2parser.git" -> D2 Parser`,

  dbml: `Table users {
  id integer
  username varchar
  role varchar
  created_at timestamp
}
Table posts {
  id integer [primary key]
  title varchar
  body text [note: 'Content of the post']
  user_id integer
  status post_status
  created_at timestamp
}
Enum post_status {
  draft
  published
  private [note: 'visible via URL only']
}
Ref: posts.user_id > users.id`,

  ditaa: `      +--------+
      |        |
      |  User  |
      |        |
      +--------+
          ^
  request |
          v
  +-------------+
  |             |
  |    Kroki    |
  |             |---+
  +-------------+   |
       ^  ^         | inflate
       |  |         |
       v  +---------+
  +-------------+
  |             |
  |    Ditaa    |
  |             |----+
  +-------------+    |
             ^       | process
             |       |
             +-------+`,

  erd: `[Person]
*name
height
weight
+birth_location_id

[Location]
*id
city
state
country

Person *--1 Location`,

  excalidraw: `{
  "type": "excalidraw",
  "version": 2,
  "elements": [
    {
      "type": "rectangle",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 100,
      "strokeColor": "#1565C0",
      "backgroundColor": "#BBDEFB",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "roughness": 1,
      "opacity": 100
    }
  ]
}`,

  blockdiag: `blockdiag {
  Kroki -> generates -> "Block diagrams";
  Kroki -> is -> "very easy!";
  Kroki [color = "greenyellow"];
  "Block diagrams" [color = "pink"];
  "very easy!" [color = "orange"];
}`,

  seqdiag: `seqdiag {
  browser  -> webserver [label = "GET /seqdiag/svg/base64"];
  webserver  -> processor [label = "Convert text to image"];
  webserver <-- processor;
  browser <-- webserver;
}`,

  actdiag: `actdiag {
  write -> convert -> image
  lane user {
    label = "User"
    write [label = "Writing text"];
    image [label = "Get diagram image"];
  }
  lane Kroki {
    convert [label = "Convert text to image"];
  }
}`,

  nwdiag: `nwdiag {
  network dmz {
    address = "210.x.x.x/24"
    web01 [address = "210.x.x.1"];
    web02 [address = "210.x.x.2"];
  }
  network internal {
    address = "172.x.x.x/24";
    web01 [address = "172.x.x.1"];
    web02 [address = "172.x.x.2"];
    db01;
    db02;
  }
}`,

  packetdiag: `packetdiag {
  colwidth = 32
  node_height = 72

  0: Version [len = 4]
  4: Type [len = 4]
  8: Token [len = 24]
  32: Payload Length [len = 32]
  64: Payload Data [len = 128, color = "#7aa2f7"]
}`,

  rackdiag: `rackdiag {
  16U;
  1: UPS [2U];
  3: DB Server;
  4: Web Server 1;
  5: Web Server 2;
  6: Web Server 3;
  7: Web Server 4;
  8: Switch [color = "lightyellow"];
}`,

  bpmn: `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
             xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
             xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
             id="def" targetNamespace="http://example.com">
  <process id="p1" isExecutable="false">
    <startEvent id="start" name="Start"/>
    <task id="task1" name="Do Work"/>
    <endEvent id="end" name="End"/>
    <sequenceFlow id="f1" sourceRef="start" targetRef="task1"/>
    <sequenceFlow id="f2" sourceRef="task1" targetRef="end"/>
  </process>
  <bpmndi:BPMNDiagram id="diagram">
    <bpmndi:BPMNPlane bpmnElement="p1">
      <bpmndi:BPMNShape id="s_start" bpmnElement="start">
        <dc:Bounds x="180" y="160" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="s_task1" bpmnElement="task1">
        <dc:Bounds x="270" y="138" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="s_end" bpmnElement="end">
        <dc:Bounds x="430" y="160" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="e_f1" bpmnElement="f1">
        <di:waypoint x="216" y="178"/>
        <di:waypoint x="270" y="178"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="e_f2" bpmnElement="f2">
        <di:waypoint x="370" y="178"/>
        <di:waypoint x="430" y="178"/>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`,

  bytefield: `(defattrs :bg-green {:fill "#a0ffa0"})
(defattrs :bg-yellow {:fill "#ffffa0"})
(defattrs :bg-pink {:fill "#ffb0a0"})
(defattrs :bg-cyan {:fill "#a0fafa"})

(draw-column-headers)
(draw-box 0x00 :bg-green)
(draw-box "Type" [{:span 3} :bg-yellow])
(draw-box "Length" [{:span 4} :bg-pink])
(draw-gap "Payload" {:min-label-columns 6})
(draw-bottom)`,

  nomnoml: `[Pirate|eyeCount: Int|raid();pillage()|
  [beard]--[parrot]
  [beard]-:>[foul mouth]
]
[<abstract>Marauder]<:--[Pirate]
[Pirate]- 0..7[mischief]
[jollyness]->[Pirate]
[jollyness]->[rum]
[jollyness]->[singing]
[Pirate]-> *[rum|tastiness: Int|swig()]
[Pirate]->[singing]
[singing]<->[rum]`,

  pikchr: `$r = 0.2in
linerad = 0.75*$r
linewid = 0.25

box "element" bold fit
line down 50% from last box.sw
dot rad 250% color black
X0: last.e + (0.3,0)
arrow from last dot to X0
move right 3.9in
box wid 5% ht 25% fill black
X9: last.w - (0.3,0)
arrow from X9 to last box.w

box "object-definition" italic fit at 11/16 way between X0 and X9
arrow to X9
arrow from X0 to last box.w`,

  structurizr: `workspace {
  model {
    user = person "User"
    softwareSystem = softwareSystem "Software System" {
      webapp = container "Web Application" {
        user -> this "Uses"
      }
      database = container "Database" {
        webapp -> this "Reads from and writes to"
      }
    }
  }
  views {
    systemContext softwareSystem {
      include *
      autolayout lr
    }
    container softwareSystem {
      include *
      autolayout lr
    }
    theme default
  }
}`,

  svgbob: `       .---.
      /-o-/--
   .-/ / /->
  ( *  \/
   '-.  \\
      \\ /
       '`,

  symbolator: `module demo_device #(
  parameter SIZE = 8,
  parameter RESET_ACTIVE_LEVEL = 1
) (
  input wire clock,
  input wire reset,
  input wire enable,
  input wire [SIZE-1:0] data_in,
  output wire [SIZE-1:0] data_out
);
endmodule`,

  tikz: `\\documentclass{article}
\\usepackage{tikz}
\\usepackage[active,tightpage]{preview}
\\PreviewEnvironment{tikzpicture}
\\setlength\\PreviewBorder{0.125pt}
\\begin{document}
\\begin{tikzpicture}
  \\draw[thick,->] (0,0) -- (4,0) node[anchor=north west] {x};
  \\draw[thick,->] (0,0) -- (0,4) node[anchor=south east] {y};
  \\draw[blue,thick] (0,0) circle (2);
  \\fill[red] (1.414,1.414) circle (0.1) node[anchor=south west] {P};
\\end{tikzpicture}
\\end{document}`,

  vega: `{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "width": 400,
  "height": 200,
  "padding": 5,
  "data": [
    {
      "name": "table",
      "values": [
        {"category": "A", "amount": 28},
        {"category": "B", "amount": 55},
        {"category": "C", "amount": 43},
        {"category": "D", "amount": 91},
        {"category": "E", "amount": 81},
        {"category": "F", "amount": 53},
        {"category": "G", "amount": 19},
        {"category": "H", "amount": 87}
      ]
    }
  ],
  "scales": [
    {
      "name": "xscale",
      "type": "band",
      "domain": {"data": "table", "field": "category"},
      "range": "width",
      "padding": 0.05
    },
    {
      "name": "yscale",
      "domain": {"data": "table", "field": "amount"},
      "nice": true,
      "range": "height"
    }
  ],
  "axes": [
    {"orient": "bottom", "scale": "xscale"},
    {"orient": "left", "scale": "yscale"}
  ],
  "marks": [
    {
      "type": "rect",
      "from": {"data": "table"},
      "encode": {
        "enter": {
          "x": {"scale": "xscale", "field": "category"},
          "width": {"scale": "xscale", "band": 1},
          "y": {"scale": "yscale", "field": "amount"},
          "y2": {"scale": "yscale", "value": 0}
        },
        "update": {"fill": {"value": "steelblue"}},
        "hover": {"fill": {"value": "red"}}
      }
    }
  ]
}`,

  vegalite: `{
  "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
  "description": "A simple bar chart",
  "data": {
    "values": [
      {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
      {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
      {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "a", "type": "nominal", "axis": {"labelAngle": 0}},
    "y": {"field": "b", "type": "quantitative"}
  }
}`,

  wavedrom: `{ signal: [
  { name: "clk",         wave: "p.....|..." },
  { name: "Data",        wave: "x.345x|=.x", data: ["head", "body", "tail", "data"] },
  { name: "Request",     wave: "0.1..0|1.0" },
  {},
  { name: "Acknowledge", wave: "1.....|01." }
]}`,

  wireviz: `connectors:
  X1:
    type: D-Sub
    subtype: female
    pinlabels: [DCD, RX, TX, DTR, GND, DSR, RTS, CTS, RI]
  X2:
    type: Molex KK 254
    subtype: female
    pinlabels: [GND, RX, TX]
cables:
  W1:
    gauge: 0.25 mm2
    length: 0.2
    color_code: DIN
    wirecount: 3
    shield: true
connections:
  -
    - X1: [5,2,3]
    - W1: [1,2,3]
    - X2: [1,3,2]
  -
    - X1: 5
    - W1: s`,
};
