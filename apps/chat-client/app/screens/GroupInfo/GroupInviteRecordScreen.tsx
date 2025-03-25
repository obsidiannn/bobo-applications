import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import userService from "app/services/user.service";
import friendApplyService from "app/services/friend-apply.service";
import { IServer } from "@repo/types";
import { IUser } from "drizzle/schema";
import { useTranslation } from 'react-i18next';
import { App } from "types/app";
import { useRecoilValue } from "recoil";
import { AuthUser } from "app/stores/auth";
import { s } from "app/utils/size";
import { navigate } from "app/navigators";
import { IModel } from "@repo/enums";
import { Button } from "app/components";
import chatService from "app/services/chat.service";
import eventUtil from "app/utils/event-util";
import { ScreenX } from "app/components/ScreenX";
import { ThemeState } from "app/stores/system";
import { StyleSheet } from "react-native";


type Props = StackScreenProps<App.StackParamList, 'GroupInviteRecordScreen'>;
export const GroupInviteRecordScreen = ({ navigation }: Props) => {
    const [items, setItems] = useState<{
        friendApply: IServer.IFriendApply,
        user: IUser | undefined
    }[]>([]);

    const currentUser = useRecoilValue(AuthUser)
    const { t } = useTranslation('screens')
    const $theme = useRecoilValue(ThemeState)
    const [loading, setLoading] = useState<boolean>(false)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            if (currentUser) {
                setLoading(true)
                const friendApplys = await friendApplyService.getList()
                const userIds = friendApplys.map(f => {
                    return f.userId == currentUser.id ? f.friendId : f.userId
                });
                const tmps = await userService.findByIds(userIds);
                setItems(friendApplys.map(f => {
                    let user: IUser | undefined;
                    if (currentUser.id == f.userId) {
                        user = tmps.find(u => u.id == f.friendId)
                    } else {
                        user = tmps.find(u => u.id == f.userId)
                    }
                    return {
                        friendApply: f,
                        user
                    }
                }));
                setLoading(false)
            }
        });
        return unsubscribe;
    }, [navigation])


    const renderFooter = () => {
        if (loading) {
            return <ActivityIndicator />
        }
        return null
    }

    const renderNavbarRight = () => {
        return <View style={styles.rightContainer}>
            <TouchableOpacity onPress={() => {
                // navigation.navigate('AddFriendModal');
                navigate('AddFriendModal')
            }}>
                <Text style={styles.text}>{t('friend.add_friend_title')}</Text>
            </TouchableOpacity>
        </View>
    }
    return (
        <ScreenX theme={$theme} title={t('friend.title_new_friend')} renderRight={() => renderNavbarRight()}>
            <View style={styles.listContainer}>
                <FlashList
                    data={items}
                    ListFooterComponent={renderFooter}
                    renderItem={({ item, index }) => {
                        console.log("renderItem", item.user)
                        if (!item.user) {
                            return null
                        }
                        if (item.friendApply.status === IModel.IFriendApply.Status.PENDING) {
                            if (item.friendApply.friendId === currentUser?.id) {
                                return <InviteItem
                                    theme={$theme}
                                    user={item.user}
                                    item={item.friendApply}
                                    isLast={index === items.length - 1}
                                    renderRight={() => <Button
                                        containerStyle={{ borderRadius: s(24) }}
                                        label={t('friend.label_add')} onPress={async () => {
                                            try {
                                                const res = await friendApplyService.agree(item.friendApply.id)
                                                if (res && res.chatId) {
                                                    const chats = await chatService.mineChatList([res.chatId])
                                                    if (chats.length > 0) {
                                                        // 发送会话新增event 
                                                        eventUtil.sendChatEvent(res.chatId, 'add', {
                                                            ...chats[0]
                                                        })
                                                        // 发送好友新增event 
                                                        eventUtil.sendFriendChangeEvent(
                                                            res.friendId ?? 0,
                                                            false
                                                        )
                                                    }
                                                }
                                            } catch (e) {

                                            }
                                        }} />}
                                />
                            }
                        }
                        return <InviteItem user={item.user} item={item.friendApply} isLast={index === items.length - 1} />
                    }}
                    estimatedItemSize={s(76)}
                >
                </FlashList>
            </View>
        </ScreenX>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    listContainer: {
        flex: 1,
        width: '100%'
    },
    rightContainer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 15,
        fontWeight: '400',
        color: '#000000'
    }
})
