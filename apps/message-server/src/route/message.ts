// 发送消息 f
// 根据会话获取最新的消息id
// 根据会话获取以前的消息id
// 批量获取最新的
// 单向删除多条我的消息
// 双向删除多条我的消息
// 根据会话id列表单向清空我的消息
// 根据会话id列表双向清空我的消息
// 根据会话批量清空消息 (仅支持服务器远程调用 由群管理远程调用)

import { Prisma } from '@prisma/db-message'
import { IModel } from '@repo/enums'

import { ChatMemberService } from '../services/chat-member'
import { ChatService } from '../services/chat.service'
import { MessageService } from '../services/message.service'
import { UserMessageService } from '../services/user-message.service'
import { MessageExtra, RequestContext } from '@/types/common'
import { prisma } from '@/lib/database'
import { ChatEntity, MessageDetailEntity, MessageDetailItem, MessageListItem } from '@/types/chat'
import { z } from 'zod'
import { Hono } from 'hono'
import { protos } from '@repo/grpc/proto'
import { authMiddleware } from '@/lib/middlewares'
import { zValidator } from '@hono/zod-validator'
import { HTTPException } from "hono/http-exception";
import JsonBigInt from 'json-bigint'

const route = new Hono<{ Variables: { user: protos.user.User } }>();


/**
 * 发送消息
 * @param currentUserId
 */
route.post(
  '/messages/send',
  authMiddleware,
  zValidator(
    "json",
    z.object({
      id: z.string(),
      chatId: z.string(),
      content: z.string(),
      type: z.number(),
      isEnc: z.number(),
      receiveIds: z.optional(z.array(z.bigint())),
      extra: z.optional(z.object({
        replyId: z.optional(z.string()),
        replyAuthorName: z.optional(z.string()),
      }))
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid",
        })
      }
    }
  ),
  async (c) => {
    const currentUser = c.get('user')
    const param = c.req.valid("json");
    const data = await prisma.$transaction(async (tx) => {
      const chatMemberService = new ChatMemberService(tx)
      const messageService = new MessageService(tx)
      const userMessageService = new UserMessageService(tx)
      const chatService = new ChatService(tx)
      console.log('extra=', param.extra);

      const sequence = await messageService.findMaxSequenceByChatId(param.chatId)
      const messageInput: Prisma.MessageDetailCreateInput = {
        id: param.id,
        chatId: param.chatId,
        content: param.content,
        type: param.type,
        isEnc: param.isEnc,
        fromUid: currentUser.id,
        fromUidType: IModel.IChat.MessageUserType.DEFAULT,
        extra: JsonBigInt.stringify(param.extra),
        action: '',
        createdAt: new Date(),
        sequence,
        status: IModel.IChat.IMessageStatusEnum.NORMAL,
      }
      const message = await messageService.create(messageInput)

      // chat 增加 sequence
      const chatType = await chatService.increaseSequence(param.chatId, sequence)
      const receiveIds = new Set<bigint>()
      // 如果指定receiveId 则
      if (param.receiveIds === undefined || param.receiveIds === null) {
        const chatUsers = await chatMemberService.findUidByChatId(param.chatId)
        chatUsers.forEach((c) => receiveIds.add(c))
      } else {
        param.receiveIds.forEach((u) => {
          receiveIds.add(u)
        })
      }
      receiveIds.add(currentUser.id)

      const userMsgs = Array.from(receiveIds).map((u) => {
        const userMsg: Prisma.UserMessageCreateInput = {
          uid: u,
          msgId: message.id,
          isRead: IModel.ICommon.ICommonBoolEnum.NO,
          sequence,
          chatId: param.chatId
        }
        return userMsg
      })
      await userMessageService.createMany(userMsgs)
      // await chatMemberService.userChatHide();
      // 更新sequence
      await chatMemberService.refreshSequence(
        currentUser.id,
        param.chatId,
        sequence
      )
      messageService
        .pushMessage(message, Array.from(receiveIds), chatType)
        .catch((e) => {
          console.error(e)
        })
      return {
        sequence,
        id: message.id,
        fromUid: currentUser.id,
        time: message.createdAt
      }
    })
    return c.json(data)
  }
)


/**
 * 我的消息列表
 */

route.post(
  '/messages/list',
  authMiddleware,
  zValidator(
    "json",
    z.object({
      chatId: z.string(),
      sequence: z.number(),
      direction: z.string(),
      limit: z.optional(z.number())
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid",
        })
      }
    }
  ),
  async (c) => {
    const param = c.req.valid("json");
    const currentUser = c.get('user')

    const chatMemberService = new ChatMemberService()
    const userMessageService = new UserMessageService()

    const up: boolean = param.direction === 'up'
    const sequence: any = {}
    if (up) {
      sequence.lte = param.sequence
    } else {
      sequence.gte = param.sequence
    }

    const userMessages = await userMessageService.findMany({
      where: {
        uid: currentUser.id,
        chatId: param.chatId,
        sequence
      },
      skip: 0,
      take: param.limit ?? 20,
      orderBy: {
        sequence: up ? 'desc' : 'asc'
      }
    })
    if (userMessages.length <= 0) {
      return c.json({ items: [] })
    }

    const data = userMessages.map((u) => {
      const item: MessageListItem = {
        id: u.id,
        msgId: u.msgId,
        isRead: u.isRead,
        sequence: u.sequence,
        createdAt: u.createdAt
      }
      return item
    }).sort((a, b) => {
      return b.sequence - a.sequence
    })
    if (data[0]) {
      const maxSequence = data[0].sequence
      // 更新sequence
      await chatMemberService.refreshSequence(
        currentUser.id,
        param.chatId,
        maxSequence
      )
    }

    return c.json({
      items: data
    })
  })


