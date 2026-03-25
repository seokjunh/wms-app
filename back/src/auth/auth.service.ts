import { randomUUID } from "node:crypto";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { JwtService } from "@nestjs/jwt";
import { compare } from "bcrypt";
import { Redis } from "ioredis";
import { PrismaService } from "src/prisma/prisma.service";
import { SigninDto } from "./dto/signin.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private prisma: PrismaService,
    @Inject("REDIS_CLIENT") private readonly redisClient: Redis,
  ) {}

  async signIn(signinDto: SigninDto) {
    const { username, password } = signinDto;

    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new UnauthorizedException("아이디 또는 비밀번호가 틀렸습니다.");

    const passwordValid = await compare(password, user.password);
    if (!passwordValid) throw new UnauthorizedException("아이디 또는 비밀번호가 틀렸습니다.");

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        role: user.role,
        username: user.username,
      },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: "30m" },
    );

    const jti = randomUUID();
    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        jti,
      },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: "7d" },
    );

    await this.redisClient.set(`refreshToken:${jti}`, user.id, "EX", 60 * 60 * 24 * 7);

    return { accessToken, refreshToken };
  }

  async signOut(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const { jti } = payload;

      await this.redisClient.del(`refreshToken:${jti}`);
    } catch (error) {
      console.error("SignOut Error:", error.message);
    }
  }

  async refresh(oldRefreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(oldRefreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const { sub, jti } = payload;

      const savedUserId = await this.redisClient.get(`refreshToken:${jti}`);
      if (!savedUserId) throw new UnauthorizedException("유효하지 않은 세션입니다.");

      const user = await this.prisma.user.findUnique({ where: { id: sub } });
      if (!user) throw new UnauthorizedException("존재하지 않는 유저입니다.");

      const accessToken = this.jwtService.sign(
        {
          sub: user.id,
          role: user.role,
          username: user.username,
        },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: "30m" },
      );

      const newJti = randomUUID();
      const refreshToken = this.jwtService.sign(
        {
          sub,
          jti: newJti,
        },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: "7d" },
      );

      await this.redisClient
        .pipeline()
        .del(`refreshToken:${jti}`)
        .set(`refreshToken:${newJti}`, sub, "EX", 60 * 60 * 24 * 7)
        .exec();

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Refresh Error:", error.message);

      throw new UnauthorizedException("다시 로그인해주세요.");
    }
  }
}
