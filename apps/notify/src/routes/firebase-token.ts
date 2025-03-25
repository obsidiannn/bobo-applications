import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware } from "@/lib/middlewares";
import { UserFirebaseTokenService } from "@/services/user-firebase-token.service";
import { protos } from '@repo/grpc/proto'

const route = new Hono<{ Variables: { user: protos.user.User } }>();
route.post(
  "/firebaseToken/register",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      token: z.string(),
      platform: z.string(),
      osVersion: z.string(),
      appVersion: z.string(),
      deviceId: z.string(),
    }),
    (result, _) => {
      if (!result.success) {

        throw new HTTPException(400, {
          message: "invalid" + result.error,
        });
      }
    }
  ),
  async (c) => {
    const params = c.req.valid("json");
    const user = c.get("user");
    console.log('注册firebase token ', user);

    let record = await UserFirebaseTokenService.findByDeviceId(params.deviceId, user.id)
    console.log("旧的注册记录：", record)
    if (!record || record.userId != BigInt(user.id)) {
      record = await UserFirebaseTokenService.create({
        userId: user.id,
        deviceId: params.deviceId,
        token: params.token,
      })
      console.log("record:", record)
    } else {
      await UserFirebaseTokenService.updateTokenById(record.id, params.token);
    }
    return c.json(null);
  }
);
export default route;
