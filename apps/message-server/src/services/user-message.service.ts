import { Prisma, UserMessage } from '@prisma/db-message'
import { prisma } from '../lib/database'
import { BasicPrismaContext } from './base-prisma.service'
import { IModel } from '@repo/enums'
export class UserMessageService extends BasicPrismaContext {
  async createMany(
    data: Prisma.UserMessageCreateInput[]
  ): Promise<void> {
    await prisma.userMessage.createMany({ data })
  }

  /**
   * 根据chatId & memberId 清除部分消息
   * @param currentUserId
   * @param chatIds
   */
  async clearMemberMessageByChatIds(
    memberIds: bigint[],
    chatIds: string[]
  ): Promise<void> {
    if (chatIds.length <= 0 || memberIds.length <= 0) {
      return
    }
    await prisma.userMessage.deleteMany({
      where: {
        chatId: { in: chatIds },
        uid: { in: memberIds }
      }
    })
  }

  async deleteByChatIdIn(chatIds: string[]): Promise<void> {
    await prisma.userMessage.deleteMany({
      where: {
        chatId: { in: chatIds }
      }
    })
  }

  async deleteByMsgIdIn(msgIds: string[]): Promise<Prisma.BatchPayload> {
    const result = await prisma.userMessage.deleteMany({
      where: {
        msgId: { in: msgIds }
      }
    })
    return result
  }

  async deleteByUserIdAndChatIdIn(userId: bigint, chatIds: string[]): Promise<void> {
    await prisma.userMessage.deleteMany({
      where: {
        chatId: { in: chatIds },
        uid: userId,
      }
    })
  }

  async deleteByUserIdIn(userIds: bigint[]): Promise<void> {
    await prisma.userMessage.deleteMany({
      where: {
        uid: { in: userIds },
      }
    })
  }

  // （单向）删除消息-按消息Id
  async deleteSelfMsg(currentUserId: bigint, msgIds: string[]): Promise<any> {
    await prisma.userMessage.deleteMany({
      where: {
        uid: currentUserId,
        msgId: { in: msgIds },
      },
    })
  }

  async firstSequenceByChatIdInGroupBy(
    userId: bigint,
    chatIds: string[]
  ): Promise<Map<string, number>> {
    const firstSequences = await prisma.userMessage.groupBy({
      where: {
        chatId: { in: chatIds },
        uid: userId,
      },
      by: ['chatId'],
      _min: {
        sequence: true,
      },
    })
    const firstSequenceHash = new Map<string, number>()
    firstSequences.forEach((f) => {
      firstSequenceHash.set(f.chatId, f._min.sequence ?? 1)
    })
    return firstSequenceHash
  }

  async findMany(
    param: Prisma.UserMessageFindManyArgs
  ): Promise<UserMessage[]> {
    const userMessages = await prisma.userMessage.findMany(param)
    return userMessages
  }

  async readMany(ids: string[]): Promise<void> {
    await prisma.userMessage.updateMany({
      where: {
        id: { in: ids },
        isRead: IModel.ICommon.ICommonBoolEnum.NO,
      },
      data: {
        isRead: IModel.ICommon.ICommonBoolEnum.YES,
      }
    })
  }


}
