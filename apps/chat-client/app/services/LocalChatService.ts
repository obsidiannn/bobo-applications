import { IChat } from "drizzle/schema";
import dayjs from 'dayjs'
import { GetDB } from "app/utils/database";
import { and, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { chats } from "drizzle/schema";
import { delaySecond } from "app/utils/delay";
import { IModel } from "@repo/enums";


export class LocalChatService {
    /**
     * 获取最新加入的chatId
     * @param chatIds 
     */
    static async findLatestId(): Promise<number | null> {
        const db = GetDB()
        const result = await db.query.chats.findFirst({
            columns: {
                createdAt: true
            },
            orderBy: [
                desc(chats.createdAt)
            ]
        })
        if (result) {
            return result.createdAt
        }
        return null
    }
    static async findById(id: string) {
        const items = await LocalChatService.findByIds([id]);
        if (items.length > 0) {
            return items[0]
        }
        return null
    }
    static async findByIds(ids: string[]): Promise<IChat[]> {
        const db = GetDB()
        return await db.query.chats.findMany({
            where: (chats, { inArray }) => inArray(chats.id, ids),
        })
    }
    /**
     * 哪些id不在db内
     * @param chatIds 不存在的id
     */
    static async findIdNotIn(chatIds: string[]): Promise<string[]> {
        if (!chatIds || chatIds.length <= 0) {
            return []
        }

        const db = GetDB()
        const result = await db.query.chats.findMany({
            columns: {
                id: true
            },
            where: inArray(chats.id, chatIds),
        })
        if (result && result.length > 0) {
            const idSet = new Set<string>(result.map(r => r.id))
            return chatIds.filter(e => {
                return !idSet.has(e)
            })
        }
        return chatIds
    }

    // 不存在过期策略的chat list
    static async findByIdInWithoutTimeout(chatIds: string[]): Promise<IChat[]> {
        if (chatIds.length <= 0)
            return []
        return await GetDB().select().from(chats).where(
            and(
                inArray(chats.id, chatIds),
                gte(chats.refreshAt, delaySecond())
            )
        )
    }
    // 存在过期策略的chat list
    static async findByIdInWithTimeout(chatIds: string[]): Promise<IChat[]> {
        if (chatIds.length <= 0)
            return []
        const db = GetDB()
        return db.select().from(chats).where(
            and(
                inArray(chats.id, chatIds),
                gte(chats.refreshAt, delaySecond())
            )
        )
    }
    static async updateSequence(chatId: string, sequence: number) {
        console.log('updateSequence', chatId, sequence)
        const db = await GetDB()
        const result = await db.update(chats).set({ lastSequence: sequence }).where(and(
            eq(chats.id, chatId),
            lt(chats.lastSequence, sequence)
        )).returning()
        console.log('updateSequence result', result)
        return result
    }
    static async save(item: IChat) {
        const items = await LocalChatService.addBatch([item]);
        return items[0];
    }
    static async addBatch(items: IChat[]) {
        const db = GetDB();
        const ids = items.map(item => item.id);
        const olds = await db.query.chats.findMany({
            where: (chats, { inArray }) => inArray(chats.id, ids)
        })
        const inserts = items.filter(item => !olds.find(old => old.id === item.id))
        if (inserts.length > 0) {
            await db.insert(chats).values(inserts.map(item => {
                return {
                    ...item,
                    refreshAt: dayjs().unix()
                }
            }))
        }
        for (const old of olds) {
            const item = items.find(item => item.id === old.id)
            let data: any = {
                refreshAt: dayjs().unix()
            }
            if (item && (old.updatedAt !== item.updatedAt)) {
                data = {
                    ...data,
                    updatedAt: item.updatedAt
                }
            }
            await db.update(chats).set(data).where(eq(chats.id, old.id))
        }
        return items;
    }
    static async saveBatch(entities: IChat[]) {
        const db = GetDB()
        if (!db) {
            return
        }
        const now = dayjs().unix()
        await db.transaction(async (tx) => {
            try {
                for (let index = 0; index < entities.length; index++) {
                    const e = entities[index];
                    await tx.insert(chats).values(e).onConflictDoUpdate({ target: chats.id, set: { ...e, refreshAt: now } })
                }
            } catch (e) {
                console.error('[sqlite] rolback', e)
                tx.rollback()
            }
        }, {
            behavior: "immediate",
        });

    }

    static async setTop(chatId: string, isTop: number) {
        return await GetDB().update(chats).set({
            isTop
        }).where(eq(chats.id, chatId))
    }

    static async setMute(chatId: string, isMute: number) {
        return await GetDB().update(chats).set({
            isMute
        }).where(eq(chats.id, chatId))
    }

    static async deleteIdIn(chatIds: string[]) {
        const db = GetDB()
        await db.delete(chats).where(
            inArray(chats.id, chatIds)
        )
    }

    static async queryEntity() {
        const db = GetDB()
        console.log('init ');
        const data = await db.select().from(chats)
            .orderBy(
                sql`case when ${chats.type} = ${IModel.IChat.IChatTypeEnum.OFFICIAL} then 1 else 0 end desc `,
                desc(chats.isTop)
            )
        return data
    }

}