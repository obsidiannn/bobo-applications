import { View, TouchableOpacity, TextInput, Text } from "react-native";
import { useRef, useContext, forwardRef, useImperativeHandle, useState } from "react";
import { ConfirmModal, ConfirmModalType } from "app/components/ConfirmModal";
import { s } from "app/utils/size";
import { IconFont } from "app/components/IconFont/IconFont";
import { FormLine } from "app/components/FormLine";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { IUser } from "drizzle/schema";
import BaseModal from "app/components/base-modal";
import { UserChatUIContext } from "../UserChat/context";
import { colors } from "app/theme";
import friendService from "app/services/friend.service";
import { IModel } from "@repo/enums";
import { navigate } from "app/navigators";
import { LocalUserService } from "app/services/LocalUserService";
import eventUtil from "app/utils/event-util";
import UserComplainModal from "./UserComplainModal";
import { useTranslation } from "react-i18next";

export interface UserConfigModalType {
    open: (userId: number) => void
}

export default forwardRef((props: {
    friend: IUser | null
}, ref) => {
    const [visible, setVisible] = useState(false)
    const themeColor = useRecoilValue(ColorsState)
    const confirmModalRef = useRef<ConfirmModalType>(null);
    const [editing, setEditing] = useState(false)
    const userContext = useContext(UserChatUIContext)
    const [friendAlias, setFriendAlias] = useState('')
    const userComplainModalRef = useRef<UserConfigModalType>(null)

    const { t } = useTranslation('screens')

    const isEditable = (): boolean => {
        return editing && props.friend !== null && ((props.friend.isFriend ?? 0) > 0)
    }

    const changeAlias = async () => {
        const friendId = props.friend?.id
        if (!friendId || !props.friend) {
            return
        }
        await friendService.updateRemark(friendId, friendAlias)
        if (userContext && userContext.reloadChat) {
            userContext.reloadChat({
                ...userContext.chatItem, chatAlias: friendAlias
            })
        }
        if (userContext) {
            const user = {
                ...props.friend,
                friendAlias: friendAlias
            }
            userContext.reloadUser(user)
        }
    }

    const renderCheckButton = () => {
        if (props.friend) {
            if (editing) {
                return <TouchableOpacity
                    onPress={async () => {
                        await changeAlias()
                        setEditing(false)
                    }}
                    style={{
                        padding: s(3),
                        backgroundColor: themeColor.secondaryBackground,
                        borderRadius: s(8)
                    }}>
                    <IconFont name="checkMark" color={themeColor.text} size={24} />
                </TouchableOpacity>
            }
            return <TouchableOpacity
                onPress={async () => {
                    setEditing(true)
                }}
                style={{
                    padding: s(3),
                    backgroundColor: themeColor.secondaryBackground,
                    borderRadius: s(8)
                }}>
                <IconFont name="edit" color={themeColor.text} size={24} />
            </TouchableOpacity>
        }
        return null
    }
    const onClose = () => {
        setFriendAlias(props.friend?.friendAlias ?? props.friend?.nickName ?? '')
        setVisible(false)
    }

    useImperativeHandle(ref, () => {
        return {
            open: () => {
                setFriendAlias(props.friend?.friendAlias ?? props.friend?.nickName ?? '')
                setVisible(true)
            }
        }
    })

    return <BaseModal visible={visible} onClose={onClose} styles={{ flex: 1, }} >
        <View style={{
            flex: 1,
            backgroundColor: themeColor.background,
            borderTopLeftRadius: s(24),
            borderTopRightRadius: s(24),
            paddingHorizontal: s(16),
        }}>
            <View style={{
                paddingVertical: s(24),
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}>
                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <IconFont name="pencil" color={themeColor.text} size={24} />
                    <TextInput
                        editable={isEditable()}
                        value={friendAlias}
                        style={{
                            color: themeColor.text,
                            width: '80%',
                            textAlign: 'left'
                        }}
                        onChangeText={(v) => {
                            setFriendAlias(v)
                        }}
                    />
                    {
                        renderCheckButton()
                    }
                </View>


                <TouchableOpacity style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: s(12)
                }}>
                    <IconFont name="pencil" color={themeColor.text} size={24} />
                    <Text style={{ color: themeColor.text, }}>{t('userInfo.btn_share_card')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        if (props.friend) {
                            userComplainModalRef.current?.open(props.friend.id)
                        }
                    }}
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: s(12)
                    }}>
                    <IconFont name="pencil" color={themeColor.text} size={24} />
                    <Text style={{ color: themeColor.text, }}>{t('userInfo.btn_complain')}</Text>
                </TouchableOpacity>

            </View>



            <View style={{
                paddingTop: s(36),
                borderTopWidth: s(0.5),
                borderTopColor: themeColor.border,
                paddingVertical: s(12)
            }}>
                <FormLine title={t('userInfo.label_block')}
                    textStyle={{
                        color: colors.palette.red500
                    }}
                    renderLeft={
                        <IconFont name="clearDoc" color={colors.palette.red500} size={24} containerStyle={{ marginRight: s(4) }} />
                    }
                    onPress={() => {
                        confirmModalRef.current?.open({
                            title: t('userInfo.label_block'),
                            content: t('userInfo.label_block_desc'),
                            onSubmit: async () => {
                                console.log(props.friend);

                                if (props.friend?.friendId) {
                                    const isShow = await friendService.block(props.friend?.friendId)
                                    if (isShow !== null && props.friend?.chatId) {
                                        if (props.friend?.chatId) {
                                            eventUtil.sendChatEvent(props.friend.chatId, 'remove')
                                        }
                                        await LocalUserService.setFriends([props.friend.id], IModel.ICommon.ICommonBoolEnum.NO)
                                    }

                                    eventUtil.sendFriendChangeEvent(props.friend.id ?? 0, true)
                                }
                            }
                        })
                    }}
                />
            </View>
            <View style={{
                marginTop: s(36),
            }}>
                <FormLine title={t('userInfo.btn_remove_friend')}
                    textStyle={{
                        color: colors.palette.red500
                    }}
                    renderLeft={
                        <IconFont name="trash" color={colors.palette.red500} size={24} containerStyle={{ marginRight: s(4) }} />
                    }
                    onPress={() => {
                        confirmModalRef.current?.open({
                            title: t('userInfo.btn_remove_friend'),
                            content: t('userInfo.btn_remove_friend_desc'),
                            onSubmit: () => {
                                friendService.remove(props.friend?.friendId ?? 0).then((chatId) => {
                                    if (chatId) {
                                        eventUtil.sendClearMsgEvent(chatId)
                                        // 发送chat remove event 
                                        eventUtil.sendChatEvent(chatId, 'remove')
                                    }
                                    navigate('TabStack')
                                })
                            }
                        })
                    }}
                />
            </View>

        </View>
        <ConfirmModal ref={confirmModalRef} />
        <UserComplainModal ref={userComplainModalRef} />
    </BaseModal>
})
