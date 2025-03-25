import { GetDB } from "app/utils/database";
import dayjs from "dayjs";
import { inArray, eq } from "drizzle-orm";
import { users } from "drizzle/schema";
import type { IUser } from "drizzle/schema";

export class LocalUserService {
    static async add(data: IUser) {
        LocalUserService.addBatch([data])
        return data;
    }
    static async addBatch(items: IUser[]) {
        const db = GetDB();
        const ids = items.map(item => item.id);
        const olds = await db.query.users.findMany({
            where: (users, { inArray }) => inArray(users.id, ids)
        })
        const inserts = items.filter(item => !olds.find(old => old.id === item.id))
        if (inserts.length > 0) {
            await db.insert(users).values(inserts.map(item => {
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
                    nickName: item.nickName,
                    avatar: item.avatar,
                    gender: item.gender,
                    sign: item.sign,
                    updatedAt: item.updatedAt
                }
            }
            await db.update(users).set(data).where(eq(users.id, old.id))
        }
        return items;
    }
    static async findById(id: number) {
        const users = await LocalUserService.findByIds([id]);
        return users.length > 0 ? users[0] : null;
    }
    static async findByIds(ids: number[]): Promise<IUser[]> {
        if (ids.length <= 0) {
            return []
        }
        const db = GetDB()
        return await db.query.users.findMany({
            where: (users, { inArray }) => inArray(users.id, ids),
        })
    }

    static async findByUserName(username: string) {
        const db = GetDB()
        return await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.userName, username),
        })
    }

    static async findByAddr(addr: string) {
        const db = GetDB()
        return await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.addr, addr),
        })
    }

    static async setFriends(ids: number[], isFriend: number) {
        if (ids.length <= 0) {
            return;
        }
        const db = GetDB()
        return await db.update(users).set({
            isFriend,
            refreshAt: dayjs().unix()
        }).where(inArray(users.id, ids));
    }
    static async getFriends() {
        const db = GetDB()
        return await db.select().from(users).where(eq(users.isFriend, 1));
    }

}