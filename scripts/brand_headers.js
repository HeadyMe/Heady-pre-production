// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║
// ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║
// ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║
// ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║
// ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║
// ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║
// ║                                                                  ║
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
// ║  FILE: scripts/brand_headers.js                                   ║
// ║  LAYER: root                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const REPO_ROOT = path.resolve(__dirname, "..");

const MAX_BYTES = 1_000_000;

const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "venv",
  ".venv",
  "__pycache__",
  ".pytest_cache",
]);

const SKIP_EXTS = new Set([
  ".json",
  ".lock",
  ".ipynb",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".pdf",
  ".zip",
  ".gz",
  ".tar",
  ".exe",
  ".dll",
]);

const EXT_STYLE = new Map([
  [".js", "line"],
  [".jsx", "line"],
  [".ts", "line"],
  [".tsx", "line"],
  [".cjs", "line"],
  [".mjs", "line"],
  [".py", "hash"],
  [".ps1", "hash"],
  [".sh", "hash"],
  [".yml", "hash"],
  [".yaml", "hash"],
  [".md", "html"],
]);

function commentStyleForPath(filePath) {
  const rel = toPosixRelative(filePath);
  const base = path.basename(rel);
  const ext = path.extname(base).toLowerCase();

  if (base === "Dockerfile") return "hash";
  if (base === ".gitignore" || base === ".gitattributes") return "hash";
  if (base === "requirements.txt") return "hash";
  if (base.startsWith(".env")) return "hash";
  if (base.startsWith("docker-compose") && (ext === ".yml" || ext === ".yaml")) return "hash";
  if (base === "render.yaml" || base === "render.yml") return "hash";

  return EXT_STYLE.get(ext);
}

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    fix: args.has("--fix"),
    check: args.has("--check"),
    staged: args.has("--staged"),
    verbose: args.has("--verbose"),
  };
}

function isEncodingCookie(line) {
  return /^#.*coding[:=]\s*[-\w.]+/.test(line);
}

function getStagedFiles() {
  const out = execSync("git diff --cached --name-only --diff-filter=ACMR", {
    cwd: REPO_ROOT,
    stdio: ["ignore", "pipe", "ignore"],
    encoding: "utf8",
  });
  return out
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => path.resolve(REPO_ROOT, p));
}

function walk(dir, acc) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      walk(path.join(dir, ent.name), acc);
      continue;
    }

    const full = path.join(dir, ent.name);
    acc.push(full);
  }
}

function toPosixRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join("/");
}

// ─── ANSI Color Helpers ───────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  red: "\x1b[31m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  bgCyan: "\x1b[46m",
  bgMagenta: "\x1b[45m",
};

function bannerLines(meta) {
  return [
    "HEADY_BRAND:BEGIN",
    "\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557",
    "\u2551  \u2588\u2557  \u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2557   \u2588\u2557                     \u2551",
    "\u2551  \u2588\u2551  \u2588\u2551\u2588\u2554\u2550\u2550\u2550\u2550\u255d\u2588\u2554\u2550\u2550\u2588\u2557\u2588\u2554\u2550\u2550\u2588\u2557\u255a\u2588\u2557 \u2588\u2554\u255d                     \u2551",
    "\u2551  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2551  \u2588\u2551 \u255a\u2588\u2588\u2588\u2588\u2554\u255d                      \u2551",
    "\u2551  \u2588\u2554\u2550\u2550\u2588\u2551\u2588\u2554\u2550\u2550\u255d  \u2588\u2554\u2550\u2550\u2588\u2551\u2588\u2551  \u2588\u2551  \u255a\u2588\u2554\u255d                       \u2551",
    "\u2551  \u2588\u2551  \u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2551  \u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d   \u2588\u2551                        \u2551",
    "\u2551  \u255a\u2550\u255d  \u255a\u2550\u255d\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u255d\u255a\u2550\u255d  \u255a\u2550\u255d\u255a\u2550\u2550\u2550\u2550\u2550\u255d    \u255a\u2550\u255d                        \u2551",
    "\u2551                                                                  \u2551",
    "\u2551  \u221e SACRED GEOMETRY \u221e  Organic Systems \u00b7 Breathing Interfaces    \u2551",
    "\u2551  \u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501  \u2551",
    `\u2551  FILE: ${meta.rel.padEnd(59)}\u2551`,
    `\u2551  LAYER: ${meta.layer.padEnd(58)}\u2551`,
    "\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d",
    "HEADY_BRAND:END",
  ];
}

function layerFromPath(rel) {
  const p = rel.toLowerCase();
  if (p.startsWith("public/")) return "ui/public";
  if (p.startsWith("frontend/")) return "ui/frontend";
  if (p.startsWith("backend/")) return "backend";
  if (p.startsWith("src/")) return "backend/src";
  if (p.startsWith("tests/")) return "tests";
  if (p.startsWith("docs/")) return "docs";
  return "root";
}

