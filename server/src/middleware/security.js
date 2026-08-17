/**
 * Express middleware for security. Applies cross-cutting request protections and security policy before business routes execute.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Implements the normalise origin operation used by this module.
 */
function normaliseOrigin(value) {
  try {
    return new URL(String(value || "").trim()).origin;
  } catch {
    return "";
  }
}

/**
 * Allows local Vite development origins even when Vite automatically moves to
 * another port (for example 5174 because 5173 is already occupied). This is
 * intentionally development-only; production still uses the explicit allowlist.
 */
function isLocalDevelopmentOrigin(origin) {
  if (process.env.NODE_ENV === "production" || !origin) return false;

  try {
    const url = new URL(origin);
    return (
      (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]") &&
      (url.protocol === "http:" || url.protocol === "https:")
    );
  } catch {
    return false;
  }
}

/**
 * Implements the allowed origins operation used by this module.
 */
export function allowedOrigins() {
  const values = [
    ...(String(process.env.CLIENT_URL || "").split(",")),
    ...(String(process.env.PUBLIC_SITE_URL || "").split(",")),
  ]
    .map(normaliseOrigin)
    .filter(Boolean);

  if (process.env.NODE_ENV !== "production") {
    values.push(
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:4173",
      "http://127.0.0.1:4173"
    );
  }

  return [...new Set(values)];
}

/**
 * Implements the cors options operation used by this module.
 */
export function corsOptions() {
  const allowlist = new Set(allowedOrigins());

  return {
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept", "X-Requested-With"],
    maxAge: 600,
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const normalised = normaliseOrigin(origin);
      return callback(null, allowlist.has(normalised) || isLocalDevelopmentOrigin(normalised));
    },
  };
}

/**
 * Implements the security headers operation used by this module.
 */
export function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");

  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  if (
    req.path.startsWith("/api/auth") ||
    req.path.startsWith("/api/admin") ||
    req.path.startsWith("/api/customer") ||
    req.path.startsWith("/api/orders/track")
  ) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
  }

  next();
}

/**
 * Implements the contains unsafe key operation used by this module.
 */
function containsUnsafeKey(value, depth = 0) {
  if (depth > 12 || value == null || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some((item) => containsUnsafeKey(item, depth + 1));

  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith("$") || key.includes(".")) return true;
    if (containsUnsafeKey(child, depth + 1)) return true;
  }
  return false;
}

/**
 * Implements the reject unsafe input operation used by this module.
 */
export function rejectUnsafeInput(req, res, next) {
  if (containsUnsafeKey(req.body) || containsUnsafeKey(req.query) || containsUnsafeKey(req.params)) {
    return res.status(400).json({
      success: false,
      code: "UNSAFE_INPUT",
      message: "The request contains unsupported field names.",
    });
  }
  return next();
}

/**
 * Implements the require trusted origin operation used by this module.
 */
export function requireTrustedOrigin(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = normaliseOrigin(req.headers.origin);
  const referer = normaliseOrigin(req.headers.referer);
  const fetchSite = String(req.headers["sec-fetch-site"] || "").toLowerCase();
  const allowlist = new Set(allowedOrigins());

  // Non-browser clients may omit Origin/Referer. Browser cross-site requests are rejected.
  if (!origin && !referer) {
    if (fetchSite === "cross-site") {
      return res.status(403).json({ success: false, code: "CROSS_SITE_REQUEST", message: "Cross-site request rejected." });
    }
    return next();
  }

  const candidate = origin || referer;
  if (!allowlist.has(candidate) && !isLocalDevelopmentOrigin(candidate)) {
    return res.status(403).json({ success: false, code: "UNTRUSTED_ORIGIN", message: "Request origin is not allowed." });
  }

  return next();
}

/**
 * Implements the require json body operation used by this module.
 */
export function requireJsonBody(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  const length = Number(req.headers["content-length"] || 0);
  if (!length) return next();
  if (!req.is("application/json")) {
    return res.status(415).json({ success: false, code: "JSON_REQUIRED", message: "Requests with a body must use application/json." });
  }
  return next();
}

const rateBuckets = new Map();

/**
 * Implements the clean buckets operation used by this module.
 */
function cleanBuckets(now) {
  if (rateBuckets.size < 5000) return;
  for (const [key, bucket] of rateBuckets) {
    if (bucket.resetAt <= now) rateBuckets.delete(key);
  }
  while (rateBuckets.size > 20_000) {
    const oldestKey = rateBuckets.keys().next().value;
    if (!oldestKey) break;
    rateBuckets.delete(oldestKey);
  }
}

/**
 * Creates rate limiter using the validated inputs supplied by the caller.
 */
export function createRateLimiter({ windowMs, max, prefix, keyGenerator, message = "Too many requests. Please try again shortly." }) {
  return function rateLimit(req, res, next) {
    const now = Date.now();
    cleanBuckets(now);

    const extra = keyGenerator ? String(keyGenerator(req) || "") : "";
    const key = `${prefix}:${req.ip || req.socket?.remoteAddress || "unknown"}:${extra}`;
    let bucket = rateBuckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      rateBuckets.set(key, bucket);
    }

    bucket.count += 1;
    const remaining = Math.max(max - bucket.count, 0);
    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader("RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      const retryAfter = Math.max(Math.ceil((bucket.resetAt - now) / 1000), 1);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({ success: false, code: "RATE_LIMITED", message });
    }

    return next();
  };
}

/**
 * Validates production security config and returns a normalized result for downstream logic.
 */
export function validateProductionSecurityConfig() {
  if (process.env.NODE_ENV !== "production") return;

  const required = ["MONGODB_URI", "CLIENT_URL", "PUBLIC_SITE_URL"];
  const missing = required.filter((key) => !String(process.env[key] || "").trim());
  if (missing.length) throw new Error(`Missing production environment variable(s): ${missing.join(", ")}`);

  const urls = [process.env.CLIENT_URL, process.env.PUBLIC_SITE_URL]
    .flatMap((value) => String(value || "").split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  for (const value of urls) {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") {
      throw new Error(`Production URL must use HTTPS: ${value}`);
    }
  }
}
