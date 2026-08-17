import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const publicDir = path.join(root, "public");

function readEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs.readFileSync(file, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "")];
      })
  );
}

const env = {
  ...readEnvFile(path.join(root, ".env")),
  ...readEnvFile(path.join(root, ".env.local")),
  ...process.env,
};

const siteUrl = String(env.VITE_SITE_URL || "").replace(/\/$/, "");
const publicRoutes = [
  "/",
  "/shop",
  "/blogs",
  "/about",
  "/contact",
  "/faq",
  "/shipping-policy",
  "/return-refund-policy",
  "/terms-and-conditions",
];

fs.mkdirSync(publicDir, { recursive: true });

let robots = "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /account\nDisallow: /checkout\nDisallow: /cart\nDisallow: /login\nDisallow: /signup\nDisallow: /forgot-password\nDisallow: /reset-password\nDisallow: /track-order\n";

const sitemapPath = path.join(publicDir, "sitemap.xml");
if (siteUrl && /^https:\/\//i.test(siteUrl)) {
  robots += `Sitemap: ${siteUrl}/sitemap.xml\n`;
  const urls = publicRoutes.map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`).join("\n");
  fs.writeFileSync(sitemapPath, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  console.log(`[seo] Generated sitemap for ${siteUrl}`);
} else {
  if (fs.existsSync(sitemapPath)) fs.rmSync(sitemapPath);
  console.log("[seo] VITE_SITE_URL is not an HTTPS URL; sitemap generation skipped.");
}

fs.writeFileSync(path.join(publicDir, "robots.txt"), robots);
