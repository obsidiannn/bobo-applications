// 退出群聊 xx
// 退出多个群聊 f
// 退出所有群聊 f

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { IModel } from '@repo/enums'
import { GroupMemberService } from "../services/group-member.service";
import { GroupService } from "../services/group.service";
import { z } from "zod";
import { chatClient } from '@/api/chat';

import { getInstance } from "@/lib/cache";
import { prisma } from "@/lib/database"; 
import { authMiddleware } from "@/lib/middlewares";
import {protos} from '@repo/grpc/proto'

const groupRouter = new Hono<{ Variables: { user: protos.user.User } }>();

/**
 * 退出多个群聊
 */
groupRouter.post(
  "/quit-batch",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      ids: z.array(z.number()), // groupId
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
    const ids = param.ids.map(id => BigInt(id))
    const currentUser = c.get("user");
    const cacheClient = await getInstance()
    prisma.$transaction(async (tx) => {
      // 这里是筛选角色，管理员之上
      const groupService = new GroupService(cacheClient, tx);
      const groupMemberService = new GroupMemberService(cacheClient, tx);
      const ownerGroups = await groupMemberService.findByGroupIdInRole(
        ids,
        IModel.IGroup.IGroupMemberRoleEnum.OWNER,
        BigInt(currentUser.id)
      );
      if (ownerGroups.length > 0) {
        const groups = await groupService.findByIds(ownerGroups);
        throw new HTTPException(400, {
          message:
            "群" + groups.map((g) => g.name).join(",") + "是群主，请直接解散群聊",
        });
      }
      const groups = await groupService.findByIds(ids);
      await groupMemberService.deleteByGroupIdsAndUIdIn(ids, [
        BigInt(currentUser.id),
      ]);
      await chatClient.exitByIds(groups.map(g => g.chatId), [BigInt(currentUser.id)])
    })

    return c.json(null);
  }
);

/**
 * 退出我的所有群聊
 */
groupRouter.post("/quit-all", authMiddleware, async (c) => {
  const currentUser = c.get("user");
  const cacheClient = await getInstance()
  prisma.$transaction(async (tx) => {
    const groupService = new GroupService(cacheClient, tx);
    const groupMemberService = new GroupMemberService(cacheClient, tx);
    // 这里是筛选角色，管理员之上
    const groupMembers = await groupMemberService.findGroupIdByUid(BigInt(currentUser.id));
    const groupIds = groupMembers.map((g) => g);
    const ownerGroups = await groupMemberService.findByGroupIdInRole(
      groupIds,
      IModel.IGroup.IGroupMemberRoleEnum.OWNER,
      BigInt(currentUser.id)
    );
    if (ownerGroups.length > 0) {
      const groups = await groupService.findByIds(ownerGroups);
      throw new HTTPException(400, {
        message:
          "群" + groups.map((g) => g.name).join(",") + "是群主，请直接解散群聊",
      });
    }

    await groupMemberService.deleteByGroupIdsAndUIdIn(groupIds, [BigInt(currentUser.id)]);

    const groupDetails = await groupService.findByIds(groupIds);
    await chatClient.exitByIds(groupDetails.map(g => g.chatId), [BigInt(currentUser.id)])

    // await messageApi.exitChat({
    //   sourceIds: groupIds,
    //   businessType: IChatTypeEnum.GROUP,
    //   userIds: [currentUser.id]
    // });
  })

  return c.json(null);
});

/**
 * 更新群昵称
 */
groupRouter.post(
  "/update-alias",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      id: z.number(), // groupId
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
  async (c) => {
    const param = c.req.valid("json");
    const id = BigInt(param.id)
    const currentUser = c.get("user");
    const cacheClient = await getInstance()

    const groupMemberService = new GroupMemberService(cacheClient);
    await groupMemberService.updateMany({
      where: {
        groupId: id,
        uid: currentUser.id,
      },
      data: { myAlias: param.alias },
    });
    return c.json(null);
  }
);
export default groupRouter;
