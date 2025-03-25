import { caching } from "cache-manager";
import { RedisCache, RedisStore, redisStore } from "cache-manager-ioredis-yet";
export interface ICacheConfig {
    host: string;
    port: number;
    database: number;
    password?: string;
}
export default async (config: ICacheConfig): Promise<RedisCache> => {
    return await caching(redisStore, {
        instanceConfig: {
            host: config.host,
            port: config.port,
            db: config.database,
        },
        host: config.host,
        database: config.database,
        password: config.password,
    });
};

export class CachePlus {
    private readonly prefix: string;
    private readonly cache: RedisCache;
    readonly store: RedisStore;
    constructor(prefix: string, cache: RedisCache) {
        this.prefix = prefix;
        this.cache = cache;
        this.store = cache.store;
    }
    async get<T>(key: string): Promise<T | undefined> {
        const cacheKey = `${this.prefix}:${key}`;
        return await this.cache.get<T>(cacheKey);
    }
    async set<T>(key: string, value: T, ttl: number = 3000): Promise<void> {
        const cacheKey = `${this.prefix}:${key}`;
        await this.cache.set(cacheKey, value, ttl);
    }
    async del(key: string): Promise<void> {
        const cacheKey = `${this.prefix}:${key}`;
        await this.cache.del(cacheKey);
    }
    async mget(...keys: string[]) {
        if (keys && keys.length > 0) {
            const cacheKeys = keys.map((key) => `${this.prefix}:${key}`);
            console.log('cacheKeys', cacheKeys);
            return await this.store.mget(...cacheKeys);
        }
        return []
    }
}