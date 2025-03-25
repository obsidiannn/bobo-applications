import { authMiddleware } from "@/lib/middlewares";
import { FriendApplyService } from "@/services/friend-apply.service";
import { FriendUserExtendInfoService } from "@/services/friend-user-extend-info.service";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { IModel } from "@repo/enums";
import { FriendService } from "@/services/friend.service";
import { UserService } from "@/services/user.service";
import { EventService } from "@/services/event.service";
import { ChatService } from "@/services/chat.service";
import { protos } from '@repo/grpc/proto'
import { generateRef } from "@repo/server/utils";
import dayjs from 'dayjs'

const app = new Hono<{ Variables: { user: protos.user.User } }>();

app.post(
  "/create",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      friendId: z.number().min(1),
      remark: z.optional(z.string().max(200)),
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
    const params = c.req.valid("json");
    const user = c.get("user");
    if (user.id === BigInt(params.friendId)) {
      throw new HTTPException(400, {
        message: "Can't apply to yourself",
      });
    }
    const friend = await UserService.findById(BigInt(params.friendId))
    if (!friend) {
      throw new HTTPException(404, {
        message: "User not found",
      });
    }
    const hashKey = generateRef([user.id, friend.id]);
    const existFriendRecord = await FriendService.findByHashKey(hashKey);
    if (existFriendRecord) {
      throw new HTTPException(409, {
        message: "Already friends",
      });
    }

    const old = await FriendApplyService.findByHashKey(hashKey, user.id);
    if (old) {
      const item = await FriendApplyService.updateCustomWhere({
        id: old.id
      }, {
        status: IModel.IFriendApply.Status.PENDING,
        remark: params.remark,
      })
      await FriendUserExtendInfoService.updateByUserId(friend.id, {
        lastFriendApplyId: item.id,
      });
    } else {
      const item = await FriendApplyService.create({
        userId: user.id,
        friendId: friend.id,
        hashKey,
        status: IModel.IFriendApply.Status.PENDING,
        remark: params.remark,
      });
      await FriendUserExtendInfoService.updateByUserId(friend.id, {
        lastFriendApplyId: item.id,
      });
    }




    // try {
    //   await EventService.broadcastFriendApply(item);
    // } catch (e) {

    // }
    return c.json(null);
  }
);

app.post("/getBatchInfo",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      ids: z.array(z.number().min(1)).min(1),
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid",
        });
      }
    }
  ), async (c) => {
    const params = c.req.valid("json");
    const items = await FriendApplyService.findByIds(params.ids);
    return c.json({
      items: items.map((item) => {
        return {
          ...item,
          createdAt: dayjs(item.createdAt).unix(),
          updatedAt: dayjs(item.updatedAt).unix(),
        }
      }).sort((a, b) => { return Number(b.id - a.id) }),
    });
  })
app.post("/getIdList",
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
          message: "invalid",
        });
      }
    }
  ),
  async (c) => {
    const user = c.get("user");
    const params = c.req.valid("json");
    const ids = await FriendApplyService.getIdList(user.id, params.page, params.limit);
    return c.json({
      ids,
    });
  });

app.post(
  "/reject",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      id: z.bigint(),
      reson: z.optional(z.string().max(200)),
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "param err",
        });
      }
    }
  ),
  async (c) => {
    const params = c.req.valid("json");
    const user = c.get("user");
    const item = await FriendApplyService.findById(params.id);

    if (!item || item.friendId !== BigInt(user.id)) {
      throw new HTTPException(404, {
        message: "Friend request not found",
      });
    }
    await FriendApplyService.reject(params.id, params.reson ?? "");
    return c.json(null);
  }
);
app.post(
  "/agree",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      id: z.number().int().min(1),
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "param err",
        });
      }
    }
  ),
  async (c) => {
    const params = c.req.valid("json");
    const user = c.get("user");
    const item = await FriendApplyService.findById(BigInt(params.id));
    console.log('agree', item, user.id);

    if (!item || item.friendId != BigInt(user.id) || !item.userId) {
      throw new HTTPException(404, {
        message: "Friend request not found",
      });
    }
    const chat = await ChatService.create(item.userId, item.friendId);
    console.log('chat=', chat);
    const hashKey = generateRef([item.friendId, item.userId]);
    await FriendApplyService.agree(hashKey);
    
    const res = await FriendService.create(item.userId, item.friendId, chat.id);
    await FriendService.create(item.friendId, item.userId, chat.id);
    return c.json({ chatId: chat.id, friendId: res.id });
  }
);

app.post(
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
          message: "param err",
        });
      }
    }
  ),
  async (c) => {
    const params = c.req.valid("json");
    const user = c.get("user");
    const item = await FriendApplyService.findById(BigInt(params.id));

    if (!item || [item.userId, item.friendId].indexOf(user.id) == -1) {
      throw new HTTPException(404, {
        message: "Friend request not found",
      });
    }
    await FriendApplyService.delById(BigInt(params.id));
    return c.json(null);
  }
);

export default app;
