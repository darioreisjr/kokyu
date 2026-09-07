import { apiUrl } from './env';
import { ApiError, type ProblemDetails } from './errors';

export interface ApiRequestInit extends Omit<RequestInit, 'body'> {
  /** JSON-serializable request body — serialized here, callers never `JSON.stringify` themselves. */
  body?: unknown;
  /** Supabase access token for this request, or `null`/omitted for the one anonymous endpoint (`GET /usernames/availability`). */
  accessToken?: string | null;
}

async function parseProblemDetails(response: Response): Promise<ProblemDetails | null> {
  try {
    const data: unknown = await response.json();
    return data && typeof data === 'object' ? (data as ProblemDetails) : null;
  } catch {
    return null;
  }
}

/**
 * The one place that actually calls `fetch` against the kokyu-sam
 * backend. Server and client callers (`lib/api/server.ts`,
 * `lib/api/client.ts`) both funnel through this — it only knows how to
 * build the URL, attach a bearer token when given one, serialize/parse
 * JSON, and turn a non-2xx response into a typed `ApiError`. It has no
 * opinion on *where* the access token comes from, so it never imports
 * Supabase itself.
 */
export async function apiRequest<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { body, accessToken, headers, ...rest } = init;
  const url = `${apiUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...rest,
    method: rest.method ?? (body !== undefined ? 'POST' : 'GET'),
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // Every response reflects the caller's current session/profile
    // state — never cache across requests or users.
    cache: 'no-store',
  });

  if (!response.ok) {
    const problem = await parseProblemDetails(response);
    throw new ApiError(response.status, problem, `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
