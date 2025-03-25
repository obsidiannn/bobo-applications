import { ChatUser, Prisma } from '@prisma/db-message'
import { IModel } from '@repo/enums'
import { arrayDifference, generateRef } from '@repo/server/utils'
import { BasicPrismaContext } from './base-prisma.service'
import { ChatEntity, ChatUserItem } from '@/types/chat'
import { prisma } from '@/lib/database'

import { ChatConfigItem } from '@repo/types'

export class ChatMemberService extends BasicPrismaContext {

  /**
   * 获取用户chat配置
   * @param chatIds 
   * @param userId 
   * @returns 
   */
  async findConfigByChatIdIn(chatIds: string[], userId: bigint): Promise<Map<string, ChatConfigItem>> {
    const chatUsers = await super.getClient().chatUser.findMany({
      where: {
        chatId: { in: chatIds },
        userId
      },
      select: {
        chatId: true,
        isTop: true,
        isMute: true
      }
    })
    const result = new Map<string, ChatConfigItem>()
    chatUsers.forEach(e => {
      result.set(e.chatId, {
        isTop: e.isTop,
        isMute: e.isMute
      })
    })
    return result
  }

  /**
   * 获取属于此会话的userId
   * @param chatId
   * @returns
   */
  async findByChatId(chatId: string): Promise<ChatUser[]> {
    const chatUsers = await super.getClient().chatUser.findMany({
      where: { chatId },
    })
    return chatUsers
  }

  async findUidByChatId(chatId: string): Promise<bigint[]> {
    const chatUsers = await super.getClient().chatUser.findMany({
      where: { chatId },
      select: {
        userId: true
      }
    })
    return chatUsers.map(u => u.userId)
  }


  async findChatIdByHashKey(hashKey: string, userId: bigint): Promise<string | null> {
    const chatUsers = await prisma.chatUser.findMany({
      where: {
        hashKey,
        userId
      },
      select: {
        chatId: true
      }
    })
    if (chatUsers.length > 0 && chatUsers[0]) {
      return chatUsers[0].chatId
    }
    return null
  }


  async findChatIdByUserIdIn(userIds: bigint[]): Promise<string[]> {
    const chatUsers = await prisma.chatUser.findMany({
      where: {
        userId: { in: userIds }
      },
      select: {
        chatId: true
      }
    })
    return chatUsers.map(u => u.chatId)
  }

  async findChatIdByUidAndChatIdIn(
    chatIds: string[],
    uid: bigint
  ): Promise<string[]> {
    const data = await super.getClient().chatUser.findMany({
      where: {
        chatId: { in: chatIds },
        userId: uid
      }
    })
    return data.map((c: ChatUser) => c.chatId)
  }


  async findChatIdByUid(userId: bigint): Promise<string[]> {
    const where: Prisma.ChatUserWhereInput = {
      sourceFrom: IModel.IChat.IChatUserSourceFrom.USER,
      userId,
      isShow: IModel.ICommon.ICommonBoolEnum.YES
    }
    const data = await super.getClient().chatUser.findMany({
      where,
      orderBy: [{ isTop: 'desc' }, { sortNo: 'desc' }, { createdAt: 'desc' }],
      select: {
        chatId: true
      }
    })
    return data.map(e => e.chatId)
  }

  async findChatIdsAfter(userId: bigint, lastTime?: number): Promise<string[]> {
    if (lastTime) {
      console.log('query date = ', new Date(lastTime * 1000));
    }

    const chatUsers = await super.getClient().chatUser.findMany({
      where: {
        sourceFrom: IModel.IChat.IChatUserSourceFrom.USER,
        isShow: IModel.ICommon.ICommonBoolEnum.YES,
        userId,
        ...(lastTime ? {
          createdAt: { gte: new Date(lastTime * 1000) }
        } : {}),
      },
    })
    return chatUsers.map(u => u.chatId)
  }


  async findChatMemberByUid(userId: bigint, chatId?: string): Promise<ChatUser[]> {
    const where: Prisma.ChatUserWhereInput = {
      sourceFrom: IModel.IChat.IChatUserSourceFrom.USER,
      userId
    }
    if (chatId !== undefined) {
      where.chatId = chatId
    }
    const data = await super.getClient().chatUser.findMany({
      where,
      orderBy: [{ isTop: 'desc' }, { businessType: 'desc' }, { createdAt: 'desc' }]
    })
    return data
  }

