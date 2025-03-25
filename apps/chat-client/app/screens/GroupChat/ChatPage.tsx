import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import tools from './tools';
import {
    ChatDetailItem, DeleteMessageEvent,
    SocketMessageEvent,
    GroupDetailItem
} from "@repo/types";
import EventManager from 'app/services/event-manager.service'
import { useTranslation } from 'react-i18next';
import { Chat, ChatUiToolsKitProps, MessageType, darkTheme, lightTheme } from "app/components/chat-ui";
import chatUiAdapter from "app/utils/chat-ui.adapter";
import { useRecoilValue } from "recoil";
import messageSendService, { MessageSendService } from "app/services/message-send.service";
import { PreviewData } from "@flyerhq/react-native-link-preview";
import VideoPlayModal, { IVideoPreviewModal } from "app/components/VideoModal"
import FilePreviewModal, { ChatUIFileModalRef } from "app/components/FileModal"
import LongPressModal, { LongPressModalType } from "app/components/LongPressModal";
import LoadingModal, { LoadingModalType } from 'app/components/loading-modal';

import { IModel } from "@repo/enums";
import { AuthUser } from "app/stores/auth";
import quickCrypto from "app/utils/quick-crypto";
import generateUtil from "app/utils/generateUtil";
import { GestureResponderEvent, Platform, TouchableOpacity, Text, View } from "react-native"
import { ThemeState } from "app/stores/system";
import chatService from "app/services/chat.service";
import eventUtil from "app/utils/event-util";
import { LocalMessageService } from "app/services/LocalMessageService";
import { CloudMessageService } from "app/services/MessageService";
import NetInfo from "@react-native-community/netinfo";
import { LocalChatService } from "app/services/LocalChatService";
import { LocalUserService } from "app/services/LocalUserService";
import userService from "app/services/user.service";
import SelectMemberModal, { SelectMemberModalType, SelectMemberOption } from "app/components/SelectMemberModal/Index"
import friendService from "app/services/friend.service"
import Navbar from "app/components/Navbar"
import { colors } from "app/theme"
import collectMapper from "app/utils/collect.mapper"
import { LocalCollectService } from "app/services/LocalCollectService"
import toast from "app/utils/toast"
import { LocalCollectDetailService } from "app/services/LocalCollectDetailService"
import UserInfoModal, { UserInfoModalType } from "../UserInfo/UserInfoModal";

