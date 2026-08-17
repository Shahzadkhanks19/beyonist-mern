import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, "src");
const failures = [];
const warnings = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

for (const file of walk(src).filter((file) => /\.(?:jsx|js|css)$/.test(file))) {
  const text = fs.readFileSync(file, "utf8");
  const rel = path.relative(root, file);

  if (/\bdebugger\s*;/.test(text)) failures.push(`${rel}: debugger statement`);
  if (/\bconsole\.log\s*\(/.test(text)) warnings.push(`${rel}: console.log`);
  if (file.endsWith(".jsx")) {
    for (const match of text.matchAll(/<img\b[^>]*>/gs)) {
      const tag = match[0];
      if (!/\balt=/.test(tag)) failures.push(`${rel}: image without alt`);
      if (!/\bdecoding=/.test(tag)) warnings.push(`${rel}: image without async decoding`);
    }
    for (const match of text.matchAll(/<iframe\b[^>]*>/gs)) {
      if (!/\btitle=/.test(match[0])) failures.push(`${rel}: iframe without title`);
    }
  }
}


const contrastRiskPatterns = [
  /text-white\/(?:25|30|35|40|45|50|55)\b/,
  /text-black\/(?:25|30|35|38|40|42|45|48|50|52|55)\b/,
];
for (const file of walk(src).filter((file) => file.endsWith(".jsx"))) {
  const text = fs.readFileSync(file, "utf8");
  for (const pattern of contrastRiskPatterns) {
    if (pattern.test(text)) {
      warnings.push(`${path.relative(root, file)}: low-contrast utility requires manual verification`);
      break;
    }
  }
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const required of [
  'name="description"',
  'name="viewport"',
  'name="robots"',
  'property="og:title"',
  'name="twitter:card"',
  'rel="preload" as="image"',
  'application/ld+json',
]) {
  if (!html.includes(required)) failures.push(`index.html missing ${required}`);
}


const llmsPath = path.join(root, "public", "llms.txt");
if (!fs.existsSync(llmsPath)) {
  failures.push("public/llms.txt is missing");
} else {
  const llms = fs.readFileSync(llmsPath, "utf8");
  if (!/^#\s+\S+/m.test(llms)) failures.push("public/llms.txt requires an H1 heading");
  if (!/\[[^\]]+\]\([^)]+\)/.test(llms)) failures.push("public/llms.txt requires at least one Markdown link");
}

if (warnings.length) console.warn("Lighthouse audit warnings:\n- " + [...new Set(warnings)].join("\n- "));
if (failures.length) {
  console.error("Lighthouse static audit failed:\n- " + [...new Set(failures)].join("\n- "));
  process.exit(1);
}
console.log("Beyonist Lighthouse static audit passed.");
