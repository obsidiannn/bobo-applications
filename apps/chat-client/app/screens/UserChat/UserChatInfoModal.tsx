import { StyleSheet, View, Switch } from "react-native";
import { useRef, useContext, useMemo, forwardRef, useImperativeHandle } from "react";
import { ConfirmModal, ConfirmModalType } from "app/components/ConfirmModal";
import messageSenderService from "app/services/message-send.service";
import ActionItem from "./action-item";
import { IModel } from "@repo/enums";
import chatApi from "app/api/chat/chat";
import { s } from "app/utils/size";
import { colors } from "app/theme";
import toast from "app/utils/toast";
import { useTranslation } from "react-i18next";
import { useRecoilValue } from "recoil";
import { ColorsState, ThemeState } from "app/stores/system";
import { ScreenModal, ScreenModalType } from "app/components/ScreenModal";
import { UserChatUIContext } from "./context";
import { IconFont } from "app/components/IconFont/IconFont";
import UserInfoModal, { UserInfoModalType } from "../UserInfo/UserInfoModal";
import { AuthUser } from "app/stores/auth";
import eventUtil from "app/utils/event-util";
import ChatHistoryModal, { ChatHistoryModalType } from "app/components/ChatHistory/ChatHistoryModal";

export interface UserChatInfoModalRef {
    open: () => void
}

export default forwardRef((_, ref) => {
    console.log('start');
    const screenModalRef = useRef<ScreenModalType>(null)
    const userInfoModalRef = useRef<UserInfoModalType>(null)
    const chatHistoryModalRef = useRef<ChatHistoryModalType>(null)
    const author = useRecoilValue(AuthUser)
    const userContext = useContext(UserChatUIContext)
    const { t } = useTranslation('screens')
    const themeColor = useRecoilValue(ColorsState)
    const confirmModalRef = useRef<ConfirmModalType>(null);
    const $theme = useRecoilValue(ThemeState)

    const chat = useMemo(() => {
        return userContext.chatItem
    }, [userContext.chatItem])
    const changeTop = (val: number) => {
        userContext.reloadChat({
            ...chat, isTop: val
        })

    }


    const changeMute = (val: number) => {
        userContext.reloadChat({
            ...chat, isMute: val
        })
    }

    useImperativeHandle(ref, () => {
        return {
            open: () => {
                screenModalRef.current?.open()
            }
        }
    })

    return <ScreenModal ref={screenModalRef} theme={$theme}>

        <View style={{
            flex: 1,
            paddingHorizontal: s(16),
            backgroundColor: themeColor.background,
            borderTopLeftRadius: s(24),
            borderTopRightRadius: s(24)
        }}>
            <View style={{
                marginTop: s(15),
            }}>
                <ActionItem title={t('chat.btn_user_profile')}
                    textColor={themeColor.text}
                    onPress={() => {
                        userInfoModalRef.current?.open(userContext.chatItem.sourceId, author?.id ?? 0)
                    }}
                    leftComponent={
                        <IconFont name="userProfile" color={themeColor.text} size={26} />
                    }
                    rightComponent={
                        <IconFont name="arrowRight" color={themeColor.border} size={16} />
                    } />
            </View>

            <View style={{
                marginTop: s(15),
            }}>
                <ActionItem title={t('chat.title_inhibite')}
                    textColor={themeColor.text}
                    leftComponent={
                        <IconFont name="notificationOff" color={themeColor.text} size={26} />
                    }
                    rightComponent={<Switch
                        thumbColor={colors.palette.neutral100}
                        trackColor={{
                            true: themeColor.primary,
                            false: themeColor.border
                        }}
                        value={
                            chat?.isMute === IModel.ICommon.ICommonBoolEnum.YES
                        }
                        onChange={async (e) => {
                            e.stopPropagation()
                            e.persist()
                            const res = await chatApi.changeMute({
                                chatId: chat.id ?? '',
                                mute: e.nativeEvent.value
                            })
                            changeMute(res.isMute)
                        }} />} />
            </View>


            <View style={{
                marginTop: s(15),
            }}>
                <ActionItem title={t('chat.btn_chat_top')}
                    textColor={themeColor.text}
                    leftComponent={
                        <IconFont name="chatTop" color={themeColor.text} size={26} />
                    }
                    rightComponent={<Switch
                        thumbColor={colors.palette.neutral100}
                        trackColor={{
                            true: themeColor.primary,
                            false: themeColor.border
                        }}
                        value={
                            chat?.isTop === IModel.ICommon.ICommonBoolEnum.YES
                        }
                        onChange={async (e) => {
                            e.stopPropagation()
                            e.persist()
                            const res = await chatApi.raiseTop({
                                chatId: chat.id ?? '',
                                top: e.nativeEvent.value
                            })
                            changeTop(res.isTop)
                        }} />} />
            </View>

            <View style={{
                marginTop: s(15),
            }}>
                <ActionItem title={t('chat.title_chat_history')}
                    textColor={themeColor.text}
                    onPress={() => {
                        if (chat && chat.id) {
                            chatHistoryModalRef.current?.open(chat.id)
                        }
                    }}
                    leftComponent={
                        <IconFont name="searchDoc" color={themeColor.text} size={26} />
                    }
                    rightComponent={<IconFont name="arrowRight" color={themeColor.border} size={16} />} />
            </View>

            <View style={{
                marginTop: s(15),
                paddingTop: s(15),
                borderTopColor: colors.palette.gray200,
                borderTopWidth: s(0.5)
            }}>
                <ActionItem onPress={() => {
                    confirmModalRef.current?.open({
                        title: t('chat.btn_message_delete'),
                        content: t('chat.btn_message_delete_desc'),
                        onSubmit: async () => {
                            messageSenderService.clearMineMessage([chat?.id ?? ""]).then(() => {
                                eventUtil.sendClearMsgEvent(chat.id)
                                toast(t('chat.success_cleaned'))
                            })
                        }
                    })
                }} title={t('chat.btn_message_delete')}
                    textColor={colors.palette.red500}
                    leftComponent={
                        <IconFont name="circleClose" color={colors.palette.red500} size={26} />
                    }
                    rightComponent={<IconFont name="arrowRight" color={themeColor.border} size={16} />} />
            </View>
        </View>
        <ConfirmModal ref={confirmModalRef} />
        <UserInfoModal ref={userInfoModalRef} user={userContext.friend ?? undefined} />
        <ChatHistoryModal ref={chatHistoryModalRef} />
    </ScreenModal>
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
});
