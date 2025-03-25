
import EventManager from 'app/services/event-manager.service'
import { ChatChangeEvent, ChatDetailItem, ChatTypingEvent, ClearChatMessageEvent, FriendChangeEvent, SocketJoinEvent } from '@repo/types'
import { IModel } from '@repo/enums'

const sendClearMsgEvent = (chatId: string) => {
    const event: ClearChatMessageEvent = { chatId, type: IModel.IClient.SocketTypeEnum.CLEAR_ALL_MESSAGE }
    const eventKey = EventManager.generateChatTopic(chatId)
    EventManager.emit(eventKey, event)
}

/**
 * 发送chat变更事件
 * @param chatId 
 * @param operate 
 * @param chat 
 * @returns 
 */
const sendChatEvent = (chatId: string, operate: 'add' | 'remove' | 'update', chat?: ChatDetailItem) => {
    if (operate !== 'remove' && !chat) {
        return
    }
    const eventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.CHAT_CHANGE)
    const event: ChatChangeEvent = {
        chatId,
        operate,
        item: chat,
        type: IModel.IClient.SocketTypeEnum.CHAT_CHANGE
    }
    EventManager.emit(eventKey, event)
}

/**
 * 发送好友变更事件
 * @param friendId 
 * @param remove 
 */
const sendFriendChangeEvent = (friendId: number, remove: boolean) => {
    const eventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.FRIEND_CHANGE)
    EventManager.emit(eventKey, {
        friendId,
        remove
    } as FriendChangeEvent)
}

const sendSocketJoinEvent = (chatId: string) => {
    const _msg = { type: IModel.IClient.SocketTypeEnum.SOCKET_JOIN, chatIds: [chatId] } as SocketJoinEvent
    const eventKey = EventManager.generateKey(_msg.type, '')
    EventManager.emit(eventKey, _msg)
}

const sendTypeingEvent = (chatId: string, flag: boolean, senderId: number) => {
    if (chatId === '' || senderId <= 0) {
        return
    }
    const _msg = {
        type: IModel.IClient.SocketTypeEnum.TYPING_CHANGE,
        chatId,
        flag,
        senderId
    } as ChatTypingEvent
    const eventKey = EventManager.generateKey(_msg.type, '')
    EventManager.emit(eventKey, _msg)
}

const sendRecieveTypeingEvent = (e: ChatTypingEvent) => {
    if (!e.chatId) {
        return
    }
    const eventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.RECIEVE_TYPING_CHANGE, e.chatId)
    EventManager.emit(eventKey, e)
}


export default {
    sendChatEvent,
    sendFriendChangeEvent,
    sendClearMsgEvent,
    sendSocketJoinEvent,
    sendTypeingEvent,
    sendRecieveTypeingEvent
}