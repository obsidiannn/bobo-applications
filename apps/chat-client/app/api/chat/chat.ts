import { createInstance } from '../req';
import {
  BaseIdsArrayReq, BaseArrayResp,
  ChatListItem, ChatDetailItem,
  ChatRaiseTopReq, ChatSequenceItem
} from "@repo/types";

// 我的会话列表（id）有序
const mineChatIdList = async (): Promise<BaseArrayResp<string>> => await createInstance(true).post('/chats/mine-id-list');
const mineChatIdAfter = async (lastTime: number): Promise<BaseArrayResp<string>> =>
  await createInstance(true).post('/chats/mine-id-after', { lastTime });
// 获取我的会话列表
const mineChatList = async (): Promise<BaseArrayResp<ChatListItem>> => await createInstance(true).post('/chats/mine-list');
const chatByIds = async (chatIds: string[]):
  Promise<BaseArrayResp<ChatDetailItem>> => await createInstance(true).post('/chats/chat-by-ids', { chatIds });

const queryChatSequence = async (chatIds: string[]):
  Promise<BaseArrayResp<ChatSequenceItem>> => await createInstance(true).post('/chats/chat-sequence', { chatIds });

const findChatIdByUserId = async (userId: number): Promise<{ id: string }> => await createInstance(true).post('/chats/id-by-user', { userId })

const mineChatDetailList = async (chatId?: string): Promise<BaseArrayResp<ChatDetailItem>> => await createInstance(true).post('/chats/mine-chat', { chatId: chatId })

// 会话详情
const chatDetail = async (param: BaseIdsArrayReq): Promise<BaseArrayResp<ChatDetailItem>> => await createInstance(true).post('/chats/detail', param);

// 删除会话
const deleteChat = async (param: BaseIdsArrayReq) => await createInstance(true).post('/chats/delete', param);

// 置顶
const raiseTop = async (param: ChatRaiseTopReq): Promise<{ isTop: number }> => createInstance(true).post('/chats/raise-top', param);

// 免打扰
const changeMute = async (param: {
  chatId: string, mute: boolean
}): Promise<{ isMute: number }> => createInstance(true).post('/chats/change-mute', param);

const tokenRegister = async (param: { token: string }): Promise<void> => await createInstance(true).post('/chats/tokenRegister', param);

export default {
  mineChatIdList,
  mineChatList,
  chatByIds,
  chatDetail,
  deleteChat,
  raiseTop,
  changeMute,
  mineChatDetailList,
  findChatIdByUserId,
  tokenRegister,
  queryChatSequence,
  mineChatIdAfter
}