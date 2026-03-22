import { createHash } from "node:crypto";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = cookies();
    const refreshToken = (await cookieStore).get("refresh_token")?.value;

    if (!refreshToken) return NextResponse.json({ ok: true }, { status: 200 });

    const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
    const jti = payload.jti;

    if (!jti) return NextResponse.json({ ok: true }, { status: 200 });

    const hashedRefreshToken = createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await prisma.refreshToken.deleteMany({
      where: {
        jti,
        token: hashedRefreshToken,
      },
    });

    (await cookieStore).set("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    (await cookieStore).set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("로그아웃 에러:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
