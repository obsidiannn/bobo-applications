import userApi from "app/api/auth/user";
// import { IUser } from '@/drizzle/schema';
// import UserModel from '@/service/user.model';
import { OfficialUserItem } from "@repo/types";
import { GetDB } from "app/utils/database";
import { eq } from "drizzle-orm";
import { IUser, users } from "drizzle/schema";
import { LocalUserService } from "./LocalUserService";
import { diff } from "radash"
import dayjs from 'dayjs'

export class UserService {
    static async add(data: IUser): Promise<IUser> {
        const old = await GetDB().query.users.findFirst({
            where: eq(users.id, data.id)
        })
        if (!old) {
            const items = await GetDB().update(users).set(data).where(eq(users.id, data.id)).returning();
            return items[0];
        }
        const items = await GetDB().insert(users).values(data).returning();
        return items[0];
    }
    static async findById(id: number): Promise<IUser | undefined> {
        return await GetDB().query.users.findFirst({
            where: eq(users.id, id)
        })
    }
    static async findByUserName(username: string): Promise<IUser | undefined> {
        return await GetDB().query.users.findFirst({
            where: eq(users.userName, username)
        })
    }
    static async findByAddr(addr: string): Promise<IUser | undefined> {
        return await GetDB().query.users.findFirst({
            where: eq(users.addr, addr)
        })
    }
}
const findByUserName = async (username: string) => {
    const result = await userApi.findByUserName(username);
    if (result.id !== null) {
        return await findById(result.id);
    }
    return null;
}



const findByIds = async (ids: number[]): Promise<IUser[]> => {
    ids = [...new Set(ids)]
    const localUsers = await LocalUserService.findByIds(ids);

    const missingIds = diff(ids, localUsers.map(i => i.id));

    if (missingIds.length > 0) {
        const result = await userApi.getBatchInfo(missingIds);
        const users = result.users.map(u => {
            return {
                ...u,
                createdAt: new Date(u.createdAt),
                updatedAt: new Date(u.updateAt),
                refreshAt: dayjs().unix(),
                isFriend: 0,
                chatId: '',
                friendId: 0,
                friendAlias: '',
                friendAliasIdx: '',
                isSelf: 0
            } as IUser
        })

        await LocalUserService.addBatch(users)
        return [...localUsers, ...users]
    }
    return localUsers as IUser[];
}
const findById = async (id: number) => {
    const users = await findByIds([id]);
    if (users.length > 0) {
        return users[0];
    }
    return null;
}

const getUserHash = async (ids: number[]): Promise<Map<number, IUser>> => {
    const users = await findByIds(ids)
    return initUserHash(users)
}

const initUserHash = (userList: IUser[]): Map<number, IUser> => {
    const result = new Map<number, IUser>()
    if (userList.length <= 0) {
        return result
    }
    userList.forEach(u => {
        result.set(u.id, u)
    })
    return result
}


const officialUserHash = async (ids: number[]): Promise<Map<number, OfficialUserItem>> => {
    const result = new Map<number, OfficialUserItem>()
    if (ids.length <= 0) {
        return result
    }
    const users = await userApi.findOfficialUsers({ ids: ids });
    users.items.forEach(u => {
        result.set(u.id, u)
    })
    return result
}

const setNonFriends = async (ids: number[]) => {
    // return await UserModel.setNonFriends(ids);
}
const setFriends = async (ids: number[]) => {
    // return await UserModel.setFriends(ids);
}

const updateUser = async (user: IUser) => {
    await LocalUserService.createMany([user])
}

export default {
    findById,
    findByIds,
    findByUserName,
    getUserHash,
    initUserHash,
    officialUserHash,
    setNonFriends,
    setFriends,
    updateUser
}