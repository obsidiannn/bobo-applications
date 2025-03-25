import { Chat, Prisma } from '@prisma/db-message'
import { IModel } from '@repo/enums'
import { arrayDifference, generateRef } from '@repo/server/utils'
import { BasicPrismaContext } from './base-prisma.service'
import { ChatEntity } from '@/types/chat'
import cacheUtil from '@/lib/cache'
import { getRedis } from './redis'
import JsonBigInt from 'json-bigint'
export class ChatService extends BasicPrismaContext {

  async getCache(id: string): Promise<ChatEntity | null> {
    const key = cacheUtil.chatCacheKey(id)

    const val = await getRedis().getVal(key)
    if (val !== null && val !== undefined) {
      return JsonBigInt.parse(val) as ChatEntity
    }
    return null
  }

  async setCache(id: string, val: ChatEntity): Promise<void> {
    const key = cacheUtil.chatCacheKey(id)
    void getRedis().setex(key, JsonBigInt.stringify(val), 60)
  }

  async clearCache(id: string): Promise<void> {
    const key = cacheUtil.chatCacheKey(id)
    void getRedis().delVal(key)
  }

  async findMany(param: Prisma.ChatFindManyArgs): Promise<Chat[]> {
    const chats = await super.getClient().chat.findMany(param)
    return chats
  }

  async createChat(businessId: bigint, businessType: number, userIds: bigint[]): Promise<Chat> {
    const userArray: bigint[] = []
    let userRef: string | undefined = undefined
    if (businessType === IModel.IChat.IChatTypeEnum.NORMAL) {
      userArray.push(...userIds.sort((a, b) => a > b ? 1 : 0))
      userRef = generateRef(userArray)
    }
    console.log('userRef = ', userRef);
    if (businessType !== IModel.IChat.IChatTypeEnum.GROUP) {
      const data = await super.getClient().chatUser.findMany({
        where: {
          hashKey: userRef,
          businessType: businessType
        },
        select: {
          chatId: true
        }
      })
      if (data && data.length > 0) {
        const existChat = await super.getClient().chat.findFirst({
          where: {
            id: data[0]?.chatId
          }
        })
        if (existChat) {
          return existChat
        }
      }
    }

    const chat: Prisma.ChatCreateInput = {
      businessType: businessType,
      businessId: businessId,
      creatorUId: businessId,
      status: 1,
      lastReadSequence: 0,
      lastSequence: 0,
      userIds: userArray.join(','),
    }
    const chatData = await super.getClient().chat.create({ data: chat })
    const sortNo = businessType === IModel.IChat.IChatTypeEnum.OFFICIAL ? 100 : 1
    const chatUsers = userIds.map(id => {
      return {
        userId: id,
        chatId: chatData.id,
        isTop: businessType === IModel.IChat.IChatTypeEnum.OFFICIAL ? IModel.ICommon.ICommonBoolEnum.YES : IModel.ICommon.ICommonBoolEnum.NO,
        isMute: 0,
        isShow: 1,
        isHide: 0,
        sortNo: sortNo,
        maxReadSeq: 0,
        businessType: businessType,
        lastOnlineTime: new Date(),
        hashKey: userRef ?? '',
        sourceFrom: IModel.IChat.IChatUserSourceFrom.USER,
      } as Prisma.ChatUserCreateInput
    })
    console.log('chatUser=', chatUsers);

    await super.getClient().chatUser.createMany({
      data: chatUsers,
    })
    return chatData;
  }

  /**
   * 这个函数只适用于 单聊增加chat 成员
   * @param currentUserId
   * @param objUserId
   * @param hashKey
   * @returns
   */
  async addSimpleChat(
    currentUserId: bigint,
    objUserId: bigint,
    hashKey: string
  ): Promise<string> {
    const userArray: bigint[] = [currentUserId, objUserId]
    userArray.sort((a, b) => a > b ? 1 : 0)
    const hasChat = await super.getClient().chat.findFirst({
      where: {
        businessType: IModel.IChat.IChatTypeEnum.NORMAL,
        userIds: userArray.join(','),
      },
      select: { id: true },
    })
    if (hasChat !== null) {
      console.log('有重复', hasChat.id)

      return hasChat.id
    }
    const input: Prisma.ChatCreateInput = {
      businessType: IModel.IChat.IChatTypeEnum.NORMAL,
      status: IModel.IChat.IChatStatusEnum.ENABLE,
      isEnc: IModel.ICommon.ICommonBoolEnum.YES,
      creatorUId: currentUserId,
      lastReadSequence: 0,
      lastSequence: 0,
      userIds: userArray.join(','),
    }
    const chat = await super.getClient().chat.create({ data: input })
    return chat.id
  }

