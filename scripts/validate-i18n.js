#!/usr/bin/env node
/**
 * scripts/validate-i18n.js
 */

const fs = require("fs");
const path = require("path");

const EN_PATH = path.resolve(__dirname, "../src/infrastructure/i18n/langs/en.json");
const AR_PATH = path.resolve(__dirname, "../src/infrastructure/i18n/langs/ar.json");

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function flatten(obj, prefix = "") {
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      Object.assign(result, flatten(val, fullPath));
    } else {
      result[fullPath] = val;
    }
  }
  return result;
}

function extractVariables(text) {
  if (typeof text !== "string") return [];
  const matches = text.match(/\{([a-zA-Z0-9_]+)\}/g) || [];
  return matches.map((m) => m.slice(1, -1)).sort();
}

function isCamelCase(str) {
  if (/^\d+$/.test(str)) return true;
  return /^[a-z][a-zA-Z0-9]*$/.test(str);
}

const en = loadJson(EN_PATH);
const ar = loadJson(AR_PATH);
const flatEn = flatten(en);
const flatAr = flatten(ar);
const enKeys = Object.keys(flatEn).sort();
const arKeys = Object.keys(flatAr).sort();

let hasErrors = false;
const missingInAr = enKeys.filter((k) => !(k in flatAr));
const missingInEn = arKeys.filter((k) => !(k in flatEn));

if (missingInAr.length > 0 || missingInEn.length > 0) {
  hasErrors = true;
  console.error("Key parity mismatch:", { missingInAr, missingInEn });
}

for (const keyPath of enKeys) {
  for (const part of keyPath.split(".")) {
    if (!isCamelCase(part)) {
      hasErrors = true;
      console.error(`Non-camelCase key: ${keyPath} (${part})`);
    }
  }
  const enVal = String(flatEn[keyPath] ?? "");
  const arVal = String(flatAr[keyPath] ?? "");
  if (enVal.trim() === "" || arVal.trim() === "") {
    hasErrors = true;
    console.error(`Empty translation for key: ${keyPath}`);
  }
  if (JSON.stringify(extractVariables(enVal)) !== JSON.stringify(extractVariables(arVal))) {
    hasErrors = true;
    console.error(`Variable mismatch for key: ${keyPath}`);
  }
}

if (hasErrors) {
  process.exit(1);
}
console.log(`✅ i18n Validation PASSED (${enKeys.length} keys verified in EN & AR)`);
