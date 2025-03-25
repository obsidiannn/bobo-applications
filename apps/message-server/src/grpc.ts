import { IModel } from '@repo/enums'
import { prisma } from '@/lib/database'
import { ChatMemberService } from '@/services/chat-member'
import { ChatService } from '@/services/chat.service'
import { MessageService } from '@/services/message.service'
import { UserMessageService } from '@/services/user-message.service'

import { MessageDetail } from '@prisma/db-message'
import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js"
import { protos } from '@repo/grpc/proto'
import * as grpc from '@grpc/grpc-js';
import "dotenv/config"
export const startServer = async () => {
    const server = new grpc.Server();
    await prisma.$connect();

    server.addService(protos.chat.ChatProtoService, {
        findByIds,
        sendUserMessage,
        sendBotMessage,
        create,
        removeUserByIds,
        addUsers,
        removeUsers,
        exitByIds,
        dropByIds,
        clearMessageByIds,
        clearMessageByUserIds,
        changeChatConfig
    })
    server.bindAsync(process.env.GRPC_ADDR, grpc.ServerCredentials.createInsecure(), (error, port) => {
        if (error) {
            console.error(error);
            return;
        }
        console.log(`grpc server running at ${process.env.GRPC_ADDR}`);
        process.on('SIGINT', async () => {
            console.log('Received SIGINT. Shutting down gracefully...');
            await prisma.$disconnect();
            server.forceShutdown();
            process.exit(0);
        });
    });
}


const dateVal = (d: string | Date | undefined): bigint => {
    if (d && d !== null) {
        if (typeof d === 'string') {
            return BigInt(Date.parse(d).valueOf());
        }
        return BigInt(d.valueOf());
    }
    return 0n;
}
export const findByIds = async (call: grpc.ServerUnaryCall<protos.chat.FindByIdsRequest, protos.chat.ChatListResponse>, callback: grpc.sendUnaryData<protos.chat.ChatListResponse>) => {
    const param = call.request
    const chatService = new ChatService()
    const chats = await chatService.findChatByIdIn(param.ids)

    const data = chats.map(c => {
        const item: protos.chat.Chat = {
            id: c.id,
            creatorId: c.businessId ?? 0n,
            lastSequence: BigInt(c.lastSequence),
            businessType: c.businessType,
            createdAt: dateVal(c.createdAt),
            updatedAt: dateVal(c.updatedAt)
        }
        return item
    })
    callback(null, { chats: data } as protos.chat.ChatListResponse);
}
export const sendUserMessage = async (call: ServerUnaryCall<protos.chat.SendUserMessageRequest, protos.chat.Message>, callback: sendUnaryData<protos.chat.Message>): Promise<void> => {

}
export const sendBotMessage = async (call: ServerUnaryCall<protos.chat.SendBotMessageRequest, protos.chat.Message>, callback: sendUnaryData<protos.chat.Message>): Promise<void> => {
    const param = call.request
    const message = await prisma.$transaction(async (tx) => {
        const messageService = new MessageService(tx)
        const chatService = new ChatService(tx)
        const chatMemberService = new ChatMemberService(tx)
        const chatUsers = await chatMemberService.findByChatId(param.id)
        const message: MessageDetail = await messageService.sendOfficialMessage(
            param.id,
            param.senderId,
            chatUsers,
            param.content,
            param.msgId
        )
        await chatService.increaseSequence(param.id, message.sequence)
        void messageService.pushOfficialMessage(message, chatUsers.map(u => Number(u.userId)), IModel.IChat.IChatTypeEnum.OFFICIAL)
        return message
    })
    callback(null,
        {
            id: message.id,
            chatId: message.chatId,
            senderId: message.fromUid,
            senderType: message.fromUidType,
            sequence: BigInt(message.sequence),
            createdAt: dateVal(message.createdAt),
            updatedAt: 0n,
            deletedAt: 0n
        } as protos.chat.Message
    )
}
export const create = async (call: ServerUnaryCall<protos.chat.CreateRequest, protos.chat.Chat>, callback: sendUnaryData<protos.chat.Chat>): Promise<void> => {
    const param = call.request
    const chat = await prisma.$transaction(async (tx) => {
        const chatService = new ChatService(tx)
        const chat = await chatService.createChat(BigInt(param.creatorId), param.businessType, param.userIds.map(id => BigInt(id)))
        return chat
    })
    callback(null, {
        id: chat.id,
        creatorId: chat.businessId,
        businessType: chat.businessType,
        createdAt: dateVal(chat.createdAt),
        updatedAt: dateVal(chat.updatedAt),
        lastSequence: 0n
    } as protos.chat.Chat)
}
export const addUsers = async (call: ServerUnaryCall<protos.chat.AddUserRequest, boolean>, callback: sendUnaryData<boolean>): Promise<void> => {
    const param = call.request
    const result = await prisma.$transaction(async (tx) => {
        const chatMemberService = new ChatMemberService(tx)
        const chatService = new ChatService(tx)
        const businessType = await chatService.findBusinessTypeById(param.id)
        if (businessType !== null) {
            await chatMemberService.addChatMember(param.id, param.userIds.map(id => BigInt(id)), businessType)
            return true
        }
        return false
    })
    callback(null, result)
};
/** 移除用户 */
export const removeUsers = async (call: ServerUnaryCall<protos.chat.RemoveUserRequest, boolean>, callback: sendUnaryData<boolean>): Promise<void> => {
    const param = call.request
    const chatMemberService = new ChatMemberService()
    await chatMemberService.removeByChatIdIn([param.id], param.userIds.map(id => BigInt(id)))
    callback(null, true)
};
export const changeCreator = async (call: ServerUnaryCall<protos.chat.ChangeCreatorRequest, boolean>, callback: sendUnaryData<boolean>): Promise<void> => {
};

