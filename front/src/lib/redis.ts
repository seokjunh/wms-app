import { createClient } from "redis";

export const redis = createClient({
  url: "redis://:rhistle1!@127.0.0.1:6379",
});

redis.on("error", (err) => console.error("Redis Client Error", err));

await redis.connect();
