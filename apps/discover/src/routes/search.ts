import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "@/lib/middlewares";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { protos } from '@repo/grpc/proto'
import { SearchService } from "@/services/search.service";
import { pageSkip } from "@repo/server/utils";
const route = new Hono<{ Variables: { user: protos.user.User } }>();

route.post("/query",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      keyword: z.optional(z.string()),
      limit: z.optional(z.number().default(10)),
      page: z.optional(z.number().default(1)),
      type: z.number()
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
    const service = SearchService.getInstance()
    const skip = pageSkip(params.page, params.limit)
    const result = await service.search(params.type, params.limit ?? 10, skip, params.keyword)
    console.log('search result = ', result);
    const ids = result.hits.map(i=>Number(i.refId))
    return c.json({
      items: ids,
      total: result.estimatedTotalHits
    });
  });


export default route;