function commentWrap(lines, style) {
  if (style === "line") return lines.map((l) => `// ${l}`);
  if (style === "hash") return lines.map((l) => `# ${l}`);
  if (style === "html") return [`<!-- ${lines[0]} -->`, ...lines.slice(1, -1).map((l) => `<!-- ${l} -->`), `<!-- ${lines[lines.length - 1]} -->`];
  throw new Error(`Unsupported comment style: ${style}`);
}

function extractExistingBlock(lines, style) {
  const beginToken = style === "html" ? "HEADY_BRAND:BEGIN" : "HEADY_BRAND:BEGIN";
  const endToken = style === "html" ? "HEADY_BRAND:END" : "HEADY_BRAND:END";

  let begin = -1;
  let end = -1;
  for (let i = 0; i < Math.min(lines.length, 200); i++) {
    const raw = lines[i];
    const s = raw.replace(/^\s*(\/\/|#|<!--)\s?/, "").replace(/\s*(-->)\s*$/, "").trim();
    if (begin === -1 && s === beginToken) begin = i;
    if (begin !== -1 && s === endToken) {
      end = i;
      break;
    }
  }
  if (begin !== -1 && end !== -1 && end >= begin) return { begin, end };
  return null;
}

function insertIndexForPython(lines) {
  let idx = 0;
  if (lines[0] && lines[0].startsWith("#!")) idx = 1;
  if (lines[idx] && isEncodingCookie(lines[idx])) idx += 1;
  else if (idx === 1 && lines[1] && isEncodingCookie(lines[1])) idx = 2;
  return idx;
}

function insertIndexForShebang(lines) {
  if (lines[0] && lines[0].startsWith("#!")) return 1;
  return 0;
}

function isMinified(filename) {
  return filename.endsWith(".min.js") || filename.endsWith(".map");
}

function shouldSkipFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (SKIP_EXTS.has(ext)) return true;
  if (!commentStyleForPath(filePath)) return true;
  if (isMinified(filePath.toLowerCase())) return true;

  const st = fs.statSync(filePath);
  if (st.size > MAX_BYTES) return true;
  return false;
}

function brandFile(filePath, mode) {
  const ext = path.extname(filePath).toLowerCase();
  const style = commentStyleForPath(filePath);
  if (!style) return { changed: false, eligible: false, reason: "unsupported" };

  const raw = fs.readFileSync(filePath);
  let text = raw.toString("utf8");
  const originalText = text;
  const eol = text.includes("\r\n") ? "\r\n" : "\n";

  let bom = "";
  if (text.charCodeAt(0) === 0xfeff) {
    bom = "\ufeff";
    text = text.slice(1);
  }

  const lines = text.split(/\r\n|\n/);

  const rel = toPosixRelative(filePath);
  const meta = { rel, layer: layerFromPath(rel) };

  const existing = extractExistingBlock(lines, style);

  const banner = commentWrap(bannerLines(meta), style);

  let insertAt = 0;
  if (ext === ".py") insertAt = insertIndexForPython(lines);
  else if (ext === ".sh") insertAt = insertIndexForShebang(lines);

  let newLines;
  if (existing) {
    let restStart = existing.end + 1;
    while (restStart < lines.length && lines[restStart] === "") restStart += 1;
    const rest = lines.slice(restStart);
    const spacer = rest.length > 0 ? [""] : [];
    newLines = [...lines.slice(0, existing.begin), ...banner, ...spacer, ...rest];
  } else {
    let restStart = insertAt;
    while (restStart < lines.length && lines[restStart] === "") restStart += 1;
    const rest = lines.slice(restStart);
    const spacer = rest.length > 0 ? [""] : [];
    newLines = [...lines.slice(0, insertAt), ...banner, ...spacer, ...rest];
  }

  const newText = bom + newLines.join(eol);

  if (newText === bom + originalText.replace(/^\ufeff/, "")) return { changed: false, eligible: true };

  if (mode === "check") return { changed: true, eligible: true };

  fs.writeFileSync(filePath, newText, "utf8");
  return { changed: true, eligible: true };
}

function printBanner() {
  const w = C.white, c = C.cyan, m = C.magenta, g = C.green, y = C.yellow, r = C.reset, b = C.bold, d = C.dim;
  process.stdout.write(`\n`);
  process.stdout.write(`${c}${b}  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557${r}\n`);
  process.stdout.write(`${c}${b}  \u2551${r}${m}  \u2588\u2557  \u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2557   \u2588\u2557  ${r}${c}${b}                   \u2551${r}\n`);
  process.stdout.write(`${c}${b}  \u2551${r}${m}  \u2588\u2551  \u2588\u2551\u2588\u2554\u2550\u2550\u2550\u2550\u255d\u2588\u2554\u2550\u2550\u2588\u2557\u2588\u2554\u2550\u2550\u2588\u2557\u255a\u2588\u2557 \u2588\u2554\u255d  ${r}${c}${b}                   \u2551${r}\n`);
  process.stdout.write(`${c}${b}  \u2551${r}${m}  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2551  \u2588\u2551 \u255a\u2588\u2588\u2588\u2588\u2554\u255d   ${r}${c}${b}                   \u2551${r}\n`);
  process.stdout.write(`${c}${b}  \u2551${r}${m}  \u2588\u2554\u2550\u2550\u2588\u2551\u2588\u2554\u2550\u2550\u255d  \u2588\u2554\u2550\u2550\u2588\u2551\u2588\u2551  \u2588\u2551  \u255a\u2588\u2554\u255d    ${r}${c}${b}                   \u2551${r}\n`);
  process.stdout.write(`${c}${b}  \u2551${r}${m}  \u2588\u2551  \u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2551  \u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d   \u2588\u2551     ${r}${c}${b}                   \u2551${r}\n`);
  process.stdout.write(`${c}${b}  \u2551${r}${m}  \u255a\u2550\u255d  \u255a\u2550\u255d\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u255d\u255a\u2550\u255d  \u255a\u2550\u255d\u255a\u2550\u2550\u2550\u2550\u2550\u255d    \u255a\u2550\u255d     ${r}${c}${b}                   \u2551${r}\n`);
  process.stdout.write(`${c}${b}  \u2551${r}${y}  \u221e SACRED GEOMETRY \u221e  ${d}Branding Protocol${r}${c}${b}                       \u2551${r}\n`);
  process.stdout.write(`${c}${b}  \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d${r}\n`);
  process.stdout.write(`\n`);
}

function main() {
  const args = parseArgs(process.argv);
  const mode = args.fix ? "fix" : "check";

  printBanner();

  const files = [];
  if (args.staged) {
    try {
      files.push(...getStagedFiles());
    } catch {
      process.stderr.write(`${C.yellow}  \u25c6 Staged file read failed; falling back to full scan.${C.reset}\n`);
      walk(REPO_ROOT, files);
    }
  } else {
    walk(REPO_ROOT, files);
  }

  const eligible = [];
  for (const f of files) {
    const rel = toPosixRelative(f);
    if (rel.startsWith(".git/")) continue;

    if (shouldSkipFile(f)) continue;

    eligible.push(f);
  }

  process.stdout.write(`${C.dim}  Scanning ${eligible.length} eligible files...${C.reset}\n\n`);

  let changedCount = 0;
  let checkedCount = 0;
  const changedFiles = [];

  for (const f of eligible) {
    const res = brandFile(f, mode);
    if (!res.eligible) continue;
    checkedCount += 1;
    if (res.changed) {
      changedCount += 1;
      const rel = toPosixRelative(f);
      changedFiles.push(rel);
      if (mode === "fix") {
        process.stdout.write(`  ${C.green}\u2713${C.reset} ${C.white}${rel}${C.reset}\n`);
      } else {
        process.stdout.write(`  ${C.yellow}\u25c6${C.reset} ${C.white}${rel}${C.reset} ${C.yellow}(needs branding)${C.reset}\n`);
      }
    } else if (args.verbose) {
      process.stdout.write(`  ${C.gray}\u25cb ${toPosixRelative(f)}${C.reset}\n`);
    }
  }

  process.stdout.write(`\n`);
  process.stdout.write(`${C.cyan}  \u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501${C.reset}\n`);

  if (mode === "check") {
    if (changedCount > 0) {
      process.stdout.write(`  ${C.red}${C.bold}\u2717 BRAND CHECK FAILED${C.reset}  ${C.yellow}${changedCount}${C.reset} file(s) missing/outdated branding\n`);
      process.stdout.write(`  ${C.dim}Run: ${C.cyan}npm run brand:fix${C.reset}\n\n`);
      process.exit(1);
    }
    process.stdout.write(`  ${C.green}${C.bold}\u2713 ALL BRANDED${C.reset}  ${C.white}${checkedCount}${C.reset} files verified ${C.green}\u221e${C.reset}\n\n`);
    return;
  }

  if (changedCount > 0) {
    process.stdout.write(`  ${C.green}${C.bold}\u2713 BRANDED${C.reset}  ${C.magenta}${changedCount}${C.reset} file(s) updated ${C.dim}(${checkedCount} checked)${C.reset} ${C.green}\u221e${C.reset}\n\n`);
  } else {
    process.stdout.write(`  ${C.green}${C.bold}\u2713 ALL CURRENT${C.reset}  ${C.white}${checkedCount}${C.reset} files already branded ${C.green}\u221e${C.reset}\n\n`);
  }
}

main();