  async findChatMemberByUidAndChatIdIn(
    userId: bigint,
    chatIds: string[]
  ): Promise<ChatUser[]> {
    const data = await super.getClient().chatUser.findMany({
      where: {
        sourceFrom: IModel.IChat.IChatUserSourceFrom.USER,
        userId,
        chatId: { in: chatIds },
      },
      orderBy: [{ isTop: 'desc' }, { createdAt: 'desc' }],
    })
    return data
  }

  /**
   * 群组移除某个人会话
   * @param groupId
   * @param memberIds
   * @returns 相关的chatId 用来删除message
   */
  async removeChatMemberByIds(
    chatIds: string[],
    memberIds: bigint[]
  ): Promise<void> {
    if (chatIds !== null && chatIds.length > 0) {
      await super.getClient().chatUser.deleteMany({
        where: {
          chatId: { in: chatIds },
          userId: { in: memberIds },
          sourceFrom: IModel.IChat.IChatUserSourceFrom.USER,
        },
      })
    }
  }

  async deleteByChatIdIn(chatIds: string[]): Promise<Prisma.BatchPayload> {
    const data = await super.getClient().chatUser.deleteMany({
      where: { chatId: { in: chatIds } },
    })
    return data
  }

  /**
   * 群组移除某个人会话
   * @param groupId
   * @param memberIds
   * @returns 相关的chatId 用来删除message
   */
  async removeByChatIdIn(chatIds: string[], memberIds: bigint[]): Promise<void> {
    if (chatIds.length > 0 && memberIds.length > 0) {
      await super.getClient().chatUser.deleteMany({
        where: {
          chatId: { in: chatIds },
          userId: { in: memberIds },
        },
      })
    }
  }

  async removeMemberByChatIdIn(chatIds: string[]): Promise<void> {
    await super.getClient().chatUser.deleteMany({
      where: {
        chatId: { in: chatIds },
      },
    })
  }

  /**
   * 增加单个 group chat user
   * @param groupId
   * @param memberId
   * @param currentUserId
   */
  async addChatMember(
    chatId: string,
    memberIds: bigint[],
    businessType: number,
    hashKey?: string
  ): Promise<void> {
    const chatUsers = await super.getClient().chatUser.findMany({
      where: {
        chatId,
        userId: { in: memberIds },
        sourceFrom: IModel.IChat.IChatUserSourceFrom.USER,
      },
      select: {
        userId: true,
      },
    })
    const saveMemberIds = arrayDifference(
      memberIds,
      chatUsers.map((u) => u.userId)
    )
    console.log('saveMembers', saveMemberIds)
    const sortNo = businessType === IModel.IChat.IChatTypeEnum.OFFICIAL ? 100 : 1
    if (saveMemberIds.length > 0) {
      const saveMembers = saveMemberIds.map((uid) => {
        const chatUserInput: Prisma.ChatUserCreateInput = {
          userId: uid,
          chatId,
          isTop: businessType === IModel.IChat.IChatTypeEnum.OFFICIAL ? IModel.ICommon.ICommonBoolEnum.YES : IModel.ICommon.ICommonBoolEnum.NO,
          isMute: IModel.ICommon.ICommonBoolEnum.NO,
          isShow: IModel.ICommon.ICommonBoolEnum.YES,
          isHide: IModel.ICommon.ICommonBoolEnum.NO,
          sortNo,
          maxReadSeq: 1,
          businessType,
          lastOnlineTime: new Date(),
          hashKey: hashKey ?? '0',
          sourceFrom: IModel.IChat.IChatUserSourceFrom.USER,
        }
        return chatUserInput
      })
      await super.getClient().chatUser.createMany({ data: saveMembers })
    }
  }

  /**
   * 删除会话
   * @param currentUserId
   * @param param
   * @param hide true: 隐藏，false： 展开
   */
  async userChatHide(userId: bigint, chatIds: string[], hide: boolean): Promise<void> {
    await super.getClient().chatUser.updateMany({
      where: {
        chatId: { in: chatIds },
        userId,
      },
      data: {
        isShow: hide ? IModel.ICommon.ICommonBoolEnum.NO : IModel.ICommon.ICommonBoolEnum.YES,
        isHide: hide ? IModel.ICommon.ICommonBoolEnum.YES : IModel.ICommon.ICommonBoolEnum.NO,
      },
    })
  }

