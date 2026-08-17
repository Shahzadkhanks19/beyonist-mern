/**
 * Central media compatibility layer for the JPG/PNG -> WebP migration.
 *
 * Historical MongoDB records, carts and CMS entries may still hold legacy
 * relative paths, absolute localhost URLs, or old asset filenames. Normalize
 * them once at the application boundary and provide a final image-error fallback
 * that also protects admin/customer/public views from broken historical media.
 */

const WEBP_IMAGE_BASENAMES = new Set([
  "gluta-kojic",
  "hydra-serum",
  "ivy-serum",
  "lotion-soap",
  "milky-coconut",
  "product-hamper",
  "product-hamper-480",
  "product-hamper-840",
  "scrub-combo",
  "scrub-sunblock",
  "sunblock-lotion",
  "whipped-scrub",
  "whitening-lotion",
  "whitening-serum",
]);

const LEGACY_ALIASES = new Map([
  ["beyonist_logo.png", "/brand/beyonist-wordmark-black.webp"],
  ["beyonist-logo.png", "/brand/beyonist-wordmark-black.webp"],
  ["b-logo-black-1.png", "/brand/beyonist-wordmark-black.webp"],
  ["b-logo-white.png", "/brand/beyonist-wordmark-white.webp"],
  ["b-logo-white-1.png", "/brand/beyonist-wordmark-white.webp"],
  ["cropped-cropped-cropped-favicon.webp", "/brand/beyonist-mark.webp"],
]);

function localPathFrom(value) {
  const image = String(value || "").trim();
  if (!image) return { image: "", local: false, path: "" };

  if (image.startsWith("data:") || image.startsWith("blob:")) {
    return { image, local: false, path: image };
  }

  try {
    const base = typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const url = new URL(image, base);

    const localHosts = new Set([
      "localhost",
      "127.0.0.1",
      "[::1]",
      typeof window !== "undefined" ? window.location.hostname : "",
    ]);

    const explicitlyRemote = /^https?:\/\//i.test(image) && !localHosts.has(url.hostname);
    if (explicitlyRemote) return { image, local: false, path: image };

    return {
      image,
      local: true,
      path: `${url.pathname}${url.search}${url.hash}`,
    };
  } catch {
    return { image, local: true, path: image };
  }
}

export function normalizeLocalImagePath(value) {
  const parsed = localPathFrom(value);
  if (!parsed.image || !parsed.local) return parsed.image;

  let path = parsed.path.replace(/\\/g, "/").replace(/^\.?\//, "/");
  if (!path.startsWith("/")) path = `/${path}`;

  const queryIndex = path.search(/[?#]/);
  const cleanPath = queryIndex >= 0 ? path.slice(0, queryIndex) : path;
  const suffix = queryIndex >= 0 ? path.slice(queryIndex) : "";
  const filename = cleanPath.split("/").pop()?.toLowerCase() || "";

  if (LEGACY_ALIASES.has(filename)) return `${LEGACY_ALIASES.get(filename)}${suffix}`;

  const match = cleanPath.match(/\/images\/([^/]+)\.(?:jpe?g|png)$/i);
  if (match) {
    const basename = match[1].toLowerCase();
    if (WEBP_IMAGE_BASENAMES.has(basename)) {
      return `/images/${basename}.webp${suffix}`;
    }
  }

  return path;
}

export function normalizeCmsMedia(value) {
  if (Array.isArray(value)) return value.map(normalizeCmsMedia);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => {
      if (typeof child === "string" && ["image", "imageUrl", "thumbnail", "coverImage", "avatar", "logo"].includes(key)) {
        return [key, normalizeLocalImagePath(child)];
      }

      if (key === "images" && Array.isArray(child)) {
        return [key, child.map((item) => (
          typeof item === "string" ? normalizeLocalImagePath(item) : normalizeCmsMedia(item)
        ))];
      }

      return [key, normalizeCmsMedia(child)];
    }),
  );
}

/**
 * Global React image-error capture handler.
 *
 * First retry the normalized WebP path if the original request used a legacy
 * local JPG/PNG URL. If that still fails, use the known collection fallback.
 */
export function handleImageError(event) {
  const image = event?.target;
  if (!image || image.tagName !== "IMG") return;

  const current = image.getAttribute("src") || image.src || "";
  const normalized = normalizeLocalImagePath(current);

  if (!image.dataset.webpRetry && normalized && normalized !== current && normalized !== image.src) {
    image.dataset.webpRetry = "true";
    image.src = normalized;
    return;
  }

  if (!image.dataset.fallbackApplied) {
    image.dataset.fallbackApplied = "true";
    image.src = "/images/product-hamper.webp";
  }
}


/**
 * Returns responsive src/srcSet/sizes props for known local product imagery.
 * Remote CMS/CDN URLs are preserved unchanged.
 */
export function responsiveImageProps(value, sizes = "(max-width: 600px) 92vw, 50vw") {
  const src = normalizeLocalImagePath(value) || "/images/product-hamper.webp";
  const match = src.match(/^\/images\/([^/?#]+)\.webp(?:[?#].*)?$/i);
  if (!match) return { src };

  const basename = match[1].replace(/-(?:480|800|840)$/i, "");
  if (!WEBP_IMAGE_BASENAMES.has(basename)) return { src };

  if (basename === "product-hamper") {
    return {
      src: "/images/product-hamper-840.webp",
      srcSet: "/images/product-hamper-480.webp 480w, /images/product-hamper-840.webp 840w, /images/product-hamper.webp 1000w",
      sizes,
    };
  }

  return {
    src: `/images/${basename}-800.webp`,
    srcSet: `/images/${basename}-480.webp 480w, /images/${basename}-800.webp 800w, /images/${basename}.webp 1080w`,
    sizes,
  };
}

export const normalizeProductImagePath = normalizeLocalImagePath;
export const normalizeProductImages = (product) => normalizeCmsMedia(product);
export const normalizeProductCollection = (items) => normalizeCmsMedia(items);
