import messageApi from "app/api/chat/message"
import ToastException from "../exception/toast-exception";
import quickAes from "app/utils/quick-crypto";
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { uploadFile } from "./file.service";
import { IModel } from "@repo/enums";
import { MessageDetailItem, MessageExtra } from "@repo/types";
import userService from "./user.service";
import { MessageType } from "app/components/chat-ui";
import chatUiAdapter from "app/utils/chat-ui.adapter";
import { captureImage, captureVideo, generateVideoThumbnail, imageFormat, videoFormat } from "app/utils/media-util";
import { LocalMessageService } from "./LocalMessageService";
import { LocalUserService } from "./LocalUserService";
import { IUser } from "drizzle/schema";
import { launchImageLibraryAsync, MediaTypeOptions } from "expo-image-picker";
import generateUtil from "app/utils/generateUtil";
import * as DocumentPicker from 'expo-document-picker';
const _limit = 20

export class MessageSendService {
    static async captureCamera(author: IUser): Promise<MessageType.Image> {
        return new Promise(async (resolve, reject) => {
            try {
                const photo = await captureImage();
                if (photo !== undefined) {
                    const message: MessageType.Image = {
                        author: chatUiAdapter.userTransfer(author),
                        createdAt: Date.now(),
                        height: photo.height,
                        id: generateUtil.generateId(),
                        name: photo.fileName ?? '',
                        size: photo.fileSize ?? 0,
                        type: 'image',
                        uri: photo.uri,
                        width: photo.width,
                        senderId: author?.id ?? 0,
                        sequence: -1
                    }
                    resolve(message);
                }
            } catch (err) {
                reject(err);
            }
        })
    }
    // 视频录制
    static async captureVideo(author: IUser): Promise<MessageType.Video> {
        return new Promise(async (resolve, reject) => {
            const video = await captureVideo();
            if (!video) {
                reject(new Error('视频录制失败'))
                return;
            }
            const formatVideo = await videoFormat(video)
            if (!formatVideo) {
                reject(new Error('视频格式化失败'))
                return;
            }
            const id = generateUtil.generateId()
            const thumbnailPath = await generateVideoThumbnail(formatVideo.uri, id)
            const message: MessageType.Video = {
                id,
                author: chatUiAdapter.userTransfer(author),
                createdAt: Date.now(),
                type: 'video',
                senderId: author?.id ?? 0,
                sequence: -1,
                height: formatVideo.height,
                width: formatVideo.width,
                name: formatVideo.fileName ?? '',
                size: formatVideo.fileSize ?? 0,
                duration: formatVideo.duration ?? 0,
                uri: formatVideo.uri,
                thumbnail: thumbnailPath ?? '',
                status: 'sending'
            }
            resolve(message)
        })
    }
    static async imageSelection(author: IUser): Promise<MessageType.Image> {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await launchImageLibraryAsync(
                    {
                        mediaTypes: MediaTypeOptions.Images,
                        quality: 0.7,
                        base64: true,
                    }
                )
                const assets = result.assets
                const response = assets?.[0]
                if (response?.base64) {
                    const message: MessageType.Image = {
                        author: chatUiAdapter.userTransfer(author),
                        createdAt: Date.now(),
                        height: response.height,
                        id: generateUtil.generateId(),
                        name: response.fileName ?? response.uri?.split('/').pop() ?? '🖼',
                        size: response.fileSize ?? 0,
                        type: 'image',
                        uri: response.uri,
                        width: response.width,
                        senderId: author?.id ?? 0,
                        sequence: -1
                    }
                    resolve(message);
                    return;
                }
            } catch (error) {
                reject(error)
            }

        });
    }
    static async fileSelection(author: IUser): Promise<MessageType.File> {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await DocumentPicker.getDocumentAsync({
                    type: '*/*',
                    copyToCacheDirectory: true,
                });
                if (result.assets !== null && result.assets.length > 0) {
                    const response = result.assets[0]
                    const message: MessageType.File = {
                        author: chatUiAdapter.userTransfer(author),
                        createdAt: Date.now(),
                        id: generateUtil.generateId(),
                        mimeType: response.mimeType ?? undefined,
                        name: response.name,
                        size: response.size ?? 0,
                        type: 'file',
                        uri: response.uri,
                        senderId: author?.id ?? 0,
                        sequence: -1,
                        status: 'sending'
                    }
                    resolve(message)
                }
            } catch (error) {
                reject(error)
            }

        });
    }

    static userCardSelect(author: IUser, friend: IUser): MessageType.UserCard {
        const message: MessageType.UserCard = {
            author: chatUiAdapter.userTransfer(author),
            createdAt: Date.now(),
            id: generateUtil.generateId(),
            type: 'userCard',
            senderId: author?.id ?? 0,
            sequence: -1,
            status: 'sending',
            userId: friend.id + '',
            avatar: friend.avatar ?? '',
            username: friend.nickName ?? '',
        }
        return message
    }
}


