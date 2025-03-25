import { useRef } from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { MenuModalRef, MenuModal } from 'app/components/MenuModal/MenuModal';
import { IMenuItemProps } from 'app/components/MenuModal/MenuItem';
import { Image } from "expo-image";
import { useTranslation } from 'react-i18next';
import { chooseImage } from "app/services/file.service";
import { s } from "app/utils/size";
import { useRecoilValue } from "recoil";
import { ColorsState, ThemeState } from "app/stores/system";
import { IconFont } from "./IconFont/IconFont";
import { View } from "react-native";
import { colors } from "app/theme";

export const AvatarUpload = (props: {
    avatar: string;
    onChange: (v: string) => void
    border?: boolean;
    size?: number;
    style?: ViewStyle
}) => {
    const { t } = useTranslation('components')
    console.log('[avatar]', props.avatar);
    const size = props.size ?? 64
    const themeColor = useRecoilValue(ColorsState)
    const $theme = useRecoilValue(ThemeState)
    const menuModalRef = useRef<MenuModalRef>();
    const options: IMenuItemProps[] = [
        {
            title: t('upload.label_camera'),
            iconName: "camera",
            onPress: () => {
                chooseImage(true, {
                    aspect: [1, 1],
                    quality: 0.5,
                }).then((uri) => {
                    console.log(uri);

                    if (!uri) {
                        return;
                    }
                    props.onChange(uri);
                });
            }
        },
        {
            title: t('upload.label_pick_album'),
            iconName: "picture",
            onPress: () => {
                chooseImage(false, {
                    aspect: [1, 1],
                    quality: 0.5,
                }).then((uri) => {
                    if (!uri) {
                        return;
                    }
                    props.onChange(uri);
                });
            }
        },
    ];
    return <>
        <TouchableOpacity style={{
            ...styles.container,
            backgroundColor: themeColor.background,
            width: size,
            height: size
        }} onPress={() => {
            menuModalRef.current?.open({
                items: options
            });
        }}>
            {props.avatar ? <Image source={props.avatar} style={{
                borderRadius: s(32),
                ...(props.border ? styles.border : null),
                width: size,
                height: size
            }} /> : null}
            <View style={{
                ...styles.icon,
                backgroundColor: colors.palette.gray500,
                borderColor: themeColor.border,
                borderWidth: s(0.5),
            }}>
                <IconFont name="camera" color={themeColor.textChoosed} size={16} />
            </View>
        </TouchableOpacity>
        <MenuModal ref={menuModalRef} theme={$theme} />
    </>
}
const styles = StyleSheet.create({
    border: {
        borderWidth: s(3),
        borderStartColor: 'red',
        borderEndColor: '#890084',
        borderTopColor: '#8A0184',
        borderBottomColor: 'green',
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: s(32),
    },

    icon: {
        zIndex: 1,
        position: 'absolute',
        bottom: s(0),
        right: s(0),
        width: s(22),
        height: s(22),
        borderRadius: s(11),
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default AvatarUpload;