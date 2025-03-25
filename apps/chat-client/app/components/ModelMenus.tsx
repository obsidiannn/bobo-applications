import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { Image } from "expo-image";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Modal, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRecoilValue } from "recoil";

export interface ModelMenuProp {
    title: string
    onPress: () => void
    icon: any
}

export interface ModelMenuProps {
    open: (params: {
        menus: ModelMenuProp[]
    }) => void
}

export default forwardRef((_, ref) => {
    const themeColor = useRecoilValue(ColorsState)
    const [menus, setMenus] = useState<ModelMenuProp[]>([])
    const [visible, setVisible] = useState<boolean>(false)

    useImperativeHandle(ref, () => ({
        open: async (params: {
            menus: ModelMenuProp[]
        }) => {
            if (params.menus.length > 0) {
                setMenus(params.menus)
                setVisible(true)
            }
        }
    }));

    const close = () => {
        setVisible(false)
    }

    return <Modal visible={visible} style={styles.container} transparent={true} >
        <View style={styles.overlay}></View>
        <View style={styles.container}>
            <View style={{
                ...styles.menuArea,
                backgroundColor: themeColor.background
            }}>
                {
                    menus.map((m, i) => {
                        return <TouchableOpacity
                            key={m.title + 'menu'}
                        style={{
                            ...styles.menuItem,
                            ...(i === menus.length - 1 ? {
                            } : {
                                borderBottomColor: themeColor.border,
                                borderBottomWidth: s(0.5)
                            })
                        }} onPress={()=>{
                            close()
                            m.onPress()
                        }}>
                            <Image source={m.icon} style={{
                                width: s(18), height: s(18),marginRight: s(8)
                            }} />
                            <Text>{m.title}</Text>
                        </TouchableOpacity>
                    })
                }
            </View>
            <View style={{ alignItems: 'center', margin: s(32), }}>
                <TouchableOpacity onPress={close} >
                    <Image source={require('assets/icons/close-opacity.svg')} style={{ width: s(36), height: s(36) }} />
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        paddingHorizontal: s(16),
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
        opacity: 0.5,
        zIndex: -1,
    },
    menuArea: {
        paddingHorizontal: s(36),
        paddingVertical: s(14),
        borderRadius: s(20),
        marginTop: '40%'
    },

    menuItem: {
        paddingVertical: s(24),
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    }
})
