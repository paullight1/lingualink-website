/**
 * Authenticated API client for the NestJS backend.
 * Ported from the mobile app's src/services/authFetch.ts.
 * The Clerk token getter is registered by SupabaseTokenBridge (uses
 * Clerk's useAuth().getToken({ template: 'supabase' })).
 */

import { API_BASE_URL } from "@/lib/config";

interface AuthFetchOptions extends RequestInit {
  requireAuth?: boolean; // default true
}

let _getClerkToken: (() => Promise<string | null>) | null = null;
let _clerkUserId: string | null = null;

/*
 * Calls can fire before Clerk has finished loading — React runs a parent
 * provider's effects after its children's, so the first wave of page queries
 * reaches authFetch before the provider has registered anything. Without this
 * gate those calls threw "Authentication required" on a perfectly valid
 * session. Requests now wait for auth to settle instead of failing the race.
 */
let _authSettled = false;
let _resolveSettled: () => void;
const _settledPromise = new Promise<void>((resolve) => {
  _resolveSettled = resolve;
});

const AUTH_WAIT_MS = 10_000;

export function setAuthTokenProvider(
  getToken: (() => Promise<string | null>) | null,
  userId: string | null
) {
  _getClerkToken = getToken;
  _clerkUserId = userId;
}

/** Called once Clerk has loaded, whether or not anyone is signed in. */
export function markAuthSettled() {
  if (_authSettled) return;
  _authSettled = true;
  _resolveSettled();
}

async function waitForAuth(): Promise<void> {
  if (_authSettled) return;
  await Promise.race([
    _settledPromise,
    new Promise<void>((resolve) => setTimeout(resolve, AUTH_WAIT_MS)),
  ]);
}

export async function authFetch(
  endpoint: string,
  options: AuthFetchOptions = {}
): Promise<Response> {
  const { requireAuth = true, headers = {}, ...rest } = options;
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  if (requireAuth) await waitForAuth();

  let accessToken: string | null = null;
  if (_getClerkToken) {
    try {
      accessToken = await _getClerkToken();
    } catch (e) {
      console.warn("Failed to get Clerk token:", e);
    }
  }

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (accessToken) {
    requestHeaders["Authorization"] = `Bearer ${accessToken}`;
  } else if (requireAuth) {
    throw new Error("Authentication required. Please log in.");
  }

  return fetch(url, { ...rest, headers: requestHeaders });
}

export function getCurrentUserId(): string {
  if (!_clerkUserId) throw new Error("User not authenticated");
  return _clerkUserId;
}

export function getOptionalCurrentUserId(): string | null {
  return _clerkUserId;
}

export async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let msg = "Request failed";
    try {
      const data = await response.json();
      msg = data.message || data.error || msg;
    } catch {
      msg = response.statusText || msg;
    }
    throw new Error(msg);
  }
  return response.json() as Promise<T>;
}

export { API_BASE_URL };
