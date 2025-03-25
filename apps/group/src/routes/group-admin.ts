// 踢出群聊 f
// 添加管理员 f
// 移除管理员 f
// 修改群简介 f
// 修改群名称 f
// 修改群封面 f
// 解散群聊 f
// 转移群组 f
// 修改公告 f
// 更新群分类

// 清空聊天记录 f

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { IModel } from '@repo/enums'
import { arrayDifference } from "@repo/server/utils";
import { GroupMemberService } from "../services/group-member.service";
import { GroupService } from "../services/group.service";
import { z } from "zod";
import { chatClient } from '@/api/chat';

import { prisma } from "@/lib/database";
import { getInstance } from "@/lib/cache";
import { authMiddleware } from "@/lib/middlewares";
import { protos } from '@repo/grpc/proto'
// import { searchClient } from "@/api/search";

const groupRouter = new Hono<{ Variables: { user: protos.user.User } }>();

/**
 * 踢出群聊
 */
groupRouter.post(
  "/kick-out",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      id: z.number(), // groupId
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
  async (c) => {
    const param = c.req.valid("json");
    const currentUser = c.get("user");

    const cacheClient = await getInstance()
    prisma.$transaction(async (tx) => {
      const groupMemberService = new GroupMemberService(cacheClient, tx);
      const groupService = new GroupService(cacheClient, tx)

      await groupMemberService.checkGroupRole(BigInt(param.id), BigInt(currentUser.id), [
        IModel.IGroup.IGroupMemberRoleEnum.OWNER,
        IModel.IGroup.IGroupMemberRoleEnum.MANAGER,
      ]);

      const groups = await groupService.findByIds([BigInt(param.id)]);
      if (groups && groups.length > 0) {
        await groupMemberService.deleteByGroupIdsAndUIdIn([BigInt(param.id)], param.uids.map(id => BigInt(id)));
        await chatClient.exitByIds(groups.map(g => g.chatId), param.uids.map(id => BigInt(id)))
      }
    })

    return c.json(null);
  }
);

/**
 * 修改群名称
 */
