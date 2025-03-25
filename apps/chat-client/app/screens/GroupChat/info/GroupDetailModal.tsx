import { forwardRef, useCallback, useContext, useImperativeHandle, useRef, useState } from "react";

import BaseModal from "app/components/base-modal";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { s } from "app/utils/size";
import { useRecoilValue } from "recoil";
import { ColorsState, ThemeState } from "app/stores/system"
import AvatarX from "app/components/AvatarX";
import { GroupChatUiContext } from "../context";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import { colors } from "app/theme";
import { IModel } from "@repo/enums";
import { IconFont } from "app/components/IconFont/IconFont";
import { isOnline } from "app/utils/account";
import { Button } from "app/components";
import groupApi from "app/api/group/group";
import GroupMemberManageModal, { GroupMemberManageModalType } from "./GroupMemberManageModal";
import SelectMemberModal, { SelectMemberModalType, SelectMemberOption } from "app/components/SelectMemberModal/Index"
import quickCrypto from "app/utils/quick-crypto";
import groupService from "app/services/group.service";
import friendService from "app/services/friend.service";
import AvatarUpload from "app/components/AvatarUpload";
import fileService from "app/services/file.service";
import strUtil from "app/utils/str-util";

export interface GroupDetailModalType {
    open: () => void
}

