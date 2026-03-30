/**
 * Standardized API response helpers.
 * All API routes should use these to ensure consistent response shapes.
 */

export function ok(data = null, headers = {}) {
  return Response.json({ ok: true, data }, { status: 200, headers });
}

export function created(data = null, headers = {}) {
  return Response.json({ ok: true, data }, { status: 201, headers });
}

export function error(message, status = 400, headers = {}) {
  return Response.json({ ok: false, error: message }, { status, headers });
}

export function paginated(data, meta, headers = {}) {
  return Response.json({ ok: true, data, meta }, { status: 200, headers });
}

export function unauthorized(message = 'Unauthorized') {
  return Response.json({ ok: false, error: message }, { status: 401 });
}

export function forbidden(message = 'Forbidden') {
  return Response.json({ ok: false, error: message }, { status: 403 });
}

export function notFound(message = 'Not found') {
  return Response.json({ ok: false, error: message }, { status: 404 });
}

export function tooManyRequests(
  message = 'Too many requests. Please try again later.',
  headers = {}
) {
  return Response.json({ ok: false, error: message }, { status: 429, headers });
}

export function serverError(message = 'Internal server error', headers = {}) {
  return Response.json({ ok: false, error: message }, { status: 500, headers });
}
