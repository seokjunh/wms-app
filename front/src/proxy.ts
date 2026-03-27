import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";

const jwtRefreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
const publicRoutes = ["/sign-in"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (!refreshToken) {
    if (isPublicRoute) return NextResponse.next();
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  try {
    await jwtVerify(refreshToken, jwtRefreshSecret);

    if (isPublicRoute) return NextResponse.redirect(new URL("/", req.url));

    return NextResponse.next();
  } catch (error) {
    console.log("Refresh Token 검증 실패:", error);

    const res = NextResponse.redirect(new URL("/sign-in", req.url));
    res.cookies.delete("refreshToken");
    return res;
  }
}

export const config = {
  // 모든 경로, 정적 파일(이미지 등)과 api, favicon 등은 제외
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
