import { Global, Inject, Module, OnModuleDestroy } from "@nestjs/common";
import { Redis } from "ioredis";

@Global()
@Module({
  providers: [
    {
      provide: "REDIS_CLIENT",
      useFactory: () => {
        const client = new Redis({
          host: process.env.REDIS_HOST || "localhost",
          port: Number(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD,
        });

        client.on("error", (err) => console.error("Redis Error", err));
        client.on("connect", () => console.log("Redis Connected"));

        return client;
      },
    },
  ],
  exports: ["REDIS_CLIENT"],
})
export class RedisModule implements OnModuleDestroy {
  constructor(@Inject("REDIS_CLIENT") private readonly redisClient: Redis) {}

  onModuleDestroy() {
    this.redisClient.disconnect();
  }
}
