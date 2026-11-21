#!/usr/bin/env node
/**
 * scripts/strip-inline-comments.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, extname, resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const WORKSPACE_ROOT = pathResolve(dirname(fileURLToPath(import.meta.url)), "..");
const ts = require(tryResolve(WORKSPACE_ROOT) ?? "typescript");

function tryResolve(repoRoot) {
  try {
    return require.resolve(join(repoRoot, "node_modules/typescript"));
  } catch {
    return null;
  }
}

const DIRECTIVE_ALLOWLIST = [
  /^@ts-ignore\b/,
  /^@ts-expect-error\b/,
  /^@ts-check\b/,
  /^@ts-nocheck\b/,
  /eslint-disable/,
  /eslint-enable/,
  /-next-line\b/,
  /prettier-ignore\b/,
  /@jest-environment\b/,
  /istanbul\b/,
  /@coverage\b/,
  /coverage ignore/i,
  /sourceMappingURL=/,
];

function isDirective(text) {
  const t = text.replace(/^[/*\s]+/, "").trim();
  if (t.startsWith("!")) return true;
  return DIRECTIVE_ALLOWLIST.some((re) => re.test(t) || re.test(text));
}

function commentRanges(source, fileName, jsx) {
  const sf = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    jsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  const byStart = new Map();
  const GAP_COMMENT_RE = /\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;
  const addGap = (gapStart, gapEnd) => {
    if (gapEnd <= gapStart) return;
    const gap = source.slice(gapStart, gapEnd);
    GAP_COMMENT_RE.lastIndex = 0;
    let m;
    while ((m = GAP_COMMENT_RE.exec(gap)) !== null) {
      byStart.set(gapStart + m.index, {
        start: gapStart + m.index,
        end: gapStart + GAP_COMMENT_RE.lastIndex,
        kind: m[0].startsWith("//") ? "single" : "multi",
        text: m[0],
      });
    }
  };
  const firstCodePos = sf.statements.length > 0 ? sf.statements[0].getStart(sf) : source.length;
  const visit = (node) => {
    addGap(node.getFullStart(), node.getStart(sf));
    for (const child of node.getChildren(sf)) visit(child);
  };
  visit(sf);
  addGap(sf.endOfFileToken.getFullStart(), sf.endOfFileToken.getStart());
  if (jsx) {
    const visitJsx = (node) => {
      if (ts.SyntaxKind.JsxExpression === node.kind && node.expression === undefined) {
        byStart.set(node.getStart(sf), {
          start: node.getStart(sf),
          end: node.getEnd(),
          kind: "jsx",
          text: "",
        });
      }
      for (const child of node.getChildren(sf)) visitJsx(child);
    };
    visitJsx(sf);
  }
  return { ranges: [...byStart.values()], firstCodePos };
}

function extendToOwnLine(source, range) {
  const lineStart = source.lastIndexOf("\n", range.start) + 1;
  const codeBefore = source.slice(lineStart, range.start);
  if (!/^\s*$/.test(codeBefore)) return range;
  const nl = source.indexOf("\n", range.end);
  const lineEnd = nl === -1 ? source.length : nl;
  const codeAfter = source.slice(range.end, lineEnd);
  if (!/^\s*$/.test(codeAfter)) return range;
  return { ...range, start: lineStart, end: Math.min(lineEnd + 1, source.length) };
}

export function stripComments(source, options = {}) {
  const jsx = options.jsx === true;
  const filePath = options.filePath ?? "input.tsx";
  const { ranges, firstCodePos } = commentRanges(source, filePath, jsx);

  const removals = [];
  let removed = 0;
  for (const r of ranges) {
    const isTop = r.start < firstCodePos;
    if (isTop || isDirective(r.text)) continue;
    removals.push(extendToOwnLine(source, r));
    removed += 1;
  }

  removals.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged = [];
  for (const r of removals) {
    const prev = merged[merged.length - 1];
    if (prev && r.start <= prev.end) prev.end = Math.max(prev.end, r.end);
    else merged.push({ ...r });
  }

  let text = "";
  let cursor = 0;
  for (const r of merged) {
    text += source.slice(cursor, r.start);
    cursor = r.end;
  }
  text += source.slice(cursor);

  text = text
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  return { text, changed: text !== source, removed };
}

const EXCLUDED_DIR_PARTS = ["node_modules", "dist", "coverage", ".expo", "Pods", ".git", ".husky"];

function collectFiles(targetPath, out) {
  const st = statSync(targetPath);
  if (st.isFile()) {
    out.push(targetPath);
    return;
  }
  for (const entry of readdirSync(targetPath)) {
    if (EXCLUDED_DIR_PARTS.some((p) => p === entry)) continue;
    const full = join(targetPath, entry);
    const est = statSync(full);
    if (est.isDirectory()) collectFiles(full, out);
    else {
      const ext = extname(entry);
      if (ext === ".ts" || ext === ".tsx") out.push(full);
    }
  }
}

function main(argv) {
  const args = argv.slice(2);
  const write = args.includes("--write");
  const dryRun = args.includes("--dry-run") || !write;
  const targets = args.filter((a) => !a.startsWith("--"));
  if (targets.length === 0) {
    console.error("usage: node scripts/strip-inline-comments.mjs [--write] <dir-or-file...>");
    process.exit(2);
  }
  const files = [];
  for (const t of targets) {
    const resolved = pathResolve(t);
    if (!statSync(resolved).isFile()) collectFiles(resolved, files);
    else files.push(resolved);
  }
  files.sort();
  let totalRemoved = 0;
  let changedFiles = 0;
  for (const f of files) {
    if (!/\.(ts|tsx)$/.test(f)) continue;
    const source = readFileSync(f, "utf8");
    const { text, changed, removed } = stripComments(source, {
      jsx: f.endsWith(".tsx"),
      filePath: f,
    });
    if (!changed) continue;
    changedFiles += 1;
    totalRemoved += removed;
    if (write) writeFileSync(f, text);
    const rel = f.replace(process.cwd() + "/", "");
    console.log(`${dryRun ? "WOULD-CHANGE" : "CHANGED"} ${rel} (${removed} comment ranges)`);
  }
  console.log(
    `\n${dryRun ? "dry-run" : "written"}: ${changedFiles} files, ${totalRemoved} comment ranges`
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === pathResolve(process.argv[1])) {
  main(process.argv);
}
