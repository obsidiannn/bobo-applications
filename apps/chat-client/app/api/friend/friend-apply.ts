import { createInstance } from '../req';
import { IServer } from "@repo/types";
import { FriendInviteApplyItem, BaseArrayResp } from "@repo/types";


const create = async (userId: number, remark: string): Promise<null> => await createInstance(true).post('/friend-applies/create', { friendId: userId, remark });

const agree = async (id: number): Promise<{ chatId: string, friendId: number }> => await createInstance(true).post('/friend-applies/agree', { id });

const reject = async (id: number, reson?: string): Promise<null> => await createInstance(true).post('/friend-applies/reject', {
  id,
  reson
});

const getList = async (): Promise<
  { ids: number[] }
> => await createInstance(true).post('/friend-applies/getIdList');

const getBatchInfo = async (ids: number[]): Promise<{
  items: IServer.IFriendApply[]
}> => await createInstance(true).post('/friend-applies/getBatchInfo', { ids });


const del = async (id: number) => await createInstance(true).post('/friend-applies/del', { id });

const getApplyListByReqUserId = async (userId: number): Promise<BaseArrayResp<FriendInviteApplyItem>> => await createInstance(true).post('/friend-applies/apply-list', { reqUserId: userId });



export default {
  create,
  del,
  getList,
  reject,
  agree,
  getApplyListByReqUserId,
  getBatchInfo
}