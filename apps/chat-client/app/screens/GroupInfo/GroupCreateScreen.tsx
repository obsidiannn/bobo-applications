import { StyleSheet, Text, TextInput } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { useEffect, useRef, useState } from "react";
import { View, Switch } from "react-native";

import groupService from "app/services/group.service";
import AvatarUpload from "app/components/AvatarUpload";
import fileService from "app/services/file.service";
import LoadingModal, { LoadingModalType } from "app/components/loading-modal";
import { useTranslation } from 'react-i18next';
import toast from "app/utils/toast";
import { s } from "app/utils/size";
import { colors } from "app/theme";
import { App } from "types/app";
import quickCrypto from "app/utils/quick-crypto";
import { Button } from "app/components";
import { useRecoilValue } from "recoil";
import { ColorsState, ThemeState } from "app/stores/system";
import { UploadArea } from "app/components/UploadArea";
import { ScrollView } from "react-native-gesture-handler";
import { IconFont } from "app/components/IconFont/IconFont";
import { ScreenX } from "app/components/ScreenX";

type Props = StackScreenProps<App.StackParamList, 'GroupCreateScreen'>;
interface GroupCreateType {
    name: string
    avatar: string
    describe: string
    searchType: string
    isEnc: boolean,
    cover: string
}
export const GroupCreateScreen = ({ route, navigation }: Props) => {
    const $theme = useRecoilValue(ThemeState)
    const loadingModalRef = useRef<LoadingModalType>();
    const themeColor = useRecoilValue(ColorsState)
    const { t } = useTranslation('screens')
    const [createState, setCreateState] = useState<GroupCreateType>({
        name: '',
        avatar: '',
        describe: '',
        searchType: '0',
        isEnc: true,
        cover: ''
    })
    useEffect(() => {
        const focus = navigation.addListener('focus', () => {
            const avatar = "https://api.dicebear.com/8.x/fun-emoji/svg?seed=" + Math.random().toString(36).substring(2, 7);
            setCreateState((old) => {
                return {
                    ...old,
                    avatar
                }
            })
        })
        return () => {
            focus()
        }
    }, [])
    const doGroupCreate = async () => {
        if (!createState.name) {
            toast(t('groupCreate.require_name'))
            return
        }
        loadingModalRef.current?.open()
        let imgUrl = createState.avatar
        let coverUrl = createState.cover
        try {
            if (imgUrl && imgUrl !== '' && !imgUrl.startsWith('http')) {
                const url = await fileService.uploadImage(imgUrl)
                if (!url || url === null || url === '') {
                    toast(t('groupCreate.error_upload'))
                    return
                }
                imgUrl = url
            }
            if (coverUrl && coverUrl !== '' && !coverUrl.startsWith('http')) {
                const url = await fileService.uploadImage(coverUrl)
                if (!url || url === null || url === '') {
                    toast(t('groupCreate.error_upload'))
                    return
                }
                coverUrl = url
            }
            console.log('group avatar = ', imgUrl, 'cover=', coverUrl);
            const group = await groupService.create(createState.name,
                imgUrl, createState.isEnc,
                createState.searchType,
                createState.describe, coverUrl)
            const ops = route.params.selected
            if (ops.length > 0) {
                const items = ops.map(o => {
                    return { id: o.id, pubKey: o.pubKey }
                })
                // 這裏是首次創建，所以share secret 是用的自己的公私鑰
                const myWallet = globalThis.wallet
                const sharedSecret = myWallet?.computeSharedSecret(myWallet.getPublicKey())
                const groupPassword = quickCrypto.De(sharedSecret ?? '', Buffer.from(group.encKey ?? '', 'hex'));
                const groupInfo = {
                    id: group.id ?? -1,
                    groupPassword: Buffer.from(groupPassword).toString('utf8')
                }
                await groupService.invite(items, groupInfo);
            }
            toast(t('groupCreate.option_success'))
            navigation.goBack()
        } catch (e) {
            toast(t('groupCreate.option_failed'))
            loadingModalRef.current?.close()
        } finally {
            loadingModalRef.current?.close()
        }
    }
    return (
        <ScreenX title={t('groupCreate.title_group_create')} theme={$theme} >
            <ScrollView
                scrollEnabled
                contentContainerStyle={{
                    display: 'flex',
                    paddingHorizontal: s(15),
                    paddingTop: s(20),
                    backgroundColor: themeColor.background
                }}
            >
                <View style={{ flex: 1 }}>
                    <AvatarUpload
                        avatar={createState.avatar}
                        onChange={(uri) => {
                            setCreateState({
                                ...createState,
                                avatar: uri,
                            })
                        }} />
                    <TextInput
                        placeholder={t('groupCreate.placeholder_name')}
                        placeholderTextColor={colors.palette.gray300}
                        maxLength={128}
                        style={{
                            ...styles.input,
                            color: themeColor.text
                        }}
                        value={createState?.name}
                        cursorColor={themeColor.text}
                        onChangeText={text => {
                            setCreateState({
                                ...createState,
                                name: text
                            })
                        }}
                    />
                    <UploadArea
                        // url={""}
                        url={createState.cover}
                        style={{
                            backgroundColor: themeColor.secondaryBackground,
                            borderColor: themeColor.border,
                        }} onChange={(v: string) => {
                            setCreateState({
                                ...createState,
                                cover: v
                            })
                        }}>
                        <View style={{
                            padding: s(14)
                        }}>
                            <View style={{
                                borderRadius: s(24),
                                borderColor: themeColor.border,
                                borderWidth: 1,
                                borderStyle: 'dashed',
                                margin: s(12),
                            }}>
                                <IconFont name="plus" color={themeColor.border} />
                            </View>
                            <Text style={{ color: themeColor.text }}>上传封面</Text>
                        </View>
                    </UploadArea>

                    <TextInput
                        placeholder={t('groupCreate.placeholder_describe')}
                        placeholderTextColor={colors.palette.gray300}
                        maxLength={128}
                        multiline
                        numberOfLines={3}

                        style={{
                            ...styles.input,
                            textAlignVertical: 'top',
                            padding: s(15),
                            backgroundColor: themeColor.secondaryBackground,
                            fontSize: s(16),
                            color: themeColor.text
                        }}
                        value={createState?.describe}
                        cursorColor={themeColor.text}
                        onChangeText={text => {
                            setCreateState({
                                ...createState,
                                describe: text
                            })
                        }}
                    />

                    <View style={{ ...styles.switchLine }}>
                        <View style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <IconFont name="unlock" color={themeColor.text} size={24} />
                            <Text style={{ fontSize: s(16), color: themeColor.text }}>{t('groupCreate.enc_disable')}</Text>
                        </View>
                        <Switch value={createState.searchType === '1'}
                            thumbColor={'#ffffff'}
                            trackColor={{
                                false: colors.palette.gray400,
                                true: themeColor.primary
                            }}
                            onValueChange={(e) => {
                                setCreateState({
                                    ...createState,
                                    searchType: e ? "1" : "0"
                                })
                            }} />
                    </View>

                    <View style={{ ...styles.switchLine, }}>
                        <View style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-start'
                        }}>
                            <IconFont name="lock" color={themeColor.text} size={24} />
                            <View>
                                <Text style={{ fontSize: s(16), marginBottom: s(4), color: themeColor.text }}>{t('groupCreate.enc_enable')}</Text>
                                <Text style={{ fontSize: s(14), color: themeColor.secondaryText }}>{t('groupCreate.enc_enable_desc')}</Text>
                            </View>
                        </View>
                        <Switch value={createState.isEnc}
                            thumbColor={'#ffffff'}
                            trackColor={{
                                false: colors.palette.gray400,
                                true: themeColor.primary
                            }}
                            onValueChange={(e) => {
                                setCreateState({
                                    ...createState,
                                    isEnc: e
                                })
                            }} />

                    </View>
                </View>
                <Button onPress={doGroupCreate}
                    size="large" label={t('groupCreate.title_group_create')}
                    fullWidth fullRounded
                    containerStyle={{
                        marginVertical: s(24),
                    }} />
            </ScrollView>

            <LoadingModal ref={loadingModalRef} />
        </ScreenX>
    );
};

export default GroupCreateScreen;

const styles = StyleSheet.create({
    input: {
        fontSize: s(32),
        fontWeight: '500',
        borderRadius: s(12),
        marginVertical: s(24)
    },
    switchLine: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: s(12)
    }
}
);