const _send = async (chatId: string,
    key: string,
    mid: string,
    type: IModel.IChat.IMessageTypeEnum,
    data: {
        t: string;
        d: any;
    },
    extra?: MessageExtra
) => {
    if (!data.d) {
        throw new ToastException('消息內容不能爲空');
    }
    if (!globalThis.wallet) {
        throw new ToastException('請先登錄');
    }
    const encode = quickAes.En(key, Buffer.from(JSON.stringify(data), 'utf8'))
    return await messageApi.sendMessage({
        id: mid,
        chatId: chatId,
        type,
        isEnc: 1,
        content: Buffer.from(encode).toString('hex'),
        extra
    });
}

const send = async (chatId: string, key: string, message: MessageType.Any): Promise<MessageType.Any> => {
    console.log('sendkey=', key);

    switch (message.type) {
        case 'text':
            return await sendText(chatId, key, message as MessageType.Text);
        case 'image':
            return await sendImage(chatId, key, message as MessageType.Image);
        case 'video':
            return await sendVideo(chatId, key, message as MessageType.Video);
        // case 'audio':
        //     return await sendAudio(chatId, key, message);
        case 'file':
            return await sendFile(chatId, key, message as MessageType.File);
        case 'userCard':
            return await sendUserCard(chatId, key, message as MessageType.UserCard);
        default:
            throw new ToastException('不支持的消息類型');
    }
}

const sendText = async (chatId: string, key: string, message: MessageType.Text) => {
    const data = {
        t: 'text',
        d: message.text,
    }
    const extra: MessageExtra = {}
    if (message?.metadata?.replyId) {
        console.log('extra>>');
        extra.replyId = message?.metadata?.replyId
        extra.replyAuthorName = message?.metadata?.replyAuthorName
    }
    console.log('extra...', extra);

    const res = await _send(chatId, key, message.id, IModel.IChat.IMessageTypeEnum.NORMAL, data, extra);
    message.sequence = res.sequence;
    return message
}
const sendImage = async (chatId: string, key: string, message: MessageType.Image) => {
    const originalPath = message.uri
    const original = await manipulateAsync(originalPath, [], {
        compress: 1,
        format: SaveFormat.PNG,
    });
    console.log('original', original)
    const originalWebp = await imageFormat(original.uri);
    const originKey = await uploadFile(originalWebp);

    message.uri = originKey.key
    const extra: MessageExtra = {}
    if (message?.metadata?.replyId) {
        extra.replyId = message?.metadata?.replyId
        extra.replyAuthorName = message?.metadata?.replyAuthorName
    }
    const result = await _send(chatId, key, message.id, IModel.IChat.IMessageTypeEnum.NORMAL, {
        t: 'image',
        d: chatUiAdapter.convertPartialContent(message)
    }, extra);
    message.status = 'sent'
    message.sequence = result.sequence

    return message
}




