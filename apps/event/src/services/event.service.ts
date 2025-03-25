import { Prisma, Event } from "@prisma/db-event";
import { getInstance } from "@/lib/cache";
import { log as logger } from "@/lib/system";
import { prisma } from "@/lib/database";
import { CachePlus } from "@repo/server/cache";
import JsonBigInt from "json-bigint";
import { IModel } from '@repo/enums'
export class EventService {
    static modelName: string = "events";
    private cache: CachePlus;
    private model: Prisma.EventDelegate;
    private static instance: EventService;
    private constructor(cache: CachePlus) {
        this.cache = cache;
        this.model = prisma.event;
    }

    static async make() {
        if (!EventService.instance) {
            const cacheClient = await getInstance();
            const cache = new CachePlus(EventService.modelName, cacheClient);
            EventService.instance = new EventService(cache);
        }
        return EventService.instance;
    }
    static async start(id: bigint) {
        const instance = await EventService.make();
        const event = await EventService.findById(id);
        if (event?.status != IModel.IEvent.Status.PENDING) {
            throw new Error("Event status is not PENDING");
        }
        const result = await instance.model.update({
            where: {
                id: id
            },
            data: {
                status: IModel.IEvent.Status.PROCESSING,
                startAt: new Date()
            }
        });
        await instance.cache.del(`id:${event.id}`)
        return result;
    }
    static async success(id: bigint) {
        const instance = await EventService.make();
        const event = await EventService.findById(id);
        if (event?.status != IModel.IEvent.Status.PROCESSING) {
            throw new Error("event status is not PROCESSING");
        }
        const result = await instance.model.update({
            where: {
                id: id
            },
            data: {
                status: IModel.IEvent.Status.SUCCESS,
                endAt: new Date()
            }
        });
        await instance.cache.del(`id:${event.id}`)
        return result;
    }
    static async failed(id: bigint, reson?: string) {
        const instance = await EventService.make();
        const event = await EventService.findById(id);
        if (event?.status != IModel.IEvent.Status.PENDING) {
            throw new Error("event status is not PENDING");
        }
        const result = await instance.model.update({
            where: {
                id: id
            },
            data: {
                status: IModel.IEvent.Status.FAILED,
                failedReason: reson,
                endAt: new Date(),

            }
        });
        await instance.cache.del(`id:${event.id}`)
        return result;
    }
    static async create(data: Prisma.EventCreateInput) {
        const instance = await EventService.make();
        return await instance.model.create({
            data: {
                ...data,
                status: IModel.IEvent.Status.PENDING,
            },
        });
    }
    static async updateById(id: bigint, data: Prisma.EventUpdateInput) {
        const instance = await EventService.make();
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
        const items = await EventService.findByIds([id]);
        return items.length ? items[0] : null;
    }
    static async findByIds(ids: bigint[]) {
        const instance = await EventService.make();
        const events: Event[] = [];
        const cachedValues = await instance.cache.mget(...ids.map((id) => `id:${id}`));
        for (const cachedValue of cachedValues) {
            if (cachedValue) {
                try {
                    const event = JsonBigInt.parse(cachedValue as string) as Event;
                    events.push(event);
                } catch (e) {
                    logger.error(e);
                    continue;
                }
            }
        }
        if (events.length < ids.length) {
            const cachedIds = events.map((event) => event.id);
            const unCachedIds = ids.filter((id) => !cachedIds.includes(id));
            if (unCachedIds.length > 0) {
                const unCachedEvents= await instance.model.findMany({
                    where: {
                        id: {
                            in: unCachedIds,
                        },
                    },
                });
                for (const unCachedEvent of unCachedEvents) {
                    await instance.cache.set(`id:${unCachedEvent.id}`, JsonBigInt.stringify(unCachedEvent));
                    events.push(unCachedEvent);
                }
            }
        }
        return events;
    }

}
