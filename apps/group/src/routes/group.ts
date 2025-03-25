// 创建群聊 f
// 批量获取群详情 f
// 获取群详情 f

import { zValidator } from "@hono/zod-validator";
import { Prisma, GroupMembers } from "@prisma/db-group";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { GroupMemberService } from "../services/group-member.service";
import { GroupService } from "../services/group.service";

import { z } from "zod";
import { chatClient } from '@/api/chat';
import { getInstance } from "@/lib/cache";
import { prisma } from "@/lib/database";
import { authMiddleware } from "@/lib/middlewares";
import { IModel } from "@repo/enums";
import { protos } from "@repo/grpc/proto";
import { dateSecondConvert, pageSkip } from "@repo/server/utils";
// import { searchClient } from "@/api/search";

const groupRouter = new Hono<{ Variables: { user: protos.user.User } }>();

/**
 * 创建群聊
 */
groupRouter.post(
  "/create",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      avatar: z.optional(z.string()),
      cover: z.optional(z.string()),
      name: z.string(),
      isEnc: z.number().min(0),
      type: z.number(),
      banType: z.number(),
      searchType: z.number(),
      // uids: z.array(z.number()).min(1),
      encKey: z.string(),
      describe: z.optional(z.string())
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
    const group = await prisma.$transaction(async (tx) => {
      const groupService = new GroupService(cacheClient, tx);
      const groupMemberService = new GroupMemberService(cacheClient, tx);

      const groupInput: Prisma.GroupCreateInput = {
        avatar: param.avatar,
        name: param.name,
        isEnc: param.isEnc,
        type: param.type,
        banType: param.banType,
        searchType: param.searchType,
        creatorId: currentUser.id,
        ownerId: currentUser.id,
        cover: param.cover ?? '',
        status: IModel.IGroup.IGroupStatusEnum.ENABLE,
        tags: "",
        chatId: "",
        desc: param.describe
      };
      console.log("group create:", param);
      const group = await groupService.create(groupInput);
      const chat = await chatClient.create(group.id, IModel.IChat.IChatTypeEnum.GROUP, [BigInt(currentUser.id)])
      console.log('chat=', chat);
      await groupService.changeChatId(group.id, chat.id);

      const member: Prisma.GroupMembersCreateInput = {
        groupId: group.id,
        uid: currentUser.id,
        encPri: "",
        encKey: param.encKey,
        role: IModel.IGroup.IGroupMemberRoleEnum.OWNER,
        joinType: 1,
        status: IModel.IGroup.IGroupMemberStatus.NORMAL,
        banType: 1,
        adminAt: new Date(),
        packageExpiredAt: new Date(),
        createdAt: new Date(),
      };
      await groupMemberService.create(member);

      return group
    })

    // void searchClient.makeIndex({
    //   searchType: protos.search.SearchResultTypeEnum.GROUP,
    //   refId: group.id + '',
    //   indexValue: group.name,
    //   link: '',
    //   name: group.name
    // })
    return c.json({
      id: group.id,
    });
  }
);

/**
 * 我的群组列表
 */
groupRouter.post("/list", authMiddleware, async (c) => {
  const currentUser = c.get("user");
  const cacheClient = await getInstance()
  const groupMemberService = new GroupMemberService(cacheClient);
  const members = await groupMemberService.findGroupIdByUid(BigInt(currentUser.id));
  return c.json({ items: members });
});

/**
 * 我的群组列表
 */
groupRouter.post(
  "/list-by-ids",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      gids: z.array(z.number()),
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

    const groupService = new GroupService(cacheClient);
    const groups = await groupService.findByIds(param.gids.map(id => BigInt(id)));
    return c.json({
      items: groups.map((g) => {
        const item = {
          id: g.id,
          name: g.name,
          avatar: g.avatar,
          memberLimit: g.memberLimit,
          total: g.total,
          desc: g.desc ?? "",
          isEnc: g.isEnc,
          chatId: g.chatId
        };
        return item;
      }),
    });
  }
);

/**
 * 批量获取群详情
 */
