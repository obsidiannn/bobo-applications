import { s } from "app/utils/size";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Modal, View, TouchableOpacity, ViewStyle } from "react-native";
import { IMenuItemProps, MenuItem } from "./MenuItem";
import { Card } from "../Card";
import { IconFont } from "../IconFont/IconFont";
import { $colors } from "app/Colors";

export interface MenuModalProps {
    theme?: "light" | "dark"
}

export interface MenuModalRef {
    open: (params: {
        items: IMenuItemProps[]
    }) => void
}

export const MenuModal = forwardRef((props: MenuModalProps, ref) => {
    const { theme = "dark" } = props;
    const [menus, setMenus] = useState<IMenuItemProps[]>([])
    const [visible, setVisible] = useState<boolean>(false)

    useImperativeHandle(ref, () => ({
        open: (params: {
            items: IMenuItemProps[]
        }) => {
            setMenus(params.items)
            setVisible(true)
        }
    }));

    const close = () => {
        setVisible(false)
    }

    return <Modal visible={visible} style={{ flex: 1 }} transparent={true} animationType="slide">
        <View style={$container}>
            <Card rounded theme={theme}>
                {menus.map((m, i) => <MenuItem
                    theme={theme}
                    key={m.title + "_" + i}
                    onPress={() => {
                        m.onPress();
                        close();
                    }} title={m.title} iconName={m.iconName} bottomBorder={i !== menus.length - 1} />)}
            </Card>
            <View style={{ alignItems: 'center', margin: s(32), }}>
                <TouchableOpacity style={[$closeIcon, {
                    backgroundColor: theme === 'dark' ? $colors.slate500 : $colors.slate900,
                }]} onPress={close}>
                    <IconFont name="close" size={24} color={$colors.white} />
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
})
const $container: ViewStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(16),
    backgroundColor: 'rgba(0,0,0,0.5)'
}
const $closeIcon: ViewStyle = {
    opacity: 0.5,
    borderRadius: s(20),
    width: s(36),
    height: s(36),
    alignItems: 'center',
    justifyContent: 'center',
}