

import { createInstance } from 'app/api/req';
import { BaseArrayResp, IServer } from "@repo/types";

const getRelationList = async (userIds: number[]) => await createInstance(true).post('/friends/getRelationList', { userIds }) as {
  items: {
    userId: number;
    status: boolean;
    chatId: string
    friendId: number
  }[]
};
const updateRemark = async (id: number, remark: string): Promise<null> => await createInstance(true).post('/friends/updateRemark', { id, remark });

const getList = async (): Promise<{
  ids: number[]
}> => await createInstance(true).post('/friends/getIdList');
const getBatchInfo = async (ids: number[]): Promise<{
  friends: IServer.IFriend[]
}> => await createInstance(true).post('/friends/getBatchInfo', { ids });

const getFriendIdByUserId = async (ids: number[]): Promise<BaseArrayResp<number>> => await createInstance(true).post('/friends/friendIdByUserId', { ids });

const getFriendUserIds = async (): Promise<BaseArrayResp<number>> => await createInstance(true).post('/friends/getFriendUserId');

/**
 * 删除自己的全部好友，之后需要清除本地 message data 
 * @returns 
 */
const dropAllFriends = async (): Promise<{ chatIds: string[] }> => await createInstance(true).post('/friends/drop-all');

/**
 * 删除自己的全部好友，之后需要清除本地 message data 
 * @returns 
 */
const dropByFriendId = async (id: number): Promise<{ chatId: string | null }> => await createInstance(true).post('/friends/del', { id });
/**
 * 删除自己的全部好友，之后需要清除本地 message data 
 * @returns 
 */
const blockFriend = async (id: number): Promise<{ isShow: number | null, chatId: string }> => await createInstance(true).post('/friends/block', { id });
// 移除黑名单
const blockOut = async (id: number): Promise<{ isShow: number | null, chatId: string }> => await createInstance(true).post('/friends/block-out', { id });
const getBlockIdList = async (): Promise<BaseArrayResp<number>> => await createInstance(true).post('/friends/blocked-id-list');



export default {
  getRelationList,
  updateRemark,
  getList,
  getBatchInfo,
  getFriendIdByUserId,
  dropAllFriends,
  dropByFriendId,
  getFriendUserIds,
  blockFriend,
  blockOut,
  getBlockIdList
}