import { StyleSheet, Switch, View } from "react-native"
import { Button } from "app/components/Button"
import MenuItem from "./components/MenuItem";
import QRcodeModal, { QRcodeModalRef } from "./QrcodeModal";
import ApplyListModal, { ApplyListModalRef } from "./ApplyListModal";
import { ConfirmModal, ConfirmModalType } from "app/components/ConfirmModal";
import GoodManager, { GroupManagerModalRef } from "./GroupManagerModal";
import { forwardRef, useContext, useImperativeHandle, useMemo, useRef, useState } from "react";
import SelectMemberModal, { SelectMemberModalType } from "app/components/SelectMemberModal/Index"
import groupService from "app/services/group.service";
import { GroupChatUiContext } from "../context";
import { useTranslation } from 'react-i18next';
import { IModel } from "@repo/enums";
import toast from "app/utils/toast";
import { s } from "app/utils/size";
import messageSendService from "app/services/message-send.service";
import BaseModal from "app/components/base-modal";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system"
import { colors } from "app/theme";
import { ScrollView } from "react-native-gesture-handler";
import GroupDetailModal, { GroupDetailModalType } from "./GroupDetailModal";

import chatApi from "app/api/chat/chat";
import { IconFont } from "app/components/IconFont/IconFont";
import eventUtil from "app/utils/event-util";
import ChatHistoryModal, { ChatHistoryModalType } from "app/components/ChatHistory/ChatHistoryModal";

export interface GroupInfoModalType {
    open: () => void
}

