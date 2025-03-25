import { GetDB } from "app/utils/database"
import { delaySecond } from "app/utils/delay"
import dayjs from "dayjs"
import { and, asc, desc, eq, gte } from "drizzle-orm"
import { IGroupMember, groupMembers } from "drizzle/schema"

export class LocalGroupMemberService {


    static queryPage() {

    }

    static async findByIdWithoutTimeout(groupId: number): Promise<IGroupMember[]> {
        const result = await GetDB().select().from(groupMembers).where(
            eq(groupMembers.groupId, groupId)
        ).orderBy(asc(groupMembers.id))
        return result
    }
    static async findByIdInWithTimeout(groupId: number): Promise<IGroupMember[]> {
        const db = GetDB()
        const result = await db.select().from(groupMembers).where(
            and(
                eq(groupMembers.id, groupId),
                gte(groupMembers.refreshAt, delaySecond())
            )
        )
        return result
    }


    static async saveBatch(entities: IGroupMember[], groupId: number) {
        const db = GetDB()
        if (!db) {
            return
        }

        const result = await db.query.groupMembers.findFirst({
            where: eq(groupMembers.groupId, groupId),
            columns: {
                refreshAt: true
            },
            orderBy: [
                desc(groupMembers.refreshAt)
            ]
        })
        if (result && result?.refreshAt !== null && result.refreshAt >= delaySecond()) {
            return
        }

        const now = dayjs().unix()
        await db.transaction(async (tx) => {
            try {
                for (let index = 0; index < entities.length; index++) {
                    const e = entities[index];
                    await tx.insert(groupMembers).values(e).onConflictDoUpdate({ target: groupMembers.id, set: { ...e, refreshAt: now } })
                }
            } catch (e) {
                console.error(e)
                tx.rollback()
            }
        }, {
            behavior: "immediate",
        });

    }



}