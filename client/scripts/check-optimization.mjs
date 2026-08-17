import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "src/components/RouteSeo.jsx",
  "src/hooks/usePageSeo.js",
  "public/robots.txt",
  "public/_headers",
  "vercel.json",
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error("Missing optimization files:", missing.join(", "));
  process.exit(1);
}

const app = fs.readFileSync(path.join(root, "src/App.jsx"), "utf8");
if (app.includes('lazy(() => import("./pages/ErrorPage.jsx"))')) {
  console.error("ErrorPage is still dynamically imported; the duplicate-import build warning will remain.");
  process.exit(1);
}
if (!app.includes('id="main-content"') || !app.includes('href="#main-content"')) {
  console.error("Skip-link/main-content accessibility wiring is missing.");
  process.exit(1);
}

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const token of ["description", "og:title", "twitter:card", "robots"]) {
  if (!index.includes(token)) {
    console.error(`index.html is missing ${token} metadata.`);
    process.exit(1);
  }
}

console.log("Client optimization smoke check passed.");
