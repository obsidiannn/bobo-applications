import { FriendApply, Prisma } from "@prisma/db-friend";
import { getInstance } from "@/lib/cache";
import { generateRef } from "@repo/server/utils";
import { CachePlus } from "@repo/server/cache";
import { prisma } from '@/lib/database';
import JsonBigInt from 'json-bigint';
import { IModel } from "@repo/enums";
export class FriendApplyService {
  static modelName: string = "friend_apply";
  private cache: CachePlus;
  private model: Prisma.FriendApplyDelegate;
  private static instance: FriendApplyService;
  private constructor(cache: CachePlus) {
    this.cache = cache;
    this.model = prisma.friendApply;
  }
  static async make() {
    if (!FriendApplyService.instance) {
      const cacheClient = await getInstance();
      const cache = new CachePlus(FriendApplyService.modelName, cacheClient);
      FriendApplyService.instance = new FriendApplyService(cache);
    }
    return FriendApplyService.instance;
  }
  static async create(data: Prisma.FriendApplyCreateInput) {
    const instance = await FriendApplyService.make();
    return await instance.model.create({ data });
  }
  static async getIdList(userId: bigint, page: number, limit: number) {
    const instance = await FriendApplyService.make();
    const items = await instance.model.findMany({
      select: {
        id: true
      },
      where: {
        OR: [
          { userId: userId },
          { friendId: userId }
        ],
        // status: IModel.IFriendApply.Status.PENDING
      },

      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });
    return items.map(i => i.id);
  }
  static async delAllByUserId(userId: bigint) {
    const instance = await FriendApplyService.make();
    const friendApplies: FriendApply[] = await FriendApplyService.getListByUserId(userId)
    const ids = friendApplies.map(f => f.id)
    await instance.model.deleteMany({
      where: {
        id: { in: ids }
      }
    })
    for (const id of ids) {
      await instance.cache.del(`id:${id}`);
    }
    await instance.cache.del(`uid:${userId}`);
    return true;
  }
  static async findByIds(ids: bigint[] | number[]) {
    const instance = await FriendApplyService.make();
    const unCachedIds: bigint[] = [];
    const items: FriendApply[] = [];
    for (const id of ids) {
      const cacheVal = await instance.cache.get<string | undefined>(`id:${id}`);
      if (cacheVal) {
        try {
          items.push(JsonBigInt.parse(cacheVal as string) as FriendApply);
        } catch (error) {
          continue;
        }
      } else {
        unCachedIds.push(BigInt(id));
        continue;
      }
    }
    if (unCachedIds.length > 0) {
      const uncachedItems = await this.instance.model.findMany({
        where: {
          id: {
            in: unCachedIds,
          },
        },
      });
      for (const uncachedItem of uncachedItems) {
        items.push(uncachedItem)
        await instance.cache.set(`id:${uncachedItem.id}`, JsonBigInt.stringify(uncachedItem));
      }
    }
    return items;
  }
  static async getListByUserId(userId: bigint) {
    const instance = await FriendApplyService.make();
    const cacheKey = `uid-list:${userId}`;
    const cacheVal = await instance.cache.get<string | undefined>(cacheKey);
    let ids: bigint[] = [];
    if (!cacheVal) {
      const tmps = await instance.model.findMany({
        select: {
          id: true,
        },
        where: {
          OR: [
            {
              userId,
            },
            {
              friendId: userId,
            },
          ],
        },
        orderBy: {
          id: "desc",
        },
      });
      const t = JsonBigInt.stringify(tmps.map((tmp) => tmp.id));
      await instance.cache.set(cacheKey, t, 6000);
      ids = tmps.map((tmp) => BigInt(tmp.id));
    } else {
      ids = JsonBigInt.parse(cacheVal ?? "[]") as bigint[]
    }
    return await FriendApplyService.findByIds(ids);
  }
  static async updateCustomWhere(
    where: Prisma.FriendApplyWhereUniqueInput,
    data: Prisma.FriendApplyUpdateInput
  ) {
    const instance = await FriendApplyService.make();
    const result = await instance.model.update({
      where,
      data,
    });

    if (result.id) {
      await instance.cache.del(`id:${result.id}`);
    }
    return result;
  }
  static async agree(hashKey: string) {
    await FriendApplyService.instance.model.updateMany({
      where: {
        hashKey
      },
      data: {
        status: IModel.IFriendApply.Status.PASSED,
        updatedAt: new Date()
      }
    })
  }
  static async reject(id: bigint, reason: string) {
    return await FriendApplyService.updateCustomWhere(
      {
        id,
        status: IModel.IFriendApply.Status.PENDING,
      },
      {
        status: IModel.IFriendApply.Status.REJECT,
      }
    );
  }
  static async delById(id: bigint) {
    const instance = await FriendApplyService.make();
    const cacheKey = `id:${id}`;
    const old = await FriendApplyService.findById(id);
    if (old && old.userId && old.friendId) {
      const hashKey = generateRef([old.userId, old.friendId]);
      await instance.cache.del(`hk:${hashKey}`);
      await instance.cache.del(`uid:${old.userId}`);
      await instance.cache.del(`uid:${old.friendId}`);
    }
    const item = await instance.model.delete({
      where: {
        id,
      },
    });
    await instance.cache.del(cacheKey);
    return item;
  }

  static async findByHashKey(hashKey: string, userId: bigint) {
    const cacheKey = `hk:${hashKey}-${userId}`;
    const instance = await FriendApplyService.make();
    let id = await instance.cache.get<bigint | undefined>(cacheKey);
    if (!id) {
      const item = await instance.model.findFirst({
        select: {
          id: true,
        },
        where: {
          hashKey,
          userId
        },
      });
      await instance.cache.set(cacheKey, -1, 50000);
      if (!item) {
        return null;
      }
      id = item.id
      await instance.cache.set(cacheKey, id, 50000);
    }
    return await FriendApplyService.findById(id);
  }
  static async findById(id: bigint) {
    const items = await FriendApplyService.findByIds([BigInt(id)]);
    return items.length > 0 ? items[0] : null;
  }
}
