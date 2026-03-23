import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("access_token")?.value;

  if (pathname === "/sign-in") {
    if (token) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (!token) return NextResponse.redirect(new URL("/sign-in", request.url));

  try {
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, JWT_SECRET);

    return NextResponse.next();
  } catch (error) {
    console.log("JWT 검증 실패:", error);
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
}

export const config = {
  // 모든 경로, 정적 파일(이미지 등)과 api, favicon 등은 제외
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
