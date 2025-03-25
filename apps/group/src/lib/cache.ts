import cache from "@repo/server/cache";
import { RedisCache } from "cache-manager-ioredis-yet";

let instance: RedisCache | undefined;
export const getInstance = async (): Promise<RedisCache> => {
  if (instance) {
    return instance;
  }
  instance = await cache({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    database: process.env.REDIS_DB,
    password: process.env.REDIS_PASSWORD
  });
  return instance;
};

const cacheClient = () => {
  return instance
}

const groupCacheKey = (id: number): string => {
  return `group:${id}`;
}

const KEY_GROUP = "GROUP"

export default {
  groupCacheKey,
  KEY_GROUP
}