groupRouter.post(
  "/update-name",
  zValidator(
    "json",
    z.object({
      id: z.number(),
      name: z.string(),
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
    const id = BigInt(param.id)

    const groupMemberService = new GroupMemberService(cacheClient);
    const groupService = new GroupService(cacheClient);
    await groupMemberService.checkGroupRole(id, BigInt(currentUser.id), [
      IModel.IGroup.IGroupMemberRoleEnum.MANAGER,
      IModel.IGroup.IGroupMemberRoleEnum.OWNER,
    ]);
    await groupService.changeName(id, param.name);

    // void searchClient.makeIndex({
    //   searchType: protos.search.SearchResultTypeEnum.GROUP,
    //   refId: id + '',
    //   indexValue: param.name,
    //   link: '',
    //   name: param.name
    // })
    return c.json(null);
  }
);

/**
 * 修改群头像
 */
groupRouter.post(
  "/update-avatar",
  zValidator(
    "json",
    z.object({
      id: z.number(),
      avatar: z.string(),
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
    const currentUser = c.get("user");
    const cacheClient = await getInstance()

    const groupService = new GroupService(cacheClient);
    const groupMemberService = new GroupMemberService(cacheClient);
    await groupMemberService.checkGroupRole(id, BigInt(currentUser.id), [
      IModel.IGroup.IGroupMemberRoleEnum.MANAGER,
      IModel.IGroup.IGroupMemberRoleEnum.OWNER,
    ]);
    await groupService.changeAvatar(id, param.avatar);

    return c.json(null);
  }
);

/**
 * 修改群通告
 */
groupRouter.post(
  "/update-notice",
  zValidator(
    "json",
    z.object({
      id: z.number(),
      notice: z.string(),
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
    const currentUser = c.get("user");
    const cacheClient = await getInstance()

    const groupService = new GroupService(cacheClient);
    const groupMemberService = new GroupMemberService(cacheClient);

    await groupMemberService.checkGroupRole(id, BigInt(currentUser.id), [
      IModel.IGroup.IGroupMemberRoleEnum.MANAGER,
      IModel.IGroup.IGroupMemberRoleEnum.OWNER,
    ]);

    await groupService.changeNotice(id, param.notice);
    return c.json(null);
  }
);

/**
 * 修改群简介
 */
groupRouter.post(
  "/update-desc",
  zValidator(
    "json",
    z.object({
      id: z.number(),
      desc: z.string(),
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
    const currentUser = c.get("user");

    const cacheClient = await getInstance()

    const groupService = new GroupService(cacheClient);
    const groupMemberService = new GroupMemberService(cacheClient);

    await groupMemberService.checkGroupRole(id, BigInt(currentUser.id), [
      IModel.IGroup.IGroupMemberRoleEnum.MANAGER,
      IModel.IGroup.IGroupMemberRoleEnum.OWNER,
    ]);

    await groupService.changeDesc(id, param.desc);
    return c.json(null);
  }
);


/**
 * 修改群成员昵称
 */
groupRouter.post(
  "/update-member-alias",
  zValidator(
    "json",
    z.object({
      id: z.number(),
      uid: z.number(),
      alias: z.string(),
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
    const currentUser = c.get("user");

    const cacheClient = await getInstance()

    const groupService = new GroupService(cacheClient);
    const groupMemberService = new GroupMemberService(cacheClient);

    await groupMemberService.checkGroupRole(id, BigInt(currentUser.id), [
      IModel.IGroup.IGroupMemberRoleEnum.MANAGER,
      IModel.IGroup.IGroupMemberRoleEnum.OWNER,
    ]);

    await groupMemberService.updateMany({
      where: {
        groupId: id,
        uid: param.uid,
      },
      data: { myAlias: param.alias },
    });
    return c.json({ ...param });
  }
);


/**
 * 解散群组
 */
groupRouter.post(
  "/dismiss",
  zValidator(
    "json",
    z.object({
      ids: z.array(z.number()),
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
    const ids = param.ids.map(id => BigInt(id))
    const cacheClient = await getInstance()
    prisma.$transaction(async (tx) => {

      const groupService = new GroupService(cacheClient, tx);
      const groupMemberService = new GroupMemberService(cacheClient, tx);

      const ownerGroupIds = await groupMemberService.findByGroupIdInRole(
        ids,
        IModel.IGroup.IGroupMemberRoleEnum.OWNER,
        BigInt(currentUser.id)
      );
      const diff = arrayDifference(param.ids, ownerGroupIds);
      if (diff.length > 0) {
        throw new HTTPException(400, {
          message: "群" + diff.join(",") + "不是群主，没有权限",
        });
      }
      const groups = await groupService.findByIds(ownerGroupIds)
      if (groups && groups.length > 0) {
        await chatClient.dropByIds(groups.map(g => g.chatId))

        await groupMemberService.deleteByGroupIds(ownerGroupIds);
        await groupService.deleteByIds(ownerGroupIds);
      }

    })
    // void searchClient.dropIndex({
    //   searchType: protos.search.SearchResultTypeEnum.GROUP,
    //   refIds: param.ids.map(id => String(id)),
    // })
    return c.json(null);
  }
);

/**
 * 转移群组
 */
groupRouter.post(
  "/transfer",
  zValidator(
    "json",
    z.object({
      id: z.number(),
      uid: z.number(),
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
    const id = BigInt(param.id)
    const uid = BigInt(param.uid)

    const cacheClient = await getInstance()
    prisma.$transaction(async (tx) => {

      const groupMemberService = new GroupMemberService(cacheClient, tx);

      groupMemberService.checkGroupRole(id, BigInt(currentUser.id), [
        IModel.IGroup.IGroupMemberRoleEnum.OWNER,
      ]);
      const members = await groupMemberService.findMany({
        where: {
          groupId: { equals: param.id },
          uid: { equals: param.uid },
          status: IModel.IGroup.IGroupMemberStatus.NORMAL,
        },
      });
      if (members.length <= 0) {
        throw new HTTPException(400, { message: "必须是群组内成员" });
      }
      await groupMemberService.updateRole(
        id,
        uid,
        IModel.IGroup.IGroupMemberRoleEnum.OWNER
      );
      await groupMemberService.updateRole(
        id,
        BigInt(currentUser.id),
        IModel.IGroup.IGroupMemberRoleEnum.MANAGER
      );
    })

    return c.json(null);
  }
);

/**
 * 添加管理员
 */
groupRouter.post(
  "/add-admin",
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
    const currentUser = c.get("user");

    const id = BigInt(param.id)
    const uids = param.uids.map(id => BigInt(id))
    const cacheClient = await getInstance()
    prisma.$transaction(async (tx) => {

      const groupMemberService = new GroupMemberService(cacheClient, tx);

      await groupMemberService.checkGroupRole(id, BigInt(currentUser.id), [
        IModel.IGroup.IGroupMemberRoleEnum.OWNER,
      ]);
      const members = await groupMemberService.findMany({
        where: {
          groupId: { equals: id },
          uid: { in: uids },
          status: IModel.IGroup.IGroupMemberStatus.NORMAL,
        },
      });
      if (members.length > 0) {
        await groupMemberService.updateMany({
          where: {
            groupId: id,
            uid: {
              in: members.map((m) => m.uid),
            },
            role: IModel.IGroup.IGroupMemberRoleEnum.MEMBER,
            status: IModel.IGroup.IGroupMemberStatus.NORMAL,
          },
          data: {
            role: IModel.IGroup.IGroupMemberRoleEnum.MANAGER,
          },
        });
      }
    })

    return c.json({});
  }
);

/**
 * 移除管理员
 */
groupRouter.post(
  "/remove-admin",
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
    const currentUser = c.get("user");

    const id = BigInt(param.id)
    const uids = param.uids.map(id => BigInt(id))
    const cacheClient = await getInstance()
    prisma.$transaction(async (tx) => {

      const groupMemberService = new GroupMemberService(cacheClient, tx);

      if (uids.includes(BigInt(currentUser.id))) {
        throw new HTTPException(400, { message: "不可包含自己" });
      }
      await groupMemberService.checkGroupRole(id, BigInt(currentUser.id), [
        IModel.IGroup.IGroupMemberRoleEnum.OWNER,
      ]);
      await groupMemberService.updateMany({
        where: {
          groupId: id,
          uid: { in: uids },
          role: IModel.IGroup.IGroupMemberRoleEnum.MANAGER,
          status: IModel.IGroup.IGroupMemberStatus.NORMAL,
        },
        data: {
          role: IModel.IGroup.IGroupMemberRoleEnum.MEMBER,
        },
      });
    })

    return c.json({});
  }
);

/**
 * 群分类变更
 */
groupRouter.post(
  "/change-tag",
  zValidator(
    "json",
    z.object({
      gid: z.number(),
      tags: z.array(z.number()),
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
    const gid = BigInt(param.gid)
    const cacheClient = await getInstance()

    const groupService = new GroupService(cacheClient);
    const groupMemberService = new GroupMemberService(cacheClient);
    await groupMemberService.checkGroupRole(gid, BigInt(currentUser.id), [
      IModel.IGroup.IGroupMemberRoleEnum.MANAGER,
      IModel.IGroup.IGroupMemberRoleEnum.OWNER,
    ]);
    await groupService.changeTags(gid, param.tags.map(BigInt));
    return c.json(null);
  }
);

/**
 * 清空群消息
 */
groupRouter.post(
  "/clear-messages",
  zValidator(
    "json",
    z.object({
      ids: z.array(z.number()), // groupIds
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
    const ids = param.ids.map(id => BigInt(id))
    const cacheClient = await getInstance()

    const groupMemberService = new GroupMemberService(cacheClient);
    const groupService = new GroupService(cacheClient)
    const managedGroupIds = await groupMemberService.findMany({
      where: {
        groupId: { in: param.ids },
        uid: currentUser.id,
        role: {
          in: [IModel.IGroup.IGroupMemberRoleEnum.MANAGER, IModel.IGroup.IGroupMemberRoleEnum.OWNER],
        },
        status: IModel.IGroup.IGroupMemberStatus.NORMAL,
      },
      select: {
        groupId: true,
      },
    });
    if (managedGroupIds.length <= 0) {
      return;
    }

    const groups = await groupService.findByIds(ids)
    if (!groups || groups.length <= 0) {
      return
    }
    await chatClient.clearMessageByIds(groups.map(g => g.chatId))

    return c.json({});
  }
);

export default groupRouter;