// 退出会话
export const exitByIds = async (call: ServerUnaryCall<protos.chat.ExitByIdsRequest, boolean>, callback: sendUnaryData<boolean>): Promise<void> => {
    const param = call.request
    const chatService = new ChatService()
    const chatMemberService = new ChatMemberService()
    const userMessageService = new UserMessageService()
    await chatService.findChatByIdIn(
        param.ids,
    )
    await chatMemberService.removeByChatIdIn(param.ids, param.userIds.map(id => BigInt(id)))
    try {
        void userMessageService.clearMemberMessageByChatIds(
            param.userIds.map(id => BigInt(id)),
            param.ids
        )
    } catch (error) {
        console.error(error);
    }
    callback(null, true);
};
// 删除会话
export const dropByIds = async (call: ServerUnaryCall<protos.chat.DropByIdsRequest, boolean>, callback: sendUnaryData<boolean>): Promise<void> => {
    const param = call.request
    const result = await prisma.$transaction(async (tx) => {
        const chatService = new ChatService(tx)
        const chatMemberService = new ChatMemberService(tx)
        const userMessageService = new UserMessageService(tx)
        const messageService = new MessageService(tx)

        await userMessageService.deleteByChatIdIn(param.ids)
        await messageService.deleteByChatIdIn(param.ids)
        await chatMemberService.removeMemberByChatIdIn(param.ids)
        await chatService.dropChatByChatIdIn(
            param.ids
        )
        return true
    })
    callback(null, result);
};
// 清空消息
export const clearMessageByIds = async (call: ServerUnaryCall<protos.chat.ClearMessageByIdsRequest, boolean>, callback: sendUnaryData<boolean>): Promise<void> => {
    const param = call.request
    await prisma.$transaction(async (tx) => {
        const userMessageService = new UserMessageService(tx)
        const messageService = new MessageService(tx)
        await messageService.deleteByChatIdIn(param.ids)
        await userMessageService.deleteByChatIdIn(param.ids)
    })
    callback(null, true);
};

