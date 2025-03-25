import { Group, Prisma } from "@prisma/db-group";
import { BaseService } from "./base-prisma.service";
import cacheUtil, { getInstance } from "@/lib/cache";
import JsonBigInt from 'json-bigint'

export class GroupService extends BaseService {

  static instance: GroupService

  static async make(): Promise<GroupService> {
    if (!this.instance) {
      const cacheClient = await getInstance()
      this.instance = new GroupService(cacheClient)
    }
    return this.instance
  }


  protected prefixCacheKey(): string {
    return cacheUtil.KEY_GROUP
  }

  async getCache(id: bigint): Promise<Group | null> {
    const val = await super.getCachePlus().get<string | undefined>(id + '')
    if (val) {
      return JsonBigInt.parse(val) as Group
    }
    return null
  }

  async setCache(id: bigint, val: Group): Promise<void> {
    super.getCachePlus().set(id + '', JsonBigInt.stringify(val), 60000)
  }

  async clearCache(id: bigint): Promise<void> {
    super.getCachePlus().del(id + '')
  }

  async create(data: Prisma.GroupCreateInput) {
    return await super.getClient().group.create({ data });
  }

  async count(param: Prisma.GroupCountArgs): Promise<number> {
    return await super.getClient().group.count(param);
  }

  async changeChatId(groupId: bigint, chatId: string): Promise<Group> {
    return await super.getClient().group.update({
      where: {
        id: groupId,
      },
      data: {
        chatId: chatId
      }
    })
  }

  async findByIds(groupIds: bigint[]): Promise<Group[]> {
    const ids: bigint[] = []
    const result: Group[] = []
    for (let i = 0; i < groupIds.length; i++) {
      const id = groupIds[i];
      const g = await this.getCache(id)
      if (g === null) {
        ids.push(id)
      } else {
        result.push(g)
      }
    }

    if (ids.length > 0) {
      const groups = await super.getClient().group.findMany({
        where: { id: { in: ids } },
      });
      groups.forEach((g: Group) => {
        const item: Group = g as Group
        this.setCache(item.id, item)
        result.push(item)
      })
    }
    return result
  }


  async findMany(param: Prisma.GroupFindManyArgs): Promise<Group[]> {
    return await super.getClient().group.findMany(param);
  }

  // 修改群名称
  async changeName(groupId: bigint, name: string): Promise<Group> {
    const result = await super.getClient().group.update({
      where: { id: groupId },
      data: { name },
    })
    this.clearCache(groupId)
    return result;
  }

  // 修改群头像
  async changeAvatar(groupId: bigint, avatar: string): Promise<Group> {
    const result = await super.getClient().group.update({
      where: { id: groupId },
      data: { avatar },
    })
    this.clearCache(groupId)
    return result
  }

  // 修改群通告
  async changeNotice(groupId: bigint, notice: string): Promise<Group> {
    const result = await super.getClient().group.update({
      where: { id: groupId },
      data: {
        notice: notice,
      },
    })
    this.clearCache(groupId)
    return result
  }

  // 修改群简介
  async changeDesc(groupId: bigint, describe: string): Promise<Group> {
    const result = await super.getClient().group.update({
      where: { id: groupId },
      data: {
        desc: describe,
      },
    })
    this.clearCache(groupId)
    return result
  }

  // 修改群tag
  async changeTags(groupId: bigint, tags: bigint[]): Promise<Group> {
    const result = await super.getClient().group.update({
      where: { id: groupId },
      data: {
        tags: tags.join(","),
      },
    })
    this.clearCache(groupId)
    return result
  }

  async deleteByIds(groupIds: bigint[]): Promise<Prisma.BatchPayload> {
    const result = await super.getClient().group.deleteMany({
      where: { id: { in: groupIds } },
    })
    groupIds.forEach(g => {
      this.clearCache(g)
    })
    return result
  }
}
