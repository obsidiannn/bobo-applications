import Navbar from "../../Navbar";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Modal, PermissionsAndroid, Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import QRCode from 'react-native-qrcode-svg';
import { s } from "app/utils/size";
import { AuthUser } from "app/stores/auth";
import AvatarX from "../../AvatarX";
import ViewShot, { captureRef } from "react-native-view-shot";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import BlockButton from "../../BlockButton";
import toast from "app/utils/toast";
import { useTranslation } from "react-i18next";
import { ScreenModal } from "app/components/ScreenModal";

export interface MyBusinessCardModalType {
    open: () => void,
    close: () => void
}
const hasAndroidPermission = async () => {
    const version = Number(Platform.Version);
    const getCheckPermissionPromise = () => {
        if (version >= 33) {
            return Promise.all([
                PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES),
                PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO),
            ]).then(
                ([hasReadMediaImagesPermission, hasReadMediaVideoPermission]) =>
                    hasReadMediaImagesPermission && hasReadMediaVideoPermission,
            );
        } else {
            return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        }
    };

    const hasPermission = await getCheckPermissionPromise();
    if (hasPermission) {
        return true;
    }
    const getRequestPermissionPromise = () => {
        if (version >= 33) {
            return PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            ]).then(
                (statuses) =>
                    statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                    statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
                    PermissionsAndroid.RESULTS.GRANTED,
            );
        } else {
            return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then((status) => status === PermissionsAndroid.RESULTS.GRANTED);
        }
    };

    return await getRequestPermissionPromise();
}
export default forwardRef((props:{
    theme: 'light' | 'dark'
}, ref) => {
    const [visible, setVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const authUser = useRecoilValue(AuthUser);
    const viewRef = useRef<ViewShot>(null);
    const { t } = useTranslation('components')
    const onClose = () => {
        setVisible(false)
    }
    useImperativeHandle(ref, () => ({
        open: async () => setVisible(true),
        close: async () => setVisible(false)
    }));
    return <ScreenModal theme={props.theme} title={t('user.labelUserCard')} >
        <View style={{
            flex: 1,
            paddingTop: insets.top,
            backgroundColor: $colors.secondaryBackground
        }}>
            <Navbar title={} onLeftPress={onClose} />
            <ViewShot ref={viewRef} style={{
                width: s(343),
                paddingHorizontal: s(50),
                paddingVertical: s(40),
                marginHorizontal: s(16),
                marginTop: s(30),
                borderRadius: s(32),
                backgroundColor: "white",
            }}>
                <View style={{
                    display: "flex",
                    flexDirection: "row",
                    height: s(44),
                    alignItems: "center",
                }}>
                    <AvatarX uri={authUser?.avatar ?? ''} border={true} size={44} />
                    <Text numberOfLines={1} ellipsizeMode="tail" style={{
                        marginLeft: s(5),
                        fontSize: s(26),
                        width: s(204),
                        fontWeight: "700",
                    }}>{authUser?.nickName}xxx</Text>
                </View>
                <View style={{
                    marginTop: s(20)
                }}>
                    <View style={{
                        borderRadius: s(16),
                        overflow: "hidden",
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderColor: $colors.border,
                        padding: s(8)
                    }}>
                        <QRCode size={s(227)} value={"nextchat://userinfo/" + authUser?.id} />
                    </View>
                </View>
                <View style={{
                    marginTop: s(42),
                }}>
                    <Text style={{
                        textAlign: 'center',
                        color: $colors.text,
                        fontSize: s(14),
                        fontWeight: "500",
                    }}>扫一扫·加我为好友</Text>
                </View>
            </ViewShot>
            <View style={{
                height: s(50),
                width: s(343),
                marginHorizontal: s(16),
                marginTop: s(54),
            }}>
                <BlockButton
                    onPress={async () => {
                        if (viewRef.current == null) {
                            return;
                        }
                        try {
                            if (Platform.OS == "android") {
                                const permission = await hasAndroidPermission();
                                if (!permission) {
                                    toast('請先允許訪問相冊');
                                    return;
                                }
                            }
                            const uri = await captureRef(viewRef.current, {
                                format: "png",
                                quality: 0.8,
                                handleGLSurfaceViewOnAndroid: true,
                            });
                            await CameraRoll.saveAsset(uri);
                            toast('保存到相冊成功');
                        } catch (error) {
                            console.log(error);
                        }
                    }} label="保存图片" />
            </View>
        </View>
    </Modal>
})