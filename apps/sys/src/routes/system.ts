import { NodeService } from "@/services/node.service";
import { AppVersionService } from "@/services/app-version.service";
import { Hono } from "hono";
import { pick } from "radash";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { IModel } from "@repo/enums";
import { SysCategoryConfig } from '@repo/types'
import { HTTPException } from "hono/http-exception";
import { CategoryService } from "@/services/category.service";
const system = new Hono();
system.all("/nodes/getLists", async (c) => {
  const nodes = await NodeService.getAllNodes();
  return c.json({
    nodes: nodes
      .filter(item => item.status == IModel.INode.Status.ONLINE)
      .map((node) => pick(node, ["region", "addr", "type"])),
  });
});
system.post("/app/versions", zValidator(
  "json",
  z.object({
    platform: z.string(),
    language: z.string(),
    limit: z.number().default(10),
    offset: z.number().default(0),
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
  const items = await AppVersionService.getList(params.language, params.platform, params.limit, params.offset);
  return c.json({
    list: items.map(item => pick(item, ["versionCode", "versionName", "description", "downloadUrl", "forceUpdate"])),
  });
});

system.post("/app/categories", zValidator(
  "json",
  z.object({
    type: z.number(),
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
  const items = await CategoryService.getList(params.type);
  return c.json({
    list: items.map(item => {
      const e = pick(item, ["id", "name", "describe", "sort", 'type'])
      if (item.config) {
        return { ...e, config: JSON.parse(item.config) as SysCategoryConfig }
      }
      return e
    }),
  });
});

export default system;
