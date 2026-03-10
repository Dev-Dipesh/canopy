#!/usr/bin/env node
/**
 * generate.cjs
 * ------------
 * CLI entry point for rendering diagram source files to PNG using Kroki.
 *
 * Supported inputs:
 *   - Individual diagram files: format detected from extension
 *   - Markdown files: fenced code blocks with a diagram language are each
 *     rendered to a sub-directory named after the .md file
 *
 * Titles (markdown mode):
 *   Add a slug after the language name on the opening fence line.
 *   The slug becomes the PNG filename. Use hyphens for multi-word titles.
 *
 *     ```plantuml user-flow
 *     ...
 *     ```
 *     → diagrams/notes/user-flow.png
 *
 *   Without a title, files are named by type and sequence: plantuml-01.png
 *
 * Usage:
 *   node generate.cjs                          # render all supported files in ./src
 *   node generate.cjs flow.puml                # render one file from the input dir
 *   node generate.cjs notes.md                 # render all diagrams inside a markdown file
 *   node generate.cjs -i ./my-diagrams         # custom input directory
 *   node generate.cjs -o ./docs/images         # custom output directory
 *   node generate.cjs -i ./arch -o ./out       # both
 *   node generate.cjs flow.puml -o ./out       # single file, custom output
 *   node generate.cjs --kroki-url <url>        # override Kroki server (skips health check)
 *   node generate.cjs --help                   # show this help
 *
 * Server selection (automatic):
 *   1. Tries local Kroki server at http://localhost:8000
 *   2. If unavailable, asks whether to fall back to https://kroki.io
 *   Use --kroki-url to override and skip this logic entirely.
 */

const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");

const {
  LOCAL_URL,
  PUBLIC_URL,
  OUTPUT_FORMAT,
  KROKI_TYPE,
  MARKDOWN_LANG,
  SUPPORTED_EXTENSIONS,
  krokiRender,
  checkLocalServer,
  collectFiles,
  renderMarkdownFile,
} = require("./lib/renderer.cjs");

function printHelp() {
  console.log(`
Usage:
  node generate.cjs [file] [options]

Arguments:
  file                 Single source file to render (looked up in input dir)

Options:
  -i, --input <dir>        Source directory   (default: ./src)
  -o, --output <dir>       Output directory   (default: ./diagrams)
  -k, --kroki-url <url>    Override Kroki server, skips health check
  -h, --help               Show this help

Server selection (automatic, when --kroki-url is not set):
  1. Tries local server at ${LOCAL_URL}
  2. If unavailable, prompts to fall back to ${PUBLIC_URL}

Supported individual file formats (auto-detected from extension):
${Object.entries(
  // Deduplicate by Kroki type for display
  Object.entries(KROKI_TYPE).reduce((acc, [ext, type]) => {
    acc[type] = acc[type] ? `${acc[type]}, ${ext}` : ext;
    return acc;
  }, {}),
)
  .map(([type, exts]) => `  ${exts.padEnd(28)} -> ${type}`)
  .join("\n")}

Markdown (.md) files:
  Fenced code blocks with a diagram language are rendered individually.
  Output goes to a sub-directory named after the .md file.

  Title syntax — add a title after the language on the opening fence.
  Quoted titles allow spaces; unquoted titles are single slugs:
    \`\`\`plantuml "User Registration Flow"  →  User Registration Flow.png
    \`\`\`plantuml user-flow                 →  user-flow.png
    \`\`\`mermaid                            →  mermaid-01.png  (fallback)

  Supported language names: ${Object.keys(MARKDOWN_LANG).join(", ")}
`);
}

function parseArgs(argv) {
  const args = { input: null, output: null, krokiUrl: null, file: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      args.help = true;
    } else if ((a === "--input" || a === "-i") && argv[i + 1]) {
      args.input = argv[++i];
    } else if ((a === "--output" || a === "-o") && argv[i + 1]) {
      args.output = argv[++i];
    } else if ((a === "--kroki-url" || a === "-k") && argv[i + 1]) {
      args.krokiUrl = argv[++i];
    } else if (!a.startsWith("-")) {
      args.file = a;
    }
  }
  return args;
}

