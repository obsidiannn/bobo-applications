import { ScrollView, StyleSheet, Text, View } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import friendApplyService from "app/services/friend-apply.service";
import { IFriendApplies, IUser } from "drizzle/schema";
import { useRecoilValue } from "recoil";
import { useTranslation } from 'react-i18next';
import { s, verticalScale } from "app/utils/size";
import { Button } from "app/components";
import { AuthUser } from "app/stores/auth";
import { ThemeState } from "app/stores/system";
import { App } from "types/app";
import { IModel } from "@repo/enums";
import InfoCard from "../UserInfo/components/info-card";
import chatService from "app/services/chat.service";
import eventUtil from "app/utils/event-util";
import { ScreenX } from "app/components/ScreenX";
import { LocalFriendApplyService } from "app/services/LocalFriendApplyService";
import userService from "app/services/user.service";

type Props = StackScreenProps<App.StackParamList, 'InviteInfoScreen'>;
export const InviteInfoScreen = ({ navigation, route }: Props) => {
    const [loading, setLoading] = useState(false);
    const currentUser = useRecoilValue(AuthUser)
    const { t } = useTranslation('screens')
    const [info, setInfo] = useState<{
        friendApply: IFriendApplies;
        user: IUser;
        isSelf: boolean;
    }>();
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            if (currentUser) {
                const { id } = route.params;
                const applies = await LocalFriendApplyService.findByIds([id])
                if (applies.length > 0) {
                    const apply = applies[0]
                    const isSelf = currentUser.id === apply.userId
                    let user: IUser | null
                    if (isSelf) {
                        user = await userService.findById(apply.userId)
                    } else {
                        user = await userService.findById(apply.friendId)
                    }
                    if (user) {
                        setInfo({
                            friendApply: apply,
                            user,
                            isSelf
                        })
                    }
                }
            }

        });
        return unsubscribe;
    }, [navigation])
    const $theme = useRecoilValue(ThemeState);
    return (
        <ScreenX theme={$theme} title={t('friend.title_apply_info')}>
            <ScrollView keyboardDismissMode="interactive">
                <View style={{
                    paddingTop: verticalScale(32),
                }}>
                    {info?.user && <InfoCard theme={$theme} user={info.user} />}
                </View>
                {
                    info?.friendApply.remark ? (
                        <View style={styles.infoContainer}>
                            <View style={{
                                borderWidth: 1,
                                borderColor: '#F4F4F4',
                                backgroundColor: '#F8F8F8',
                                width: '100%',
                                borderRadius: verticalScale(16),
                                paddingHorizontal: s(15),
                                paddingVertical: verticalScale(17),
                                marginTop: verticalScale(10),
                            }}>
                                <Text style={{
                                    fontSize: 16,
                                    color: '#333'
                                }}>{info?.friendApply.remark ?? ''}</Text>
                            </View>
                        </View>
                    ) : null
                }

                <View style={styles.actionContainer}>
                    {info?.friendApply.status === IModel.IFriendApply.Status.PENDING && !info.isSelf ? <>
                        <Button fullWidth fullRounded theme={$theme} size="large" onPress={async () => {
                            if (loading) {
                                return
                            };
                            try {
                                const res = await friendApplyService.agree(info.friendApply.id)
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

                            } finally {
                                setLoading(false);
                                navigation.goBack();
                            }

                        }} label={t('friend.btn_apply')} />

                        <Button type="secondary" containerStyle={{
                            marginTop: s(10)
                        }} fullWidth fullRounded size="large" onPress={async () => {
                            if (loading) {
                                return
                            };
                            setLoading(true);
                            friendApplyService.reject(info.friendApply.id, "").then(() => {
                                navigation.goBack();
                            }).finally(() => {
                                navigation.goBack();
                                setLoading(false);
                            });
                        }} label={t('friend.btn_reject')} />
                    </> : null}

                    {info?.friendApply.status === IModel.IFriendApply.Status.PENDING && info.isSelf ?
                        <Button label={t('friend.label_pending')} fullWidth fullRounded disabled size="large"
                        // icon={<IconFont name="restart"}
                        /> : null}
                </View>
            </ScrollView>
        </ScreenX>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    infoContainer: {
        paddingHorizontal: s(15),
        paddingTop: verticalScale(21)
    },
    actionContainer: {
        paddingHorizontal: s(15),
        marginTop: verticalScale(100),
    },
    accpetButton: {
        width: '100%',
        height: verticalScale(50),
        borderRadius: verticalScale(16),
        marginTop: verticalScale(30),
    },
    rejectButton: {
        width: '100%',
        height: verticalScale(50),
        borderRadius: verticalScale(16),
        marginTop: verticalScale(16),
    },
    waitButton: {
        width: '100%',
        height: verticalScale(50),
        borderRadius: verticalScale(16),
        marginTop: verticalScale(30),
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
    }
});
