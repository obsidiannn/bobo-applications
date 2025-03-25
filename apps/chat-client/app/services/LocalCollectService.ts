import { GetDB } from "app/utils/database"
import { pageSkip } from "app/utils/query";
import dayjs from "dayjs";
import { and, desc, eq, asc, inArray, like, lt, sql } from "drizzle-orm";
import { ICollect, collects } from "drizzle/schema"

export interface ICollectQueryPage {
    type?: string[],
    desc?: boolean
    keyword: string | null
    page: number
    size: number
}

export class LocalCollectService {
    static async removeAll() {
        const db = GetDB()
        await db.delete(collects)
    }

    // static async addBatch(entities: ICollect[]) {
    //     const db = GetDB()
    //     const msgIds: string[] = entities.map(item => item.msgId ?? '');
    //     const olds = await db.query.collects.findMany({
    //         where: (collects, { inArray }) => inArray(collects.msgId, msgIds),
    //         columns: {
    //             id: true,
    //             msgId: true
    //         }
    //     })
    //     const inserts = entities.filter(item => !olds.find(old => old.msgId === item.msgId))
    //     if (inserts.length > 0) {
    //         await db.insert(collects).values(inserts.map(item => {
    //             return {
    //                 ...item,
    //                 createdAt: dayjs().unix()
    //             }
    //         }))
    //     }
    //     return entities;
    // }

    static async addSingle(entity: ICollect): Promise<ICollect | null> {
        const db = GetDB()
        const olds = await db.query.collects.findMany({
            where: (collects, { eq }) => eq(collects.msgId, entity.msgId),
            columns: {
                id: true,
                msgId: true
            }
        })
        if (olds.length <= 0) {
            const e = await db.insert(collects).values([{
                ...entity,
                createdAt: dayjs().unix()
            }]).returning()
            if (e.length > 0) {
                return e[0]
            }
        }
        return null;
    }


    /**
     * 分页查询
     * @param param 
     * @returns 
     */
    static async queryPage(param: ICollectQueryPage): Promise<ICollect[]> {
        const db = GetDB()
        const offset = pageSkip(param.page, param.size)
        console.log('offset', offset, param.size);

        const data = await db.query.collects.findMany({
            where: (and(
                (param.type && param.type.length > 0 ? inArray(collects.type, param.type) : undefined),
                (param.keyword ? like(collects.title, '%' + param.keyword + '%') : undefined),
            )),
            orderBy: (
                (param.desc ? desc(collects.id) : asc(collects.id))
            ),
            offset,
            limit: param.size
        })
        // const data = await db.query.collects.findMany()
        console.log('local query', param);

        return data
    }

}