# diagram-render

Renders PlantUML diagrams to PNG using [Kroki](https://kroki.io). No local PlantUML/Java installation needed — Kroki handles rendering over HTTPS.

Zero runtime dependencies. Uses only Node.js built-ins.

## Usage

```bash
# Render all .puml files in puml/
npm run render

# Render a single file
npm run render:one -- my-diagram.puml
```

Output PNGs are written to `diagrams/` with the same base filename.

## Structure

```txt
diagram-render/
├── generate.cjs      # renderer script
├── puml/             # source diagrams (.puml)
└── diagrams/         # output PNGs (gitignored)
```

## Adding diagrams

Drop `.puml` files into `puml/` and run `npm run render`.

## Notes

- Requires internet access (calls `https://kroki.io/plantuml/png`).
- `diagrams/*.png` is gitignored — commit only source `.puml` files.
