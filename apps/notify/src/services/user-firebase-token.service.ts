import { Prisma, UserFirebaseToken } from "@prisma/db-notify";
import { getInstance } from "@/lib/cache";
import { log as logger } from "@/lib/system";
import { prisma } from "@/lib/database";
import { CachePlus } from "@repo/server/cache";
import JsonBigInt from "json-bigint";
import { group, unique } from 'radash'
export class UserFirebaseTokenService {
    static modelName: string = "user_firebase_tokens";
    private cache: CachePlus;
    private model: Prisma.UserFirebaseTokenDelegate;
    private static instance: UserFirebaseTokenService;
    private constructor(cache: CachePlus) {
        this.cache = cache;
        this.model = prisma.userFirebaseToken;
    }

    static async make() {
        if (!UserFirebaseTokenService.instance) {
            const cacheClient = await getInstance();
            const cache = new CachePlus(UserFirebaseTokenService.modelName, cacheClient);
            UserFirebaseTokenService.instance = new UserFirebaseTokenService(cache);
        }
        return UserFirebaseTokenService.instance;
    }
    static async findTokensByUserIds(userIds: bigint[]) {
        const items = await UserFirebaseTokenService.findListByUserIds(userIds);
        const tokens: string[] = items.map(item => item.token ?? "").filter(v => v != '');
        return unique(tokens, v => v);
    }
    static async findByIds(ids: bigint[]) {
        const instance = await UserFirebaseTokenService.make();
        const items: UserFirebaseToken[] = [];
        const cachedValues = await instance.cache.mget(...ids.map((id) => `id:${id}`));
        for (const cachedValue of cachedValues) {
            if (cachedValue) {
                try {
                    const item = JsonBigInt.parse(cachedValue as string) as UserFirebaseToken;
                    items.push(item);
                } catch (e) {
                    logger.error(e);
                    continue;
                }
            }
        }
        if (items.length === ids.length) {
            return items;
        }
        const cachedIds = items.map((item) => item.id);
        const unCachedIds = ids.filter((id) => !cachedIds.includes(id));
        const records = await instance.model.findMany({
            where: {
                id: {
                    in: unCachedIds,
                },
            },
        });
        for (const record of records) {
            await instance.cache.set(`id:${record.id}`, JsonBigInt.stringify(record), 6000);
            items.push(record);
        }
        return items;
    }
    static async create(data: Prisma.UserFirebaseTokenCreateInput) {

        console.log("创建新的token注册信息", data)
        const instance = await UserFirebaseTokenService.make();
        const result = await instance.model.create({ data });
        // 删除token组缓存
        await instance.cache.del(`uid:${result.userId}`);
        return result;
    }
    static async updateTokenById(id: bigint, token: string) {
        const instance = await UserFirebaseTokenService.make();
        const result = await instance.model.update({
            where: {
                id
            },
            data: {
                token
            }
        });
        return result;
    }
    static async findByDeviceId(deviceId: string, userId: bigint) {
        // const items = await UserFirebaseTokenService.findByDeviceIds([deviceId]);
        const instance = await UserFirebaseTokenService.make();
        const key = `did:${deviceId}-${userId}`
        try {
            const cachedValue = await instance.cache.get<string>(key);
            if (cachedValue) {
                const result = JsonBigInt.parse(cachedValue) as UserFirebaseToken
                if (result) {
                    return result
                }
            }
        } catch (e) {

        }
        const data = await instance.model.findMany({
            where: {
                deviceId,
                userId
            }
        })
        if (data.length > 0) {
            const e = data[0]
            instance.cache.set(key, JsonBigInt.stringify(e))
            return e
        }
        return null;

    }
    static async findListByUserId(userId: bigint) {
        const items = await UserFirebaseTokenService.findListByUserIds([userId]);
        return items.length ? items[0] : null;
    }
    static async findListByUserIds(userIds: bigint[]) {
        const instance = await UserFirebaseTokenService.make();
        let items: UserFirebaseToken[] = [];
        let ids: bigint[] = []
        const unCachedUserIds: bigint[] = [];
        for (const userId of userIds) {
            const cachedValue = await instance.cache.get<string>(`uid:${userId}`);
            if (cachedValue) {
                try {
                    ids = ids.concat(JsonBigInt.parse(cachedValue) as bigint[])
                } catch (e) {
                    logger.error(e);
                    continue;
                }
            } else {
                unCachedUserIds.push(userId);
            }
        }
        if (ids.length > 0) {
            const records = await UserFirebaseTokenService.findByIds(ids);
            items = items.concat(records);
        }
        if (unCachedUserIds.length > 0) {
            const records = await instance.model.findMany({
                where: {
                    userId: {
                        in: unCachedUserIds,
                    },
                },
            });
            const groupRecordsMap = group(records, (item) => Number(item.userId ?? 0));
            for (const unCachedUserId of unCachedUserIds) {
                const groupRecords = groupRecordsMap[Number(unCachedUserId)];
                if (groupRecords) {
                    items = items.concat(groupRecords);
                    await instance.cache.set(`uid:${unCachedUserId}`, JsonBigInt.stringify(groupRecords.map(record => record.id)), 6000);
                }
            }

        }
        return items;
    }

    static async findByDeviceIds(deviceIds: string[]) {
        const instance = await UserFirebaseTokenService.make();
        const unCachedDeviceIds: string[] = [];
        const result: UserFirebaseToken[] = []
        for (const deviceId of deviceIds) {
            const cachedValue = await instance.cache.get<string>(`did:${deviceId}`);
            if (cachedValue) {
                try {
                    const e = JsonBigInt.parse(cachedValue) as UserFirebaseToken
                    result.push(e)
                } catch (e) {
                    logger.error(e);
                    unCachedDeviceIds.push(deviceId);
                    continue;
                }
            } else {
                unCachedDeviceIds.push(deviceId);
            }
        }
        if (unCachedDeviceIds.length <= 0) {
            return result
        }

        const records = await instance.model.findMany({
            where: {
                deviceId: {
                    in: unCachedDeviceIds,
                },
            },
        });
        console.log('recordsresult', result);
        for (const record of records) {
            await instance.cache.set(`did:${record.deviceId}`, record.id, 6000);
            result.push(record);
        }
        console.log('result', result);
        return result;
    }

}
