import { GroupMembers, Prisma } from "@prisma/db-group";
import { HTTPException } from "hono/http-exception";
import { BaseService } from "./base-prisma.service";

import cacheUtil, { getInstance } from "@/lib/cache";
import { IModel } from "@repo/enums";

export class GroupMemberService extends BaseService {
  static instance: GroupMemberService

  static async make(): Promise<GroupMemberService> {
    if (!this.instance) {
      const cacheClient = await getInstance()
      this.instance = new GroupMemberService(cacheClient)
    }
    return this.instance
  }

  protected prefixCacheKey(): string {
    return cacheUtil.KEY_GROUP
  }

  async create(data: Prisma.GroupMembersCreateInput): Promise<GroupMembers> {
    return await super.getClient().groupMembers.create({ data });
  }

  async createMany(
    data: Prisma.GroupMembersCreateInput[]
  ): Promise<Prisma.BatchPayload> {
    return await super.getClient().groupMembers.createMany({ data });
  }

  async update(
    id: bigint,
    data: Prisma.GroupMembersUpdateInput
  ): Promise<GroupMembers> {
    return await super.getClient().groupMembers.update({
      where: { id },
      data,
    });
  }
  async groupMemberById(
    groupId: bigint,
    uId: bigint
  ): Promise<GroupMembers | null> {
    return await super.getClient().groupMembers.findFirst({
      where: {
        groupId: groupId,
        uid: uId,
        status: IModel.IGroup.IGroupMemberStatus.NORMAL,
      },
    });
  }

  async groupMemberByIdIn(
    groupIds: bigint[],
    uId: bigint
  ): Promise<GroupMembers[]> {
    return await super.getClient().groupMembers.findMany({
      where: {
        groupId: { in: groupIds },
        uid: uId,
        status: IModel.IGroup.IGroupMemberStatus.NORMAL,
      },
    });
  }


  async groupMemberRecord(
    groupId: bigint,
    uId: bigint
  ): Promise<GroupMembers | null> {
    return await super.getClient().groupMembers.findFirst({
      where: {
        groupId: groupId,
        uid: uId,
      },
    });
  }

  /**
   * 把所有异常的member都清空
   * @param groupId
   * @param uIds
   */
  async deleteByGroupIdAndUserIdIn(groupId: bigint, uIds: bigint[]) {
    await super.getClient().groupMembers.deleteMany({
      where: {
        groupId: groupId,
        uid: { in: uIds },
        status: { not: IModel.IGroup.IGroupMemberStatus.NORMAL },
      },
    });
  }

  async getGroupMemberIdsByIdIn(
    groupId: bigint,
    uIds: bigint[]
  ): Promise<bigint[]> {
    const members = await super.getClient().groupMembers.findMany({
      where: {
        groupId: groupId,
        uid: { in: uIds },
      },
      select: {
        uid: true,
      },
    });
    return members.map((m: any) => m.uid);
  }

