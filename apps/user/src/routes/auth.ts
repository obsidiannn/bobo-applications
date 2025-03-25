import { Context, Hono } from "hono";
import { listify, pick } from "radash";
import { UserService } from "@/services/user.service";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { User } from "@prisma/db-user"
import s3 from "@/lib/s3";
import { getFirstLetterOfPinyin } from "@repo/server/str-util";
import { authMiddleware } from "@/lib/middlewares";
import { IModel } from "@repo/enums";
import { ComplainService } from "@/services/complain.service";
import { FeedbackService } from "@/services/feedback.service";
const auth = new Hono<{ Variables: { user: User } }>();
auth.post(
  "/update/nickName",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      nickName: z
        .string()
        .min(1, "nickName must be at least 1 characters long.")
        .max(16, "nickName can be up to 16 characters long"),
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
    console.log("请求参数", params);
    const user = c.get("user");
    await UserService.update(user.id, {
      nickNameIdx: getFirstLetterOfPinyin(params.nickName),
      nickName: params.nickName,
    });
    return c.json(null);
  }
);
auth.post(
  "/update/userName",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      userName: z
        .string()
        .min(6, "userName must be at least 6 characters long.")
        .max(16, "userName can be up to 16 characters long")
        .regex(
          /^[A-Za-z][A-Za-z0-9]*$/,
          "Username must start with a letter and only contain letters and numbers"
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
    const params = c.req.valid("json");
    const user = c.get("user");
    const old = await UserService.findByUserName(params.userName);
    if (!old || old.id == user.id) {
      await UserService.update(user.id, {
        userName: params.userName,
      });
    } else {
      throw new HTTPException(400, {
        message: "已经存在",
      });
    }
    return c.json(null);
  }
);

auth.post(
  "/update/gender",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      gender: z.number().refine((value) => listify(IModel.IUser.Status, (_, v) => v).includes(value)),
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
    await UserService.update(user.id, {
      gender: params.gender,
    });
    //
    return c.json(null);
  }
);

auth.post(
  "/update/avatar",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      avatar: z.string().min(1, "头像不能为空"),
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
    let { avatar } = params;
    if (avatar.startsWith("tmp")) {
      const newAvatar = avatar.replace("tmp", "user/avatar");
      try {
        await s3.copyFileToOtherDir(avatar, newAvatar);
        avatar = newAvatar;
      } catch (e) {
        console.log(e);
        throw new HTTPException(400, {
          message: "请重试",
        });
      }
    }
    const user = c.get("user");
    await UserService.update(user.id, {
      avatar,
    });
    return c.json(null);
  }
);

auth.post("/destroy", authMiddleware, async (c: Context) => {
  const user = c.get("user");
  await UserService.deleteById(user.id);
  return c.json(null);
});

auth.post(
  "/update/sign",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      sign: z.string().max(16, "sign can be up to 16 characters long"),
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
    if (user.sign != params.sign) {
      await UserService.update(user.id, {
        sign: params.sign,
      });
    }
    return c.json(null);
  }
);
auth.post("/info", authMiddleware, async (c: Context) => {
  const user = c.get("user");
  return c.json({
    user: pick(user, [
      "id",
      "addr",
      "avatar",
      "gender",
      "nickName",
      "nickNameIdx",
      "userName",
      "sign",
      "createdAt",
    ]),
  });
});



auth.post(
  "/complain",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      userId: z.number(),
      content: z.optional(z.string()),
      imageUrls: z.array(z.string())
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
    const result = await ComplainService.doComplain(user.id, BigInt(params.userId), params.imageUrls, params.content)
    return c.json({ id: result.id });
  }
);


auth.post(
  "/feedback",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      categoryId: z.number(),
      content: z.string(),
      imageUrls: z.array(z.string())
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
    const result = await FeedbackService.doFeedback(user.id, params.imageUrls, BigInt(params.categoryId), params.content)
    return c.json({ id: result.id });
  }
);


export default auth;
