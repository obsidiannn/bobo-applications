import { FriendUserExtendInfo, Prisma } from "@prisma/db-friend";
import { getInstance } from "@/lib/cache";
import { CachePlus } from "@repo/server/cache";
import { prisma } from "@/lib/database";
import JsonBigInt from "json-bigint";
export class FriendUserExtendInfoService {
  static modelName: string = "friend_user_extend_info";
  private cache: CachePlus;
  private model: Prisma.FriendUserExtendInfoDelegate;
  private static instance: FriendUserExtendInfoService;
  private constructor(cache: CachePlus) {
    this.cache = cache;
    this.model = prisma.friendUserExtendInfo;
  }
  static async make() {
    if (!FriendUserExtendInfoService.instance) {
      const cacheClient = await getInstance();
      const cache = new CachePlus(FriendUserExtendInfoService.modelName, cacheClient);
      FriendUserExtendInfoService.instance = new FriendUserExtendInfoService(cache);
    }
    return FriendUserExtendInfoService.instance;
  }
  static async updateByUserId(
    userId: bigint,
    data: Prisma.FriendUserExtendInfoUpdateInput
  ) {
    
    const old = await FriendUserExtendInfoService.findByUserId(userId);
    console.log('old',old);
    
    if (old) {
      return await FriendUserExtendInfoService.update(old.id, data);
    }

    return await FriendUserExtendInfoService.create({
      userId,
      ...data,
    } as Prisma.FriendUserExtendInfoCreateInput);
  }
  static async update(id: bigint, data: Prisma.FriendUserExtendInfoUpdateInput) {
    const instance = await FriendUserExtendInfoService.make();
    const cacheKey = `info:${id}`;
    const result = await instance.model.update({
      where: {
        id,
      },
      data,
    });
    await instance.cache.del(cacheKey);
    return result;
  }
  static async create(data: Prisma.FriendUserExtendInfoCreateInput) {
    const instance = await FriendUserExtendInfoService.make();
    return await instance.model.create({ data });
  }
  static async findByUserIds(userIds: bigint[]) {
    const instance = await FriendUserExtendInfoService.make();
    const cacheKeys = userIds.map((userId) => `uid:${userId.toString()}`);
    console.log(cacheKeys);
    
    const cacheVals = await instance.cache.mget(...cacheKeys); 
    const items: { id: bigint, userId: bigint | null }[] = [];
    for (const cacheVal of cacheVals) {
      if (cacheVal) {
        items.push(JsonBigInt.parse(cacheVal as string) as { id: bigint, userId: bigint });
      }
    }
    if (items.length !== userIds.length) {
      const cachedUserIds = items.map((item) => item.userId);
      const notCachedUserIds = userIds.filter((id) => !cachedUserIds.includes(id));
      if (notCachedUserIds.length > 0) {
        const unCachedItems = await instance.model.findMany({
          select: {
            id: true,
            userId: true,
          },
          where: {
            userId: {
              in: notCachedUserIds
            }
          }
        });
        for (const unCachedItem of unCachedItems) {
          await instance.cache.set(`uid:${unCachedItem.userId}`, JsonBigInt.stringify({
            id: unCachedItem.id,
            userId: unCachedItem.userId,
          }), 600);
          items.push({
            id: unCachedItem.id,
            userId: unCachedItem.userId,
          });
        }
      }
    }
    return FriendUserExtendInfoService.findByIds(items.map(item => item.id));
  }
  static async findByIds(ids: bigint[]) {
    const instance = await FriendUserExtendInfoService.make();
    const cacheKeys = ids.map((id) => `id:${id}`);
    const cacheVals = await instance.cache.mget(...cacheKeys);
    const items: FriendUserExtendInfo[] = [];
    for (const cacheVal of cacheVals) {
      if (cacheVal) {
        try {
          items.push(JsonBigInt.parse(cacheVal as string) as FriendUserExtendInfo);
        } catch (e) {
          console.log(e);
          continue;
        }
      }
    }
    if (items.length !== ids.length) {
      const cachedIds = items.map((item) => item.id);
      const notCachedIds = ids.filter((id) => !cachedIds.includes(id));
      if (notCachedIds.length > 0) {
        const unCachedItems = await instance.model.findMany({
          where: {
            id: {
              in: notCachedIds
            }
          }
        });
        for (const unCachedItem of unCachedItems) {
          await instance.cache.set(`id:${unCachedItem.id}`, JsonBigInt.stringify(unCachedItem), 600);
          items.push(unCachedItem);
        }
      }
    }
    return items;
  }
  static async findByUserId(userId: bigint) {
    const items = await FriendUserExtendInfoService.findByUserIds([userId]);
    return items && items.length > 0 ? items[0] : null;
  }
  static async findById(id: bigint) {
    const items = await FriendUserExtendInfoService.findByIds([id]);
    return items.length > 0 ? items[0] : null;
  }
}
