import { View, TouchableOpacity } from "react-native";
import friendService from 'app/services/friend.service'
import userService from 'app/services/user.service'
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import InfoCard from "./components/info-card";
import { IUser } from "drizzle/schema";
import chatService from "app/services/chat.service";
import { useTranslation } from 'react-i18next';
import { s } from "app/utils/size";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { navigate } from "app/navigators";
import { Button } from "app/components";
import BaseModal from "app/components/base-modal";
import { IconFont } from "app/components/IconFont/IconFont";
import UserConfigModal, { UserConfigModalType } from "./UserConfigModal";


export interface UserInfoModalType {
    open: (userId: number, selfId: number) => void
}

export default forwardRef((props: {
    user?: IUser
}, ref) => {
    const [selfId, setSelfId] = useState<number>(0)
    const [user, setUser] = useState<IUser | null>(null);
    const themeColor = useRecoilValue(ColorsState)
    const [visible, setVisible] = useState<boolean>(false)
    const userConfigModalRef = useRef<UserConfigModalType>(null)
    const { t } = useTranslation('screens')

    const onClose = () => {
        setSelfId(0)
        setUser(null)
        setVisible(false)
    }

    useImperativeHandle(ref, () => ({
        open: async (userId: number, selfId: number) => {
            if (userId <= 0) { return }
            const u = props.user ?? await userService.findById(userId);
            console.log('user=', u);

            setSelfId(selfId)
            if (u && userId !== selfId) {
                friendService.getReleationList([u.id]).then(res => {
                    const item = res.items.find(item => item.userId === u.id);
                    if (item) {
                        setUser({
                            ...u,
                            friendId: item.friendId,
                            isFriend: item.status == true ? 1 : 0,
                            chatId: item.chatId
                        } as IUser)
                    }
                })
            } else {
                setUser(u)
            }
            setVisible(true)
        }
    }));

    const renderTopRight = () => {
        if (user?.id !== selfId && user?.isFriend !== 0) {
            return <TouchableOpacity
                onPress={() => {
                    userConfigModalRef.current?.open(user?.id ?? 0)
                }}
                style={{
                    padding: s(3),
                    backgroundColor: themeColor.background,
                    borderRadius: s(8)
                }}>
                <IconFont name="ellipsis" color={themeColor.text} size={24} />
            </TouchableOpacity>
        }
        return null
    }

    const renderButton = () => {
        if (!user) {
            return null
        }
        if (selfId === user.id) {
            return null
        }

        if (user.isFriend === 0) {
            // 非好友
            return <Button
                fullRounded fullWidth
                size="large"
                onPress={() => {
                    navigate('InviteFriendScreen', {
                        userId: user.id
                    })
                }}
                label={t('userInfo.label_add_friend')}
            />
        } else {
            return <Button
                fullRounded fullWidth
                size="large"
                onPress={() => {
                    if (user.chatId && user.chatId !== '') {
                        navigate('UserChatScreen', {
                            chatId: user.chatId
                        })
                    }
                }}
                label={t('userInfo.label_start_chat')}
            />
        }
    }

    return (
        <BaseModal visible={visible} title="" onClose={onClose} renderRight={
            renderTopRight()
        } styles={{ flex: 1 }}>
            {user ?
                <View style={{
                    flex: 1,
                    backgroundColor: themeColor.background,
                    borderTopLeftRadius: s(24),
                    borderTopRightRadius: s(24),
                }}>
                    <View style={{
                        backgroundColor: themeColor.secondaryBackground,
                        paddingTop: s(36)
                    }}>
                        <InfoCard user={user} />
                    </View>
                    <View style={{
                        paddingHorizontal: s(16),
                    }}>
                        {
                            renderButton()
                        }
                    </View>
                </View> : null}
            <UserConfigModal ref={userConfigModalRef} friend={user} />
        </BaseModal>
    );
})