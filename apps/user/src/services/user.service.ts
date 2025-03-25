import { Prisma, User } from "@prisma/db-user";
import { getInstance } from "@/lib/cache";
import { log as logger } from "@/lib/system";
import { prisma } from "@/lib/database";
import { CachePlus } from "@repo/server/cache";
import JsonBigInt from "json-bigint";
export class UserService {
  static modelName: string = "users";
  private cache: CachePlus;
  private model: Prisma.UserDelegate;
  private static instance: UserService;
  private constructor(cache: CachePlus) {
    this.cache = cache;
    this.model = prisma.user;
  }
  static async make() {
    if (!UserService.instance) {
      const cacheClient = await getInstance();
      const cache = new CachePlus(UserService.modelName, cacheClient);
      UserService.instance = new UserService(cache);
    }
    return UserService.instance;
  }
  static async findByAddrs(addrs: string[]) {
    const instance = await UserService.make();
    const items: User[] = [];
    const cachedValues = await instance.cache.mget(
      ...addrs.map((addr) => `addr:${addr}`)
    );
    for (const cachedValue of cachedValues) {
      if (cachedValue) {
        try {
          const user = JsonBigInt.parse(cachedValue as string) as User;
          items.push(user);
        } catch (e) {
          logger.error(e);
          continue;
        }
      }
    }
    if (items.length === addrs.length) {
      return items;
    }
    const cachedAddrs = items.map((item) => item.addr);
    const unCachedAddrs = addrs.filter((addr) => !cachedAddrs.includes(addr));
    const users = await instance.model.findMany({
      where: {
        addr: {
          in: unCachedAddrs,
        },
      },
    });
    for (const user of users) {
      await instance.cache.set(`addr:${user.addr}`, JsonBigInt.stringify(user));
      items.push(user);
    }
    return items;
  }
  static async findByUserNames(userNames: string[]) {
    const instance = await UserService.make();
    const items: User[] = [];
    const cachedValues = await instance.cache.mget(
      ...userNames.map((userName) => `uname:${userName}`)
    );
    for (const cachedValue of cachedValues) {
      if (cachedValue) {
        try {
          const user = JsonBigInt.parse(cachedValue as string) as User;
          items.push(user);
        } catch (e) {
          logger.error(e);
          continue;
        }
      }
    }
    if (items.length === userNames.length) {
      return items;
    }
    const cachedUserNames = items.map((item) => item.userName);
    const unCachedUserNames = userNames.filter((userName) => !cachedUserNames.includes(userName));
    const users = await instance.model.findMany({
      where: {
        userName: {
          in: unCachedUserNames,
        },
      },
    });
    for (const user of users) {
      await instance.cache.set(`uname:${user.userName}`, JsonBigInt.stringify(user));
      items.push(user);
    }
    return items;
  }
  static async findByAddr(address: string) {
    const users = await UserService.findByAddrs([address]);
    return users.length ? users[0] : null;
  }
  static async findByUserName(userName: string) {
    const users = await UserService.findByUserNames([userName]);
    return users.length ? users[0] : null;
  }
  static async findById(id: bigint) {
    const users = await UserService.findByIds([id]);
    return users.length ? users[0] : null;
  }
  static async add(data: Prisma.UserCreateInput): Promise<User> {
    const instance = await UserService.make();
    const user = await instance.model.create({
      data,
    });
    await instance.cache.del(`addr:${user.addr}`);
    return user;
  }

  static async update(id: bigint, data: Prisma.UserUpdateInput) {
    const instance = await UserService.make();
    const user = await instance.model.update({
      where: {
        id,
      },
      data,
    });
    await instance.cache.del(`un:${user.userName}`);
    await instance.cache.del(`id:${id}`);
    return user;
  }

  static async deleteById(id: bigint) {
    const instance = await UserService.make();
    const user = await UserService.findById(id)
    if (user) {
      await instance.model.delete({
        where: { id: user.id }
      })
      await instance.cache.del(`un:${user.userName}`);
      await instance.cache.del(`id:${user.id}`);
    }
    return true;
  }

  static async checkByIds(ids: bigint[]) {
    const users = await UserService.findByIds(ids);
    return users.map((u) => u.id);
  }

  static async findByIds(ids: bigint[]) {
    const instance = await UserService.make();
    const users: User[] = [];
    const cacheKeys = ids.map((id) => `id:${id}`);
    const cachedUsers = await instance.cache.mget(...cacheKeys);
    for (const cachedUser of cachedUsers) {
      if (cachedUser) {
        try {
          users.push(JsonBigInt.parse(cachedUser as string) as User);
        } catch (error) {
          logger.error("Error fetching data:" + JSON.stringify(error));
          continue;
        }
      }
    }
    const cachedIds = users.map((u) => u.id);
    const unCachedIds = ids.filter((id) => !cachedIds.includes(id));
    if (unCachedIds.length > 0) {
      const fetchedUsers = await instance.model.findMany({
        where: {
          id: {
            in: unCachedIds,
          },
        },
      });
      for (const user of fetchedUsers) {
        users.push(user);
        await instance.cache.set(`id:${user.id}`, JsonBigInt.stringify(user));
      }
    }
    return users;
  }

}
