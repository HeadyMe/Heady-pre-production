// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: scripts/brand_headers.js
// LAYER: root
// 
//         _   _  _____    _  __   __
//        | | | || ____|  / \ \  / /
//        | |_| ||  _|   / _ \ \ V / 
//        |  _  || |___ / ___ \ | |  
//        |_| |_||_____/_/   \_\|_|  
// 
//    Sacred Geometry :: Organic Systems :: Breathing Interfaces
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

function bannerLines(meta) {
  const art = [
    "        _   _  _____    _  __   __",
    "       | | | || ____|  / \\ \\ \ / /",
    "       | |_| ||  _|   / _ \\ \\ V / ",
    "       |  _  || |___ / ___ \\ | |  ",
    "       |_| |_||_____/_/   \\_\\|_|  ",
    "",
    "   Sacred Geometry :: Organic Systems :: Breathing Interfaces",
  ];

  return [
    "HEADY_BRAND:BEGIN",
    "HEADY SYSTEMS :: SACRED GEOMETRY",
    `FILE: ${meta.rel}`,
    `LAYER: ${meta.layer}`,
    "",
    ...art,
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

function main() {
  const args = parseArgs(process.argv);
  const mode = args.fix ? "fix" : "check";

  const files = [];
  if (args.staged) {
    try {
      files.push(...getStagedFiles());
    } catch {
      process.stderr.write("[brand_headers] Failed to read staged files; falling back to full scan.\n");
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

  let changedCount = 0;
  let checkedCount = 0;
  const changedFiles = [];

  for (const f of eligible) {
    const res = brandFile(f, mode);
    if (!res.eligible) continue;
    checkedCount += 1;
    if (res.changed) {
      changedCount += 1;
      changedFiles.push(toPosixRelative(f));
    }
  }

  if (args.verbose) {
    for (const f of changedFiles) process.stdout.write(`${f}\n`);
  }

  if (mode === "check") {
    if (changedCount > 0) {
      process.stderr.write(`\n[brand_headers] Missing or outdated branding headers in ${changedCount} file(s).\n`);
      process.stderr.write("[brand_headers] Run: npm run brand:fix\n\n");
      process.exit(1);
    }
    process.stdout.write(`[brand_headers] OK. Checked ${checkedCount} file(s).\n`);
    return;
  }

  process.stdout.write(`[brand_headers] Updated ${changedCount} file(s) (checked ${checkedCount}).\n`);
}

main();
