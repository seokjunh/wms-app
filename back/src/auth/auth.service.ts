import { randomUUID } from "node:crypto";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcrypt";
import { Redis } from "ioredis";
import { PrismaService } from "../prisma/prisma.service.js";
import { SigninDto } from "./dto/signin.dto.js";

export const REFRESH_TOKEN_EX_SECONDS = 60 * 60 * 24 * 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    @Inject("REDIS_CLIENT") private readonly redisClient: Redis,
  ) {}

  async signIn(signinDto: SigninDto) {
    const { username, password } = signinDto;

    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
      },
    });

    if (!user || !(await compare(password, user.password)))
      throw new UnauthorizedException("아이디 또는 비밀번호가 틀렸습니다.");

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
      username: user.username,
    });

    const jti = randomUUID();
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        jti,
      },
      { secret: this.configService.get("JWT_REFRESH_SECRET"), expiresIn: "7d" },
    );

    await this.redisClient.set(
      `refreshToken:${user.id}:${jti}`,
      "true",
      "EX",
      REFRESH_TOKEN_EX_SECONDS,
    );

    return { accessToken, refreshToken };
  }

  async signOut(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get("JWT_REFRESH_SECRET"),
      });

      const { sub, jti } = payload;

      const redisKey = `refreshToken:${sub}:${jti}`;
      await this.redisClient.del(redisKey);

      console.log(`SignOut Success: ${redisKey}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error("SignOut Error:", error.message);
      }
    }
  }

  async refresh(oldRefreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(oldRefreshToken, {
        secret: this.configService.get("JWT_REFRESH_SECRET"),
      });

      const { sub, jti } = payload;

      const isExist = await this.redisClient.get(`refreshToken:${sub}:${jti}`);
      if (!isExist) throw new UnauthorizedException("유효하지 않은 세션입니다.");

      const user = await this.prisma.user.findUnique({
        where: { id: sub },
        select: { id: true, role: true, username: true },
      });
      if (!user) throw new UnauthorizedException("존재하지 않는 유저입니다.");

      const accessToken = await this.jwtService.signAsync({
        sub: user.id,
        role: user.role,
        username: user.username,
      });

      const newJti = randomUUID();
      const refreshToken = await this.jwtService.signAsync(
        {
          sub,
          jti: newJti,
        },
        { secret: this.configService.get("JWT_REFRESH_SECRET"), expiresIn: "7d" },
      );

      await this.redisClient
        .pipeline()
        .del(`refreshToken:${sub}:${jti}`)
        .set(`refreshToken:${sub}:${newJti}`, "true", "EX", REFRESH_TOKEN_EX_SECONDS)
        .exec();

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Refresh Error:", error.message);
      }
      throw new UnauthorizedException("다시 로그인해주세요.");
    }
  }
}