/**
 * 我的消息列表
 */

route.post(
  '/messages/list-ids',
  authMiddleware,
  zValidator(
    "json",
    z.object({
      chatId: z.string(),
      sequence: z.number(),
      direction: z.string(),
      limit: z.optional(z.number())
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid",
        })
      }
    }
  ),
  async (c) => {
    const param = c.req.valid("json");
    const currentUser = c.get('user')

    const chatMemberService = new ChatMemberService()
    const userMessageService = new UserMessageService()

    const up: boolean = param.direction === 'up'
    const sequence: any = {}
    if (up) {
      sequence.lte = param.sequence
    } else {
      sequence.gte = param.sequence
    }

    const userMessages = await userMessageService.findMany({
      where: {
        uid: currentUser.id,
        chatId: param.chatId,
        sequence
      },
      skip: 0,
      take: param.limit ?? 20,
      orderBy: {
        sequence: up ? 'desc' : 'asc'
      },
      select: {
        id: true,
        msgId: true,
        sequence: true
      }
    })
    if (userMessages.length <= 0) {
      return c.json({ items: [] })
    }
    const data = userMessages
      .sort((a, b) => {
        return b.sequence - a.sequence
      })

    if (data[0]) {
      const maxSequence = data[0].sequence
      // 更新sequence
      await chatMemberService.refreshSequence(
        currentUser.id,
        param.chatId,
        maxSequence
      )
    }

    return c.json({
      items: data.map((u) => {
        return u.msgId
      })
    })
  })


/**
 * 消息详情
 */
route.post(
  '/messages/detail',
  authMiddleware,
  zValidator(
    "json",
    z.object({
      chatId: z.string(),
      ids: z.array(z.string())
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid",
        })
      }
    }
  ),
  async (c) => {
    const param = c.req.valid("json");
    const currentUser = c.get('user')

    const messageService = new MessageService()
    const userMessageService = new UserMessageService()

    const userMessages = await userMessageService.findMany({
      where: {
        uid: currentUser.id,
        msgId: { in: param.ids },
        chatId: param.chatId
      },
      select: {
        id: true,
        msgId: true,
        sequence: true
      },
      orderBy: {
        sequence: 'asc'
      }
    })

    if (userMessages.length <= 0) {
      return c.json({ items: [] })
    }
    // cache
    const messages = await messageService.findAllByIdIn(
      userMessages.map((u) => u.msgId)
    )

    if (messages.length > 0) {
      const messageHash = new Map<string, MessageDetailEntity>()
      messages.forEach((m) => {
        messageHash.set(m.id, m)
      })

      // 已读 + 更新最大read sequence
      const data: MessageDetailItem[] = userMessages
        .filter((i) => messageHash.has(i.msgId))
        .map((u) => {
          const msg = messageHash.get(u.msgId)
          if (msg === null || msg === undefined) {
            throw new HTTPException(500, { message: 'error' })
          }
          const item: MessageDetailItem = {
            ...msg,
            status: msg.status ?? 0,
            isEnc: msg.isEnc ?? 0,
            extra: msg.extra as MessageExtra,
            action: msg.action
          }
          // 如果是撤回，则内容消失
          if (item.status === 2) {
            item.content = ''
          }
          return item
        })
      return c.json({ items: data })
    }
    return c.json({ items: [] })
  })



/**
 * 撤回消息 delete-batch
 */
route.post(
  '/messages/delete-batch',
  authMiddleware,
  zValidator(
    "json",
    z.object({
      ids: z.array(z.string())
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid",
        })
      }
    }
  ),
  async (c) => {
    const param = c.req.valid("json");
    const currentUser = c.get('user')

    await prisma.$transaction(async (tx) => {
      const messageService = new MessageService(tx)
      const userMessageService = new UserMessageService(tx)

      const messages = await messageService.findMany({
        where: {
          fromUid: currentUser.id,
          id: { in: param.ids }
        },
        select: { id: true }
      })
      if (messages.length > 0) {
        const msgIds = messages.map((m) => m.id)
        await messageService.deleteByIdIn(msgIds)
        await userMessageService.deleteByMsgIdIn(msgIds)
        msgIds.forEach(id => {
          void messageService.clearCache(id)
        })
      }
    })
    return c.json(null)
  })



