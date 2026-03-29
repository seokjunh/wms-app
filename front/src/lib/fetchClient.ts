import { useAuthStore } from "@/stores/auth";

const BASE_URL = "http://localhost:3001/api";

let refreshPromise: Promise<string | null> | null = null;

export const fetchClient = async (url: string, options: RequestInit = {}) => {
  const { accessToken, setAccessToken } = useAuthStore.getState();

  const headers = new Headers(options.headers);

  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const config = {
    ...options,
    headers,
    credentials: "include" as RequestCredentials,
  };

  const response = await fetch(`${BASE_URL}${url}`, config);

  if (response.status === 401) {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const res = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });

          if (!res.ok) {
            setAccessToken(null);
            return null;
          }

          const data = await res.json();
          const newAccessToken = data.accessToken;
          
          setAccessToken(newAccessToken);

          return newAccessToken;
        } catch {
          setAccessToken(null);
          return null;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    const newToken = await refreshPromise;

    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      return fetch(`${BASE_URL}${url}`, { ...config, headers });
    } else {
      return response;
    }
  }

  return response;
};
