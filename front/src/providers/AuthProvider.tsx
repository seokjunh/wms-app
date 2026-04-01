"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // const { accessToken, setAccessToken } = useAuthStore();
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   const refreshToken = async () => {
  //     if (accessToken) {
  //       setIsLoading(false);
  //       return;
  //     }

  //     try {
  //       const res = await fetch("http://localhost:3001/api/auth/refresh", {
  //         method: "POST",
  //         credentials: "include",
  //       });

  //       if (!res.ok) {
  //         setAccessToken(null);
  //         return;
  //       }

  //       const data = await res.json();

  //       setAccessToken(data.accessToken);
  //     } catch (error) {
  //       setAccessToken(null);
  //       console.error("Silent refresh failed", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   refreshToken();
  // }, [accessToken, setAccessToken]);

  // if (isLoading) return null;

  return <>{children}</>;
};
export default AuthProvider;
