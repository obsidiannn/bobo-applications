import { View } from "react-native";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import InfoCard from "./components/info-card";
import { IUser } from "drizzle/schema";
import { s } from "app/utils/size";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { Button } from "app/components";
import BaseModal from "app/components/base-modal";
import UserConfigModal, { UserConfigModalType } from "./UserConfigModal";
import friendService from "app/services/friend.service";
import chatService from "app/services/chat.service";
import eventUtil from "app/utils/event-util";


export interface UserBlockModalType {
    open: (user: IUser) => void
}

export default forwardRef((_, ref) => {
    const [user, setUser] = useState<IUser | null>(null);
    const themeColor = useRecoilValue(ColorsState)
    const [visible, setVisible] = useState<boolean>(false)
    const userConfigModalRef = useRef<UserConfigModalType>(null)

    const onClose = () => {
        setUser(null)
        setVisible(false)
    }

    useImperativeHandle(ref, () => ({
        open: async (user: IUser) => {
            setUser(user)
            setVisible(true)
        }
    }));


    return (
        <BaseModal visible={visible} title="" onClose={onClose} styles={{ flex: 1 }}>
            {user ?
                <View style={{ flex: 1, backgroundColor: themeColor.background }}>
                    <View style={{
                        backgroundColor: themeColor.secondaryBackground,
                        paddingTop: s(36)
                    }}>
                        <InfoCard user={user} />
                    </View>
                    <View style={{
                        paddingHorizontal: s(16),
                    }}>
                        <Button
                            fullRounded fullWidth
                            size="large"
                            onPress={async () => {

                                if (user && user.friendId) {
                                    console.log(user);
                                    const chatId = await friendService.blockOut(user.friendId)
                                    if (chatId) {
                                        const chat = await chatService.mineChatList([chatId])
                                        eventUtil.sendChatEvent(chatId, 'add', chat[0])
                                    }
                                    eventUtil.sendFriendChangeEvent(user.id ?? 0, false)
                                    onClose()
                                }
                            }}
                            label={'移出黑名单'}
                        />
                    </View>
                </View> : null}
            <UserConfigModal ref={userConfigModalRef} friend={user} />
        </BaseModal>
    );
})

// const styles = StyleSheet.create({

// });
