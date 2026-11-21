#!/usr/bin/env node
/**
 * scripts/check-symmetry.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { stripComments } from "./strip-inline-comments.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

let hasErrors = false;
const errors = [];
const warnings = [];

function error(ruleId, message) {
  hasErrors = true;
  errors.push(`❌ [${ruleId}] ${message}`);
}

function isTestOrMockFile(file) {
  return (
    file.includes(".test.") ||
    file.includes(".spec.") ||
    file.includes("__mocks__") ||
    file.includes("/test/") ||
    file.includes("setupTests")
  );
}

function getFiles(
  dir,
  extensions = [".ts", ".tsx"],
  ignorePatterns = ["node_modules", "dist", ".expo"]
) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (ignorePatterns.some((pattern) => entry.name.includes(pattern))) continue;
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }

  traverse(dir);
  return results;
}

const presentationFiles = getFiles(path.join(rootDir, "src", "presentation"));

for (const file of presentationFiles) {
  if (isTestOrMockFile(file)) continue;
  const content = fs.readFileSync(file, "utf8");
  const loc = content.split("\n").length;
  const relPath = path.relative(rootDir, file);
  if (loc > 300) {
    error("SYM-FILE-05", `Presentation file exceeds 300 LOC (${loc} lines): ${relPath}`);
  }
  if (/React\.FC\b|<FC\b|:\s*FC\b/.test(content)) {
    error("SYM-COMP-01", `Contains React.FC or FC type annotation: ${relPath}`);
  }
  if (/import\s+{[^}]*TouchableOpacity[^}]*}\s+from\s+["']react-native["']/.test(content)) {
    error("SYM-ONE-04", `Forbidden TouchableOpacity import: ${relPath}`);
  }
  if (/from\s+["']expo-haptics["']/.test(content)) {
    error("SYM-ARCH-05", `Direct expo-haptics import in presentation: ${relPath}`);
  }
}

const allSrcFiles = getFiles(path.join(rootDir, "src"));
for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, "utf8");
  const relPath = path.relative(rootDir, file).replace(/\\/g, "/");
  if (/\/\/\s*@ts-ignore/.test(content)) {
    error("ZERO-WORKAROUND", `Found @ts-ignore in: ${relPath}`);
  }
  if (/\/\/\s*@ts-nocheck/.test(content)) {
    error("ZERO-WORKAROUND", `Found @ts-nocheck in: ${relPath}`);
  }
  if (/eslint-disable/.test(content)) {
    error("ZERO-WORKAROUND", `Found eslint-disable in: ${relPath}`);
  }

  if (!isTestOrMockFile(file)) {
    if (relPath.includes("/domain/")) {
      if (
        /from\s+["'][^"']*(\/data\/|@data|\/presentation\/|@presentation|\/infrastructure\/|@infrastructure|expo-|react-native)/.test(
          content
        )
      ) {
        error(
          "SYM-ARCH-01",
          `Domain file imports Data, Infrastructure, Presentation, or Platform SDK: ${relPath}`
        );
      }
    }
    if (relPath.includes("/infrastructure/")) {
      if (/from\s+["'][^"']*(\/data\/|@data)/.test(content)) {
        error("SYM-ARCH-03", `Infrastructure file imports Data directly: ${relPath}`);
      }
    }
    if (relPath.includes("/presentation/")) {
      if (/from\s+["'][^"']*(\/data\/|@data)/.test(content)) {
        error("SYM-ARCH-02", `Presentation file imports Data directly: ${relPath}`);
      }
    }
  }

  const jsx = file.endsWith(".tsx");
  const { changed } = stripComments(content, { jsx, filePath: file });
  if (changed) {
    error("SYM-ONE-05", `Inline code comment present: ${relPath}`);
  }
}

const storeDir = path.join(rootDir, "src", "presentation", "stores");
if (fs.existsSync(storeDir)) {
  for (const f of fs.readdirSync(storeDir)) {
    if (isTestOrMockFile(f) || f.startsWith("index") || f.includes(".types.")) continue;
    if (f.endsWith(".ts") && (!f.startsWith("use") || !f.endsWith("Store.ts"))) {
      warnings.push(`⚠️ [SYM-ONE-02] Store file should be named use*Store.ts: ${f}`);
    }
  }
}

console.log("\n==========================================");
console.log("         SYMMETRY AUDIT REPORT            ");
console.log("==========================================");

if (warnings.length > 0) {
  for (const w of warnings) console.log(w);
}

if (errors.length > 0) {
  console.log(`\nFailed Rules (${errors.length}):`);
  for (const e of errors) console.log(e);
  process.exit(1);
} else {
  console.log(
    `\n✅ 100% SUCCESS: All Symmetry Rules PASS across ${allSrcFiles.length} source files!`
  );
  process.exit(0);
}