/**
 * （单向）删除消息-按消息Id delete-self-all
 */
route.post(
  '/messages/delete-self-all',
  authMiddleware,
  zValidator(
    "json",
    z.object({
      ids: z.array(z.string())
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid",
        })
      }
    }
  ),
  async (c) => {
    const param = c.req.valid("json");
    const currentUser = c.get('user')

    await prisma.$transaction(async (tx) => {
      const userMessageService = new UserMessageService(tx)
      await userMessageService.deleteSelfMsg(currentUser.id, param.ids)
    })
    return c.json(null)
  })


/**
 * （双向）删除所有消息-根据会话IDs TODO: 这里的实现有点问题
 *  "/delete-chat-ids",
 */
route.post(
  '/messages/delete-chat-ids',
  authMiddleware,
  zValidator(
    "json",
    z.object({
      chatIds: z.array(z.string())
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid",
        })
      }
    }
  ),
  async (c) => {
    const param = c.req.valid("json");
    const currentUser = c.get('user')

    await prisma.$transaction(async (tx) => {
      const messageService = new MessageService(tx)
      await messageService.deleteChatByIds(currentUser.id, param.chatIds)
    })
    return c.json(null)
  }
);

/**
 *  清空我的消息 clear-mine-message
 */

route.post(
  '/messages/clear-mine-message',
  authMiddleware,
  zValidator(
    "json",
    z.object({
      chatIds: z.array(z.string())
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid",
        })
      }
    }
  ),
  async (c) => {
    const param = c.req.valid("json");
    const currentUser = c.get('user')

    await prisma.$transaction(async (tx) => {
      const userMessageService = new UserMessageService(tx)
      await userMessageService.deleteByUserIdAndChatIdIn(
        currentUser.id,
        param.chatIds
      )
    })
    return c.json(null)
  }
);


/**
 *  清空我的所有消息 clear-mine-message
 */
route.post(
  '/messages/clear-mine-message-all',
  authMiddleware,
  async (c) => {
    const currentUser = c.get('user')
    await prisma.$transaction(async (tx) => {
      const chatMemberService = new ChatMemberService(tx)
      const userMessageService = new UserMessageService(tx)
      const chatService = new ChatService(tx)

      const chatUsers = await chatMemberService.findChatMemberByUid(currentUser.id)
      if (chatUsers !== null && chatUsers.length > 0) {
        const chatIds = chatUsers.map(c => c.chatId)
        await userMessageService.deleteByUserIdAndChatIdIn(
          currentUser.id,
          chatIds
        )
        const chats = await chatService.findChatByIdIn(chatIds)
        const chatMap = new Map<string, ChatEntity>()
        chats.forEach(c => {
          chatMap.set(c.id, c)
        })
        await chatMemberService.refreshSequenceToTop(chatUsers, chatMap)
      }
    })
    return c.json(null)
  }
);

/**
 *  （单向）删除所有消息-根据会话IDs 解除自己与会话消息的关系
 *  delete-self-chat-ids
 */
route.post(
  '/messages/delete-self-chat-ids',
  authMiddleware,
  zValidator(
    "json",
    z.object({
      chatIds: z.array(z.string())
    }),
    (result, _) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: "invalid",
        })
      }
    }
  ),
  async (c) => {
    const currentUser = c.get('user')
    const param = c.req.valid("json");
    await prisma.$transaction(async (tx) => {
      const chatService = new ChatService(tx)
      const chatMemberService = new ChatMemberService(tx)
      const userMessageService = new UserMessageService(tx)

      // 首先必须身处chat内
      const chatIds = await chatMemberService.findChatIdByUidAndChatIdIn(
        param.chatIds,
        currentUser.id
      )
      if (chatIds.length > 0) {
        // 找到单聊消息
        const deleteChats = await chatService.findMany({
          where: {
            businessId: IModel.IChat.IChatTypeEnum.NORMAL,
            id: { in: chatIds }
          },
          select: { id: true }
        })
        if (deleteChats.length > 0) {
          const deleteChatIds = deleteChats.map((c) => c.id)
          await chatMemberService.deleteByChatIdIn(deleteChatIds)
          await userMessageService.deleteByChatIdIn(deleteChatIds)
        }
      }
    })
    return c.json(null)
  }
);



// /**
//  * 根据 userID获取对应的chatId
//  */
// route.post(
//   '/messages/last-by-stamp',
//   authMiddleware,
//   zValidator(
//     "json",
//     z.object({
//       chatId: z.string(),
//       createdAt: z.number()
//     }),
//     (result, _) => {
//       if (!result.success) {
//         throw new HTTPException(400, {
//           message: "invalid",
//         })
//       }
//     }
//   ),
//   async (c) => {
//     const param = c.req.valid("json");
//     const currentUser = c.get('user')

//     const userMessageService = new UserMessageService()
//     const hashKey = generateRef([BigInt(param.userId), currentUser.id])
//     return c.json({ id: await chatMemberService.findChatIdByHashKey(hashKey, currentUser.id) })
//   }
// );



export default route