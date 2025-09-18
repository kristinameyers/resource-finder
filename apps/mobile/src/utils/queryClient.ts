import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get the API base URL from environment or default to empty (same origin)
export const API_BASE_URL: string = process.env.EXPO_PUBLIC_API_URL || "";
type UnauthorizedBehavior = "returnNull" | "throw";

// --- Throw error if response is not ok ---
export async function throwIfResNotOk(res: Response): Promise<void> {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// --- Typed helper for all REST/JSON requests ---
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  // Prepend the base URL if url starts with '/api'
  const fullUrl =
    url.startsWith("/api") && API_BASE_URL
      ? `${API_BASE_URL}${url}`
      : url;

  const res = await fetch(fullUrl, {
    method,
    headers: data
      ? { "Content-Type": "application/json" }
      : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// --- Generic query function for React Query ---
export function getQueryFn<T>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> {
  return async ({ queryKey }) => {
    if (!Array.isArray(queryKey) || typeof queryKey[0] !== "string") {
      throw new Error("Invalid queryKey: must start with URL string.");
    }
    const url = queryKey[0] as string;
    const fullUrl =
      url.startsWith("/api") && API_BASE_URL
        ? `${API_BASE_URL}${url}`
        : url;
    const res = await fetch(fullUrl, {
      credentials: "include",
    });
    if (options.on401 === "returnNull" && res.status === 401) {
      return null as unknown as T;
    }
    await throwIfResNotOk(res);
    return (await res.json()) as T;
  };
}

// --- Instantiate the global singleton QueryClient with sane defaults ---
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // The generic will be determined by your useQuery<T> calls:
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
