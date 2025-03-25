import { prisma } from "@/lib/database";
import { Prisma, Node } from "@prisma/db-system";
import { getInstance } from "@/lib/cache";
import { CachePlus } from "@repo/server/cache";
import JsonBigInt from 'json-bigint'
export class NodeService {
  static modelName: string = "node";
  private cache: CachePlus;
  private model: Prisma.NodeDelegate;
  private static instance: NodeService;
  private constructor(cache: CachePlus) {
    this.cache = cache;
    this.model = prisma.node;
  }
  static async make() {
    if (!NodeService.instance) {
      const cache = new CachePlus(NodeService.modelName, await getInstance());
      NodeService.instance = new NodeService(cache);
    }
    return NodeService.instance;
  }
  static async getAllIds() {
    const instance = await NodeService.make();
    const cacheKey = `all_ids`;
    const cacheVal = await instance.cache.get(cacheKey);
    if (cacheVal) {
      return JsonBigInt.parse(cacheVal as string) as number[];
    }
    await instance.cache.set(cacheKey, JsonBigInt.stringify([]), 600);
    const results = await prisma.node.findMany({
      select: {
        id: true,
      }
    });
    const ids = results.map((item: any) => item.id);
    await instance.cache.set(cacheKey, JsonBigInt.stringify(ids), 600);
    return ids;
  }
  static async findByIds(ids: number[]) {
    const instance = await NodeService.make();
    const unCachedIds: number[] = []
    const items: Node[] = [];
    for (let index = 0; index < ids.length; index++) {
      const id = ids[index];
      const cacheKey = `id:${id}`;
      const cacheVal = await instance.cache.get(cacheKey);
      if (cacheVal) {
        try {
          const item = JsonBigInt.parse(cacheVal as string) as Node;
          if (item) {
            items.push(item);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          continue;
        }
      } else {
        unCachedIds.push(id);
      }
    }
    if (unCachedIds.length > 0) {
      const results = await prisma.node.findMany({
        where: {
          id: {
            in: unCachedIds,
          }
        }
      });
      for (let index = 0; index < results.length; index++) {
        const item = results[index];
        items.push(item);
        await instance.cache.set(`id:${item.id}`, JsonBigInt.stringify(item));
      }
    }
    return items;
  }
  static async getAllNodes() {
    const ids = await NodeService.getAllIds();
    return await NodeService.findByIds(ids);
  }
  static async findById(id: number) {
    const items =await NodeService.findByIds([id]);
    if (items.length === 0) {
      return null;
    }
    return items[0];
  }

  static async add(data: Prisma.NodeCreateInput) {
    const instance = await NodeService.make();
    const result = await instance.model.create({
      data,
    });
    await instance.cache.del(`all_ids`);
    return result;
  }

  static async update(id: number, data: Prisma.NodeUpdateInput) {
    const instance = await NodeService.make();
    const result = await instance.model.update({
      where: {
        id,
      },
      data,
    });
    await instance.cache.del(`id:${id}`);
    return result;
  }

  static async delete(id: number) {
    const instance = await NodeService.make();
    const result = await instance.model.delete({
      where: {
        id,
      },
    });
    const cacheKey = `id:${id}`;
    await instance.cache.del(cacheKey);
    await instance.cache.del(`all_ids`);
    return result;
  }
}
