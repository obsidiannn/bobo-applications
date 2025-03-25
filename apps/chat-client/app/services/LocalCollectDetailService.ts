import { GetDB } from "app/utils/database"
import { pageSkip } from "app/utils/query";
import dayjs from "dayjs";
import { and, desc, eq, asc, inArray, like, lt, sql } from "drizzle-orm";
import { ICollect, ICollectDetail, collectDetail } from "drizzle/schema"
import { id } from "ethers";


export class LocalCollectDetailService {
    static async removeAll() {
        const db = GetDB()
        await db.delete(collectDetail)
    }

    static async addBatch(entities: ICollectDetail[]) {
        const db = GetDB()
        const collectIds: number[] = entities.map(item => item.collectId ?? '');
        const olds = await db.query.collectDetail.findMany({
            where: (collectDetail, { inArray }) => inArray(collectDetail.collectId, collectIds),
            columns: {
                msgId: true
            }
        })
        const inserts = entities.filter(item => !olds.find(old => old.msgId === item.msgId))
        if (inserts.length > 0) {
            await db.insert(collectDetail).values(inserts)
        }
        return entities;
    }

    static async findByCollectId(collectId: number): Promise<ICollectDetail[]> {
        const db = GetDB()
        const result = await db.query.collectDetail.findMany({
            where: eq(collectDetail.collectId, collectId),
            orderBy: asc(collectDetail.id)
        })
        return result
    }



}