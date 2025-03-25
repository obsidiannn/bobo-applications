import { forwardRef, useImperativeHandle, useState } from "react";
import { useCameraPermissions } from 'expo-camera';
import { Modal, View } from "react-native";
import { CameraPermissionView } from "./CameraPermissionView";
import { CameraWindow } from "./CameraWindow";
import { ScreenX } from "../ScreenX";
import { useTranslation } from "react-i18next";
export interface ScanModalType {
    open: () => void,
    close: () => void
}
export interface ScanModalProps {
    onChange: (val: string) => void
    theme: 'light' | 'dark';
}


export default forwardRef((props: ScanModalProps, ref) => {
    const [visible, setVisible] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const onClose = () => {
        setVisible(false)
    }
    useImperativeHandle(ref, () => ({
        open: async () => setVisible(true),
        close: async () => setVisible(false)
    }));
    const {t} = useTranslation('default');
    return <Modal transparent={false} style={{ flex: 1 }} visible={visible} animationType="slide" >
        <ScreenX theme={props.theme} title={t('Scan')} onLeftPress={onClose}>
            <View style={{
                flex: 1
            }}>
                {permission ? (!permission.granted ? <CameraPermissionView theme={props.theme} requestPermission={requestPermission} /> : (visible ? <CameraWindow onChange={(v) => {
                    props.onChange(v);
                    setVisible(false);
                }} /> : null)) : null}
            </View>
        </ScreenX>
    </Modal>
})