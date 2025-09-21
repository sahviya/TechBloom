import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://mindbloomgenie.netlify.app/.netlify/functions/server'
  : '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error(`API Error: ${res.status} - ${text}`, {
      url: res.url,
      status: res.status,
      statusText: res.statusText
    });
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  path: string,
  data?: unknown | undefined,
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const token = localStorage.getItem("auth_token");
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("auth_token");
    }
    throw new Error(`${response.status}: ${response.statusText}`);
  }
  
  return response;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> => {
  return async ({ queryKey }) => {
    // Ensure the path starts with / but doesn't have double //
    const path = queryKey.join("/").startsWith("/") 
      ? queryKey.join("/") 
      : `/${queryKey.join("/")}`;
    const url = `${API_BASE_URL}${path}`;
    
    console.log(`Making query request to: ${url}`);
    
    const res = await fetch(url, {
      credentials: "include",
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (options.on401 === "returnNull" && res.status === 401) {
      localStorage.removeItem("auth_token");
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };
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
