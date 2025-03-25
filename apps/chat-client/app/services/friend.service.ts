import friendApi from "app/api/friend/friend";
import userService from "./user.service";
import { select } from "radash";
import { IUser } from "drizzle/schema";
import { LocalUserService } from "./LocalUserService";
import { LocalChatService } from "./LocalChatService";
import { LocalMessageService } from "./LocalMessageService";
import { IModel } from "@repo/enums";

const getReleationList = async (userIds: number[]) => {
    return await friendApi.getRelationList(userIds);
}

/**
 * 根據userId獲取friendInfo
 * @param userId
 */
const getFriendInfoByUserId = async (userId: number): Promise<IUser | null> => {
    try {
        const user = await userService.findById(userId)
        if (user === null) {
            return null
        }
        if (user.friendId === null) {
            const friendResp = await friendApi.getFriendIdByUserId([userId])
            if (friendResp.items.length > 0) {
                const { friends } = await friendApi.getBatchInfo(friendResp.items);
                const friend = friends[0]
                user.friendId = friend.id
                user.friendAlias = friend.remark
                user.friendAliasIdx = friend.remarkIdx
                user.chatId = friend.chatId
            }
            // todo: await LocalUserService.update(user)
        }
        return user
    } catch (error) {

    }

    return null
}



/**
 * 根據friendId 獲取friend
 * @param ids friendId
 * @returns
 */
const findByIds = async (ids: number[]) => {
    const infoRep = await friendApi.getBatchInfo(ids);
    const { friends } = infoRep;
    return friends;
}
const getIds = async () => {
    const rep = await friendApi.getList();
    return rep.ids;
}
const getOfflineList = async () => {
    const users = await LocalUserService.getFriends();
    return users;
}
const getOnlineList = async (ids?: number[]) => {
    const friendIds = ids ? ids : await getIds();
    console.log('friendIds', friendIds);

    if (!friendIds || friendIds.length === 0) {
        return [];
    }
    const friends = await findByIds(friendIds);
    const userIds = select(friends, f => f.friendId, () => true)
    const usersMap = await userService.getUserHash(userIds);
    const result: IUser[] = []
    friends.forEach(friend => {
        const u = usersMap.get(friend.friendId)
        if (u) {
            result.push({
                ...u,
                friendId: friend.id,
                chatId: friend.chatId,
                friendAlias: friend.remark,
                friendAliasIdx: friend.remarkIdx,
                isFriend: 1,
            })
        }
    })
    // await userService.setNonFriends(userIds);
    await LocalUserService.setFriends(userIds,IModel.ICommon.ICommonBoolEnum.YES);
    return result as IUser[];
}

const getBlockedList = async () => {
    const blockIdResp = await friendApi.getBlockIdList()

    if (!blockIdResp || blockIdResp.items.length <= 0) {
        return [];
    }
    const friendIds = blockIdResp.items
    const friends = await findByIds(friendIds);
    const userIds = select(friends, f => f.friendId, () => true)
    const usersMap = await userService.getUserHash(userIds);
    const result: IUser[] = []
    friends.forEach(friend => {
        const u = usersMap.get(friend.friendId)
        if (u) {
            result.push({
                ...u,
                friendId: friend.id,
                chatId: friend.chatId,
                friendAlias: friend.remark,
                friendAliasIdx: friend.remarkIdx,
                isFriend: 1,
            })
        }
    })
    return result as IUser[];
}

const removeAll = async () => {
    return true;
}
const removeBatch = async (uids: string[]) => {
    return true;
}

const block = async (id: number): Promise<number | null> => {
    const result = await friendApi.blockFriend(id)
    await LocalChatService.deleteIdIn([result.chatId])
    return result.isShow
}

const blockOut = async (id: number): Promise<string | null> => {
    const result = await friendApi.blockOut(id)
    await LocalChatService.deleteIdIn([result.chatId])
    return result.chatId
}

const remove = async (id: number): Promise<string | null> => {
    const result = await friendApi.dropByFriendId(id)
    if (result && result.chatId) {
        // 去除chat等
        await LocalChatService.deleteIdIn([result.chatId])
        await LocalMessageService.delByChatIdIn([result.chatId])
        return result.chatId
    }
    return null
}
const updateRemark = async (id: number, remark: string): Promise<void> => {
    await friendApi.updateRemark(id, remark);
}
export default {
    getOnlineList,
    removeAll,
    removeBatch,
    remove,
    updateRemark,
    getReleationList,
    getOfflineList,
    getFriendInfoByUserId,
    block,
    blockOut,
    getBlockedList
};