  // 获取某uid的groupId
  async findGroupIdByUid(
    uId: bigint
  ): Promise<bigint[]> {
    const mineGroups = await super.getClient().groupMembers.findMany({
      where: {
        uid: { equals: uId },
        status: IModel.IGroup.IGroupMemberStatus.NORMAL,
      },
      select: {
        groupId: true,
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });
    return mineGroups.map((e) => e.groupId);
  }

  async deleteByGroupIdsAndUIdIn(
    groupIds: bigint[],
    uIds: bigint[]
  ): Promise<Prisma.BatchPayload> {
    return await super.getClient().groupMembers.deleteMany({
      where: {
        groupId: { in: groupIds },
        uid: { in: uIds },
      },
    });
  }

  async deleteByGroupIds(groupIds: bigint[]): Promise<Prisma.BatchPayload> {
    return await super.getClient().groupMembers.deleteMany({
      where: { groupId: { in: groupIds } },
    });
  }

  async findMany(
    param: Prisma.GroupMembersFindManyArgs
  ): Promise<GroupMembers[]> {
    return await super.getClient().groupMembers.findMany(param);
  }

  async count(param: Prisma.GroupMembersCountArgs): Promise<number> {
    return await super.getClient().groupMembers.count(param);
  }

  async findByGroupIdInRole(
    groupIds: bigint[],
    role: IModel.IGroup.IGroupMemberRoleEnum,
    userId: bigint
  ): Promise<bigint[]> {
    const data = await super.getClient().groupMembers.findMany({
      where: {
        groupId: { in: groupIds },
        uid: userId,
        role: role,
        status: IModel.IGroup.IGroupMemberStatus.NORMAL,
      },
      select: {
        groupId: true,
      },
    });
    return data.map((d: any) => d.groupId);
  }

  /**
   * 获取有群权限的成员
   * @param groupId
   * @param role
   * @param uIds
   * @returns
   */
  async groupMembersByRole(
    groupId: bigint,
    role: IModel.IGroup.IGroupMemberRoleEnum,
    uIds: bigint[]
  ): Promise<GroupMembers[]> {
    const where: Prisma.GroupMembersWhereInput = {
      groupId: groupId,
      role: { lte: role },
      status: IModel.IGroup.IGroupMemberStatus.NORMAL,
    };
    if (uIds.length > 0) {
      where.uid = { in: uIds };
    }
    return await super.getClient().groupMembers.findMany({
      where,
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  /**
   * 修改角色
   */
  async updateRole(
    groupId: bigint,
    userId: bigint,
    role: IModel.IGroup.IGroupMemberRoleEnum
  ) {
    return await super.getClient().groupMembers.updateMany({
      where: { groupId: groupId, uid: userId },
      data: {
        role: role,
      },
    });
  }

  async updateMany(
    param: Prisma.GroupMembersUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await super.getClient().groupMembers.updateMany(param);
  }
  /**
   * 获取群角色
   * @param groupId
   * @param uId
   */
  async getGroupRole(groupId: bigint, uId: bigint): Promise<number> {
    const member = await super.getClient().groupMembers.findFirst({
      where: {
        groupId: groupId,
        uid: uId,
      },
      select: {
        role: true,
      },
    });
    if (member === null) {
      throw new HTTPException(400, { message: "不在群组内" });
    }
    return member.role;
  }

  // 群组权限检查
  async checkGroupRole(
    groupId: bigint,
    uId: bigint,
    roles: IModel.IGroup.IGroupMemberRoleEnum[]
  ): Promise<IModel.IGroup.IGroupMemberRoleEnum> {
    const role = await this.getGroupRole(groupId, uId);
    if (!roles.includes(role)) {
      throw new HTTPException(400, { message: "没有群组权限" });
    }
    return role;
  }

  async findGroupManager(groupId: bigint): Promise<bigint[]> {
    const groupMembers = await super.getClient().groupMembers.findMany({
      where: {
        role: {
          in: [IModel.IGroup.IGroupMemberRoleEnum.MANAGER, IModel.IGroup.IGroupMemberRoleEnum.OWNER],
        },
        groupId,
        status: IModel.IGroup.IGroupMemberStatus.NORMAL,
      },
      select: {
        uid: true,
      },
    });
    return groupMembers.map((g: any) => g.uid);
  }

  /**
   * 获取群内成员数量
   * @param groupIds 
   */
  async memberCountByGroupIds(groupIds: bigint[]): Promise<Map<bigint, number>> {
    const groupMembers = await super.getClient().groupMembers.groupBy({
      where: {
        groupId: { in: groupIds },
        status: IModel.IGroup.IGroupMemberStatus.NORMAL,
      },
      by: ['groupId'],
      _count: {
        id: true
      },
    })
    console.log('members', groupMembers);

    const result: Map<bigint, number> = new Map()
    if (groupMembers.length > 0) {
      groupMembers.forEach(g => {
        result.set(g.groupId, g._count.id)
      })
    }
    return result
  }

  async groupIdAfter(currentUserId: bigint, lastTime: number): Promise<bigint[]> {

    const data = await super.getClient().groupMembers.findMany({
      where: {
        uid: currentUserId,
        ...(lastTime > 0 ? {
          createdAt: { gte: new Date(lastTime * 1000) }
        } : {})
      },
    })
    return data.map(u => u.groupId)

  }


}
