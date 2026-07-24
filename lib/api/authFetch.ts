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

export function setAuthTokenProvider(
  getToken: () => Promise<string | null>,
  userId: string | null
) {
  _getClerkToken = getToken;
  _clerkUserId = userId;
}

export async function authFetch(
  endpoint: string,
  options: AuthFetchOptions = {}
): Promise<Response> {
  const { requireAuth = true, headers = {}, ...rest } = options;
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

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