export default forwardRef((_, ref) => {
    const [visible, setVisible] = useState(false);
    const themeColor = useRecoilValue(ColorsState)
    const groupContext = useContext(GroupChatUiContext)
    const [editing, setEditing] = useState(false)
    const [groupName, setGroupName] = useState(groupContext.group.name)
    const groupMemberManageRef = useRef<GroupMemberManageModalType>()
    const { t } = useTranslation('screens')
    const selectMemberModalRef = useRef<SelectMemberModalType>(null)
    const onClose = () => {
        setVisible(false)
    }
    useImperativeHandle(ref, () => ({
        open: () => {
            setVisible(true);
        }
    }));

    const changeName = async () => {
        if (editing) {
            groupApi.changeName({ id: groupContext.group.id, name: groupName }).then(res => {
                groupContext.reloadGroup(groupContext.group.id)
                setEditing(false)
            })
        } else {
            setEditing(true)
        }
    }


    const batchInviteJoin = useCallback(async (users: {
        id: number;
        pubKey: string;
    }[]) => {

        const myWallet = globalThis.wallet
        if (!myWallet) {
            return
        }
        const group = groupContext.group
        if (!group) {
            return
        }
        let sharedSecret: string
        if (group?.encPri !== '' && group?.encPri !== null && group?.encPri !== undefined) {
            console.log('[groupa]', group);

            const key = myWallet.computeSharedSecret(group.encPri)
            const decode = quickCrypto.De(key, Buffer.from(group.encKey, 'hex'))
            sharedSecret = Buffer.from(decode).toString('utf8')
        } else {
            console.log('[groupb]', group);
            const key = myWallet.computeSharedSecret(myWallet.getPublicKey())
            const decode = quickCrypto.De(key, Buffer.from(group.encKey, 'hex'))
            sharedSecret = Buffer.from(decode).toString('utf8')
        }
        console.log('sharedSecret==', sharedSecret);
        const groupInfo = {
            id: groupContext.group?.id ?? -1,
            groupPassword: sharedSecret
        }

        groupService.invite(users, groupInfo).then(() => {
            groupContext.reloadMember(groupInfo.id)
        })
    }, []);




    return <BaseModal visible={visible} onClose={onClose} title={""} animationType="slide" styles={{
        flex: 1,
        backgroundColor: themeColor.secondaryBackground,
        paddingTop: s(36),
    }}
        renderRight={
            <TouchableOpacity style={{ backgroundColor: themeColor.background, padding: s(4), borderRadius: s(8) }}
            >
                <IconFont name="share" color={themeColor.text} size={24} />
            </TouchableOpacity>
        }

    >
        <View style={{
            flex: 1,
            borderTopLeftRadius: s(24),
            borderTopRightRadius: s(24),
            backgroundColor: themeColor.background,
            padding: s(15),
            display: 'flex',
            flexDirection: 'column'
        }}>
            <View style={{
                marginTop: s(-48)
            }}>
                {
                    groupContext.selfMember?.role < IModel.IGroup.IGroupMemberRoleEnum.MEMBER ?
                        <AvatarUpload
                            border
                            avatar={fileService.getFullUrl(groupContext.group.avatar)}
                            onChange={async (uri) => {
                                const url = await fileService.uploadImage(uri)
                                if (url) {
                                    groupApi.changeAvatar({
                                        id: groupContext.group.id,
                                        avatar: url
                                    }).then(() => {
                                        groupContext.reloadGroup(groupContext.group.id)
                                    })
                                }

                            }} /> :
                        <AvatarX uri={fileService.getFullUrl(groupContext.group.avatar)} border size={64} />
                }
            </View>
            <View style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: "space-between"
            }}>
                <TextInput
                    editable={editing && groupContext.selfMember && groupContext.selfMember.role < IModel.IGroup.IGroupMemberRoleEnum.MEMBER}
                    placeholder={t('groupCreate.placeholder_name')}
                    placeholderTextColor={colors.palette.gray300}
                    maxLength={128}
                    style={{
                        ...styles.input,
                        color: themeColor.text
                    }}
                    value={groupName}
                    cursorColor={themeColor.text}
                    onChangeText={text => {
                        if (text.length <= 10) {
                            setGroupName(text)
                        } else {
                            setGroupName(text.substring(0, 10))
                        }
                    }}
                />
                {groupContext.selfMember && groupContext.selfMember.role < IModel.IGroup.IGroupMemberRoleEnum.MEMBER ?
                    <TouchableOpacity style={{ backgroundColor: themeColor.secondaryBackground, padding: s(4), borderRadius: s(8) }}
                        onPress={changeName}
                    >
                        {editing ? <IconFont name="checkMark" color={themeColor.text} size={24} /> :
                            <IconFont name="edit" color={themeColor.text} size={24} />}
                    </TouchableOpacity> :
                    null
                }
            </View>
            <View style={{ marginBottom: s(14) }}>
                <Text>{groupContext.group.desc}</Text>
            </View>
            <View style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: "space-between"
            }}>
                <View style={{
                    display: 'flex', flexDirection: 'row', alignItems: 'center',
                }}>
                    <IconFont name="userGroup" color={themeColor.secondaryText} size={22} />
                    <Text>{t('groupChat.labelCurrentMemberCount')}</Text>
                </View>
                <Text>
                    {groupContext.members.length}/{groupContext.group.memberLimit}
                </Text>
            </View>

            <ScrollView style={{
                flex: 1
            }}>
                {
                    groupContext.members.map(item => {
                        return <View style={styles.memberItem} key={"member_" + item.id}>
                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <AvatarX uri={item.avatar} online={isOnline(1)} border />
                                <View>
                                    <Text style={{ color: themeColor.title, fontSize: s(16), fontWeight: '500' }}>{strUtil.defaultLabel(item.groupAlias, item.name)}</Text>
                                    <Text style={{ color: colors.palette.gray400 }}>{item.sign}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => {
                                groupMemberManageRef.current?.open(groupContext.group.id, item, groupContext.selfMember)
                            }}>
                                <IconFont name="ellipsis" color={themeColor.text} size={22} />
                            </TouchableOpacity>
                        </View>
                    })
                }

            </ScrollView>
            <Button fullWidth fullRounded containerStyle={{
                backgroundColor: themeColor.primary,
                borderRadius: s(14),
            }}
                size="large"
                onPress={async () => {
                    const data = await friendService.getOnlineList();
                    const existIds = groupContext.members?.map(item => item.id) ?? [];
                    const options: SelectMemberOption[] = data.map((item) => {
                        const disabled = existIds.includes(item.id);
                        return {
                            id: item.id,
                            icon: item.avatar,
                            status: false,
                            name: item.nickName,
                            title: item.nickName,
                            name_index: item.nickNameIdx,
                            disabled,
                            pubKey: item.pubKey
                        } as SelectMemberOption;
                    })
                    if (options.length > 0) {
                        console.log('options', options);
                        selectMemberModalRef.current?.open({
                            title: t('groupChat.title_add_member'),
                            options,
                            callback: async (ops: SelectMemberOption[]) => {
                                const selected = ops.filter((item) => item.status).map(o => {
                                    return { id: Number(o.id), pubKey: o.pubKey ?? '' }
                                })
                                if (selected.length > 0) {
                                    await batchInviteJoin(selected)
                                }
                            },
                        })
                    }
                }}
                label={t('groupChat.btn_invite_member')}
            />

        </View>

        <SelectMemberModal ref={selectMemberModalRef} />
        <GroupMemberManageModal ref={groupMemberManageRef} />
    </BaseModal >
})


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    input: {
        fontSize: s(32),
        fontWeight: '500',
        borderRadius: s(12),
        marginVertical: s(16)
    },
    switchLine: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: s(12)
    },
    memberItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: s(12)
    }
});
