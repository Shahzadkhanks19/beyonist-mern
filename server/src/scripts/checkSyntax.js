import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.resolve(here, "..");

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

const files = walk(sourceRoot).filter((file) => file.endsWith(".js"));
const failures = [];

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) failures.push(`${path.relative(sourceRoot, file)}\n${result.stderr.trim()}`);
}

if (failures.length) {
  console.error(`Server syntax check failed (${failures.length} file(s)):\n\n${failures.join("\n\n")}`);
  process.exit(1);
}

console.log(`Server syntax check passed (${files.length} source files).`);
