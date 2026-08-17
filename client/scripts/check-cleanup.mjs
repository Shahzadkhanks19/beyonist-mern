import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceRoot = path.join(root, "src");
const publicRoot = path.join(root, "public");

const forbiddenFiles = [
  "src/pages/Placeholder.jsx",
  "src/pages/admin/AdminDashboardStub.jsx",
];

const forbiddenPatterns = [
  { label: "debugger statement", regex: /\bdebugger\s*;/g },
  { label: "console.log in client source", regex: /\bconsole\.log\s*\(/g },
  { label: "temporary TODO/FIXME marker", regex: /\b(?:TODO|FIXME)\b/g },
];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

const failures = [];

for (const relative of forbiddenFiles) {
  if (fs.existsSync(path.join(root, relative))) failures.push(`Dead placeholder still exists: ${relative}`);
}

for (const file of walk(sourceRoot).filter((item) => /\.(?:js|jsx|css)$/.test(item))) {
  const text = fs.readFileSync(file, "utf8");
  for (const rule of forbiddenPatterns) {
    if (rule.regex.test(text)) failures.push(`${rule.label}: ${path.relative(root, file)}`);
    rule.regex.lastIndex = 0;
  }
}

const legacyAssets = [
  "images/beyonist-logo.png",
  "images/original-banner.png",
  "brand/beyonist-logo-white.png",
  "brand/favicon.webp",
];
for (const relative of legacyAssets) {
  if (fs.existsSync(path.join(publicRoot, relative))) failures.push(`Unused legacy asset still exists: public/${relative}`);
}

if (failures.length) {
  console.error("\nCleanup audit failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Beyonist cleanup audit passed.");