export default forwardRef((_, ref) => {

    const groupContext = useContext(GroupChatUiContext)
    const [visible, setVisible] = useState(false)
    const themeColor = useRecoilValue(ColorsState)

    const qrcodeModalRef = useRef<QRcodeModalRef>(null);
    const applyListModalRef = useRef<ApplyListModalRef>(null);
    const confirmModalRef = useRef<ConfirmModalType>(null);
    const selectMemberModalRef = useRef<SelectMemberModalType>(null)
    const groupDetailModalRef = useRef<GroupDetailModalType>(null)
    // const groupCategoryModalRef = useRef<GroupCategoryModalRef>(null)
    const groupManagerModalRef = useRef<GroupManagerModalRef>(null)
    const chatHistoryModalRef = useRef<ChatHistoryModalType>(null)

    const { t } = useTranslation('screens')

    const switchState = useMemo(() => {
        console.log('chat change memo', groupContext.chatItem);
        return {
            isTop: groupContext.chatItem?.isTop === IModel.ICommon.ICommonBoolEnum.YES,
            isMute: groupContext.chatItem?.isMute === IModel.ICommon.ICommonBoolEnum.YES,
        }
    }, [
        groupContext.chatItem
    ])

    const changeTop = (val: number) => {
        groupContext.reloadChat({
            ...groupContext.chatItem,
            isTop: val
        })
    }

    const changeMute = (val: number) => {

        groupContext.reloadChat({
            ...groupContext.chatItem,
            isMute: val
        })
    }


    useImperativeHandle(ref, () => ({
        open: () => {
            setVisible(true)
        }
    }));


    return <BaseModal visible={visible} onClose={() => { setVisible(false) }} title="群设置" styles={{
        backgroundColor: themeColor.secondaryBackground,
        paddingTop: s(24),
        flex: 1
    }}>
        <ScrollView style={{
            flex: 1,
            borderTopLeftRadius: s(24),
            borderTopRightRadius: s(24),
            backgroundColor: themeColor.background,
            padding: s(15),
        }}>
            {/* 群信息 */}
            <MenuItem
                label={t('groupChat.title_group_info')}
                labelColor={themeColor.text}
                leftIcon={
                    <IconFont name="userGroup" color={themeColor.text} size={24} />
                }
                rightComponent={
                    <IconFont name="arrowRight" color={themeColor.border} size={16} />
                }
                onPress={() => {
                    groupDetailModalRef.current?.open()
                }}
            />
            <MenuItem
                label={t('groupChat.title_qrcode')}
                labelColor={themeColor.text}
                leftIcon={
                    <IconFont name="qrcode" color={themeColor.text} size={24} />
                }
                rightComponent={
                    <IconFont name="arrowRight" color={themeColor.border} size={16} />
                }
                onPress={() => {
                    qrcodeModalRef.current?.open({
                        group: groupContext.group,
                        count: groupContext.members?.length ?? 0
                    })
                }}
            />
            {
                // 管理员
                (groupContext.selfMember && groupContext.selfMember.role === IModel.IGroup.IGroupMemberRoleEnum.OWNER) ?
                    <MenuItem label={t('groupChat.title_manager')}
                        labelColor={themeColor.text}
                        onPress={() => {
                            if (!groupContext.group) {
                                return;
                            }
                            groupManagerModalRef.current?.open(groupContext.group?.id);
                        }}
                        leftIcon={
                            // <Icon name={$theme === 'dark' ? "userManageDark" : "userManageLight"} />
                            <IconFont name="userSetting" color={themeColor.text} size={24} />
                        }
                        rightComponent={
                            <IconFont name="arrowRight" color={themeColor.border} size={16} />
                        } />
                    : null
            }
            <View style={{
                ...styles.bottomLine,
                borderBottomColor: themeColor.border
            }} />

            <MenuItem label={t('groupChat.title_top')}
                labelColor={themeColor.text}
                leftIcon={
                    <IconFont name="chatTop" color={themeColor.text} size={24} />
                }
                rightComponent={
                    <Switch value={switchState.isTop}
                        thumbColor={'#ffffff'}
                        trackColor={{
                            false: colors.palette.gray400,
                            true: themeColor.primary
                        }}
                        onChange={async (e) => {
                            e.stopPropagation()
                            e.persist()
                            const res = await chatApi.raiseTop({
                                chatId: groupContext.chatItem.id ?? '',
                                top: e.nativeEvent.value
                            })
                            changeTop(res.isTop ? 1 : 0)
                        }} />} />

            <MenuItem label={t('groupChat.title_inhibite')}
                labelColor={themeColor.text}
                leftIcon={
                    <IconFont name="notificationOff" color={themeColor.text} size={24} />
                }
                rightComponent={<Switch value={switchState.isMute}
                    thumbColor={'#ffffff'}
                    trackColor={{
                        false: colors.palette.gray400,
                        true: themeColor.primary
                    }}
                    onChange={async (e) => {
                        e.stopPropagation()
                        e.persist()
                        const res = await chatApi.changeMute({
                            chatId: groupContext.chatItem.id ?? '',
                            mute: e.nativeEvent.value
                        })
                        changeMute(res.isMute)
                    }} />} />

            <MenuItem label={t('groupChat.title_chat_history')}
                labelColor={themeColor.text}
                onPress={() => {
                    if (groupContext.chatItem && groupContext.chatItem.id) {
                        console.log('group', groupContext.chatItem);
                        chatHistoryModalRef.current?.open(groupContext.chatItem.id)
                    }
                }}
                leftIcon={
                    <IconFont name="searchDoc" color={themeColor.text} size={26} />
                } />


            <View style={{
                ...styles.bottomLine,
                borderBottomColor: themeColor.border
            }} />

            {
                (groupContext.selfMember && groupContext.selfMember.role < IModel.IGroup.IGroupMemberRoleEnum.MEMBER) ?
                    <>
                        {/* 申请列表 */}
                        <MenuItem onPress={() => {
                            if (!groupContext.group) {
                                return;
                            }
                            applyListModalRef.current?.open(
                                groupContext.group?.id,
                                groupContext.group?.encKey ?? '',
                                groupContext.group?.encPri ?? '');
                        }} icon={"arrowRight"} label={t('groupChat.title_apply_list')}
                            labelColor={themeColor.text}
                        />
                        {/* 清空群记录 */}
                        <MenuItem label={t('groupChat.title_drop_message')} labelColor="#FB3737"
                            onPress={() => {
                                confirmModalRef.current?.open({
                                    title: t('groupChat.title_drop_message'),
                                    content: t('groupChat.title_drop_message_desc'),
                                    onSubmit: () => {
                                        groupService.clearGroupMessages([groupContext.group.id], [groupContext.group?.chatId]).then(() => {
                                            eventUtil.sendClearMsgEvent(groupContext.group.chatId)
                                        })
                                    }
                                });
                            }}
                            leftIcon={
                                <IconFont name="clearDoc" color={colors.palette.red500} size={24} />
                            }
                        />
                    </>
                    : null
            }

            <MenuItem label={t('groupChat.title_clear_message')} labelColor="#FB3737"
                onPress={() => {
                    confirmModalRef.current?.open({
                        title: t('groupChat.title_clear_message'),
                        content: t('groupChat.title_drop_message_desc'),
                        onSubmit: async () => {
                            groupService.clearGroupMessages([groupContext.group.id], [groupContext.group?.chatId]).then(() => {
                                eventUtil.sendClearMsgEvent(groupContext.group.chatId)
                            })
                        }
                    });
                }}
                leftIcon={
                    <IconFont name="clearDoc" color={colors.palette.red500} size={24} />
                }
            />

            {
                (groupContext.selfMember && groupContext.selfMember.role !== IModel.IGroup.IGroupMemberRoleEnum.OWNER) ?
                    <MenuItem label={t('groupChat.title_exit_group')} labelColor="#FB3737"
                        onPress={() => {
                            confirmModalRef.current?.open({
                                title: t('groupChat.title_clear_message'),
                                content: t('groupChat.title_drop_message_desc'),
                                onSubmit: async () => {
                                    messageSendService.clearMineMessage([groupContext.group.chatId]).then(res => {
                                        eventUtil.sendClearMsgEvent(groupContext.group.chatId)
                                        toast(t('groupChat.option_success'))
                                    })
                                }
                            });
                        }}
                        leftIcon={
                            <IconFont name="trash" color={colors.palette.red500} size={24} />
                        }
                    /> : null
            }

            {
                (groupContext.selfMember && groupContext.selfMember.role === IModel.IGroup.IGroupMemberRoleEnum.OWNER) ?
                    <Button onPress={() => {
                        confirmModalRef.current?.open({
                            title: t('groupChat.title_drop_group'),
                            content: t('groupChat.title_drop_group_desc'),
                            onSubmit: () => {
                                console.log('解散羣聊');
                            }
                        });
                    }} containerStyle={{
                        height: s(50),
                        marginVertical: s(24),
                        borderRadius: s(12)
                    }}
                        label={t('groupChat.title_drop_group')}
                    /> : null
            }

        </ScrollView>


        <QRcodeModal ref={qrcodeModalRef} />
        <ApplyListModal onCheck={(item) => {
            console.log('查看用戶', item);
            // applyInfoModalRef.current?.open(item);
        }} ref={applyListModalRef} />
        <ConfirmModal ref={confirmModalRef} />
        {/* <GoodCategory ref={groupCategoryModalRef} onCheck={() => {
            console.log("打開羣分類");
        }} /> */}

        <GoodManager ref={groupManagerModalRef} onCheck={() => {
            console.log("打開羣管理");
        }} />
        <GroupDetailModal ref={groupDetailModalRef} />
        <ChatHistoryModal ref={chatHistoryModalRef} />
        <SelectMemberModal ref={selectMemberModalRef} />
    </BaseModal>
})


const styles = StyleSheet.create({
    bottomLine: {
        borderBottomWidth: s(0.5),
    }
})
