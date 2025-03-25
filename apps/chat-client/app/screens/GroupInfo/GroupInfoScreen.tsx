import { StyleSheet, Text, View } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { useEffect, useRef, useState } from "react";
import { GroupDetailItem, GroupMemberResp } from "@repo/types";
import { useTranslation } from 'react-i18next';
import ApplyJoinModal, { ApplyJoinModalRef } from "app/components/ApplyJoinModal";
import groupService from "app/services/group.service";
import userService from "app/services/user.service";
import { App } from "types/app";
import Navbar from "app/components/Navbar";
import { s } from "app/utils/size";
import { Image } from "expo-image";
import { Button } from "app/components";
import fileService from "app/services/file.service";
import { useRecoilValue } from "recoil";
import { ColorsState, ThemeState } from "app/stores/system";
import { ScreenX } from "app/components/ScreenX";
type Props = StackScreenProps<App.StackParamList, 'GroupInfoScreen'>;

export const GroupInfoScreen = ({ navigation, route }: Props) => {
    const $theme = useRecoilValue(ThemeState)
    const [group, setGroup] = useState<GroupDetailItem | null>(null);
    const applyJoinModalRef = useRef<ApplyJoinModalRef>(null);
    const [groupMemberPage, setGroupMemberPage] = useState<GroupMemberResp>()
    const themeColor = useRecoilValue(ColorsState)
    const { t } = useTranslation('screens')
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            console.log('groupInfo: ', route.params);
            const groupId = Number(route.params.id)
            let _group = route.params.group
            if (!_group) {
                const groupMap = await groupService.queryByIdIn([groupId])
                _group = groupMap.get(groupId)
            }
            if (!_group) {
                return
            }
            setGroup(_group)
            groupService.getMemberPage({ id: _group.id, limit: 5, page: 1 }).then(memberPage => {
                console.log('member=', memberPage);

                const uids = memberPage.items.map(m => m.uid)
                if (uids.length > 0) {
                    userService.getUserHash(uids).then(uHash => {
                        const items = memberPage.items.map(m => {
                            return {
                                ...m,
                                avatar: uHash.get(m.uid)?.avatar ?? ''
                            }
                        })
                        setGroupMemberPage({ ...memberPage, items: items })
                    })
                }
                setGroupMemberPage(memberPage)
            })

        });
        return unsubscribe;
    }, [navigation])

    return (

        <ScreenX title="羣聊詳情" onLeftPress={() => {
            if (route.params.outside) {
                navigation.replace('TabStack')
            } else {
                navigation.goBack()
            }
        }} theme={$theme}>
            <View style={{
                paddingHorizontal: s(15),
                paddingTop: s(20)
            }}>
                <View style={{
                    padding: s(15),
                    backgroundColor: '#ffffff',
                    // 生成陰影
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 1,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 1,
                    elevation: 1,
                    borderRadius: s(15),
                    borderWidth: 1,
                    borderColor: '#EFF0F1',
                }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>

                            <Image style={{
                                width: s(50),
                                height: s(50),
                                borderRadius: s(25),
                                borderWidth: 1,
                                borderColor: '#EAEDEF',
                                marginRight: s(15),
                            }} source={group?.avatar} />
                            <View>
                                <Text style={{
                                    fontSize: s(16),
                                    fontWeight: '400',
                                    color: '#333333',
                                }}>{group?.name}</Text>
                                <Text style={{
                                    fontSize: s(13),
                                    fontWeight: '400',
                                    color: '#999999',
                                }}>
                                    {group?.desc}adawd
                                </Text>
                            </View>

                        </View>
                        <Button
                            fullRounded
                            onPress={() => {
                                if ((group?.role ?? -1) > 0) {
                                    navigation.navigate('GroupChatScreen', {
                                        chatId: group?.chatId ?? ''
                                    })
                                } else {
                                    applyJoinModalRef.current?.open(group?.id ?? 0);
                                }
                            }}
                            containerStyle={{
                                borderRadius: s(15),
                                padding: s(4),
                                backgroundColor: themeColor.primary
                            }} label={((group?.role ?? -1) > 0) ? "進入" : "加入"}
                            textStyle={{ color: themeColor.textChoosed }} />

                    </View>
                    <View style={{
                        marginTop: s(12),
                        padding: s(12),
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {
                            (groupMemberPage?.items ?? []).map(m => {
                                return <Image style={{
                                    width: s(40),
                                    height: s(40),
                                    borderRadius: s(25),
                                    borderWidth: 1,
                                    borderColor: '#EAEDEF',
                                    marginLeft: s(-15)
                                }} key={m.id} source={fileService.getFullUrl(m.avatar ?? '')} />
                            })
                        }
                        <Text style={{
                            marginLeft: s(8),
                            fontSize: s(14),
                            fontWeight: '400',
                        }}>{groupMemberPage?.total ?? 0}{t('groupChat.group_member_joined')}</Text>
                    </View>

                </View>
            </View>
            <ApplyJoinModal ref={applyJoinModalRef} />
        </ScreenX>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
});
