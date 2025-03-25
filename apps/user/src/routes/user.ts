import { Hono } from "hono";
import { pick } from "radash";
import { UserService } from "@/services/user.service";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware } from "@/lib/middlewares";
const user = new Hono();
user.use(authMiddleware);
user.post(
  "/getBatchInfo",
  zValidator(
    "json",
    z.object({
      ids: z
        .array(z.number())
        .min(1, "ids must be at least 1 items.")
        .max(100, "ids must be at most 100 items."),
    }),
    (result,_) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid",
        });
      }
    }
  ),
  async (c) => {
    const params = c.req.valid("json");
    const users = await UserService.findByIds(params.ids.map(BigInt));
    return c.json({
      users: users.map((user) =>
        pick(user, [
          "id",
          "avatar",
          "pubKey",
          "gender",
          "nickName",
          "nickNameIdx",
          "userName",
          "sign",
          "createdAt",
          "addr",
          "updatedAt"
        ])
      ),
    });
  }
);
user.post(
  "/findByUserName",
  zValidator(
    "json",
    z.object({
      userName: z
        .string()
        .min(6, "ids must be at least 1 items.")
        .max(120, "ids must be at most 120 items."),
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
    const user = await UserService.findByUserName(params.userName);
    if (!user) {
      return c.json(null);
    }
    return c.json({
      id: user.id,
    });
  }
);
export default user;
