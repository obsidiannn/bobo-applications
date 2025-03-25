import { MessageType } from "app/components/chat-ui"
import { ICollect, ICollectDetail } from "drizzle/schema"
import chatUiAdapter from "./chat-ui.adapter"
import { CollectItem, CollectRecord } from "app/screens"
import dateUtil from "./dateUtil"
import generateUtil from "./generateUtil"
import { ChatDetailItem } from "../../../../packages/types/dist/client/chat"
import { IModel } from "@repo/enums"

/**
 * 单消息转为单收藏
 * @param message 
 * @returns 
 */
const convertEntity = (message: MessageType.Any): ICollect => {
    let title = ""
    if (message.type === 'text') {
        title = (message as MessageType.Text).text
    }
    const entity: ICollect = {
        fromAuthorId: Number(message.author.id),
        fromAuthor: message.author.firstName ?? '',
        chatId: message.roomId ?? '',
        msgId: message.id,
        type: message.type,
        readCount: 0,
        title: title,
        data: chatUiAdapter.convertPartialContent(message as MessageType.PartialAny),
        createdAt: 0,
    }

    return entity
}
/**
 * 多消息转为单收藏聊天记录
 * @param messages 
 * @param chatItem 
 * @returns 
 */
const convertRecordsEntity = (messages: MessageType.Any[],
    chatItem?: ChatDetailItem
): ICollect => {
    let title = "聊天记录"
    let author = ''
    if (chatItem?.type === IModel.IChat.IChatTypeEnum.GROUP) {
        title = "群组" + title
        const nameSet = new Set<string>()
        messages.forEach(m => {
            if (m.author && m.author.firstName) {
                nameSet.add(m.author.firstName)
            }
        })
        if (nameSet.size > 0) {
            const names = Array.from(nameSet.keys())
            if (names.length > 3) {
                author = names.slice(0, 3).join("、")
            } else {
                author = names.join("、")
            }
        }

    }

    const entity: ICollect = {
        fromAuthorId: 0,
        fromAuthor: author,
        chatId: chatItem?.id ?? '',
        msgId: generateUtil.generateId(),
        type: 'record',
        readCount: 0,
        title: title,
        data: convertRecords(messages),
        createdAt: 0,
    }

    return entity
}
// 聊天记录摘要转换
const convertRecords = (records: MessageType.Any[]): string => {
    const list: { name: string, title: string }[] =
        records.map(r => {
            let t = ''
            switch (r.type) {
                case 'image':
                    t = '【图片】'
                    break
                case 'text':
                    t = r.text
                    break
                case 'video':
                    t = '【视频】'
                    break
                case 'file':
                    t = '【文件】'
                    break
                default: break
            }
            return { name: r.author.firstName ?? '', title: t }
        })
    if (list.length > 3) {
        return JSON.stringify(list.slice(0, 3))
    }
    return JSON.stringify(list)
}

// 收藏实体转 封装类
const convertItem = (entity: ICollect): CollectItem => {
    let data = null
    if (entity.type === 'record') {
        data = JSON.parse(entity.data) as CollectRecord[]
    } else {
        data = chatUiAdapter.convertPartialItem(entity.data)
    }
    const item: CollectItem = {
        id: entity.id,
        fromAuthorId: entity.fromAuthorId ?? 0,
        fromAuthor: entity.fromAuthor ?? '',
        chatId: entity.chatId,
        msgId: entity.msgId,
        type: entity.type,
        readCount: entity.readCount,
        title: entity.title ?? '',
        data,
        createdAt: dateUtil.second2Label(entity.createdAt ?? 0)
    }
    return item
}

/**
 * 聊天记录详情记录转换
 * @param messages 
 * @param collect 
 */
const convertCollectDetailEntity = (messages: MessageType.Any[], collect: ICollect): ICollectDetail[] => {
    return messages.map(message => {
        const e: ICollectDetail = {
            collectId: collect.id,
            fromAuthorId: Number(message.author.id),
            fromAuthor: message.author.firstName ?? '',
            chatId: message.roomId ?? '',
            msgId: message.id,
            data: chatUiAdapter.convertPartialContentForCollect(message),
        }
        return e
    })
}

export default {
    convertEntity,
    convertItem,
    convertRecords,
    convertRecordsEntity,
    convertCollectDetailEntity
}