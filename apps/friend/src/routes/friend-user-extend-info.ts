import { Hono } from "hono";
import { FriendUserExtendInfoService } from "@/services/friend-user-extend-info.service";
import { pick } from "radash";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import {authMiddleware} from "@/lib/middlewares";
import { protos } from '@repo/grpc/proto'
const route = new Hono<{ Variables: { user: protos.user.User } }>();

route.post(
  "/getInfo",
  authMiddleware,
  async (c) => {
    const user = c.get("user");
    let info = await FriendUserExtendInfoService.findByUserId(user.id);
    if (!info) {
      info = await FriendUserExtendInfoService.create({
        userId: user.id,
        lastFriendApplyId: 0,
        lastReadFriendApplyId: 0,
      });
    }
    return c.json({
      info: pick(info, ["lastFriendApplyId", "lastReadFriendApplyId"]),
    });
  }
);

route.post(
  "/read",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      friendApplyId: z.number().int().min(1),
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
    const user = c.get("user");
    const params = c.req.valid("json");
    let info = await FriendUserExtendInfoService.findByUserId(user.id);
    if (info) {
      await FriendUserExtendInfoService.update(info.id, {
        lastReadFriendApplyId: params.friendApplyId,
      });
    }
    return c.json(null);
  }
);

export default route;
