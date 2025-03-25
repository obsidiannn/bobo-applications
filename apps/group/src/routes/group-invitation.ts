// 邀请入群 f
// 申请加群 f
// 同意加群 f
// 拒绝加群  f
// 申请列表 f
// 我的申请列表

import { zValidator } from "@hono/zod-validator";
import { Prisma } from "@prisma/db-group";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { GroupMemberService } from "../services/group-member.service";
import { z } from "zod";
import { chatClient } from '@/api/chat'
import { userClient } from "@/api/user";

import { getInstance } from "@/lib/cache";
import { prisma } from "@/lib/database";
import { GroupService } from "@/services/group.service";
import { authMiddleware } from "@/lib/middlewares";
import { IModel } from "@repo/enums";
import { protos } from '@repo/grpc/proto'
import JsonBigInt from 'json-bigint'
import { EventService } from "@/services/event.service";

const groupRouter = new Hono<{ Variables: { user: protos.user.User } }>();


/**
 * 邀请加入群聊
 */
groupRouter.post(
  "/invite-join",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      id: z.number(),
      items: z.array(
        z.object({
          uid: z.number(),
          encPri: z.string(),
          encKey: z.string(),
        })
      ),
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid",
        });
      }
    }
  ),
  async (c) => {
    const param = c.req.valid("json");
    const currentUser = c.get("user");
    const cacheClient = await getInstance()
    const uIds = param.items.map((i) => BigInt(i.uid));
    const userIds = prisma.$transaction(async (tx) => {
      const groupMemberService = new GroupMemberService(cacheClient, tx);

      const groupService = new GroupService(cacheClient)
      const groups = await groupService.findByIds([BigInt(param.id)])
      if (!groups || groups.length <= 0) {
        return []
      }
      const group = groups[0]

      // 这里是筛选角色，管理员之上
      await groupMemberService.checkGroupRole(BigInt(param.id), BigInt(currentUser.id), [
        IModel.IGroup.IGroupMemberRoleEnum.OWNER,
        IModel.IGroup.IGroupMemberRoleEnum.MANAGER,
      ]);
      await groupMemberService.deleteByGroupIdAndUserIdIn(BigInt(param.id), param.items.map(i => BigInt(i.uid)));
      const itemHash = new Map();
      param.items.forEach((i) => {
        itemHash.set(i.uid, i);
      });

      const users = (await userClient.findUsersByIds(uIds)) ?? []
      const userIds = users.map(u => u.id)
      const members: Prisma.GroupMembersCreateInput[] = users.map((user) => {
        const item = itemHash.get(Number(user.id));
        const member: Prisma.GroupMembersCreateInput = {
          groupId: param.id,
          uid: user.id,
          encPri: item.encPri,
          encKey: item.encKey,
          inviteUid: currentUser.id,
          role: IModel.IGroup.IGroupMemberRoleEnum.MEMBER,
          joinType: 1,
          status: IModel.IGroup.IGroupMemberStatus.NORMAL,
          banType: IModel.ICommon.IActiveEnum.ACTIVE,
        };
        return member;
      });
      await groupMemberService.createMany(members);

      await chatClient.addUsers(group.chatId, userIds.map(BigInt))
      return userIds
    })
    return c.json({
      items: userIds,
    });

  }
);

/**
 * 申请加入群聊
 */
groupRouter.post(
  "/require-join",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      id: z.number(),
      remark: z.optional(z.string()),
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid",
        });
      }
    }
  ),
  async (c) => {
    const param = c.req.valid("json");
    const currentUser = c.get("user");
    // 这里是筛选角色，管理员之上
    const cacheClient = await getInstance()
    prisma.$transaction(async (tx) => {
      const groupMemberService = new GroupMemberService(cacheClient, tx);

      const groupMember = await groupMemberService.groupMemberRecord(
        BigInt(param.id),
        BigInt(currentUser.id)
      );
      if (groupMember !== null) {
        if (groupMember.status === IModel.IGroup.IGroupMemberStatus.NORMAL) {
          return c.json({
            gid: param.id,
            status: groupMember?.status,
            err: "已经加入群组",
          });
        } else if (groupMember.status === IModel.IGroup.IGroupMemberStatus.PENDING) {
          return c.json({
            gid: param.id,
            status: groupMember?.status,
            err: "请等待管理审核",
          });
        }
      }
      if (groupMember === null) {
        const member: Prisma.GroupMembersCreateInput = {
          groupId: param.id,
          uid: currentUser.id,
          encPri: "",
          encKey: "",
          inviteUid: currentUser.id,
          role: IModel.IGroup.IGroupMemberRoleEnum.MEMBER,
          joinType: 2,
          myAlias: currentUser.userName,
          status: IModel.IGroup.IGroupMemberStatus.PENDING,
          banType: IModel.ICommon.IActiveEnum.ACTIVE,
          remark: param.remark,
        };
        await groupMemberService.create(member);
      } else {
        await groupMemberService.update(groupMember.id, {
          status: IModel.IGroup.IGroupMemberStatus.PENDING,
          banType: IModel.ICommon.IActiveEnum.ACTIVE,
          remark: param.remark,
        });
      }

      // const content = {
      //   t: "group_require",
      //   d: "发起了入群申请",
      //   senderId: currentUser.id,
      //   remark: param.remark
      // };
      // 发起入群申请事件
      const managerIds: bigint[] = await groupMemberService.findGroupManager(BigInt(param.id));
      for (let index = 0; index < managerIds.length; index++) {
        const managerId = managerIds[index];
        try {
          await EventService.broadcastRegister(currentUser.id, BigInt(param.id), managerId)
        } catch (error) {
          
        }
      }
    })

    return c.json({ gid: param.id, status: IModel.IGroup.IGroupMemberStatus.PENDING });
  }
);

