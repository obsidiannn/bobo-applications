import { FriendService } from "@/services/friend.service";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "@/lib/middlewares";
import { getFirstLetterOfPinyin } from "@repo/server/str-util";
import { generateRef } from "@repo/server/utils";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { pick } from "radash";
import { z } from "zod";
import { IModel } from "@repo/enums";
import { FriendApplyService } from "@/services/friend-apply.service";
import { protos } from '@repo/grpc/proto'
import { ChatService } from "@/services/chat.service";
import { chat } from "@repo/grpc/client";

const route = new Hono<{ Variables: { user: protos.user.User } }>();

route.post("/getIdList",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      page: z.optional(z.number().min(1)).default(1),
      limit: z.optional(z.number().min(10).max(100)).default(20),
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid input",
        });
      }
    },
  ),
  async (c) => {
    const user = c.get("user");
    const params = c.req.valid("json");
    const ids = await FriendService.getIdListByUserId(user.id, params.page, params.limit);
    return c.json({
      ids: ids.map(Number),
    });
  });

route.post("/getFriendUserId",
  authMiddleware,
  async (c) => {
    const user = c.get("user");
    const ids = await FriendService.getMyFriendIds(user.id);
    return c.json({
      items: ids.map(Number),
    });
  });


route.post(
  "/getBatchInfo",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      ids: z.array(z.number()).min(1).max(50),
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid input",
        });
      }
    },
  ),
  async (c) => {
    const params = c.req.valid("json");
    const user = c.get("user");
    const items = await FriendService.findByIds(params.ids.map(BigInt));
    return c.json({
      friends: items
        .filter((item) => item.userId == user.id)
        .map((item) =>
          pick(item, [
            "id",
            "friendId",
            "remark",
            "remarkIdx",
            "relation",
            "chatId",
          ]),
        ),
    });
  },
);

route.post(
  "/getRelationList",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      userIds: z.array(z.number().min(1)),
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid",
        });
      }
    },
  ),
  async (c) => {
    console.log("getRelationList");
    const params = c.req.valid("json");
    const user = c.get("user");
    const userIds = Array.from(new Set(params.userIds));
    let results: { userId: bigint; status: boolean }[] = []
    console.log('end');
    if (userIds.length) {
      results = await FriendService.isFriends(BigInt(user.id), userIds.map(BigInt))
    }
    console.log("results", results)

    return c.json({
      items: results,
    });
  },
);
route.post(
  "/del",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      id: z.number().int().min(1),
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid input",
        });
      }
    },
  ),
  async (c) => {
    const params = c.req.valid("json");
    const user = c.get("user");
    const oldRecord = await FriendService.findById(BigInt(params.id));
    if (!oldRecord || oldRecord.userId !== user.id) {
      throw new HTTPException(404, {
        message: "Friend not found or unauthorized",
      });
    }

    await FriendService.delById(oldRecord.id);
    const chatId = oldRecord.chatId
    if (chatId) {
      await ChatService.removeUserById(user.id, chatId)
    }
    if (oldRecord.chatId && oldRecord.relation == IModel.IFriend.Relation.ONE_WAY_FRIEND) {
      // @note 删除会话
      await ChatService.dropById(oldRecord.chatId)
    }
    const reversedHashKey = generateRef([oldRecord.friendId ?? 0n, user.id]);
    const oppositeRecord = await FriendService.findByHashKey(reversedHashKey);

    if (oppositeRecord) {
      await FriendService.update(oppositeRecord.id, {
        relation: IModel.IFriend.Relation.ONE_WAY_FRIEND
      });
    }

    return c.json({ chatId });
  },
);


route.post(
  "/block",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      id: z.number().int().min(1),
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid input",
        });
      }
    },
  ),
  async (c) => {
    const params = c.req.valid("json");
    const user = c.get("user");
    const oldRecord = await FriendService.findById(BigInt(params.id));
    if (!oldRecord || oldRecord.userId !== user.id) {
      throw new HTTPException(400, {
        message: "Friend not found or unauthorized",
      });
    }

    await FriendService.blockById(oldRecord.id, user.id);
    if (oldRecord.chatId) {
      console.log('do block');

      const chatResp = await ChatService.block(user.id, oldRecord.chatId)
      console.log('do block result', chatResp);
      return c.json({
        isShow: chatResp.isShow,
        chatId: oldRecord.chatId
      });
    }
    return c.json({ isShow: null, chatId: oldRecord.chatId });
  },
);