  async findChatByIdIn(chatIds: string[]): Promise<ChatEntity[]> {
    const ids: string[] = []
    const result: ChatEntity[] = []
    console.log('test');

    for (let i = 0; i < chatIds.length; i++) {
      const id = chatIds[i]
      const g = await this.getCache(id ?? '')
      if (g === null) {
        ids.push(id ?? '')
      } else {
        result.push(g)
      }
    }

    if (ids.length > 0) {
      const chats = await super.getClient().chat.findMany({
        where: { id: { in: ids } }
      })
      console.log('[chat]db query')

      chats.forEach((g: Chat) => {
        const item: ChatEntity = g as ChatEntity
        void this.setCache(item.id, item)
        result.push(item)
      })
    }
    return result
  }

  async findBusinessTypeById(
    id: string
  ): Promise<number | null> {
    const businessType = await super.getClient().chat.findFirst({
      where: {
        id: id,
      },
      select: {
        businessType: true
      }
    })
    return businessType?.businessType ?? null
  }


  async findChatByBusinessId(
    businessId: bigint,
    businessType: IModel.IChat.IChatTypeEnum
  ): Promise<Chat | null> {
    const chat = await super.getClient().chat.findFirst({
      where: { businessId, businessType },
    })
    return chat
  }

  async findChatByBusinessIdIn(
    groupIds: bigint[],
    businessType: IModel.IChat.IChatTypeEnum
  ): Promise<string[]> {
    const data = await super.getClient().chat.findMany({
      where: {
        businessId: { in: groupIds },
        businessType,
      },
      select: { id: true },
    })
    return data.map((d: any) => d.id)
  }

  /**
   * 全部删除 chat & chatUser
   * 调用前务必校验group 权限
   * @param groupIds
   * @returns chatIds
   */
  async dropChatByBusinessIdIn(
    businessIds: number[],
    businessType: IModel.IChat.IChatTypeEnum
  ): Promise<string[]> {
    const chats = await super.getClient().chat.findMany({
      where: {
        businessId: { in: businessIds },
        businessType,
      },
      select: { id: true },
    })
    if (chats.length > 0) {
      const chatIds = chats.map((i: any) => i.id)
      await super.getClient().chat.deleteMany({
        where: {
          id: { in: chatIds },
        },
      })

      return chatIds
    }
    return []
  }

  /**
  * 全部删除 chat & chatUser
  * @param groupIds
  * @returns chatIds
  */
  async dropChatByChatIds(
    chatIds: string[],
    businessType: IModel.IChat.IChatTypeEnum
  ): Promise<string[]> {
    const chats = await super.getClient().chat.findMany({
      where: {
        id: { in: chatIds },
        businessType
      },
      select: { id: true }
    })
    if (chats.length > 0) {
      const chatIds: string[] = chats.map((i: any) => i.id)
      await super.getClient().chat.deleteMany({
        where: {
          id: { in: chatIds }
        }
      })
      chatIds.forEach(c => {
        void this.clearCache(c)
      })
      return chatIds
    }
    return []
  }

  /**
 * 全部删除 chat & chatUser
 * @param groupIds
 * @returns chatIds
 */
  async dropChatByChatIdIn(
    chatIds: string[],
  ): Promise<string[]> {
    const chats = await super.getClient().chat.findMany({
      where: {
        id: { in: chatIds },
      },
      select: { id: true }
    })
    if (chats.length > 0) {
      const chatIds: string[] = chats.map((i: any) => i.id)
      await super.getClient().chat.deleteMany({
        where: {
          id: { in: chatIds }
        }
      })
      chatIds.forEach(c => {
        void this.clearCache(c)
      })
      return chatIds
    }
    return []
  }

  async increaseSequence(chatId: string, sequence: number): Promise<number> {
    const result = await super.getClient().chat.update({
      where: {
        id: chatId,
      },
      data: {
        lastSequence: sequence,
        updatedAt: new Date(),
        lastTime: new Date()
      },
      select: {
        id: true,
        lastSequence: true,
        businessType: true,
      },
    })
    void this.clearCache(chatId)
    return result.businessType
  }


  async chatRecycle(chatIds: string[]): Promise<string[]> {
    const chatuser = await super.getClient().chatUser.findMany({
      where: {
        chatId: { in: chatIds }
      },
      select: {
        chatId: true
      },
    })
    const dbChatIds = chatuser.map(u => u.chatId)
    const removeChatIds = arrayDifference(chatIds, dbChatIds)
    if (removeChatIds && removeChatIds.length > 0) {
      await this.dropChatByChatIdIn(removeChatIds)
    }
    return removeChatIds
  }

}
