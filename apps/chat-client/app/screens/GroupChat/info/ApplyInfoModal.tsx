import { GroupApplyItem } from "@repo/types";
import groupService from "app/services/group.service";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { s, vs } from "app/utils/size";
import { Image } from "expo-image";
import * as clipboard from 'expo-clipboard';
import toast from "app/utils/toast";
import BaseModal from "app/components/base-modal";
import { useTranslation } from "react-i18next";
import { IModel } from "@repo/enums";
import { Button } from "app/components";
import quickCrypto from "app/utils/quick-crypto";
import { IconFont } from "app/components/IconFont/IconFont";
import { colors } from "app/theme";
import fileService from "app/services/file.service";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";

export interface ApplyInfoModalRef {
    open: (item: GroupApplyItem, encKey: string, encPub: string) => void;
}
export default forwardRef((props: {
    onCheck: (item: GroupApplyItem) => void;
    onReject: (item: GroupApplyItem) => void;
}, ref) => {
    const [visible, setVisible] = useState(false);

    const { t } = useTranslation('screens')
    const [item, setItem] = useState<GroupApplyItem>();
    const [selfEnc, setSelfEnc] = useState<{ k: string, p: string }>()
    const [loading, setLoading] = useState(false);
    const themeColor = useRecoilValue(ColorsState)

    useImperativeHandle(ref, () => ({
        open: (v: GroupApplyItem, encKey: string, encPri: string) => {
            setItem(v);
            setSelfEnc({
                k: encKey, p: encPri
            })
            setVisible(true);
        }
    }));
    const onClose = () => {
        setVisible(false)
    }
    return <BaseModal visible={visible} onClose={onClose} title={t('groupChat.title_apply_info')} animationType="slide" styles={{ backgroundColor: themeColor.background, flex: 1 }}>
        <View style={{ flex: 1 }}>

            <View style={{ paddingHorizontal: s(14), paddingTop: vs(21), }}>
                <View style={{
                    height: vs(82),
                    borderWidth: s(0.5),
                    borderColor: themeColor.border,
                    borderRadius: vs(16),
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: s(15),
                }}>
                    <Image style={{
                        width: vs(50),
                        height: vs(50),
                        borderRadius: vs(25),
                        borderWidth: 1,
                        borderColor: themeColor.border,
                        marginRight: s(15),
                    }} source={fileService.getFullUrl(item?.avatar ?? '')} />
                    <View>
                        <Text style={{ fontSize: 16, fontWeight: '500', color: themeColor.text }}>{item?.name}</Text>
                        <TouchableOpacity onPress={async () => {
                            await clipboard.setStringAsync(item?.address ?? '');
                            toast(t('common.success_copied'));
                        }} style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 5,
                        }}>
                            <Text style={{ fontSize: 14, color: themeColor.secondaryText, fontWeight: '400', marginRight: s(4) }}>{item?.address}</Text>
                            <IconFont name="copy" color={themeColor.text} size={20} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{
                    borderWidth: 1,
                    backgroundColor: colors.palette.gray300,
                    width: '100%',
                    borderRadius: vs(16),
                    paddingHorizontal: s(15),
                    paddingVertical: vs(17),
                    marginTop: vs(10),
                }}>
                    <Text style={{
                        fontSize: 16,
                        color: '#333'
                    }}>{item?.remark ?? ''}</Text>
                </View>
            </View>
            <View style={{
                paddingHorizontal: s(14),
            }}>
                {item?.status === IModel.IGroup.IGroupMemberStatus.PENDING ? <>
                    <Button size="large" containerStyle={{
                        height: vs(50),
                        marginTop: vs(30),
                        backgroundColor: themeColor.primary
                    }}
                        fullRounded fullWidth
                        onPress={async () => {
                            if (loading) {
                                return
                            };
                            setLoading(true);
                            try {
                                const encKey = selfEnc?.k
                                if (encKey === '' || encKey === undefined) {
                                    return
                                }
                                const myWallet = globalThis.wallet
                                console.log(selfEnc);
                                console.log('target pub', item);

                                if (!myWallet) {
                                    return
                                }

                                let sharedKey = ''
                                if (selfEnc?.p && selfEnc.p !== '') {
                                    sharedKey = myWallet.computeSharedSecret(selfEnc?.p ?? '')

                                } else {
                                    sharedKey = myWallet.computeSharedSecret(myWallet.getPublicKey())
                                }
                                const password = quickCrypto.De(sharedKey, Buffer.from(selfEnc?.k ?? '', 'hex'))
                                // const password = Buffer.from(decode).toString('utf8')
                                // console.log('password=', password);

                                const newSharedKey = myWallet.computeSharedSecret(item.pubKey)
                                const newEncKey = quickCrypto.En(newSharedKey, password)
                                console.log(sharedKey);
                                await groupService.adminAgree({
                                    id: item.gid,
                                    uid: item.uid,
                                    encPri: myWallet.getPublicKey(),
                                    encKey: Buffer.from(newEncKey).toString('hex')
                                })
                            } catch (e) {
                                console.error(e)
                            } finally {
                                setLoading(false)
                                props.onCheck(item)
                                onClose()
                            }
                        }} textStyle={{
                            fontSize: 16,
                            fontWeight: '700',
                        }}
                        label={t('groupChat.btn_allow')} />

                    <Button size="large" containerStyle={{
                        height: vs(50),
                        marginTop: vs(16),
                        backgroundColor: themeColor.border
                    }}
                        fullRounded fullWidth
                        onPress={() => {
                            if (loading) {
                                return
                            };
                            setLoading(true);
                            groupService.rejectJoin(item?.gid, [item?.uid]).then(res => {
                                toast(t('groupChat.label_rejected'));
                                setTimeout(() => {
                                    setVisible(false);
                                }, 500)
                            }).finally(() => {
                                setLoading(false);
                                props.onCheck(item)
                            })
                        }} textStyle={{
                            fontSize: 16,
                            fontWeight: '700',
                        }} label={t('groupChat.btn_reject')} />
                </> : null}
            </View>
        </View>

    </BaseModal >
});