  /**
   * 置顶会话
   * @param chatId
   * @param currentUserId
   * @param isTop true 置顶，false 非置顶
   */
  async raiseTop(
    chatId: string,
    userId: bigint,
    isTop: boolean
  ): Promise<number> {
    const data = await super.getClient().chatUser.findFirst({
      where: {
        chatId,
        userId
      }
    })
    if (!data) {
      throw new Error("bad chat data")
    }
    const result = await super.getClient().chatUser.update({
      where: {
        id: data.id,
        userId
      },
      data: {
        isTop: isTop ? IModel.ICommon.ICommonBoolEnum.YES : IModel.ICommon.ICommonBoolEnum.NO,
      },
      select: {
        isTop: true,
      },
    })
    if (result === null) {
      return IModel.ICommon.ICommonBoolEnum.NO
    }
    return result.isTop
  }


  /**
   * @param chatId
   * @param currentUserId
   * @param isTop true 置顶，false 非置顶
   */
  async change(
    chatId: string,
    userId: bigint,
    field: string,
    value: number,
  ): Promise<ChatUser | null> {
    const data = await super.getClient().chatUser.findFirst({
      where: {
        chatId,
        userId
      }
    })
    if (!data) {
      throw new Error("bad chat data")
    }
    const _d = {}
    _d[field] = value
    console.log('change config', _d);

    const result = await super.getClient().chatUser.update({
      where: {
        id: data.id,
        userId
      },
      data: {
        ..._d,
        createdAt: new Date()
      },
    })

    return result
  }


  /**
   * 置顶会话
   * @param chatId
   * @param currentUserId
   * @param isTop true 置顶，false 非置顶
   */
  async changeMute(
    chatId: string,
    userId: bigint,
    isMute: boolean
  ): Promise<number> {
    const data = await super.getClient().chatUser.findFirst({
      where: {
        chatId,
        userId
      }
    })
    if (!data) {
      throw new Error("bad chat data")
    }
    const result = await super.getClient().chatUser.update({
      where: {
        id: data.id,
        userId
      },
      data: {
        isMute: isMute ? IModel.ICommon.ICommonBoolEnum.YES : IModel.ICommon.ICommonBoolEnum.NO,
      },
      select: {
        isMute: true,
      },
    })
    if (result === null) {
      return IModel.ICommon.ICommonBoolEnum.NO
    }
    return result.isMute
  }


  /**
   * 更新最大 read sequence
   * @param currentUserId
   * @param chatId
   * @param maxSequence
   */
  async refreshSequence(
    currentUserId: bigint,
    chatId: string,
    maxSequence: number
  ): Promise<void> {
    await super.getClient().chatUser.updateMany({
      where: {
        userId: currentUserId,
        chatId,
        maxReadSeq: {
          lt: maxSequence
        }
      },
      data: {
        maxReadSeq: maxSequence
      }
    })
  }

  /**
   * 找到指定user的sys chat user
   * @param userIds
   * @returns
   */
  async findChatUserByOfficialUser(
    userIds: bigint[],
    officialUserId: bigint
  ): Promise<ChatUser[]> {
    const refIdxs = userIds.map((u) => {
      return generateRef([u, officialUserId])
    })
    const chatUsers = await super.getClient().chatUser.findMany({
      where: {
        userId: { in: userIds },
        businessType: IModel.IChat.IChatTypeEnum.OFFICIAL,
        sourceFrom: IModel.IChat.IChatUserSourceFrom.USER,
        hashKey: { in: refIdxs },
      },
    })
    return chatUsers
  }

  /**
   * 寻找官方会话 （系统消息）
   * @param userIds
   * @returns
   */
  async findOfficialChatByUserIdIn(
    userIds: bigint[]
  ): Promise<ChatUserItem[]> {
    const chatUsers = await super.getClient().chatUser.findMany({
      where: {
        userId: { in: userIds },
        businessType: IModel.IChat.IChatTypeEnum.OFFICIAL,
        sourceFrom: IModel.IChat.IChatUserSourceFrom.USER
      },
      select: {
        chatId: true,
        userId: true
      }
    })
    return chatUsers.map(c => {
      return {
        chatId: c.chatId,
        userId: c.userId
      }
    })
  }

  /**
   * 更新chat user sequence 到最大
   * @param chatId
   * @param userId
   * @param sequence
   */
  async refreshSequenceToTop(chatUsers: ChatUser[], chatMap: Map<string, ChatEntity>): Promise<void> {
    for (let index = 0; index < chatUsers.length; index++) {
      const cu = chatUsers[index];
      if (!cu) {
        continue
      }
      const chat = chatMap.get(cu.chatId)
      if (chat !== null) {
        await super.getClient().chatUser.update({
          where: {
            id: cu.id
          },
          data: {
            maxReadSeq: chat?.lastSequence
          }
        })
      }
    }
  }
}
