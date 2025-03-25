import { Redis } from "ioredis";
export class UserOnlineService {
    private static instance: UserOnlineService;
    private cache: Redis;
    private findPartitionAndPosition(num: number) {
        const total = 10000000;
        const partitionSize = total / 100;
        if (num < 1 || num > total) {
            throw new Error("Number out of range");
        }
        const partition = Math.ceil(num / partitionSize);
        const position = num - (partition - 1) * partitionSize;

        return {
            partition,
            position
        }
    }
    private constructor(cache: Redis) {
        this.cache = cache;
    }
    static async make() {
        if (!UserOnlineService.instance) {
            const cacheClient = new Redis(
                {
                    host: process.env.REDIS_HOST,
                    port: process.env.REDIS_PORT,
                    db: process.env.REDIS_DB,
                    password: process.env.REDIS_PASSWORD
                }
            )
            UserOnlineService.instance = new UserOnlineService(cacheClient);
        }
        if (UserOnlineService.instance.cache.status == 'close') {
            await UserOnlineService.instance.cache.connect()
        }
        return UserOnlineService.instance;
    }
    static async offline(userId: bigint) {
        console.log("offline", userId);
        const instance = await UserOnlineService.make();
        const map = instance.findPartitionAndPosition(Number(userId));
        const cacheKey = `online:${map.partition}`;
        return await instance.cache.setbit(cacheKey, map.position, 0)
    }
    static async online(userId: bigint) {
        console.log('online', userId);
        const instance = await UserOnlineService.make();
        const map = instance.findPartitionAndPosition(Number(userId));
        const cacheKey = `online:${map.partition}`;
        return await instance.cache.setbit(cacheKey, map.position, 1)
    }

    static async checkOnline(userIds: bigint[]): Promise<Map<bigint, boolean>> {
        const instance = await UserOnlineService.make();
        const statusMap = new Map<bigint, boolean>();
        for (const userId of userIds) {
            const map = instance.findPartitionAndPosition(Number(userId));
            const cacheKey = `online:${map.partition}`;
            const status = await instance.cache.getbit(cacheKey, map.position)
            statusMap.set(userId, status === 1);
        }
        return statusMap;
    }
}