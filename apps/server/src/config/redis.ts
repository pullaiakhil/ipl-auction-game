import Redis from "ioredis";
import { env } from "./env";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  let url = env.REDIS_URL;
  try {
    if (url.includes('<') || url.includes('>')) {
      throw new Error("Contains placeholder brackets");
    }
    new URL(url);
  } catch (err) {
    console.error(`⚠️ Redis: Invalid or placeholder REDIS_URL provided: "${url}". Falling back to default "redis://127.0.0.1:6379".`);
    url = "redis://127.0.0.1:6379";
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number): number | null {
      if (times > 10) {
        console.error("❌ Redis: max retries reached, giving up");
        return null;
      }
      const delay = Math.min(times * 200, 5000);
      console.warn(`⏳ Redis: retrying connection in ${delay}ms (attempt ${times})`);
      return delay;
    },
    reconnectOnError(err: Error): boolean {
      const targetErrors = ["READONLY", "ECONNRESET", "ECONNREFUSED"];
      return targetErrors.some((e) => err.message.includes(e));
    },
    enableReadyCheck: true,
    lazyConnect: true,
  });

  client.on("connect", () => {
    console.log("✅ Redis connected");
  });

  client.on("ready", () => {
    console.log("✅ Redis ready to accept commands");
  });

  client.on("error", (err: Error) => {
    console.error("❌ Redis error:", err.message);
  });

  client.on("close", () => {
    console.warn("⚠️ Redis connection closed");
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
  console.log("🔌 Redis disconnected");
}
