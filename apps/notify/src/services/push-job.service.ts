import { Prisma, PushJob } from "@prisma/db-notify";
import { getInstance } from "@/lib/cache";
import { log as logger } from "@/lib/system";
import { prisma } from "@/lib/database";
import { CachePlus } from "@repo/server/cache";
import JsonBigInt from "json-bigint";
import { IModel } from '@repo/enums'
export class PushJobService {
    static modelName: string = "push_jobs";
    private cache: CachePlus;
    private model: Prisma.PushJobDelegate;
    private static instance: PushJobService;
    private constructor(cache: CachePlus) {
        this.cache = cache;
        this.model = prisma.pushJob;
    }

    static async make() {
        if (!PushJobService.instance) {
            const cacheClient = await getInstance();
            const cache = new CachePlus(PushJobService.modelName, cacheClient);
            PushJobService.instance = new PushJobService(cache);
        }
        return PushJobService.instance;
    }
    static async start(id: bigint) {
        const instance = await PushJobService.make();
        const pushJob = await PushJobService.findById(id);
        if (pushJob?.status != IModel.IPushJob.Status.PENDING) {
            throw new Error("PushJob status is not PENDING");
        }
        const result = await instance.model.update({
            where: {
                id: id
            },
            data: {
                status: IModel.IPushJob.Status.PROCESSING,
                startAt: new Date()
            }
        });
        await instance.cache.del(`id:${pushJob.id}`)
        return result;
    }
    static async success(id: bigint) {
        const instance = await PushJobService.make();
        const pushJob = await PushJobService.findById(id);
        if (pushJob?.status != IModel.IPushJob.Status.PROCESSING) {
            throw new Error("PushJob status is not PROCESSING");
        }
        const result = await instance.model.update({
            where: {
                id: id
            },
            data: {
                status: IModel.IPushJob.Status.SUCCESS,
                endAt: new Date()
            }
        });
        await instance.cache.del(`id:${pushJob.id}`)
        return result;
    }
    static async failed(id: bigint, reson?: string) {
        const instance = await PushJobService.make();
        const pushJob = await PushJobService.findById(id);
        if (pushJob?.status != IModel.IPushJob.Status.PROCESSING) {
            console.log("push job status is not pending",pushJob);
            return ;
            //throw new Error("PushJob status is not PROCESSING");
        }
        const result = await instance.model.update({
            where: {
                id: id
            },
            data: {
                status: IModel.IPushJob.Status.FAILED,
                failedReason: reson,
                endAt: new Date(),

            }
        });
        await instance.cache.del(`id:${pushJob.id}`)
        return result;
    }
    static async create(data: Prisma.PushJobCreateInput) {
        const instance = await PushJobService.make();
        return await instance.model.create({
            data: {
                ...data,
                status: IModel.IPushJob.Status.PENDING,
            },
        });
    }
    static async updateById(id: bigint, data: Prisma.PushJobUpdateInput) {
        const instance = await PushJobService.make();
        const result = await instance.model.update({
            where: {
                id
            },
            data
        });
        const cacheKey = `id:${id}`
        await instance.cache.del(cacheKey);
        return result;
    }
    static async findById(id: bigint) {
        const items = await PushJobService.findByIds([id]);
        return items.length ? items[0] : null;
    }
    static async findByIds(ids: bigint[]) {
        const instance = await PushJobService.make();
        const pushJobs: PushJob[] = [];
        const cachedValues = await instance.cache.mget(...ids.map((id) => `id:${id}`));
        for (const cachedValue of cachedValues) {
            if (cachedValue) {
                try {
                    const pushJob = JsonBigInt.parse(cachedValue as string) as PushJob;
                    pushJobs.push(pushJob);
                } catch (e) {
                    logger.error(e);
                    continue;
                }
            }
        }
        if (pushJobs.length < ids.length) {
            const cachedIds = pushJobs.map((pushJob) => pushJob.id);
            const unCachedIds = ids.filter((id) => !cachedIds.includes(id));
            if (unCachedIds.length > 0) {
                const unCachedPushJobs = await instance.model.findMany({
                    where: {
                        id: {
                            in: unCachedIds,
                        },
                    },
                });
                for (const unCachedPushJob of unCachedPushJobs) {
                    await instance.cache.set(`id:${unCachedPushJob.id}`, JsonBigInt.stringify(unCachedPushJob));
                    pushJobs.push(unCachedPushJob);
                }
            }
        }
        return pushJobs;
    }

}
