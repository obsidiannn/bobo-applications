import messageApi from "app/api/chat/message"
import ToastException from "../exception/toast-exception";
import quickAes from "app/utils/quick-crypto";
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { uploadFile } from "./file.service";
import { IModel } from "@repo/enums";
import { MessageType } from "app/components/chat-ui";
import chatUiAdapter from "app/utils/chat-ui.adapter";
import { imageFormat } from "app/utils/media-util";
import { LocalMessageService } from "./LocalMessageService";
import { IMessage, IUser } from "drizzle/schema";
import userService from "./user.service";
export class CloudMessageService {
    private static async _send(chatId: string, key: string, message: MessageType.Any, data: {
        t: string;
        d: any;
    }) {
        if (!data.d) {
            throw new ToastException('消息內容不能爲空');
        }
        const encode = quickAes.En(key, Buffer.from(JSON.stringify(data), 'utf8'))
        const result = await messageApi.sendMessage({
            id: message.id,
            chatId: chatId,
            type: IModel.IChat.IMessageTypeEnum.NORMAL,
            isEnc: 1,
            content: Buffer.from(encode).toString('hex')
        });
        message.status = "sent";
        message.sequence = result.sequence;

        LocalMessageService.add(chatUiAdapter.messageDto2Entity(message));
        return message;
    }
    private static async _sendText(chatId: string, key: string, message: MessageType.Text) {
        const data = {
            t: 'text',
            d: message.text,
        }
        return await CloudMessageService._send(chatId, key, message, data);
    }
    private static async _sendImage(chatId: string, key: string, message: MessageType.Image) {
        const originalPath = message.uri
        const original = await manipulateAsync(originalPath, [], {
            compress: 1,
            format: SaveFormat.PNG,
        });
        console.log('original', original)
        const originalWebp = await imageFormat(original.uri);
        const originKey = await uploadFile(originalWebp);

        message.uri = originKey.key
        return await CloudMessageService._send(chatId, key, message, {
            t: 'image',
            d: chatUiAdapter.convertPartialContent(message)
        });
    }


    private static async _sendVideo(chatId: string, key: string, message: MessageType.Video) {
        const file = message.uri;
        if (!file) {
            throw new ToastException('文件不能爲空');
        }
        const transFilePath = file
        // const transFilePath = fileService.cachePath() + message.id + '_trans.mp4'
        // await formatVideo(file, transFilePath)
        const videoResult = await uploadFile(transFilePath);

        const thumbailResult = await uploadFile(message.thumbnail);
        message.uri = videoResult.key
        message.thumbnail = thumbailResult.key
        message.metadata = { 'original': transFilePath }

        return await CloudMessageService._send(chatId, key, message, {
            t: 'video',
            d: chatUiAdapter.convertPartialContent(message)
        });
    }

    private static async _sendFile(chatId: string, key: string, message: MessageType.File) {
        const file = message.uri;
        if (!file) {
            throw new ToastException('文件不能爲空');
        }
        console.log('發送文件 file', file);
        const fileResult = await uploadFile(file);
        message.uri = fileResult.key
        message.metadata = { 'original': file }
        // const fileInfo = await fileService.getFileInfo(file);
        // fileInfo?.exists && (file.md5 = fileInfo.md5 ?? '');
        console.log('處理完成準備發送', file);
        return await CloudMessageService._send(chatId, key, message, {
            t: 'file',
            d: chatUiAdapter.convertPartialContent(message)
        });
    }
    static async send(chatId: string, key: string, message: MessageType.Any): Promise<MessageType.Any> {
        switch (message.type) {
            case 'text':
                return await CloudMessageService._sendText(chatId, key, message as MessageType.Text);
            case 'image':
                return await CloudMessageService._sendImage(chatId, key, message as MessageType.Image);
            case 'video':
                return await CloudMessageService._sendVideo(chatId, key, message as MessageType.Video);
            // case 'audio':
            //     return await sendAudio(chatId, key, message);
            case 'file':
                return await CloudMessageService._sendFile(chatId, key, message as MessageType.File);
            default:
                throw new ToastException('不支持的消息類型');
        }
    }
    static async findByIds(chatId: string, ids: string[], key: string, initReply = true): Promise<MessageType.Any[]> {
        // 过滤出已缓存的
        const items: IMessage[] = await LocalMessageService.findByIds(ids)
        const result = items.map(i => {
            return chatUiAdapter.messageEntity2Dto(i, key, initReply)
        })
        const cloudIds = ids.filter(id => !items.find(item => item.id === id));
        if (cloudIds.length > 0) {
            const cloudItems = await messageApi.findByIds({ chatId, ids: cloudIds });
            if (cloudItems.length > 0) {
                const replyIds: string[] = []
                const remoteData = cloudItems.map(i => {
                    const item = chatUiAdapter.messageTypeConvert(i, key, null, true)
                    if (item.metadata?.replyId) {
                        replyIds.push(item.metadata.replyId)
                    }
                    return item
                })
                const replyMap = new Map<string, MessageType.Any>()
                if (replyIds.length > 0) {
                    const replys = await this.findByIds(chatId, replyIds, key, false)
                    replys.forEach(r => {
                        replyMap.set(r.id, r)
                    })
                }
                result.push(...remoteData.map(r => {
                    if (r.metadata?.replyId) {
                        const rpl = replyMap.get(r.metadata?.replyId)
                        return {
                            ...r, reply: rpl
                        } as MessageType.Any
                    }
                    return r
                }))

                // 存储到缓存中
                await LocalMessageService.addBatch(chatUiAdapter.messageEntityConverts(remoteData));
            }
        }
        return result.sort((a, b) => {
            return b.sequence - a.sequence
        });
    }
    // 获取最新消息的 id 列表
    static async getLatestIds(chatId: string, sequence: number, limit: number = 20): Promise<string[]> {
        // 根据sequence 获取最新的 id 列表
        return [];
    }

    // 删除所有我的消息
    static async flushAll() {
    }
    // 删除消息对于我的关联
    static async delByIds(ids: string[]) {
        await LocalMessageService.delByIds(ids)
        return messageApi.deleteSelfMsg({ ids: ids })
    }

    /**
     * 獲取消息列表
     * @param chatId
     * @param key
     * @param sequence
     * @param direction
     * @returns
     */
    static async getRemoteList(
        chatId: string,
        key: string,
        sequence: number,
        limit: number
    ): Promise<MessageType.Any[]> {
        const list = await CloudMessageService.getMessageDetails(chatId, key, sequence, limit)
        const userIds: number[] = []

        list.forEach(d => {
            if (d.senderId !== undefined && d.senderId !== null) {
                userIds.push(d.senderId)
            }

        })

        let userHash: Map<number, IUser> = await userService.getUserHash(userIds)
        return list.map((item) => {
            const user = userHash.get(item?.senderId ?? -1)
            if (user) {
                return {
                    ...item,
                    author: chatUiAdapter.userTransfer(user)
                }
            }
            return item
        });
    }

    static async getMessageDetails(
        chatId: string,
        key: string,
        sequence: number,
        limit: number
    ): Promise<MessageType.Any[]> {
        const idsResp = await messageApi.getMessageListIds({
            chatId,
            limit: limit,
            sequence,
            direction: 'down',
        })
        if (!idsResp || idsResp.items.length <= 0) {
            return []
        }
        const result: MessageType.Any[] = await CloudMessageService.findByIds(chatId, idsResp.items, key)
        return result
    }


}


