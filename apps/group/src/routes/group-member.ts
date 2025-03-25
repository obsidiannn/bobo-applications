// 群成员列表 f

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { pick } from "radash";
import { dateSecondConvert, pageSkip } from "@repo/server/utils";
import { GroupMemberService } from "../services/group-member.service";

import { z } from "zod";
import { getInstance } from "@/lib/cache";
import { authMiddleware } from "@/lib/middlewares";
import { IModel } from "@repo/enums";
import { protos } from '@repo/grpc/proto'

const groupRouter = new Hono<{ Variables: { user: protos.user.User } }>();

groupRouter.post(
  "/members-list",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      isAdmin: z.optional(z.boolean()),
      uids: z.optional(z.array(z.number())),
      id: z.number(),
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

    const groupMemberService = new GroupMemberService(cacheClient);
    // 这里是筛选角色，管理员之上
    let requireRole = IModel.IGroup.IGroupMemberRoleEnum.MEMBER;
    if (param.isAdmin ?? false) {
      const selfRole = await groupMemberService.getGroupRole(
        BigInt(param.id),
        BigInt(currentUser.id)
      );
      if (selfRole < IModel.IGroup.IGroupMemberRoleEnum.MEMBER) {
        requireRole = IModel.IGroup.IGroupMemberRoleEnum.MANAGER;
      }
    }
    const result = await groupMemberService.groupMembersByRole(
      BigInt(param.id),
      requireRole,
      param.uids?.map(id => BigInt(id)) ?? []
    );
    console.log('result', result);

    return c.json({
      items: result.map((item) => {
        const pickResult = pick(item, [
          "id",
          "uid",
          "role",
          "groupId",
          "myAlias",
          "aliasIdx",
          "adminAt",
          "createdAt",
          "status"
          // "encKey",
          // "encPri"
        ]);
        return {
          ...pickResult,
          createdAt: dateSecondConvert(item.createdAt)
          // 如果是自己，则返回解密信息
          // ...(BigInt(currentUser.id) === item.uid
          //   ? {
          //     encKey: item.encKey,
          //     encPri: item.encPri,
          //   }
          //   : {}),
        };
      }),
    });
  }
);

groupRouter.post(
  "/members",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      id: z.number(),
      limit: z.optional(z.number().default(10)),
      page: z.optional(z.number().default(1)),
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

    const cacheClient = await getInstance()

    const groupMemberService = new GroupMemberService(cacheClient);
    const data = await groupMemberService.findMany({
      where: {
        groupId: { equals: param.id },
        status: IModel.IGroup.IGroupMemberStatus.NORMAL,
      },
      skip: pageSkip(param.page, param.limit), // 计算需要跳过的数据量
      take: param.limit, // 指定每页取多少条数据
      orderBy: {
        createdAt: "asc", // 按照创建时间降序排序，你可以根据需要修改排序字段和顺序
      },
    });


    const result = {
      page: param.page ?? 1,
      limit: param.page ?? 10,
      items: data,
      total: await groupMemberService.count({
        where: {
          groupId: { equals: param.id },
          status: IModel.IGroup.IGroupMemberStatus.NORMAL,
        },
      }),
    };
    return c.json(result);
  }
);

export default groupRouter;
