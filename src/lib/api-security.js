const rateLimitStore = new Map();

const DEFAULT_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 5;

function cleanupExpiredEntries(now) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function getAllowedOrigins(request) {
  const requestOrigin = request.nextUrl?.origin;
  const configuredOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    "https://jamsaq.in",
    "https://www.jamsaq.in",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter(Boolean);

  return new Set([requestOrigin, ...configuredOrigins].filter(Boolean));
}

function isAllowedOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  return getAllowedOrigins(request).has(origin);
}

function buildRateLimitHeaders(limit, remaining, resetAt) {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
  };
}

function rateLimit(request, routeKey, { windowMs = DEFAULT_WINDOW_MS, maxRequests = DEFAULT_MAX_REQUESTS } = {}) {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const ip = getClientIp(request);
  const key = `${routeKey}:${ip}`;
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    const freshEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, freshEntry);

    return {
      ok: true,
      headers: buildRateLimitHeaders(maxRequests, maxRequests - 1, freshEntry.resetAt),
    };
  }

  existing.count += 1;

  if (existing.count > maxRequests) {
    return {
      ok: false,
      response: Response.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            ...buildRateLimitHeaders(maxRequests, 0, existing.resetAt),
            "Retry-After": String(Math.max(1, Math.ceil((existing.resetAt - now) / 1000))),
          },
        }
      ),
    };
  }

  return {
    ok: true,
    headers: buildRateLimitHeaders(maxRequests, maxRequests - existing.count, existing.resetAt),
  };
}

export function rejectDisallowedOrigin(request) {
  if (isAllowedOrigin(request)) {
    return null;
  }

  return Response.json(
    { error: "Requests from this origin are not allowed." },
    { status: 403 }
  );
}

export function enforceJsonRequest(request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return null;
  }

  return Response.json(
    { error: "Content-Type must be application/json." },
    { status: 415 }
  );
}

export function protectPublicPostRoute(request, routeKey, options) {
  const originResponse = rejectDisallowedOrigin(request);
  if (originResponse) {
    return { ok: false, response: originResponse };
  }

  const contentTypeResponse = enforceJsonRequest(request);
  if (contentTypeResponse) {
    return { ok: false, response: contentTypeResponse };
  }

  return rateLimit(request, routeKey, options);
}

