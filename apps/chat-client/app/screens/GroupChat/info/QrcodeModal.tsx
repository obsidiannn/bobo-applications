import { GroupDetailItem, GroupInfoItem } from "@repo/types";
import { Image } from "expo-image";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Text, View } from "react-native";
import QRCode from 'react-native-qrcode-svg';
import ViewShot, { captureRef } from "react-native-view-shot";
import BaseModal from "app/components/base-modal";
import { useTranslation } from "react-i18next";
import { s } from "app/utils/size";
import { Button } from "app/components";
import toast from "app/utils/toast";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { colors } from "app/theme";
import AvatarX from "app/components/AvatarX";
import fileService from "app/services/file.service";
export interface QRcodeModalRef {
    open: (params: {
        group: GroupDetailItem;
        count: number
    }) => void;
}
export default forwardRef((_, ref) => {
    const [visible, setVisible] = useState(false);
    const [group, setGroup] = useState<GroupDetailItem>();
    const [count, setCount] = useState<number>(0)
    const [data, setData] = useState<string>("xxxx");
    const viewRef = useRef<ViewShot>(null);
    const themeColor = useRecoilValue(ColorsState)
    const { t } = useTranslation('screens')

    useImperativeHandle(ref, () => ({
        open: (params: {
            group: GroupDetailItem;
            count: number
        }) => {
            setGroup(params.group);
            setCount(params.count)
            // setData('action=groupInfo&groupId=' + params.group?.id);
            setData('nextchat://group/' + params.group.id)
            setVisible(true);
        }
    }));
    const onClose = () => {
        setVisible(false)
    }
    return <BaseModal visible={visible} onClose={onClose} title={t('groupChat.title_qrcode')} animationType="slide" styles={{ flex: 1 }} >
        <View style={{
            flex: 1,
            paddingHorizontal: s(15),
            backgroundColor: themeColor.background
        }}>
            <View style={{
                borderRadius: s(16),
                padding: s(15),
                marginTop: s(30),
            }}>
                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <Image source={fileService.getFullUrl(group?.avatar ?? "")} style={{
                        width: s(50),
                        height: s(50),
                        borderRadius: s(10),
                        borderWidth: 1,
                        borderColor: themeColor.border,
                        marginRight: s(10),
                    }} />
                    <Text style={{
                        fontSize: s(24),
                        color: themeColor.text,
                        fontWeight: '400',
                    }}>{group?.name}
                        <Text style={{ fontSize: s(14), color: colors.palette.gray400, fontWeight: '400', marginHorizontal: s(12) }}>({count}人)</Text>
                    </Text>
                </View>
                <ViewShot ref={viewRef}
                    style={{
                        padding: s(14),
                        borderRadius: s(16),
                        marginTop: s(40),
                        backgroundColor: 'white',
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 1,
                        },
                        shadowOpacity: 0.30,
                        shadowRadius: 1,
                        elevation: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    {data ? <QRCode
                        size={260}
                        value={data}
                    /> : null}
                </ViewShot>
                <View>
                    <Button
                        fullWidth fullRounded
                        onPress={() => {
                            if (viewRef.current == null) {
                                return;
                            }
                            captureRef(viewRef.current, {
                                format: "jpg",
                                quality: 0.8,
                                handleGLSurfaceViewOnAndroid: true,
                            }).then(uri => {
                                console.log(uri);
                                toast(t('groupChat.success_save_album'));
                            });
                        }}
                        containerStyle={{
                            height: s(42),
                            marginTop: s(40),
                            borderRadius: s(21),
                            backgroundColor: themeColor.primary
                        }}
                        textStyle={{
                            fontSize: s(14),
                            fontWeight: '700',
                            color: themeColor.textChoosed
                        }} label={t('groupChat.btn_save_image')} />

                </View>
            </View>
        </View>
    </BaseModal>;
});
