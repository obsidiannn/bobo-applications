import { createInstance } from '../req';
import {
  BaseIdsArrayReq, BaseArrayResp,

  MessageSendReq,
  MessageListItem,
  MessageDetailItem,
  MessageDeleteByIdReq,
  MessageSendResp,
  MessageListReq,
  MessageDetailReq
} from "@repo/types";

// 发送消息
const sendMessage = async (param: MessageSendReq): Promise<MessageSendResp> => await createInstance(true).post('/chats/messages/send', param);

// 消息列表
const getMessageList = async (param: MessageListReq): Promise<BaseArrayResp<MessageListItem>> => await createInstance(true).post('/chats/messages/list', param);
const getMessageListIds = async (param: MessageListReq): Promise<BaseArrayResp<string>> => await createInstance(true).post('/chats/messages/list-ids', param);

// 消息列表
const findByIds = async (param: {
  chatId: string;
  ids: string[];
}): Promise<MessageDetailItem[]> => {
  const rep: {
    items: MessageDetailItem[]
  } = await createInstance(true).post('/chats/messages/detail', param);
  return rep.items;
};

// 撤回消息
const pullBack = async (param: BaseIdsArrayReq) => await createInstance(true).post('/chats/messages/delete-batch', param);

//（单向）删除消息-按消息Id
const deleteSelfMsg = async (param: BaseIdsArrayReq) => await createInstance(true).post('/chats/messages/delete-self-all', param);

//（双向）删除所有消息-根据会话IDs
const deleteChatByIds = async (param: MessageDeleteByIdReq) => await createInstance(true).post('/chats/messages/delete-chat-ids', param);

// （单向）删除所有消息-根据会话IDs 解除自己与会话消息的关系
const deleteSelfChatByIds = async (param: MessageDeleteByIdReq) => await createInstance(true).post('/chats/messages/delete-self-chat-ids', param);

// 撤回消息 根据会话IDs 所有发送者的消息物理删除
const pullBackByChatIds = async (param: MessageDeleteByIdReq) => await createInstance(true).post('/chats/messages/revoke-chat-ids', param);

// 清空所有端消息 物理删除 (不可恢复,只有拥有管理员权限的用户才能调用)
const clearGroupMessageByChatIds = async (param: MessageDeleteByIdReq) => await createInstance(true).post('/chats/messages/clear-chat-ids', param);

/**
 * 清除我的消息，其他人的消息不受影響
 */
const clearMineMessage = async (param: MessageDeleteByIdReq) => await createInstance(true).post('/chats/messages/clear-mine-message', param);

/**
 * 清除我的所有消息，其他人的消息不受影響
 */
const clearMineMessageAll = async () => await createInstance(true).post('/chats/messages/clear-mine-message-all');

export default {
  sendMessage,
  getMessageList,
  getMessageListIds,
  findByIds,
  pullBack,
  deleteSelfMsg,
  deleteChatByIds,
  deleteSelfChatByIds,
  pullBackByChatIds,
  clearMineMessage,
  clearMineMessageAll,
  clearGroupMessageByChatIds
}