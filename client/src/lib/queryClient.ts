import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { authStorage, isTokenExpired } from "./auth";
import { useAuth } from "@/hooks/useAuth";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function getAuthHeaders() {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

async function refreshToken() {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch("/api/v1/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    authStorage.clear();
    window.location.href = "/";
    throw new Error("Failed to refresh token");
  }

  const data = await response.json();
  authStorage.setToken(data.access_token);
  authStorage.setRefreshToken(data.refresh_token);
  useAuth.getState().initialize();
  return data.access_token;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  let token = authStorage.getToken();

  if (token && isTokenExpired(token)) {
    try {
      token = await refreshToken();
    } catch (error) {
      console.error("Token refresh failed, logging out.", error);
      useAuth.getState().logout();
      throw new Error("Session expired. Please log in again.");
    }
  }

  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  const res = await fetch(`/api/v1${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (res.status === 401) {
    try {
      token = await refreshToken();
      headers["Authorization"] = `Bearer ${token}`;
      const retryRes = await fetch(`/api/v1${url}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
      await throwIfResNotOk(retryRes);
      return retryRes;
    } catch (error) {
      console.error("Token refresh failed after 401, logging out.", error);
      useAuth.getState().logout();
      throw new Error("Session expired. Please log in again.");
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
