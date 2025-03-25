import { GetDB } from "app/utils/database"
import { and } from "drizzle-orm"
import { IFriendApplies, friendApplies } from "drizzle/schema"

export class LocalFriendApplyService {

    static async addBatch(items: IFriendApplies[]) {
        const db = GetDB()
        await db.transaction(async (tx) => {
            try {
                for (let index = 0; index < items.length; index++) {
                    const e = items[index];
                    await tx.insert(friendApplies).values(e).onConflictDoUpdate({ target: friendApplies.id, set: { ...e } })
                }
            } catch (e) {
                console.error('[sqlite] rolback', e)
                tx.rollback()
            }
        }, {
            behavior: "immediate",
        });
        return true;
    }

    static async getList(): Promise<IFriendApplies[]> {
        const db = GetDB()
        const results = await db.query.friendApplies.findMany({
            orderBy: (entities, { desc }) => desc(entities.id),
        })
        console.log('[friend-applies]', results);

        return results
    }

    static async findByIds(ids: number[]): Promise<IFriendApplies[]> {
        const db = GetDB()
        return await db.query.friendApplies.findMany({
            where: (entities, { inArray }) => and(
                inArray(entities.id, ids)
            ),
        })
    }

}