import { MessageDetail, Prisma, ChatUser } from '@prisma/db-message'
import { IModel } from '@repo/enums'
import { BasicPrismaContext } from './base-prisma.service'
import { MessageDetailEntity } from '@/types/chat'
import cacheUtil from '@/lib/cache'
import { getNotifyClient } from '@/api/notify'
import JsonBigInt from 'json-bigint'
import { protos } from '@repo/grpc/proto'
import { getRedis } from './redis'
 

export class MessageService extends BasicPrismaContext {
  async create(data: Prisma.MessageDetailCreateInput): Promise<MessageDetail> {
    const e = await super.getClient().messageDetail.create({ data })
    return e
  }

  async createMany(
    data: Prisma.MessageDetailCreateInput
  ): Promise<MessageDetail> {
    const e = await super.getClient().messageDetail.create({ data })
    return e
  }

  async findMany(
    param: Prisma.MessageDetailFindManyArgs
  ): Promise<MessageDetail[]> {
    const data = await super.getClient().messageDetail.findMany(param)
    return data
  }

  /**
   * 根据chatId 全部清除消息
   * @param currentUserId
   * @param chatIds
   */
  async deleteByChatIdIn(chatIds: string[]): Promise<void> {
    if (chatIds.length <= 0) {
      return
    }

    await super.getClient().messageDetail.deleteMany({
      where: {
        chatId: { in: chatIds }
      }
    })
  }

  async deleteChatByIds(
    currentUserId: bigint,
    chatIds: string[]
  ): Promise<void> {
    await super.getClient().userMessage.deleteMany({
      where: {
        chatId: { in: chatIds },
        uid: currentUserId,
      },
    })
  }

  // 寻找chat下最大的message sequence
  async findMaxSequenceByChatId(chatId: string): Promise<number> {
    let sequence = 1
    const res = await super.getClient().messageDetail.findFirst({
      where: {
        chatId
      },
      select: { sequence: true },
      orderBy: { sequence: 'desc' },
    })
    if (res !== null && res.sequence > 0) {
      sequence = res.sequence + 1
    }
    return sequence
  }

  /**
   * message max sequence  group by chatID
   * @param chatIds
   * @returns
   */
  async findMaxSequenceByChatIds(
    chatIds: string[]
  ): Promise<Map<string, number>> {
    const result: Map<string, number> = new Map()
    const groupBy = await super.getClient().messageDetail.groupBy({
      where: {
        chatId: { in: chatIds }
      },
      by: ['chatId'],
      _max: {
        sequence: true
      }
    })
    groupBy.forEach((item: any) => {
      result.set(item.chatId, (item._max.sequence ?? 0) + 1)
    })
    return result
  }

  async findAllByIdIn(ids: string[]): Promise<MessageDetailEntity[]> {
    const mids: string[] = []
    const result: MessageDetailEntity[] = []
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      if (id) {
        const g = await this.getCache(id)
        if (g === null) {
          mids.push(id)
        } else {
          result.push(g)
        }
      }
    }

    if (mids.length > 0) {
      const data = await super.getClient().messageDetail.findMany({
        where: {
          id: { in: ids }
        }
      })
      data.forEach((g: MessageDetail) => {
        const item: MessageDetailEntity = g as MessageDetailEntity
        void this.setCache(item.id, item)
        result.push(item)
      })
    }
    return result
  }

  async pushMessage(
    message: MessageDetail,
    receiveIds: bigint[],
    chatType: IModel.IChat.IChatTypeEnum
  ): Promise<void> {
    // const socketData = {
    //   chatId: message.chatId,
    //   msgId: message.id,
    //   sequence: message.sequence,
    //   date: message.createdAt,
    //   type: 1,
    //   sender: Number(message.fromUid)
    // }

    const metadata = {
      chatType: chatType
    }

    const socketData: protos.notify.SocketEventRequest = {
      type: protos.notify.SocketEventTypeEnum.CHAT,
      channel: message.chatId,
      sequence: message.sequence,
      senderId: message.fromUid,
      dateMills: BigInt(message.createdAt.valueOf()),
      metadata: JsonBigInt.stringify(metadata),
      recieverIds: receiveIds
    }
    // 发送失败的，需要进行推送
    await getNotifyClient().sendSocket(socketData)
  }

  async pushOfficialMessage(
    message: MessageDetail,
    receiveIds: number[],
    chatType: IModel.IChat.IChatTypeEnum
  ): Promise<void> {
    let date = new Date()
    if (message.createdAt !== undefined && message.createdAt !== null) {
      if (typeof message.createdAt === 'string') {
        date = new Date(message.createdAt)
      } else {
        date = message.createdAt
      }
    }
    // const socketData: SocketMessageEvent = {
    //   chatId: message.chatId,
    //   msgId: message.id,
    //   sequence: message.sequence,
    //   date,
    //   type: 1,
    //   sender: Number(message.fromUid)
    // }
    const metadata = {
      chatType: chatType
    }

    const socketData: protos.notify.SocketEventRequest = {
      type: protos.notify.SocketEventTypeEnum.CHAT,
      channel: message.chatId,
      sequence: message.sequence,
      senderId: message.fromUid,
      dateMills: BigInt(message.createdAt.valueOf()),
      metadata: JsonBigInt.stringify(metadata),
      recieverIds: receiveIds.map(BigInt)
    }
    // 发送失败的，需要进行推送
    await getNotifyClient().sendSocket(socketData)
  }

  async deleteByIdIn(ids: string[]): Promise<void> {
    await super.getClient().messageDetail.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })
  }

  async sendOfficialMessage(
    chatId: string,
    currentUserId: bigint,
    chatUsers: ChatUser[],
    content: string,
    msgId: string
  ): Promise<MessageDetail> {
    const sequence = await this.findMaxSequenceByChatId(chatId)

    const userIds = chatUsers.map(c => c.userId)
    const messageInput: Prisma.MessageDetailCreateInput = {
      id: msgId,
      chatId,
      content,
      type: IModel.IChat.IMessageTypeEnum.OFFICIAL_MESSAGE,
      isEnc: 0,
      fromUid: currentUserId,
      action: '',
      status: IModel.IChat.IMessageStatusEnum.NORMAL,
      sequence,
      receiveIds: userIds.join(','),
      fromUidType: IModel.IChat.MessageUserType.OFFICIAL
    }
    const message = await super.getClient().messageDetail.create({
      data: messageInput
    })

    const userMessages = chatUsers.map(u => {
      const userMsg: Prisma.UserMessageCreateInput = {
        uid: u.userId,
        msgId: message.id,
        isRead: IModel.ICommon.ICommonBoolEnum.NO,
        sequence,
        chatId: u.chatId
      }
      return userMsg
    })

    await super.getClient().userMessage.createMany({ data: userMessages })
    return message
  }

  async getCache(id: string): Promise<MessageDetailEntity | null> {
    const key = cacheUtil.messageCacheKey(id)
    const val = await getRedis().getVal(key)
    if (val !== undefined && val !== null) {
      return JsonBigInt.parse(val) as MessageDetailEntity
    }
    return null
  }

  async setCache(id: string, val: MessageDetailEntity): Promise<void> {
    const key = cacheUtil.messageCacheKey(id)
    void getRedis().setex(key, JsonBigInt.stringify(val), 60)
  }

  async clearCache(id: string): Promise<void> {
    const key = cacheUtil.messageCacheKey(id)
    void getRedis().delVal(key)
  }
}