const sendVideo = async (chatId: string, key: string, message: MessageType.Video) => {
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

    const extra: MessageExtra = {}
    if (message?.metadata?.replyId) {
        extra.replyId = message?.metadata?.replyId
        extra.replyAuthorName = message?.metadata?.replyAuthorName
    }
    const result = await _send(chatId, key, message.id, IModel.IChat.IMessageTypeEnum.NORMAL, {
        t: 'video',
        d: chatUiAdapter.convertPartialContent(message)
    }, extra);
    message.status = 'sent'
    message.sequence = result.sequence
    return message
}

const sendFile = async (chatId: string, key: string, message: MessageType.File) => {
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
    const extra: MessageExtra = {}
    if (message?.metadata?.replyId) {
        extra.replyId = message?.metadata?.replyId
        extra.replyAuthorName = message?.metadata?.replyAuthorName
    }
    console.log('處理完成準備發送', file);
    const result = await _send(chatId, key, message.id, IModel.IChat.IMessageTypeEnum.NORMAL, {
        t: 'file',
        d: chatUiAdapter.convertPartialContent(message)
    }, extra);
    message.status = 'sent'
    message.sequence = result.sequence
    return message
}


const sendUserCard = async (chatId: string, key: string, message: MessageType.UserCard) => {
    const extra: MessageExtra = {}
    if (message?.metadata?.replyId) {
        extra.replyId = message?.metadata?.replyId
        extra.replyAuthorName = message?.metadata?.replyAuthorName
    }
    const result = await _send(chatId, key, message.id, IModel.IChat.IMessageTypeEnum.NORMAL, {
        t: 'userCard',
        d: chatUiAdapter.convertPartialContent(message)
    }, );
    message.status = 'sent'
    message.sequence = result.sequence
    return message
}


const getListFromDb = async (
    chatId: string,
    sequence: number,
    direction: 'up' | 'down',
    limit: number,
    key: string,
): Promise<MessageType.Any[]> => {
    const queryParam = {
        chatId: chatId,
        sequence: sequence,
        direction: direction,
        limit: limit
    }
    const list = await LocalMessageService.queryEntity(queryParam)
    return chatUiAdapter.messageEntityToItems(list, key, false)
}

const checkDiffFromWb = (
    data: MessageType.Any[],
    _seq: number,
    direction: string,
    _limit: number,
    firstSeq: number
): { seq: number, limit: number } => {

    const success = { seq: 0, limit: -1 }
    if (data !== undefined && data !== null && data.length > 0) {
        const up: boolean = direction === 'up'
        const min = data[data.length - 1].sequence ?? 1
        const max = data[0].sequence ?? 1
        console.log('max=', max, 'min=', min);
        console.log('seq=', _seq);

        if (up) {
            const targetSeq = _seq - _limit <= 0 ? 1 : _seq - _limit
            // 完全取得
            if (max === _seq) {
                if (data.length === _limit || min <= firstSeq) {
                    return success
                }
            }
            // 部分取得
            if (max < _seq) {
                return { seq: _seq, limit: _seq - max }
            }
            if (min > targetSeq) {
                return { seq: min - 1, limit: min - targetSeq }
            }
        } else {
            const targetSeq = _seq + _limit
            // 完全取得
            if (min === _seq && data.length === _limit || min === 1) {
                return success
            }
            // 部分取得
            if (max < targetSeq) {
                return { seq: max + 1, limit: targetSeq - max }
            }
            return success
        }

    } else {
        // if (direction === 'up' && _seq <= firstSeq) {
        //     return success
        // }
    }



    return { seq: _seq, limit: _limit }
}


/**
 * 獲取消息列表
 * @param chatId
 * @param key
 * @param sequence
 * @param direction
 * @returns
 */
