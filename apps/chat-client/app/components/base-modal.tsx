import { ThemeState } from "app/stores/system";
import Navbar from "./Navbar";
import { ReactNode } from "react";
import { Modal, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecoilValue } from "recoil";
import { $colors } from "app/Colors";


export interface BaseModalProps {
    styles?: ViewStyle
    children: ReactNode
    title?: string
    visible: boolean
    transparent?: boolean
    animationType?: 'none' | 'slide' | 'fade'
    onClose: () => void
    renderRight?: ReactNode
    renderLeft?: ReactNode
}

const BaseModal = ({
    styles,
    children,
    title,
    visible,
    onClose,
    transparent,
    animationType,
    renderRight,
    renderLeft
}: BaseModalProps) => {
    const insets = useSafeAreaInsets()
    const $theme = useRecoilValue(ThemeState)
    return <Modal transparent={transparent ?? false} style={{ flex: 1 }} visible={visible} animationType={animationType} >
        <View style={{
            flex: 1,
            paddingTop: insets.top,
            backgroundColor: $theme == "dark" ? $colors.slate950 : $colors.neutra100,
        }}>
            <Navbar title={title} onLeftPress={onClose} renderRight={() => { return renderRight }} theme={$theme}
                {...{
                    renderLeft: renderLeft ? () => { return renderLeft } : undefined,
                }}
            />
            <View style={{
                ...styles
            }}>

                {children}
            </View>
        </View>
    </Modal>
}

export default BaseModal