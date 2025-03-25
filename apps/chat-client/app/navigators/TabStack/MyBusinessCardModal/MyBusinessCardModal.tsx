import { forwardRef, useImperativeHandle, useRef } from "react";
import { PermissionsAndroid, Platform, Text, View } from "react-native";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import QRCode from 'react-native-qrcode-svg';
import { s } from "app/utils/size";
import { AuthUser } from "app/stores/auth";
import ViewShot, { captureRef } from "react-native-view-shot";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import toast from "app/utils/toast";
import AvatarX from "app/components/AvatarX";
import { Button } from "app/components";
import { useTranslation } from "react-i18next";
import { ScreenModal, ScreenModalType } from "app/components/ScreenModal";
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
export default forwardRef((props: {
    theme: 'light' | 'dark',
}, ref) => {
    const $colors = useRecoilValue(ColorsState);
    const authUser = useRecoilValue(AuthUser);
    const viewRef = useRef<ViewShot>(null);

    useImperativeHandle(ref, () => ({
        open: async () => screenModalRef.current?.open(),
        close: async () => screenModalRef.current?.close()
    }));
    const {t} = useTranslation('default');
    const screenModalRef = useRef<ScreenModalType>(null);
    return <ScreenModal ref={screenModalRef} theme={props.theme} title={t('My Business Card')}>
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
                    }}>{authUser?.nickName}</Text>
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
                    }}>{t('Scan to add friend')}</Text>
                </View>
            </ViewShot>
            <View style={{
                height: s(50),
                width: s(343),
                marginHorizontal: s(16),
                marginTop: s(54),
            }}>
                <Button
                    size="large"
                    fullRounded
                    theme={props.theme}
                    onPress={async () => {
                        if (viewRef.current == null) {
                            return;
                        }
                        try {
                            if (Platform.OS == "android") {
                                const permission = await hasAndroidPermission();
                                if (!permission) {
                                    toast(t('Please allow access to the album'));
                                    return;
                                }
                            }
                            const uri = await captureRef(viewRef.current, {
                                format: "png",
                                quality: 0.8,
                                handleGLSurfaceViewOnAndroid: true,
                            });
                            await CameraRoll.saveAsset(uri);
                            toast(t('Save to album'));
                        } catch (error) {
                            console.log(error);
                        }
                    }} label={t('Save') } />
            </View>
    </ScreenModal>
})