export interface GroupChatPageRef {
    init: (
        chatItem: ChatDetailItem,
        group: GroupDetailItem,
    ) => void;
    close: () => void;
}
export default forwardRef((_, ref) => {
    const [messages, setMessages] = useState<MessageType.Any[]>([])
    const chatItemRef = useRef<ChatDetailItem>()
    const author = useRecoilValue(AuthUser)
    const sharedSecretRef = useRef<string>('');

    const firstSeq = useRef<number>(0);
    const lastSeq = useRef<number>(0);
    const remoteMessageLoading = useRef<boolean>(false)
    const remoteLastSeq = useRef<number>(0)

    const [multi, setMulti] = useState<boolean>(false)
    const [replyMsg, setReplyMsg] = useState<MessageType.Any | null>(null)
    const [checkedIdList, setCheckedIdList] = useState<string[]>([])

    const encVideoPreviewRef = useRef<IVideoPreviewModal>();
    const longPressModalRef = useRef<LongPressModalType>();
    const loadingModalRef = useRef<LoadingModalType>(null)
    const fileModalRef = useRef<ChatUIFileModalRef>()
    const selectMemberModalRef = useRef<SelectMemberModalType>(null);

    const userInfoModalRef = useRef<UserInfoModalType>(null)

    const theme = useRecoilValue(ThemeState)
    const { t } = useTranslation('screen-group-chat')


    const addMessage = (message: MessageType.Any) => {
        if (replyMsg) {
            message.metadata = {
                ...message.metadata,
                replyId: replyMsg.id,
                replyAuthorName: replyMsg.author.firstName ?? ''
            }
        }
        const { sequence = 0 } = message
        if (sequence > lastSeq.current) {
            lastSeq.current = sequence
        }
        console.log('------add message', sequence);
        setMessages([message, ...messages])
        messageSendService.send(chatItemRef.current?.id ?? '', sharedSecretRef.current, message)
            .then((res) => {
                updateMessage(res)
                setReplyMsg(null)
            })
    }

    const updateMessage = async (message: MessageType.Any) => {
        if (message.sequence > lastSeq.current) {
            lastSeq.current = message.sequence
        }

        if (chatItemRef.current) {
            if (!message.roomId) {
                message.roomId = chatItemRef.current.id
            }
            if (message.metadata?.uidType) {
                message.metadata.uidType = 1
            }
            if (message.senderId) {
                message.senderId = author?.id ?? 0;
            }
            // 如果是自己发出的消息，如果有引用，肯定已经加载到message list里面了
            if (message.metadata?.replyId) {
                const replyMsg = messages.find(m => m.id === message.metadata?.replyId)
                if (replyMsg) {
                    message.reply = replyMsg
                }
            }
            await LocalMessageService.addBatch(chatUiAdapter.messageEntityConverts([message]))
            LocalChatService.updateSequence(chatItemRef.current?.id, message.sequence)
        }
        setMessages(items => {
            for (let index = items.length - 1; index >= 0; index--) {
                const item = items[index]
                if (item.id === message.id) {
                    items[index] = { ...message }
                    break
                }
            }
            return items;
        })
    }

    // 加载历史数据 历史数据只会出现在本地
    const loadHistoryMessages = useCallback(async (chatId: string, seq: number) => {
        let init = false
        if (seq < 0) {
            init = true
            seq = Number.MAX_VALUE
        }
        const items = await LocalMessageService.getList(chatId, seq, 20);
        console.log('【本地消息】', items);

        if (items.length > 0) {
            const userIds = items.map(i => i.uid)
            const users = await LocalUserService.findByIds(userIds)
            const userHash = userService.initUserHash(users)
            const tmps = items.map((e) => {
                const item = chatUiAdapter.messageEntity2Dto(e)
                const user = userHash.get(item?.senderId ?? -1)
                if (user) {
                    return {
                        ...item,
                        author: chatUiAdapter.userTransfer(user)
                    }
                }
                return item
            });
            const finalMessages: MessageType.Any[] = await loadReply(tmps)
            setMessages(olds => {
                let result = []
                if (olds.length > 0) {
                    const existIds = olds.map(o => o.id)
                    result = olds.concat(finalMessages.filter(t => {
                        return !existIds.includes(t.id)
                    }))
                } else {
                    result = finalMessages
                }
                if (init) {
                    lastSeq.current = result[0].sequence
                }
                firstSeq.current = result[result.length - 1].sequence
                return result;
            })
        }
    }, [])

    const loadReply = async (list: MessageType.Any[]): Promise<MessageType.Any[]> => {
        const replyIds: string[] = []
        list.forEach(i => {
            if (i.metadata?.replyId) {
                replyIds.push(i.metadata.replyId)
            }
        })
        if (replyIds.length > 0) {
            const replys = await LocalMessageService.findByIds(replyIds)
            const replyMap = new Map<string, MessageType.Any>()
            replys.forEach(r => {
                replyMap.set(r.id, chatUiAdapter.messageEntity2Dto(r))
            })
            return list.map(i => {
                if (i.metadata?.replyId) {
                    const reply = replyMap.get(i.metadata.replyId)
                    return {
                        ...i, reply
                    } as MessageType.Any
                }
                return i
            })
        }
        return list
    }

    // 获取最新数据 也是从seq开始获取最近的 20 条
    const loadRemoteMessages = useCallback(async (chatId: string, seq: number) => {
        if (remoteMessageLoading.current) {
            return;
        }
        remoteMessageLoading.current = true;
        try {
            const items = await CloudMessageService.getRemoteList(chatId, sharedSecretRef.current, seq, 20);
            if (items.length > 0) {
                setMessages(olds => {
                    let result = []
                    if (olds.length > 0) {
                        const exsitIds = olds.map(o => o.id)
                        result = items.filter(t => !exsitIds.includes(t.id)).concat(olds)
                    } else {
                        result = items
                    }
                    firstSeq.current = result[result.length - 1].sequence
                    lastSeq.current = result[0].sequence
                    return result;
                })
            }

            if (remoteLastSeq.current > lastSeq.current) {
                loadRemoteMessages(chatId, lastSeq.current);
            }
        } finally {
            remoteMessageLoading.current = false;
        }

    }, [])

    const init = useCallback(async (
        chatItem: ChatDetailItem,
        group: GroupDetailItem
    ) => {
        if (chatItem === null || chatItem === undefined) {
            return
        }
        if (author === undefined) {
            console.error('self member error')
            return;
        }
        const myWallet = globalThis.wallet
        if (myWallet === null || myWallet === undefined) {
            return
        }
        console.log('會話id conversationIdRef', chatItem.id)
        console.log('author=', author);
        const chatId = chatItem.id
        let sharedSecret: string
        if (group?.encPri !== '' && group?.encPri !== null && group?.encPri !== undefined) {
            console.log('[groupa]', group);

            const key = myWallet.computeSharedSecret(group.encPri)
            const decode = quickCrypto.De(key, Buffer.from(group.encKey, 'hex'))
            sharedSecret = Buffer.from(decode).toString('utf8')
        } else {
            console.log('[groupb]', group);
            const key = myWallet.computeSharedSecret(myWallet.getPublicKey())
            const decode = quickCrypto.De(key, Buffer.from(group.encKey, 'hex'))
            sharedSecret = Buffer.from(decode).toString('utf8')
        }

        console.log('sharedSecret==', sharedSecret);
        chatItemRef.current = chatItem
        sharedSecretRef.current = sharedSecret

        await loadHistoryMessages(chatItem.id, -1)

        // join room event
        eventUtil.sendSocketJoinEvent(chatItem.id)

        // 註冊 message 接收
        const _eventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.MESSAGE, chatItem.id)
        EventManager.addEventSingleListener(_eventKey, handleEvent)

        NetInfo.fetch().then(async (state) => {
            if (state.isConnected) {
                chatService.querySequence([chatId]).then(res => {
                    if (res.items.length > 0) {
                        remoteLastSeq.current = res.items[0].lastSequence
                        loadRemoteMessages(chatId, lastSeq.current);
                    }
                })
            }
        })

    }, []);

    const close = useCallback(() => {
        console.log('销毁');
        const _eventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.MESSAGE, chatItemRef.current?.id ?? '')
        EventManager.removeListener(_eventKey, handleEvent)
        setMessages([]);
        firstSeq.current = 0;
        lastSeq.current = 0;
    }, []);


    useImperativeHandle(ref, () => ({
        init,
        close,
    }));

    const handleEvent = (e: any) => {
        const { type } = e
        console.log(author?.nickName, '收到消息', e);
        console.log('[lastSeq]', lastSeq.current, remoteLastSeq.current);


        if (type === IModel.IClient.SocketTypeEnum.MESSAGE) {
            const _eventItem = e as SocketMessageEvent
            if (lastSeq.current < _eventItem.sequence && author?.id !== _eventItem.senderId && remoteLastSeq.current < _eventItem.sequence) {
                console.log("socket 监听到新的消息了", Platform.OS)
                remoteLastSeq.current = _eventItem.sequence;
                console.log(remoteMessageLoading.current, "当前远程请求状态")
                if (!remoteMessageLoading.current) {
                    loadRemoteMessages(chatItemRef.current?.id ?? '', lastSeq.current)
                }
            }
        }
        if (type === IModel.IClient.SocketTypeEnum.CLEAR_ALL_MESSAGE) {
            setMessages([])
        }
        if (type === IModel.IClient.SocketTypeEnum.DELETE_MESSAGE) {
            const _eventItem = e as DeleteMessageEvent
            if (_eventItem.msgIds && _eventItem.msgIds.length > 0) {
                setMessages((items) => {
                    return items.filter(i => !_eventItem.msgIds.includes(i.id))
                })
            }
        }
    }

    /**
     * 发送消息
     * @param key
     */
    const handleAttachmentPress = async (key: string) => {
        if (!author) return
        switch (key) {
            case 'camera':
                MessageSendService.captureCamera(author).then(addMessage)
                break
            case 'video':
                loadingModalRef.current?.open(t('common.loading'))
                MessageSendService.captureVideo(author).then(addMessage)
                    .finally(() => {
                        loadingModalRef.current?.close()
                    })
                break
            case 'albums':
                MessageSendService.imageSelection(author).then(addMessage)
                break
            case 'file':
                MessageSendService.fileSelection(author).then(addMessage)
                break
            case 'userCard':
                const users = await friendService.getOnlineList();
                const options: SelectMemberOption[] = users
                    .map((item) => {
                        return {
                            id: item.id,
                            icon: item.avatar ?? "",
                            title: item.nickName ?? "",
                            name: item.nickName ?? "",
                            name_index: item.nickNameIdx ?? "",
                            status: false,
                            disabled: false,
                            pubKey: item.pubKey
                        } as SelectMemberOption
                    });
                selectMemberModalRef.current?.open({
                    title: '選擇好友',
                    options,
                    max: 1,
                    callback: async (ops: SelectMemberOption[]) => {
                        if (ops.length > 0) {
                            const f = users.find(u => u.id === ops[0].id)
                            if (f) {
                                const userCardMsg = MessageSendService.userCardSelect(author, f)
                                addMessage(userCardMsg)
                            }
                        }
                    }
                });
                break
            default: break
        }
    }


    const handleMessagePress = async (message: MessageType.Any) => {
        if (message.type === 'file') {
            try {
                fileModalRef.current?.open({
                    encKey: sharedSecretRef.current ?? '',
                    file: message
                })
            } catch { }
        }
        if (message.type === 'video') {
            encVideoPreviewRef.current?.open({
                encKey: sharedSecretRef.current,
                video: message
            })
        }
        if (message.type === 'userCard') {
            const userCardMsg = message as MessageType.UserCard
            userInfoModalRef.current?.open(Number(userCardMsg.userId), author?.id ?? 0)
        }
    }

    const handlePreviewDataFetched = ({
        message,
        previewData,
    }: {
        message: MessageType.Text
        previewData: PreviewData
    }) => {
        setMessages(
            messages.map<MessageType.Any>((m) =>
                m.id === message.id ? { ...m, previewData } : m
            )
        )
    }

    const handleSendPress = (message: MessageType.PartialText) => {
        const textMessage: MessageType.Text = {
            author: chatUiAdapter.userTransfer(author),
            createdAt: Date.now(),
            id: generateUtil.generateId(),
            text: message.text,
            type: 'text',
            senderId: author?.id ?? 0,
            sequence: -1
        }
        addMessage(textMessage)
    }

    const messageDelete = (msgId: string) => {
        if (chatItemRef.current) {
            messageSendService.deleteMessage(chatItemRef.current.id, [msgId])
                .then(() => {
                    setMessages((items) => {
                        return items.filter(i => i.id !== msgId)
                    })
                })
        }
    }

    /**
     * 长按效果处理 打开悬浮窗
     * @param pressed true 开启，false 关闭
     * @param msgId
     */
    const longPressHandle = (pressed: boolean, msgId: string) => {
        if (pressed) {
            setCheckedIdList([msgId])
        } else {
            setCheckedIdList([])
        }
    }

    /**
   * todo
   * @param m 长按消息
   */
    const handleLongPress = (m: MessageType.Any, e: GestureResponderEvent) => {
        longPressModalRef.current?.open({
            message: m,
            e
        })
    }

    const renderMultiNavbar = () => {
        if (multi) {
            return <Navbar style={{
                position: 'absolute',
            }} renderLeft={() => <TouchableOpacity
                onPress={() => {
                    setMulti(false)
                    setCheckedIdList([])
                }}
            >
                <Text style={{
                    color: colors.palette.primary
                }}>取消</Text>
            </TouchableOpacity>
            } />
        }
        return null
    }


    // 收藏聊天记录
    const onCollectPress = async () => {
        if (checkedIdList.length > 0) {
            const msgs = messages.filter(m => {
                return checkedIdList.includes(m.id)
            })
            if (msgs.length > 0) {
                if (msgs.length === 1) {
                    const collect = collectMapper.convertEntity(msgs[0])
                    const entity = await LocalCollectService.addSingle(collect)
                    if (entity) {
                        setCheckedIdList([])
                        setMulti(false)
                        setReplyMsg(null)
                        toast('操作成功')
                    }
                } else {
                    const _chatItem = chatItemRef.current
                    if (_chatItem) {
                        const collect = collectMapper.convertRecordsEntity(msgs, _chatItem)
                        const entity = await LocalCollectService.addSingle(collect)
                        if (entity) {
                            const details = collectMapper.convertCollectDetailEntity(msgs, entity)
                            const result = await LocalCollectDetailService.addBatch(details)
                            if (result.length > 0) {
                                setCheckedIdList([])
                                setMulti(false)
                                setReplyMsg(null)
                                toast('操作成功')
                            }
                        }
                    }
                }
            }
        }
    }

    return (
        <>
            {renderMultiNavbar()}
            <Chat
                enableMultiSelect={multi}
                tools={tools as ChatUiToolsKitProps[]}
                messages={messages}
                onEndReached={async () => {
                    loadHistoryMessages(chatItemRef.current?.id ?? '', firstSeq.current)
                }}
                showUserAvatars
                onMessageLongPress={handleLongPress}
                usePreviewData={false}
                theme={theme === 'dark' ? darkTheme : lightTheme}
                onAttachmentPress={handleAttachmentPress}
                onMessagePress={handleMessagePress}
                onPreviewDataFetched={handlePreviewDataFetched}
                onSendPress={handleSendPress}
                user={chatUiAdapter.userTransfer(author)}
                checkedIdList={checkedIdList}
                onChecked={(id, v) => {
                    if (v) {
                        setCheckedIdList(ids => {
                            return ids.filter(i => i !== id).concat(id)
                        })
                    } else {
                        setCheckedIdList(ids => {
                            return ids.filter(i => i !== id)
                        })
                    }
                }}
                reply={replyMsg}
                onCloseReply={() => {
                    setReplyMsg(null)
                }}
                onCollectPress={onCollectPress}
            />
            <VideoPlayModal ref={encVideoPreviewRef} />
            <FilePreviewModal ref={fileModalRef} />
            <LoadingModal ref={loadingModalRef} />
            <LongPressModal ref={longPressModalRef}
                onCollect={(msg) => {
                    LocalCollectService.addSingle(collectMapper.convertEntity(msg))
                        .then((entity) => {
                            if (entity) {
                                setCheckedIdList([])
                                setMulti(false)
                                setReplyMsg(null)
                                toast('操作成功')
                            }
                        })
                }}
                onReply={(_m) => {
                    setReplyMsg(_m)
                }}
                onMulti={(id, val) => {
                    if (val) {
                        if (id !== '') {
                            setCheckedIdList([id])
                            setReplyMsg(null)
                        }
                    } else {
                        setCheckedIdList([])
                        setReplyMsg(null)
                    }
                    setMulti(val)
                }}
                onDelete={messageDelete}
                onClose={(msgId: string) => {
                    longPressHandle(false, msgId)
                }} />

            <SelectMemberModal ref={selectMemberModalRef} />
            <UserInfoModal ref={userInfoModalRef} />
        </>
    )
});
