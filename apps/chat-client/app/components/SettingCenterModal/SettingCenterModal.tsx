import Navbar from "../Navbar";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Modal, Pressable, Text, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecoilValue } from "recoil";
import { ColorsState, ThemeState } from "app/stores/system";
import { s } from "app/utils/size";
import { AuthUser } from "app/stores/auth";
import AvatarX from "../AvatarX";
import { Image } from "expo-image";

export interface SettingCenterModalType {
    open: () => void;
    close: () => void;
}
interface OptionItemProps {
    title: string;
    icon: any;
    onPress: () => void;
    style?: ViewStyle;
}
const OptionItem = (props: OptionItemProps) => {
    const $colors = useRecoilValue(ColorsState);
    const $theme = useRecoilValue(ThemeState);
    return <Pressable onPress={props.onPress} style={[
        {
            height: s(50),
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: s(16),
            justifyContent: "space-between",
        }
    ]}>
        <View style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center"
        }}>
            <Image style={{
                width: s(24),
                height: s(24),
                marginRight: s(10)
            }} source={props.icon} />
            <Text style={{
                color: $colors.text,
                fontSize: s(15),
                fontWeight: "400",
            }}>{props.title}</Text>
        </View>
        <Image style={{
            width: s(24),
            height: s(24),
        }} source={$theme == "dark" ? require('./arrow-right-dark.png') : require('./arrow-right-light.png')} />
    </Pressable>
}
export default forwardRef((_, ref) => {
    const [visible, setVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const authUser = useRecoilValue(AuthUser);
    const $theme = useRecoilValue(ThemeState);
    const onClose = () => {
        setVisible(false)
    }
    useImperativeHandle(ref, () => ({
        open: async () => setVisible(true),
        close: async () => setVisible(false)
    }));
    return <Modal transparent={false} style={{ flex: 1 }} visible={visible} animationType="slide" >
        <View style={{
            flex: 1,
            paddingTop: insets.top,
            backgroundColor: $colors.secondaryBackground,
        }}>
            <Navbar title='' onLeftPress={onClose} />
            <View style={{
                flex: 1,
                backgroundColor: "white",
                width: s(375),
                borderTopRightRadius: s(32),
                borderTopLeftRadius: s(32),
                marginTop: s(75),
                paddingHorizontal: s(16)
            }}>
                <View style={{
                    position: "relative",
                    top: s(-30),
                    height: s(44),
                }}>
                    <AvatarX border size={74} uri={authUser?.avatar ?? ''} online={true} />
                </View>
                <View style={{
                    height: s(74),
                    justifyContent: 'center'
                }}>
                    <Text style={{
                        color: $colors.text,
                        fontSize: s(28),
                        fontWeight: "600"
                    }}>{authUser?.nickName}</Text>
                </View>
                <View style={{
                    width: s(343),
                    paddingVertical: s(10),
                    borderRadius: s(16),
                    overflow: "hidden",
                    backgroundColor: $colors.secondaryBackground
                }}>
                    <OptionItem onPress={() => {
                        console.log("edit")
                    }} icon={$theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png')} title="编辑资料" />
                    <OptionItem style={{
                        marginTop: s(10)
                    }} onPress={() => {
                        console.log("safe")
                    }} icon={$theme == "dark" ? require('./safe-dark.png') : require('./safe-light.png')} title="安全" />
                    <OptionItem style={{
                        marginTop: s(10)
                    }} onPress={() => {
                        console.log("setting")
                    }} icon={$theme == "dark" ? require('./setting-dark.png') : require('./setting-light.png')} title="设置" />

                </View>
            </View>

        </View>
    </Modal>
})