route.post(
  "/block-out",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      id: z.number().int().min(1),
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid input",
        });
      }
    },
  ),
  async (c) => {
    const params = c.req.valid("json");
    const user = c.get("user");
    const oldRecord = await FriendService.findById(BigInt(params.id));
    if (!oldRecord || oldRecord.userId !== user.id) {
      throw new HTTPException(400, {
        message: "Friend not found or unauthorized",
      });
    }

    await FriendService.blockOutById(oldRecord.id, user.id);
    if (oldRecord.chatId) {
      const chatResp = await ChatService.blockOut(user.id, oldRecord.chatId)
      console.log('do block result', chatResp);
      return c.json({
        isShow: chatResp.isShow,
        chatId: oldRecord.chatId
      });
    }
    return c.json({ isShow: null, chatId: oldRecord.chatId });
  },
);



route.post(
  "/deepDel",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      id: z.number().int().min(1),
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid input",
        });
      }
    },
  ),
  async (c) => {
    const params = c.req.valid("json");
    const user = c.get("user");
    const oldRecord = await FriendService.findById(BigInt(params.id));
    if (!oldRecord || oldRecord.userId !== user.id) {
      throw new HTTPException(404, {
        message: "Friend not found or unauthorized",
      });
    }

    await FriendService.delById(oldRecord.id);
    const reversedHashKey = generateRef([oldRecord.friendId ?? 0n, user.id]);
    const oppositeRecord = await FriendService.findByHashKey(reversedHashKey);
    if (oppositeRecord) {
      await FriendService.delById(oppositeRecord.id);
    }
    await FriendService.delById(oldRecord.id);
    if (oppositeRecord?.chatId) {
      // ChatService.dropById(oppositeRecord.chatId)
    }
    return c.json(null);
  },
);

route.post("/dropAll", authMiddleware, async (c) => {
  const user = c.get("user");
  const friends = await FriendService.findAllByUserId(user.id);
  const delChatIds: string[] = [];
  const unDelChatIds: string[] = [];
  const unFriendIds: bigint[] = [];
  const delIds: bigint[] = [];
  for (const friend of friends) {
    delIds.push(friend.id);
    if (friend.relation === IModel.IFriend.Relation.ONE_WAY_FRIEND) {
      if (friend.chatId) {
        delChatIds.push(friend.chatId);
      }
    } else {
      if (friend.friendId) {
        unFriendIds.push(friend.friendId);
      }
      if (friend.chatId) {
        unDelChatIds.push(friend.chatId);
      }
    }
  }
  if (delChatIds.length) {
    // await ChatService.dropByIds(delChatIds);
  }
  if (delIds.length) {
    await FriendService.delByIds(delIds);
  }
  if (unFriendIds.length) {
    // 移除关系
    FriendService.batchUnFriend(user.id, unFriendIds);
  }
  await FriendApplyService.delAllByUserId(user.id);
  if (unDelChatIds.length) {
    // 移除会话成成员
    // ChatService.removeUserByIds(user.id, unDelChatIds);
  }
  return c.json({
    chatIds: delChatIds
  });
});

route.post(
  "/updateRemark",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      id: z.number().int().min(0),
      remark: z.string().max(100),
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid input",
        });
      }
    },
  ),
  async (c) => {
    const params = c.req.valid("json");
    const user = c.get("user");
    const old = await FriendService.findById(BigInt(params.id));
    if (!old) {
      throw new HTTPException(404, {
        message: "Friend not found",
      });
    }
    if (old.userId !== user.id) {
      throw new HTTPException(403, {
        message: "Unauthorized to update remark of this friend",
      });
    }
    await FriendService.update(old.id, {
      remark: params.remark,
      remarkIdx: getFirstLetterOfPinyin(params.remark),
    });
    return c.json(null);
  },
);


/**
 * 获取我的拉黑列表
 */
route.post(
  "/blocked-id-list",
  authMiddleware,
  async (c) => {
    const user = c.get("user");
    const ids = await FriendService.blockFriendId(user.id);
    return c.json({ items: ids });
  },
);




export default route;