// 删除某用户所有消息
export const clearMessageByUserIds = async (call: ServerUnaryCall<protos.chat.ClearMessageByUserIdsRequest, boolean>, callback: sendUnaryData<boolean>): Promise<void> => {
    const param = call.request
    await prisma.$transaction(async (tx) => {
        const userMessageService = new UserMessageService(tx)
        await userMessageService.deleteByUserIdIn(param.userIds.map(id => BigInt(id)))
    })
    callback(null, true);
};
// 删除某用户 chatuser + usermessage
export const removeUserByIds = async (call: ServerUnaryCall<protos.chat.RemoveUserByIdsRequest, boolean>, callback: sendUnaryData<boolean>): Promise<void> => {
    const param = call.request
    await prisma.$transaction(async (tx) => {
        const chatMemberService = new ChatMemberService(tx)
        const userMessageService = new UserMessageService(tx)
        await userMessageService.clearMemberMessageByChatIds([BigInt(param.userId)], param.ids)
        await chatMemberService.removeChatMemberByIds(param.ids, [BigInt(param.userId)])
    })
    await prisma.$transaction(async (tx) => {
        const chatService = new ChatService(tx)
        const messageService = new MessageService(tx)
        const removeChatIds = await chatService.chatRecycle(param.ids)
        if (removeChatIds && removeChatIds.length > 0) {
            await messageService.deleteByChatIdIn(removeChatIds)
        }
    })
    callback(null, true);
};

// 删除某用户所有消息
export const removeUserByUserIds = async (call: ServerUnaryCall<protos.chat.RemoveUserByUserIdsRequest, boolean>, callback: sendUnaryData<boolean>): Promise<void> => {
    const param = call.request
    const chatIds = await prisma.$transaction(async (tx) => {
        const chatMemberService = new ChatMemberService(tx)
        const userMessageService = new UserMessageService(tx)
        const chatIds = await chatMemberService.findChatIdByUserIdIn(param.userIds.map(id => BigInt(id)))
        if (chatIds.length > 0) {
            await userMessageService.deleteByUserIdIn(param.userIds.map(id => BigInt(id)))
            await chatMemberService.removeChatMemberByIds(chatIds, param.userIds.map(id => BigInt(id)))
        }
        return chatIds
    })
    if (chatIds && chatIds.length > 0) {
        await prisma.$transaction(async (tx) => {
            const chatService = new ChatService(tx)
            const messageService = new MessageService(tx)
            const removeChatIds = await chatService.chatRecycle(chatIds)
            if (removeChatIds && removeChatIds.length > 0) {
                await messageService.deleteByChatIdIn(removeChatIds)
            }
        })
    }
    callback(null, true);
};



// 删除某用户所有消息
export const changeChatConfig = async (call: ServerUnaryCall<protos.chat.ChatConfigRequest, protos.chat.ChatConfigResponse>,
    callback: sendUnaryData<protos.chat.ChatConfigResponse>): Promise<void> => {
    const param = call.request
    const chatUser = await prisma.$transaction(async (tx) => {
        const chatMemberService = new ChatMemberService(tx)
        console.log('change chat', param);

        const result = await chatMemberService.change(param.id, param.userId, param.changeField, Number(param.value))
        return result
    })
    const result: protos.chat.ChatConfigResponse = {
        id: chatUser?.chatId ?? '',
        isTop: chatUser?.isTop ?? IModel.ICommon.ICommonBoolEnum.NO,
        isMute: chatUser?.isMute ?? IModel.ICommon.ICommonBoolEnum.NO,
        isShow: chatUser?.isShow ?? IModel.ICommon.ICommonBoolEnum.NO,
        isHide: chatUser?.isHide ?? IModel.ICommon.ICommonBoolEnum.NO,
    }
    callback(null, result);
};



startServer()
