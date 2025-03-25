import { Friend, Prisma } from "@prisma/db-friend";
import { generateRef, strMd5 } from "@repo/server/utils";
import { prisma } from '@/lib/database';
import { CachePlus } from "@repo/server/cache";
import { getInstance } from "@/lib/cache";
import JsonBigInt from 'json-bigint';
import { IModel } from "@repo/enums";
export class FriendService {
  static modelName: string = "friend";
  private cache: CachePlus;
  private model: Prisma.FriendDelegate;
  private static instance: FriendService;
  private constructor(cache: CachePlus) {
    this.cache = cache;
    this.model = prisma.friend;
  }
  static async make() {
    if (!FriendService.instance) {
      const cacheClient = await getInstance();
      const cache = new CachePlus(FriendService.modelName, cacheClient);
      FriendService.instance = new FriendService(cache);
    }
    return FriendService.instance;
  }
  static async getIdListByUserId(userId: bigint, page: number, limit: number) {
    const instance = await FriendService.make();
    const items = await instance.model.findMany({
      select: {
        id: true,
      },
      where: {
        userId,
        relation: { in: [IModel.IFriend.Relation.BOTH_FRIENDS, IModel.IFriend.Relation.ONE_WAY_FRIEND] }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })
    return items.map(item => item.id);
  }

  static async getMyFriendIds(userId: bigint) {
    const instance = await FriendService.make();
    const items = await instance.model.findMany({
      select: {
        friendId: true,
      },
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return items.map(item => item.friendId);
  }

  static async findByHashKey(hashKey: string): Promise<{ id: bigint, chatId: string, friendId: bigint } | null> {
    const instance = await FriendService.make();
    const cacheKey = `hk:${hashKey}`;
    let value = await instance.cache.get<string | undefined>(cacheKey);

    if (!value) {
      const item = await instance.model.findFirst({
        select: {
          id: true,
          chatId: true,
          friendId: true
        },
        where: {
          hashKey,
        },
      });
      console.log('[][]', item);
      if (!item) {
        await instance.cache.set(cacheKey, { id: -1n, chatId: '' });
        return null;
      }
      value = JsonBigInt.stringify(item)
      await instance.cache.set(cacheKey, value);
    }
    const item = JsonBigInt.parse(value ?? '{}') as { id: bigint, chatId: string, friendId: bigint }
    if (item.chatId && item.chatId !== '') {
      return item
    }
    return null;
  }


  static async create(userId: bigint, friendId: bigint, chatId: string) {
    const userIdArr = [userId, friendId]
    const instance = await FriendService.make();
    const result = await instance.model.create({
      data: {
        userId,
        friendId,
        relation: IModel.IFriend.Relation.BOTH_FRIENDS,
        hashKey: generateRef(userIdArr),
        chatId
      }
    });
    if (userId) {
      const cacheKey = `uid:${userId}`
      await instance.cache.del(cacheKey);
    }
    return result;
  }

  static async findAllByUserId(userId: bigint) {
    const instance = await FriendService.make();
    return await instance.model.findMany({
      where: {
        userId,
      }
    });
  }

  static async findByUserIdAndFriendIds(userId: bigint, friendIds: bigint[]) {
    const instance = await FriendService.make();
    const result = await instance.model.findMany({
      where: {
        userId: userId,
        friendId: { in: friendIds },
      },
      select: { id: true },
      orderBy: {
        id: "desc",
      },
    });
    return result;
  }

  static async getIdsByUserId(userId: bigint, page: number, limit: number) {
    const instance = await FriendService.make();
    const cacheKey = `ids:${page}-${limit}-${userId}`
    let cacheVal = await instance.cache.get<string | undefined>(cacheKey);
    if (!cacheVal) {
      const friends = await instance.model.findMany({
        select: {
          id: true,
        },
        where: {
          userId,
        },
        orderBy: {
          id: "desc",
        },
      });
      const ids = friends.map((v) => v.id);
      await instance.cache.set(cacheKey, JsonBigInt.stringify(ids), 500);
      return ids;
    }
    return JsonBigInt.parse(cacheVal) as bigint[];
  }


  static async blockById(id: bigint, userId: bigint) {
    const instance = await FriendService.make();
    const old = await FriendService.findById(id);
    const result = await instance.model.update({
      where: {
        id,
        userId
      },
      data: {
        relation: IModel.IFriend.Relation.BLOCKED
      }
    });
    if (old && old.userId) {
      const cacheKey = `user-list:${old.userId}`
      await instance.cache.del(cacheKey);
    }
    return result;
  }


  static async blockOutById(id: bigint, userId: bigint) {
    const instance = await FriendService.make();
    const old = await FriendService.findById(id);
    const result = await instance.model.update({
      where: {
        id,
        userId
      },
      data: {
        relation: IModel.IFriend.Relation.BOTH_FRIENDS
      }
    });
    if (old && old.userId) {
      const cacheKey = `user-list:${old.userId}`
      await instance.cache.del(cacheKey);
    }
    return result;
  }

  static async delById(id: bigint) {
    const instance = await FriendService.make();
    const old = await FriendService.findById(id);
    const result = await instance.model.delete({
      where: {
        id,
      },
    });
    if (old && old.userId) {
      const cacheKey = `user-list:${old.userId}`
      await instance.cache.del(cacheKey);
    }
    return result;
  }

  static async delByIds(ids: bigint[]) {
    const instance = await FriendService.make();
    const olds = await instance.model.findMany({
      select: {
        id: true,
        userId: true,
      },
      where: {
        id: {
          in: ids,
        },
      },
    });
    for (const old of olds) {
      await instance.cache.del(`user-list:${old.userId}`);
      await instance.cache.del(`info:${old.id}`)
    }
    return await instance.model.deleteMany({
      where: { id: { in: ids } }
    })

  }

  static async findById(id: bigint) {
    const items = await FriendService.findByIds([id])
    return items.length > 0 ? items[0] : null;
  }
  static async findByIds(ids: bigint[]) {
    const instance = await FriendService.make();
    const results: Friend[] = [];
    const missingIds: bigint[] = [];

    for (const id of ids) {
      const cacheKey = `id:${id}`
      const cacheVal = await instance.cache.get<string | undefined>(cacheKey);
      if (cacheVal) {
        results.push(JsonBigInt.parse(cacheVal) as Friend);
      } else {
        missingIds.push(id);
      }
    }

    if (missingIds.length) {
      const missingResults = await instance.model.findMany({
        where: {
          id: { in: missingIds },
        },
      });
      for (const friend of missingResults) {
        const cacheKey = `info:${friend.id}`
        await instance.cache.set(cacheKey, JsonBigInt.stringify(friend), 500);
        results.push(friend);
      }
    }

    return results;
  }

  static async update(id: bigint, data: Prisma.FriendUpdateInput) {
    const instance = await FriendService.make();
    const result = await instance.model.update({
      where: {
        id,
      },
      data,
    });
    const cacheKey = `id:${id}`
    await instance.cache.del(cacheKey);
    return result;
  }
  static async isFriends(userId: bigint, userIds: bigint[]): Promise<{
    userId: bigint;
    status: boolean;
    chatId: string,
    friendId: bigint
  }[]> {
    const results: {
      userId: bigint;
      status: boolean;
      chatId: string,
      friendId: bigint
    }[] = [];
    console.log(userIds);

    for (let index = 0; index < userIds.length; index++) {
      const friendId = userIds[index];
      const userIdArr = [userId, friendId]
      const hashKey = generateRef(userIdArr);
      console.log('query hash:', hashKey);

      let isFriend = false;
      let hashItem = await FriendService.findByHashKey(hashKey)
      isFriend = hashItem !== null

      results.push({
        userId: friendId,
        status: isFriend,
        chatId: hashItem?.chatId ?? '',
        friendId: hashItem?.id ?? 0n
      });
    }

    return results;
  }

  static async batchUnFriend(userId: bigint, friendIds: bigint[]) {
    const instance = await FriendService.make();
    for (const friendId of friendIds) {
      const hashKey = generateRef([userId, friendId]);
      const reverseHashKey = generateRef([friendId, userId]);
      await instance.cache.del(hashKey);
      await instance.cache.del(reverseHashKey);
    }
    return await instance.model.updateMany({
      where: {
        userId: {
          in: friendIds
        },
        friendId: userId
      },
      data: {
        relation: IModel.IFriend.Relation.ONE_WAY_FRIEND
      }
    });
  }
  static async blockFriendId(userId: bigint): Promise<bigint[]> {
    const instance = await FriendService.make();
    const ids = await instance.model.findMany({
      where: {
        userId,
        relation: IModel.IFriend.Relation.BLOCKED
      },
      select: {
        id: true
      }
    })
    return ids.map(i => i.id)
  }

}
