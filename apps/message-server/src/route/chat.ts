import { IModel } from '@repo/enums'
import { generateRef } from '@repo/server/utils'
import { prisma } from '@/lib/database'
import { ChatMemberService } from '@/services/chat-member'
import { ChatService } from '@/services/chat.service'
import { UserMessageService } from '@/services/user-message.service'
import { ChatDetailItem, ChatEntity } from '@/types/chat'
import { z } from 'zod'
import { Hono } from 'hono'
import { protos } from '@repo/grpc/proto'
import { authMiddleware } from '@/lib/middlewares'
import { zValidator } from '@hono/zod-validator'
import { HTTPException } from "hono/http-exception";
import dayjs from 'dayjs';
const route = new Hono<{ Variables: { user: protos.user.User } }>();

route.post('mine-id-after',
  authMiddleware,
  zValidator(
    "json",
    z.object({
      lastTime: z.optional(z.number())
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
    const currentUserId = c.get('user').id
    const chatMemberService = new ChatMemberService()
    const result = await chatMemberService.findChatIdsAfter(currentUserId, param.lastTime)
    // cache
    return c.json({ items: result })
  }
)


/**
 * 我的会话id 列表
 * @param currentUserId
 */
route.post(
  '/mine-id-list',
  authMiddleware,
  async (c) => {
    const currentUserId = c.get('user').id
    const chatMemberService = new ChatMemberService()
    const items = await chatMemberService.findChatIdByUid(
      currentUserId
    )
    return c.json({ items })
  }
);


/**
 * 根据id获取详情
 * @param currentUserId
 */
route.post(
  '/chat-by-ids',
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

    const currentUserId = c.get('user').id
    const chatService = new ChatService()
    const chatMemberService = new ChatMemberService()

    // cache
    const chats = await chatService.findChatByIdIn(param.chatIds)

    const chatMap = new Map<string, ChatEntity>()
    chats.forEach((c) => {
      chatMap.set(c.id, c)
    })

    const configMap = await chatMemberService.findConfigByChatIdIn(param.chatIds, currentUserId)
    const result: ChatDetailItem[] = chats.map((chat) => {
      const config = configMap.get(chat.id)
      const item: ChatDetailItem = {
        id: chat.id,
        type: chat.businessType,
        status: chat.status,
        isEnc: chat.isEnc,
        sourceId: 0n,
        firstSequence: 1,
        lastReadSequence: 1,
        lastSequence: chat.lastSequence,
        lastTime: chat.lastTime?.valueOf() ?? 0,
        isTop: config?.isTop ?? IModel.ICommon.ICommonBoolEnum.NO,
        isMute: config?.isMute ?? IModel.ICommon.ICommonBoolEnum.NO,
        createdAt: dayjs(chat.createdAt).unix(),
      }

      if (chat.businessType === IModel.IChat.IChatTypeEnum.GROUP) {
        const sourceId = chat.businessId ?? 0n
        item.sourceId = sourceId
      } else if (chat.businessType === IModel.IChat.IChatTypeEnum.NORMAL) {
        const uId =
          (chat.userIds?.split(',') ?? []).find(
            (id) => id !== currentUserId.toString()
          ) ?? '-1'
        item.sourceId = BigInt(uId)
      } else if (chat.businessType === IModel.IChat.IChatTypeEnum.OFFICIAL) {
        item.sourceId = chat.businessId ?? 0n
      }
      return item
    })
    console.log('result', result);

    return c.json({ items: result })
  }
);

/**
 * 我的会话列表
 * @param currentUserId
 */
route.post(
  '/mine-chat',
  authMiddleware,
  zValidator(
    "json",
    z.object({
      chatId: z.optional(z.string())
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

    const currentUserId = c.get('user').id
    const chatService = new ChatService()
    const chatMemberService = new ChatMemberService()
    const userMessageService = new UserMessageService()

    const chatMembers = await chatMemberService.findChatMemberByUid(
      currentUserId, param.chatId
    )

    const chatIds = chatMembers.map((c) => c.chatId)
    // cache
    const chats = await chatService.findChatByIdIn(chatIds)
    console.log('members', chatMembers);

    const firstSequenceHash =
      await userMessageService.firstSequenceByChatIdInGroupBy(
        currentUserId,
        chatIds
      )
    const chatMap = new Map<string, ChatEntity>()
    chats.forEach((c) => {
      chatMap.set(c.id, c)
    })
    const result: ChatDetailItem[] = chatMembers.map((chatUser) => {
      const chat = chatMap.get(chatUser.chatId)
      if (chat === null || chat === undefined) {
        throw new HTTPException(400, { message: 'error' })
      }
      const item: ChatDetailItem = {
        id: chat.id,
        type: chat.businessType,
        status: chat.status,
        isEnc: chat.isEnc,
        sourceId: 0n,
        firstSequence: firstSequenceHash.get(chat.id) ?? chat.lastSequence,
        lastReadSequence: chatUser.maxReadSeq,
        lastSequence: chat.lastSequence,
        lastTime: chat.lastTime?.valueOf() ?? chatUser.lastOnlineTime.getTime(),
        isTop: chatUser.isTop,
        isMute: chatUser.isMute
      }

      if (chat.businessType === IModel.IChat.IChatTypeEnum.GROUP) {
        const sourceId = chat.businessId ?? 0n
        item.sourceId = sourceId
      } else if (chat.businessType === IModel.IChat.IChatTypeEnum.NORMAL) {
        const uId =
          (chat.userIds?.split(',') ?? []).find(
            (id) => id !== currentUserId.toString()
          ) ?? '-1'
        item.sourceId = BigInt(uId)
      } else if (chat.businessType === IModel.IChat.IChatTypeEnum.OFFICIAL) {
        item.sourceId = chat.businessId ?? 0n
      }
      return item
    })
    console.log('result', result);

    return c.json({ items: result })
  }
);


/**
 * 获取sequence 数据
 * @param currentUserId
 */
route.post(
  '/chat-sequence',
  authMiddleware,
  zValidator(
    "json",
    z.object({
      chatIds: z.array(z.string()),
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
    const currentUserId = c.get('user').id
    const chatService = new ChatService()
    const chatMemberService = new ChatMemberService()
    const userMessageService = new UserMessageService()

    const chatMembers = await chatMemberService.findChatMemberByUidAndChatIdIn(
      currentUserId, param.chatIds
    )

    const chatIds = chatMembers.map((c) => c.chatId)
    // cache
    const chats = await chatService.findChatByIdIn(chatIds)

    const firstSequenceHash =
      await userMessageService.firstSequenceByChatIdInGroupBy(
        currentUserId,
        chatIds
      )
    const chatMap = new Map<string, ChatEntity>()
    chats.forEach((c) => {
      chatMap.set(c.id, c)
    })

    const result = chatMembers.map(chatUser => {
      const chat = chatMap.get(chatUser.chatId)
      return {
        chatId: chatUser.chatId,
        firstSequence: firstSequenceHash.get(chatUser.chatId) ?? chat?.lastSequence,
        lastReadSequence: chatUser.maxReadSeq,
        lastSequence: chat?.lastSequence,
        lastTime: chat?.lastTime ? dayjs(chat.lastTime).unix() : undefined,
        isTop: chatUser.isTop,
        isMute: chatUser.isMute
      }
    })

    return c.json({ items: result })
  }
);



/**
 * 隐藏会话
 */
route.post(
  '/delete',
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
    const currentUserId = c.get('user').id
    await prisma.$transaction(async (tx) => {
      const chatMemberService = new ChatMemberService(tx)
      const userMessageService = new UserMessageService(tx)

      await chatMemberService.userChatHide(
        currentUserId,
        param.ids,
        true
      )
      await userMessageService.clearMemberMessageByChatIds(
        [currentUserId],
        param.ids
      )
    })
    return c.json({})
  }
);




/**
 * 会话置顶
 */
route.post(
  '/raise-top',
  authMiddleware,
  zValidator(
    "json",
    z.object({
      chatId: z.string(),
      top: z.boolean()
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
    const currentUserId = c.get('user').id
    const chatMemberService = new ChatMemberService()
    const result = await chatMemberService.raiseTop(
      param.chatId,
      currentUserId,
      param.top
    )
    console.log('置顶', result);

    return c.json({ isTop: result })
  }
);




/**
 * 免打扰
 */
route.post(
  '/change-mute',
  authMiddleware,
  zValidator(
    "json",
    z.object({
      chatId: z.string(),
      mute: z.boolean()
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
    const currentUserId = c.get('user').id
    const chatMemberService = new ChatMemberService()
    const result = await chatMemberService.changeMute(
      param.chatId,
      currentUserId,
      param.mute
    )
    return c.json({ isMute: result })
  }
);


/**
 * 根据 userID获取对应的chatId
 */
route.post(
  '/id-by-user',
  authMiddleware,
  zValidator(
    "json",
    z.object({
      userId: z.number()
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
    const hashKey = generateRef([BigInt(param.userId), currentUser.id])
    return c.json({ id: await chatMemberService.findChatIdByHashKey(hashKey, currentUser.id) })
  }
);




export default route