const getList = async (
    chatId: string,
    key: string,
    sequence: number,
    direction: 'up' | 'down',
    firstSeq: number,
    enableLocalUser: boolean = true,
    limit: number = _limit
): Promise<MessageType.Any[]> => {
    // await LocalMessageService.deleteMessageByChatIdIn([chatId])
    const list = await getMessageDetails(chatId, key, sequence, direction, firstSeq, limit)
    const userIds: number[] = []
    list.forEach(d => {
        if (d.senderId !== undefined && d.senderId !== null) {
            userIds.push(d.senderId)
        }
    })
    let userHash: Map<number, IUser>
    if (enableLocalUser) {
        const users = await LocalUserService.findByIds(userIds, false)
        userHash = userService.initUserHash(users)
    } else {
        userHash = await userService.getUserHash(userIds)
    }
    console.log('message list', list);

    return list.map((item) => {
        const user = userHash.get(item?.senderId ?? -1)
        // console.log('user avatar::',user?.avatar);

        return {
            ...item,
            author: chatUiAdapter.userTransfer(user ?? undefined)
        }
    });
}

const getMessageDetails = async (
    chatId: string,
    key: string,
    sequence: number,
    direction: 'up' | 'down',
    firstSeq: number,
    limit: number
): Promise<MessageType.Any[]> => {
    if (chatId === null && chatId === undefined) {
        return []
    }
    // await LocalMessageService.deleteMessageByChatIdIn([chatId])
    const list: MessageType.Any[] = await getListFromDb(chatId, sequence, direction, limit, key)
    const checkResult = checkDiffFromWb(list, sequence, direction, limit, firstSeq)
    console.log('檢查', checkResult);

    if (direction == "up") {
        // 無需請求遠端
        return list
    }

    let data = null

    try {
        data = await messageApi.getMessageList({
            chatId,
            limit: checkResult.limit,
            sequence: checkResult.seq,
            direction,
        })
    } catch (error) {
        console.error(error)
    }

    if (!data || data.items.length <= 0) {
        return list
    }
    const mids: string[] = data.items.map(i => i.msgId)
    const details = await messageApi.getMessageDetail({ chatId, ids: mids })
    const messageHash = new Map<string, MessageDetailItem>();
    details.items.forEach(d => {
        messageHash.set(d.id, d)
    })
    const remoteData: MessageType.Any[] = []
    data.items.forEach(item => {
        const detail = messageHash.get(item.msgId)
        if (detail !== undefined) {
            remoteData.push(chatUiAdapter.messageTypeConvert(detail, key, {}, true))
        }
    })

    if (remoteData.length > 0) {

        console.log('@@@@@@@remote data', remoteData);
        console.log('list data', list);
        if (list.length <= 0) {
            void LocalMessageService.addBatch(chatUiAdapter.messageEntityConverts(remoteData))
            return remoteData
        }

        const localSequence = new Set(list.map(r => r.sequence))
        const saveData = remoteData.filter(r => !localSequence.has(r.sequence))
        s
        LocalMessageService.addBatch(chatUiAdapter.messageEntityConverts(saveData))
        const result = list.concat(saveData).sort((a, b) => { return (b.sequence ?? 0) - (a.sequence ?? 0) })
        console.log('[msg result]', result);

        return result
    }
    return list
};



const removeBatch = async (chatId: string, mids: string[]) => {
    return true;
}

// 清除所有消息
// 發起更新chatItem的事件
const clearMineMessage = async (chatIds: string[]) => {
    await LocalMessageService.delByChatIdIn(chatIds)
    return messageApi.clearMineMessage({ chatIds: chatIds })
}

/**
 * 刪除羣消息
 */
const dropGroupMessage = async (chatIds: string[]) => {
    await LocalMessageService.delByChatIdIn(chatIds)
    return messageApi.clearGroupMessageByChatIds({ chatIds: chatIds })
}

const deleteMessage = async (chatId: string, ids: string[]) => {
    await LocalMessageService.delByIds(ids)
    return messageApi.deleteSelfMsg({ ids: ids })
}

const clearMineMessageAll = async () => {
    await LocalMessageService.deleteAll()
    return messageApi.clearMineMessageAll()
}

export default {
    getList,
    removeBatch,
    send,
    clearMineMessage,
    clearMineMessageAll,
    dropGroupMessage,
    deleteMessage
}
