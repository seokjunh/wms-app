import { randomUUID } from "node:crypto";
import { compare } from "bcrypt";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.isActive)
      return NextResponse.json(
        { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 },
      );

    const valid = await compare(password, user.password);

    if (!valid)
      return NextResponse.json(
        { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 },
      );

    const accessToken = await new SignJWT({
      userId: user.id,
      role: user.role,
      username: user.username,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30m")
      .sign(JWT_SECRET);

    const jti = randomUUID();
    const refreshToken = await new SignJWT({
      userId: user.id,
      jti,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    await redis.set(`refresh:${jti}`, user.id, { EX: 60 * 60 * 24 * 7 });

    const cookieStore = cookies();

    (await cookieStore).set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 30,
    });

    (await cookieStore).set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("로그인 에러:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
