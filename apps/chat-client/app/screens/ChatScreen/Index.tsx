
import { useEffect, useRef, useState } from "react";
import PagerView from "react-native-pager-view";
import { StyleSheet, View } from "react-native";
import { colors } from "../../theme/colors";
import { Button } from "app/components";
import { s } from "app/utils/size";
import { useTranslation } from "react-i18next";
import { useRecoilState, useRecoilValue } from "recoil";
import { ColorsState, ThemeState } from "app/stores/system";
import { StackScreenProps } from "@react-navigation/stack";
import chatService from "app/services/chat.service";
import { App } from "types/app";
import { ChatsStore } from "app/stores/auth";
import friendService from "app/services/friend.service";
import { IUser } from "drizzle/schema";
import { ChatChangeEvent, ChatDetailItem, FriendChangeEvent, GroupDetailItem } from "@repo/types";
import groupService from "app/services/group.service";
import EventManager from 'app/services/event-manager.service'
import { IModel } from "@repo/enums";
import { $colors } from "app/Colors";
import { ChatListView } from "./ChatListView";
import { GroupListView } from "./GroupListView";
import { FriendListView } from "./FriendListView";
import BannerComponent from "app/components/Banner";

type Props = StackScreenProps<App.StackParamList, 'ChatScreen'>;
export const ChatScreen = ({ navigation }: Props) => {
    const pagerViewRef = useRef<PagerView>(null);
    const [pageIndex, setPageIndex] = useState(0);
    const themeColor = useRecoilValue(ColorsState)
    const [chatStore, setChatsStore] = useRecoilState(ChatsStore)
    const [friends, setFriends] = useState<IUser[]>([])
    const [groups, setGroups] = useState<GroupDetailItem[]>([])
    const { t } = useTranslation('screens')
    const $theme = useRecoilValue(ThemeState);
    const changeTab = (idx: number) => {
        pagerViewRef.current?.setPage(idx);
        dataRefresh(idx)
    }

    useEffect(() => {
        friendService.getOnlineList().then((val) => {
            setFriends(val)
        })
        groupService.getMineList().then(res => {
            setGroups(res)
        })

        const eventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.FRIEND_CHANGE)
        EventManager.addEventListener(eventKey, friendChangeHandle)

        const chatEventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.CHAT_CHANGE)
        EventManager.addEventListener(chatEventKey, chatChangeEventHandler)
    }, [])

    const friendChangeHandle = (event: FriendChangeEvent) => {
        if (event.remove) {
            setFriends((items) => {
                return items.filter(i => i.id !== event.friendId)
            })
        } else {
            friendService.getOnlineList([event.friendId]).then(res => {
                if (res.length > 0) {
                    const friend = res[0]
                    setFriends((items) => {
                        const f = items.find(i => i.id === friend.id)
                        if (!f) {
                            return items.concat(friend)
                        }
                        return items
                    })
                }
            })
        }
    }

    const chatChangeEventHandler = (event: ChatChangeEvent) => {
        if (event.operate === 'add') {
            setChatsStore(items => {
                const has = items.find(i => i.id === event.chatId)
                if (!has && event.item) {
                    return items.concat(event.item)
                }
                return items
            })
        }
        if (event.operate === 'update') {
            setChatsStore(items => {
                return items.map(i => {
                    if (i.id === event.chatId && event.item) {
                        return { ...event.item }
                    }
                    return i
                })
            })
        }
        if (event.operate === 'remove') {
            setChatsStore(items => {
                return items.filter(i => i.id !== event.chatId)
            })
        }
    }


    const dataRefresh = (idx: number) => {
        if (idx === 0) {
            chatService.checkAndRefresh(chatStore).then(res => {
                const oldsMap = new Map<string, ChatDetailItem>()
                if (res.olds.length > 0) {
                    res.olds.forEach(o => {
                        oldsMap.set(o.id, o)
                    })
                }
                setChatsStore((items) => {
                    if (res.news && res.news.length > 0) {
                        const newItems = items.map(t => {
                            const old = oldsMap.get(t.id)
                            return old ? old : t
                        })
                        return res.news.concat(newItems)
                    } else {
                        const newItems = items.map(t => {
                            const old = oldsMap.get(t.id)
                            return old ? old : t
                        })
                        return newItems
                    }
                })
            })
        }
        if (idx === 1) {
            if (groups.length <= 0) {
                groupService.getMineList().then(res => {
                    console.log('groups', res);
                    setGroups(res)
                })
            } else {
                groupService.checkAndRefresh().then(res => {
                    setGroups((items) => {
                        return res.concat(items)
                    })
                })
            }
        }
        if (idx === 2) {
            if (friends && friends.length > 0) {
                friendService.getOnlineList().then((val) => {
                    setFriends(val)
                })
            } else {
                friendService.getOnlineList().then((val) => {
                    setFriends(val)
                })
            }

        }
    }

    const btnTextStyle = (idx: number) => {
        const choosed = pageIndex === idx
        return {
            ...styles.btnTextDefault,
            ...(choosed ? {
                color: themeColor.textChoosed
            } : {
                color: themeColor.text
            })
        }
    }
    const btnStyle = (idx: number) => {
        if (pageIndex === idx) {
            return {
                backgroundColor: themeColor.btnChoosed,
                color: colors.palette.primary,
                borderColor: colors.palette.gray200,
                marginRight: s(8)
            }
        } else {
            return {
                backgroundColor: themeColor.btnDefault,
                color: colors.palette.primary,
                borderColor: colors.palette.gray200,
                marginRight: s(8)
            }
        }
    }

    useEffect(() => {
        const focusEvent = navigation.addListener('focus', () => {
            console.log('chat screen on focus');

            dataRefresh(pageIndex)
        })
        return () => {
            navigation.removeListener('focus', focusEvent)
        }
    }, [navigation])

    return <View style={{
        flex: 1,
        backgroundColor: $colors.slate950,
    }}>
        <View style={[styles.container, {
            backgroundColor: $theme == "dark" ? $colors.slate800 : $colors.gray100,
            borderBottomEndRadius: s(20),
            borderBottomStartRadius: s(20),
            borderBottomWidth: 1,
            paddingTop:s(16),
            overflow: 'hidden',
        }]}>
            <BannerComponent label={t('discover.labelDiscover')} describe="你最喜欢的社区" onPress={() => {
                console.log('press');
                navigation.navigate('DiscoverScreen')
            }} />
            <View style={styles.topContainer} >
                <Button label={t('chat.btn_recent')} onPress={() => changeTab(0)} containerStyle={btnStyle(0)}
                    // style={[styles.tabButton]}
                    textStyle={btnTextStyle(0)}
                />
                <Button label={t('chat.btn_group')} onPress={() => changeTab(1)} containerStyle={btnStyle(1)}
                    // style={[styles.tabButton, btnStyle(1)]}
                    textStyle={btnTextStyle(1)}
                />
                <Button label={t('chat.btn_contract')} onPress={() => changeTab(2)} containerStyle={btnStyle(2)}
                    // style={[styles.tabButton, btnStyle(2)]}
                    textStyle={btnTextStyle(2)}
                />
            </View>
            <PagerView useNext={false} ref={pagerViewRef}
                scrollEnabled={false}
                style={{
                    flex: 1,
                    backgroundColor: $theme == 'dark' ? $colors.slate800 : $colors.slate100,
                }} onPageSelected={(v) => setPageIndex(v.nativeEvent.position)} initialPage={pageIndex}>
                <ChatListView theme={$theme} />
                <GroupListView theme={$theme} groups={groups} />
                <FriendListView theme={$theme} contacts={friends} />
            </PagerView>
        </View>
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        paddingHorizontal: s(18),
    },
    topContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: s(18),
        paddingLeft: 0
    },
    tabButton: {
        fontSize: s(10),
        marginRight: s(18),
        padding: 0,
        paddingVertical: s(8),
        display: 'flex',
        flexDirection: 'row',
        minHeight: 0,
        borderRadius: s(12),
        borderWidth: 0
    },

    btnTextDefault: {
        fontSize: s(14),
        fontWeight: 400,
    },
})
