import { GetDB } from "app/utils/database"
import { delaySecond } from "app/utils/delay"
import dayjs from "dayjs"
import { and, desc, eq, gt, gte, inArray } from "drizzle-orm"
import { IGroup, groups } from "drizzle/schema"

export class LocalGroupService {


    static async removeAll() {
        const db = GetDB()
        if (!db) {
            return 0
        }
        await db.delete(groups)
    }

    /**
     * 获取最新加入的groupId
     */
    static async findLatestId(): Promise<number> {
        const db = GetDB()
        if (!db) {
            return 0
        }
        const result = await db.query.groups.findFirst({
            columns: {
                joinAt: true
            },
            orderBy: [
                desc(groups.joinAt)
            ]
        })
        if (result) {
            return result.joinAt ?? 0
        }
        return 0
    }

    /**
     * 哪些id不在db内
     * @param groupIds 不存在的id
     */
    static async findIdNotIn(groupIds: number[]): Promise<number[]> {
        if (!groupIds || groupIds.length <= 0) {
            return []
        }

        const db = GetDB()
        const result = await db.query.groups.findMany({
            columns: {
                id: true
            },
            where: inArray(groups.id, groupIds),
        })
        if (result && result.length > 0) {
            const idSet = new Set<number>(result.map(r => r.id))
            return groupIds.filter(e => {
                return !idSet.has(e)
            })
        }
        return groupIds
    }

    static async findByIdIn(groupIds: number[]): Promise<IGroup[]> {
        if (groupIds.length <= 0)
            return []
        return await GetDB().select().from(groups).where(
            and(
                inArray(groups.id, groupIds),
            )
        )
    }

    // 不存在过期策略的chat list
    static async findByIdInWithoutTimeout(groupIds: number[]): Promise<IGroup[]> {
        if (groupIds.length <= 0)
            return []
        return await GetDB().select().from(groups).where(
            and(
                inArray(groups.id, groupIds),
            )
        )
    }
    // 存在过期策略的chat list
    static async findByIdInWithTimeout(groupIds: number[]): Promise<IGroup[]> {
        if (groupIds.length <= 0)
            return []
        const db = GetDB()
        const result = await db.select().from(groups).where(
            and(
                inArray(groups.id, groupIds),
                gt(groups.role, 0),
                gte(groups.refreshAt, delaySecond())
            )
        )
        return result
    }

    static async save(e: IGroup): Promise<IGroup> {

        const entity = {
            ...e,
            refreshAt: dayjs().unix()
        }
        const old = await GetDB().query.groups.findFirst({
            where: eq(groups.id, entity.id)
        })
        if (old) {
            const items = await GetDB().update(groups).set(entity).where(eq(groups.id, entity.id)).returning();
            return items[0];
        }
        const items = await GetDB().insert(groups).values([entity]).returning();
        return items[0];
    }

    static async saveBatch(entities: IGroup[]) {
        const db = GetDB()
        if (!db) {
            return
        }
        const now = dayjs().unix()
        await db.transaction(async (tx) => {
            try {
                for (let index = 0; index < entities.length; index++) {
                    const e = entities[index];
                    await tx.insert(groups).values(e).onConflictDoUpdate({ target: groups.id, set: { ...e, refreshAt: now } })
                }
            } catch (e) {
                console.error(e)
                tx.rollback()
            }
        }, {
            behavior: "immediate",
        });

    }


    /**
        * 檢索
        * @param param 
        * @returns 
        */
    static async queryEntity(): Promise<IGroup[]> {
        const db = GetDB()
        const data = await db.select().from(groups)
            .orderBy(
                desc(groups.joinAt))
        return data
    }
}