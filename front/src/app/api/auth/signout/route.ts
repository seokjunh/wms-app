import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = cookies();
    const refreshToken = (await cookieStore).get("refresh_token")?.value;

    if (refreshToken) {
      const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
      const jti = payload.jti;
      await redis.del(`refresh:${jti}`);
    }

    (await cookieStore).set("access_token", "", { maxAge: 0, path: "/" });
    (await cookieStore).set("refresh_token", "", { maxAge: 0, path: "/" });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("로그아웃 에러:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