/**
 * 同意加入群聊
 */
groupRouter.post(
  "/agree-join",
  zValidator(
    "json",
    z.object({
      id: z.number(),
      uid: z.number(),
      encPri: z.string(),
      encKey: z.string(),
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid",
        });
      }
    }
  ),
  authMiddleware,
  async (c) => {
    const param = c.req.valid("json");
    const currentUser = c.get("user");
    const cacheClient = await getInstance()
    prisma.$transaction(async (tx) => {
      const groupMemberService = new GroupMemberService(cacheClient, tx);
      const groupService = new GroupService(cacheClient, tx)
      const groups = await groupService.findByIds([BigInt(param.id)])
      if (!groups || groups.length <= 0) {
        return
      }
      const group = groups[0]
      await groupMemberService.checkGroupRole(BigInt(param.id), BigInt(currentUser.id), [
        IModel.IGroup.IGroupMemberRoleEnum.MANAGER,
        IModel.IGroup.IGroupMemberRoleEnum.OWNER,
      ]);
      const existMembers = await groupMemberService.findMany({
        where: {
          groupId: { equals: param.id },
          uid: param.uid,
          status: { equals: IModel.IGroup.IGroupMemberStatus.PENDING },
        },
      });
      if (existMembers.length > 0) {
        // 当前存在的申请记录
        const existIds: bigint[] = existMembers.map((e) => e.id);
        await groupMemberService.updateMany({
          where: {
            groupId: { equals: param.id },
            id: { in: existIds },
          },
          data: {
            status: IModel.IGroup.IGroupMemberStatus.NORMAL,
            encKey: param.encKey,
            encPri: param.encPri,
          },
        });
        await chatClient.addUsers(group.chatId, [BigInt(param.uid)])
      }
    })

    return c.json(null);
  }
);

/**
 * 拒绝加入群聊
 */
groupRouter.post(
  "/reject-join",
  zValidator(
    "json",
    z.object({
      id: z.number(),
      uids: z.array(z.number()),
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid",
        });
      }
    }
  ),
  authMiddleware,
  async (c) => {
    const param = c.req.valid("json");
    const id = BigInt(param.id)
    const uids = param.uids.map(id => BigInt(id))
    const currentUser = c.get("user");
    const cacheClient = await getInstance()

    const groupMemberService = new GroupMemberService(cacheClient);
    await groupMemberService.checkGroupRole(id, BigInt(currentUser.id), [
      IModel.IGroup.IGroupMemberRoleEnum.MANAGER,
      IModel.IGroup.IGroupMemberRoleEnum.OWNER,
    ]);
    await groupMemberService.updateMany({
      where: {
        groupId: { equals: id },
        uid: { in: uids },
        status: { equals: IModel.IGroup.IGroupMemberStatus.PENDING },
      },
      data: {
        status: IModel.IGroup.IGroupMemberStatus.REJECTED,
      },
    });
    return c.json(null);
  }
);

/**
 * 申请人列表
 */
groupRouter.post(
  "/apply-list",
  zValidator(
    "json",
    z.object({
      ids: z.array(z.number()),
      uids: z.optional(z.array(z.number())),
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid",
        });
      }
    }
  ),
  authMiddleware,
  async (c) => {
    const param = c.req.valid("json");
    const currentUser = c.get("user");
    const cacheClient = await getInstance()

    const ids = param.ids.map(id => BigInt(id))
    const uids = param.uids ? param.uids.map(id => BigInt(id)) : []

    const groupMemberService = new GroupMemberService(cacheClient);
    const managedGroups = await groupMemberService.findMany({
      where: {
        groupId: { in: ids },
        uid: currentUser.id,
        role: {
          in: [IModel.IGroup.IGroupMemberRoleEnum.OWNER, IModel.IGroup.IGroupMemberRoleEnum.MANAGER],
        },
      },
    });
    if (managedGroups.length > 0) {
      const groupIds = managedGroups.map((g) => g.groupId);
      const where: Prisma.GroupMembersWhereInput = {
        joinType: { in: [2] },
        groupId: { in: groupIds },
      };
      if (
        uids !== null &&
        uids !== undefined &&
        uids.length > 0
      ) {
        where.uid = { in: uids };
      }
      const pendingMembers = await groupMemberService.findMany({
        where,
      });
      const result = pendingMembers.map((m) => {
        const item = {
          id: m.id,
          gid: m.groupId,
          uid: m.uid,
          encKey: m.encKey,
          role: m.role,
          status: m.status,
          createdAt: m.createdAt === null ? 0 : m.createdAt.getDate(),
          remark: m.remark ?? "",
        };
        return item;
      });
      return c.json({ items: result });
    }
    return c.json({ items: [] });
  }
);

/**
 * 我的申请列表
 */
groupRouter.post("/my-apply-list", authMiddleware, async (c) => {
  const currentUser = c.get("user");
  const cacheClient = await getInstance()

  const groupMemberService = new GroupMemberService(cacheClient);

  const pendingList = await groupMemberService.findMany({
    where: {
      uid: currentUser.id,
      status: IModel.IGroup.IGroupMemberStatus.PENDING,
    },
  });
  const result = pendingList.map((m) => {
    const item = {
      id: m.id,
      gid: m.groupId,
      status: m.status,
      createdAt: m.createdAt,
    };
    return item;
  });
  return c.json({ items: result });
});
export default groupRouter;
