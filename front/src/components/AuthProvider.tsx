"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, setAccessToken } = useAuthStore();

  useEffect(() => {
    const refreshToken = async () => {
      if (accessToken) return;

      try {
        const res = await fetch("http://localhost:3001/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) return;

        const data = await res.json();
        setAccessToken(data.accessToken);
      } catch (error) {
        console.error("Silent refresh failed", error);
      }
    };

    refreshToken();
  }, [setAccessToken, accessToken]);

  return <div>{children}</div>;
};
export default AuthProvider;
