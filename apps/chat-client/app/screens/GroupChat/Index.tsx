import { StackScreenProps } from "@react-navigation/stack";
import { View } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "app/components/Navbar";
import { TouchableOpacity } from "react-native";
import groupService from "app/services/group.service";
import { ChatDetailItem, GroupDetailItem, GroupMemberItemVO } from "@repo/types";
import ChatPage, { GroupChatPageRef } from './ChatPage';
import { GroupChatUiContext } from "./context";
import { useRecoilValue } from "recoil";
import { IUser } from "drizzle/schema";
import { useTranslation } from 'react-i18next';
import { App } from "types/app";
import { AuthUser } from "app/stores/auth";
import NetInfo from '@react-native-community/netinfo'
import { s } from "app/utils/size";
import GroupInfoModal, { GroupInfoModalType } from './info/Index'
import { ColorsState, ThemeState } from "app/stores/system";
import chatService from "app/services/chat.service";
import { IconFont } from "app/components/IconFont/IconFont";
import { LocalChatService } from "app/services/LocalChatService";
import chatMapper from "app/utils/chat.mapper";
import { LocalUserService } from "app/services/LocalUserService";
import userService from "app/services/user.service";
import { FullScreen } from "app/components/ScreenX";

type Props = StackScreenProps<App.StackParamList, 'GroupChatScreen'>;


export const GroupChatScreen = ({ navigation, route }: Props) => {
    const [chatItem, setChatItem] = useState<ChatDetailItem | null>()
    const [members, setMembers] = useState<GroupMemberItemVO[]>([]);
    const [group, setGroup] = useState<GroupDetailItem | null>()
    const authUser = useRecoilValue<IUser | null>(AuthUser)
    const groupInfoModalRef = useRef<GroupInfoModalType>(null)
    const chatPageRef = useRef<GroupChatPageRef>(null);
    const [selfMember, setSelfMember] = useState<GroupMemberItemVO>()
    const $theme = useRecoilValue(ThemeState)
    const themeColor = useRecoilValue(ColorsState)
    const { t } = useTranslation('screens')

    // TODO: 這裏是根據uid變化而部分請求接口的函數
    const refreshMember = useCallback(async (groupId: number, uids: number[]) => {
        loadMembers(groupId)
    }, []);

    const loadLocalChat = useCallback(async (chatId: string): Promise<ChatDetailItem | null> => {
        const localChat = await LocalChatService.findById(chatId);
        if (localChat) {
            const item = chatMapper.entity2Dto(localChat)
            setChatItem(item)
            return item
        }
        return null
    }, [])

    const loadRemoteChat = useCallback(async (chatId: string): Promise<ChatDetailItem | null> => {
        const remoteChats = await chatService.mineChatList([chatId])
        if (remoteChats.length > 0) {
            setChatItem(remoteChats[0])
            return remoteChats[0]
        }
        return null
    }, [])

    const loadLocalMembers = useCallback(async (groupId: number) => {
        const localMembers = await groupService.getLocalMemberList(groupId)
        if (localMembers.length > 0) {
            const ids = localMembers.map(l => l.uid)
            const users = await LocalUserService.findByIds(ids)
            const memberHash = userService.initUserHash(users)
            const finalMembers = localMembers.map(l => {
                const member = memberHash.get(l.uid)
                if (member) {
                    return { ...l, name: member.nickName ?? '', pubKey: member.pubKey, nameIndex: member.nickNameIdx ?? '' }
                }
                return l
            })
            const self = finalMembers.find(m => m.uid === authUser?.id ?? -1)
            setMembers(finalMembers)
            console.log('-----', self, finalMembers);
            setSelfMember(self)
        }

        return localMembers.length > 0
    }, [])

    const loadMembers = useCallback(async (groupId: number) => {
        groupService.getMemberList(groupId).then((res) => {
            setMembers(res)
            const self = res.find(m => m.uid === authUser?.id ?? -1)
            if (self) {
                setSelfMember(self)
            }
        });
    }, []);

    const loadLocalGroup = useCallback(async (groupId: number) => {
        // await LocalGroupService.removeAll()
        const localGroup = await groupService.queryLocalByIdIn([groupId])
        if (localGroup.has(groupId)) {
            const v = localGroup.get(groupId)
            setGroup(v)
            return v
        }
        return null
    }, [])


    const loadGroup = useCallback(async (groupId: number) => {
        const res = await groupService.getMineList([groupId])
        console.log('羣信息', res);
        if (res && res.length > 0) {
            setGroup(res[0]);
            return res[0]
        }
        return null
    }, [])

    const reloadChat = (chat: ChatDetailItem) => {
        chatService.changeChat(chat).then(() => {
            console.log('[group]reload', chat);
            setChatItem(chat)
        })
        // chatItemRef.current = chat
    }

    const init = useCallback(async () => {

        console.log("初始化group聊天")
        const chatId = route.params.chatId
        if (!globalThis.wallet) {
            navigation.goBack();
            return;
        }

        const netInfo = await NetInfo.fetch()
        let chatResult = await loadLocalChat(chatId)
        let localUser = false
        let localChat = true
        if (!chatResult) {
            if (netInfo.isConnected) {
                const remoteChat = await loadRemoteChat(chatId)
                if (remoteChat) {
                    localChat = false
                }
            }
        } else {
            localUser = await loadLocalMembers(chatResult.sourceId)
            console.log('goon', localUser);
        }
        console.log('chatItem = ', chatResult);
        if (chatResult === null) {
            return
        }
        const groupId = chatResult.sourceId
        let g = await loadLocalGroup(groupId)
        if (!g) {
            g = await loadGroup(groupId)
        } else {
            loadGroup(groupId)
        }
        console.log('loadgroup=', g);

        if (!g) {
            navigation.goBack();
            return
        }

        loadMembers(chatResult.sourceId)
        chatPageRef.current?.init(chatResult, g)

    }, [])
    useEffect(() => {
        // 監聽頁面獲取焦點
        const focusEvent = navigation.addListener('focus', () => {
            init();
        });
        const blurEvent = navigation.addListener('blur', () => {
            chatPageRef.current?.close();
        });
        return () => {
            focusEvent();
            blurEvent();
        }
    }, [navigation])

    return (
        <FullScreen theme={$theme}>
            <View style={{
                width: '100%',
                backgroundColor: 'white',
            }}>
                <Navbar theme={$theme} title={group?.name ?? ''}
                    onLeftPress={() => {
                        if (route.params.fromNotify) {
                            navigation.replace('TabStack')
                        } else {
                            navigation.goBack()
                        }
                    }}
                    renderRight={() => {
                        return <View style={{
                            height: '100%',
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'row',
                        }}>

                            <TouchableOpacity style={{
                                backgroundColor: themeColor.background,
                                borderRadius: s(10),
                                padding: s(2)
                            }}
                                onPress={() => {
                                    groupInfoModalRef.current?.open()
                                }}>
                                <IconFont name="ellipsis" color={themeColor.text} size={28} />
                            </TouchableOpacity>

                        </View>
                    }} />
            </View>

            <GroupChatUiContext.Provider value={{
                members: members,
                group: group,
                chatItem: chatItem,
                selfMember: selfMember,
                reloadMember: loadMembers,
                reloadMemberByUids: refreshMember,
                reloadGroup: loadGroup,
                reloadChat: reloadChat
            }}>
                <ChatPage ref={chatPageRef} />
                <GroupInfoModal ref={groupInfoModalRef} />
            </GroupChatUiContext.Provider>
        </FullScreen>
    )
}
