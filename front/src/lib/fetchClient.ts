export async function fetchClient(url: string, options: RequestInit = {}) {
  const defaultHeaders = {
    "Content-Type": "application/json",
    ...options.headers, // 여기서 사용자가 전달한 헤더로 덮어쓰기
  };

  let res = await fetch(url, {
    ...options,
    headers: defaultHeaders,
    credentials: "include",
  });

  if (res.status === 401) {
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      res = await fetch(url, { ...options, credentials: "include" });
    } else {
      window.location.href = "/sign-in";
      return;
    }
  }

  return res;
}
