import { View } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import friendService from 'app/services/friend.service'
import userService from 'app/services/user.service'
import { useEffect, useState } from "react";
import InfoCard from "./components/info-card";
import { IUser } from "drizzle/schema";
import chatService from "app/services/chat.service";
import { useTranslation } from 'react-i18next';
import { App } from "types/app";
import { s, verticalScale } from "app/utils/size";
import { useRecoilValue } from "recoil";
import { ThemeState } from "app/stores/system"
import { Button } from "app/components";
import { ScreenX } from "app/components/ScreenX";

type Props = StackScreenProps<App.StackParamList, 'UserInfoScreen'>;
export const UserInfoScreen = ({ navigation, route }: Props) => {
    const [user, setUser] = useState<IUser>();
    const { t } = useTranslation('screens')
    const $theme = useRecoilValue(ThemeState)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            const userId = route.params.userId;
            const u = await userService.findById(userId);
            if (u) {
                friendService.getReleationList([u.id]).then(res => {
                    const item = res.items.find(item => item.userId === u.id);
                    if (item) {
                        setUser({
                            ...u,
                            isFriend: item.status == true ? 1 : 0,
                            chatId: item.chatId
                        } as IUser)
                    }
                })
            }
        });
        return unsubscribe;
    }, [navigation])


    return (
        <ScreenX theme={$theme} title={t('userInfo.title_user_info')} onLeftPress={() => {
            if (route.params.outside) {
                navigation.replace('TabStack')
            } else {
                navigation.goBack()
            }
        }}>
            {user ?
                <View style={{ flex: 1 }}>
                    <View style={{
                        paddingTop: s(48)
                    }}>
                        <InfoCard theme={$theme} user={user} />
                    </View>
                    <View style={{
                        paddingHorizontal: s(16),
                        alignItems: 'center',
                        marginTop: verticalScale(40),
                    }}>
                        <Button fullRounded fullWidth size="large" onPress={() => {
                            if (!user.isFriend) {
                                navigation.navigate('InviteFriendScreen', {
                                    userId: user.id
                                })
                            } else {
                                chatService.mineChatList([user?.chatId ?? '']).then(res => {
                                    if (res.length > 0) {
                                        console.log(res[0]);
                                        navigation.navigate('UserChatScreen', {
                                            item: res[0]
                                        })
                                    }

                                })
                            }
                        }}
                            label={user?.isFriend ? "进入聊天" : "添加好友"}
                        />
                    </View>
                </View> : null}
        </ScreenX>
    );
};