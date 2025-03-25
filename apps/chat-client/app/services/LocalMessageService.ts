import { GetDB } from "app/utils/database";
import { and, inArray, like } from "drizzle-orm";
import { IMessage, messages } from "drizzle/schema";

export interface IGetListParamType {
    chatId: string
    sequence: number
    limit: number
}

export class LocalMessageService {
    static async add(item: IMessage) {
        return await LocalMessageService.addBatch([item])
    }
    static async addBatch(items: IMessage[]) {
        const db = GetDB()
        const exists = await db.query.messages.findMany({
            where: (messages, { inArray }) => inArray(messages.id, items.map(item => item.id)),
        })
        const inserts = items.filter(item => !exists.find(exist => exist.id === item.id))
        if (inserts.length > 0) {
            await db.insert(messages).values(inserts)
        }
        return true;
    }
    static async getList(chatId: string, sequence: number, limit: number): Promise<IMessage[]> {
        const db = GetDB()
        const results = await db.query.messages.findMany({
            where: (messages, { eq, lte, and }) => and(
                eq(messages.chatId, chatId),
                lte(messages.sequence, sequence)
            ),
            orderBy: (messages, { desc }) => desc(messages.sequence),
            limit: limit,
        })
        return results.sort((a, b) => (b.sequence ?? 1) - (a.sequence ?? 1))
    }

    static async queryList(chatId: string, type: string, keyword: string,): Promise<IMessage[]> {
        const db = GetDB()
        const results = await db.query.messages.findMany({
            where: (messages, { eq, and }) => and(
                eq(messages.chatId, chatId),
                (type === 'text' ? like(messages.data, '%' + keyword + '%') :
                    undefined
                ),
                eq(messages.dataType, type)
            ),
            orderBy: (messages, { desc }) => desc(messages.sequence),
        })
        return results.sort((a, b) => (b.sequence ?? 1) - (a.sequence ?? 1))
    }

    static async findByIds(ids: string[]) {
        const db = GetDB()
        return await db.query.messages.findMany({
            where: (messages, { inArray }) => and(
                inArray(messages.id, ids)
            ),
        })
    }
    static async flushAll() {
        const db = GetDB()
        return await db.delete(messages)
    }
    static async flushByChatIds(chatIds: string[]) {
        const db = GetDB()
        return await db.delete(messages).where(
            and(inArray(messages.chatId, chatIds))
        )
    }
    static async delById(id: string) {
        return LocalMessageService.delByIds([id])
    }
    static async delByIds(ids: string[]) {
        const db = GetDB()
        return await db.delete(messages).where(
            and(inArray(messages.id, ids))
        )
    }
    static async deleteAll() {
        const db = GetDB()
        return await db.delete(messages)
    }
    static async delByChatIdIn(chatIds: string[]) {
        const db = GetDB()
        return await db.delete(messages).where(
            and(inArray(messages.chatId, chatIds))
        )
    }
}