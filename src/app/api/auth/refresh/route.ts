import { randomUUID } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST() {
  try {
    const cookieStore = cookies();
    const oldRefreshToken = (await cookieStore).get("refresh_token")?.value;

    if (!oldRefreshToken)
      return NextResponse.json({ error: "No Refresh Token" }, { status: 401 });

    const { payload } = await jwtVerify(oldRefreshToken, JWT_SECRET);
    const jti = payload.jti;
    const userId = await redis.get(`refresh:${jti}`);

    if (!userId)
      return NextResponse.json(
        { error: "Invalid Refresh Token" },
        { status: 401 },
      );

    const newJti = randomUUID();
    const newRefreshToken = await new SignJWT({ userId, jti: newJti })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    await redis.del(`refresh:${jti}`);
    await redis.set(`refresh:${newJti}`, userId, { EX: 60 * 60 * 24 * 7 });

    (await cookieStore).set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