groupRouter.post(
  "/get-batch-info",
  authMiddleware,
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
  async (c) => {
    const param = c.req.valid("json");
    const cacheClient = await getInstance()

    const groupService = new GroupService(cacheClient);
    const groupMemberService = new GroupMemberService(cacheClient);
    const currentUser = c.get("user");

    const groupIds = param.ids.map(BigInt)

    const groups = await groupService.findByIds(groupIds);
    if (groups.length <= 0) {
      throw new HTTPException(400, { message: "not found" });
    }
    const g = groups[0];

    const members = await groupMemberService.groupMemberByIdIn(
      groupIds,
      BigInt(currentUser.id)
    );
    const memberMap = new Map<bigint, GroupMembers>()
    members.forEach(m => {
      memberMap.set(m.groupId, m)
    })

    const data = groups.map(g => {
      const item = {
        id: g.id,
        gid: g.id,
        name: g.name,
        avatar: g.avatar,
        createdAt: g.createdAt,
        memberLimit: g.memberLimit,
        total: g.total,
        ownerId: g.ownerId,
        creatorId: g.creatorId,
        notice: g.notice === null ? "" : g.notice,
        desc: g.desc === null ? "" : g.desc,
        cover: g.cover,
        isEnc: g.isEnc,
        type: g.type,
        banType: g.banType,
        searchType: g.searchType,
        status: g.status,
        tags: g.tags ?? '',
        chatId: g.chatId
      };
      const member = memberMap.get(g.id)
      if (member) {
        const role = member === null ? -1 : member.role;
        return {
          ...item,
          role: role,
          encKey: member?.encKey ?? "",
          encPri: member?.encPri ?? "",
          joinAt: dateSecondConvert(member?.createdAt)
        }
      }
      return item
    })
    return c.json({ items: data });
  }
);

/**
 * 获取群详情
 */
groupRouter.post(
  "/get-info",
  authMiddleware,
  zValidator(
    "json",
    z.object({
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

    const groupService = new GroupService(cacheClient);
    const groupMemberService = new GroupMemberService(cacheClient);
    const groups = await groupService.findByIds([BigInt(param.id)]);
    if (groups.length <= 0) {
      throw new HTTPException(400, { message: "not found" });
    }
    const g = groups[0];

    const member = await groupMemberService.groupMemberById(
      BigInt(param.id),
      BigInt(currentUser.id)
    );
    const role = member === null ? -1 : member.role;
    let createAt = 0
    if (g.createdAt) {
      if (typeof g.createdAt === 'string') {
        createAt = new Date(g.createdAt).getDate()
      } else {
        createAt = (g.createdAt as Date).getDate()
      }
    }
    const item = {
      id: g.id,
      gid: g.id,
      name: g.name,
      avatar: g.avatar,
      createdAt: createAt,
      memberLimit: g.memberLimit,
      total: g.total,
      ownerId: g.ownerId,
      creatorId: g.creatorId,
      notice: g.notice === null ? "" : g.notice,
      desc: g.desc === null ? "" : g.desc,
      cover: g.cover,
      isEnc: g.isEnc,
      type: g.type,
      banType: g.banType,
      searchType: g.searchType,
      status: g.status,
      tags: g.tags ?? '',
      role: role,
      encKey: member?.encKey ?? "",
      encPub: member?.encPri ?? "",
      joinAt: dateSecondConvert(member?.createdAt)
    };
    return c.json(item);
  }
);

// /**
//  * 获取群详情
//  */
// groupRouter.post(
//   "/get-single-info",
//   authMiddleware,
//   zValidator(
//     "json",
//     z.object({
//       ids: z.array(z.number()),
//     }),
//     (result, _) => {
//       if (!result.success) {
//         throw new HTTPException(400, {
//           message: "invalid",
//         });
//       }
//     }
//   ),
//   async (c) => {
//     const param = c.req.valid("json");

//     const cacheClient = await getInstance()

//     const groupService = new GroupService(cacheClient);
//     const groups = await groupService.findMany({
//       where: { id: { in: param.ids.map(id => BigInt(id)) } },
//       select: {
//         id: true,
//         name: true,
//         avatar: true,
//         chatId: true
//       },
//     });

//     return c.json({
//       items: groups.map((g) => {
//         return {
//           id: g.id,
//           name: g.name,
//           avatar: g.avatar,
//           chatId: g.chatId
//         };
//       }),
//     });
//   }
// );



/**
 * 获取群详情
 */
groupRouter.post(
  "/mine-id-after",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      lastTime: z.number(),
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
    const user = c.get('user')
    const cacheClient = await getInstance()
    const groupMemberService = new GroupMemberService(cacheClient);
    const ids = groupMemberService.groupIdAfter(user.id, param.lastTime)
    return c.json({
      items: ids
    });
  }
);

/**
 * 获取群详情
 */
groupRouter.post(
  "/search",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      keyword: z.optional(z.string()),
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
    const groupService = new GroupService(cacheClient);
    const groups = await groupService.findMany({
      where: {
        searchType: IModel.ICommon.IActiveEnum.ACTIVE,
        ...(param.keyword ? {
          name: { contains: param.keyword }
        } : {})
      },
      skip: pageSkip(param.page, param.limit),
      take: param.limit,
      select: {
        id: true,
      },
      orderBy: {
        id: 'asc'
      }
    });

    const result = {
      page: param.page ?? 1,
      limit: param.page ?? 10,
      items: groups.map((g) => {
        return g.id
      }),
      total: await groupService.count({
        where: {
          searchType: IModel.ICommon.IActiveEnum.ACTIVE,
          ...(param.keyword ? {
            name: { contains: param.keyword }
          } : {})
        },
      }),
    };

    return c.json(result);
  }
);


export default groupRouter;