// Prompts the user for a yes/no answer. Resolves to true only on "y" / "Y".
function askConfirm(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const defaultSrcDir = path.resolve("src");
  const defaultDiagramsDir = path.resolve("diagrams");
  const inputDir = path.resolve(args.input ?? "src");

  // Derive output dir:
  // - Explicit OUT → use it directly
  // - Custom DIR inside src/ with no OUT → mirror to matching diagrams/ subdir
  //   e.g. DIR=src/public → diagrams/public
  // - Anything else → diagrams/
  let outputDir;
  if (args.output) {
    outputDir = path.resolve(args.output);
  } else if (args.input) {
    const relFromSrc = path.relative(defaultSrcDir, inputDir);
    outputDir = relFromSrc.startsWith("..")
      ? defaultDiagramsDir
      : path.join(defaultDiagramsDir, relFromSrc);
  } else {
    outputDir = defaultDiagramsDir;
  }

  // Resolve which Kroki server to use
  let krokiUrl;
  if (args.krokiUrl) {
    krokiUrl = args.krokiUrl;
    console.log(`Kroki: ${krokiUrl} (override)`);
  } else {
    process.stdout.write(`Kroki: checking ${LOCAL_URL} ... `);
    const localUp = await checkLocalServer(LOCAL_URL);
    if (localUp) {
      krokiUrl = LOCAL_URL;
      console.log("ok");
    } else {
      console.log("unavailable");
      const fallback = await askConfirm(`Fall back to ${PUBLIC_URL}? [y/N] `);
      if (!fallback) {
        console.error(`Aborted. Start the local server with: make up`);
        process.exit(1);
      }
      krokiUrl = PUBLIC_URL;
    }
  }

  if (!fs.existsSync(inputDir)) {
    console.error(`Input directory not found: ${inputDir}`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  // Collect files to render as paths relative to inputDir.
  // Sub-directory structure is mirrored to outputDir (e.g. src/public/ → diagrams/public/).
  let relFiles;
  if (args.file) {
    const inputPath = path.resolve(args.file);  // resolve from cwd, not inputDir
    const ext = path.extname(inputPath);
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      console.error(`Unsupported extension: ${ext}\nRun --help to see supported formats.`);
      process.exit(1);
    }
    if (!fs.existsSync(inputPath)) {
      console.error(`File not found: ${inputPath}`);
      process.exit(1);
    }
    // Compute relative path from inputDir for output mirroring
    const relPath = path.relative(inputDir, inputPath);
    relFiles = [relPath];
  } else {
    relFiles = collectFiles(inputDir, inputDir);
  }

  if (relFiles.length === 0) {
    console.log(`No supported diagram files found in: ${inputDir}`);
    return;
  }

  let ok = 0;
  let failed = 0;

  for (const relPath of relFiles) {
    const ext = path.extname(relPath);
    const inputPath = path.resolve(inputDir, relPath);
    // Mirror sub-directory: src/public/flow.puml → diagrams/public/flow.png
    const relDir = path.dirname(relPath);
    const fileOutputDir = relDir === "." ? outputDir : path.join(outputDir, relDir);

    if (ext === ".md") {
      console.log(`[markdown] ${relPath}`);
      try {
        const result = await renderMarkdownFile(inputPath, fileOutputDir, krokiUrl);
        ok += result.ok;
        failed += result.failed;
        // Log each output
        for (let i = 0; i < result.outputs.length; i++) {
          const outPath = result.outputs[i];
          if (outPath) {
            console.log(`  ok  ${path.relative(process.cwd(), outPath)}`);
          }
        }
      } catch (err) {
        failed += 1;
        console.error(`  failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      const diagramType = KROKI_TYPE[ext];
      const fmt = OUTPUT_FORMAT[diagramType] ?? "png";
      const outName = `${path.basename(relPath, ext)}.${fmt}`;
      const outputPath = path.join(fileOutputDir, outName);
      fs.mkdirSync(fileOutputDir, { recursive: true });
      const source = fs.readFileSync(inputPath, "utf8");

      process.stdout.write(`[${diagramType}] ${relPath} -> ${path.join(relDir === "." ? "" : relDir, outName)} ... `);
      try {
        const data = await krokiRender(source, diagramType, krokiUrl);
        fs.writeFileSync(outputPath, data);
        ok += 1;
        console.log("ok");
      } catch (err) {
        failed += 1;
        console.log("failed");
        console.error(`  ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  console.log(`\nDone. Success: ${ok}, Failed: ${failed}`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

void main();
