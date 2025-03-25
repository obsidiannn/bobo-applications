import { IUser } from "drizzle/schema";
import { forwardRef, useImperativeHandle, useState } from "react";
import { ImageBackground, Modal, Text } from "react-native";
import Navbar from "./Navbar";
import { View, TouchableOpacity } from "react-native";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { colors } from "app/theme";
import fileService from "app/services/file.service";
import { s } from "app/utils/size";
import { IconFont } from "./IconFont/IconFont";
import AvatarX from "./AvatarX";
import { useTranslation } from "react-i18next";

export interface VoicePhoneModalType {
    open: (user: IUser) => void
}

export default forwardRef((_, ref) => {
    const [visible, setVisible] = useState<boolean>(false)

    const [user, setUser] = useState<IUser | null>(null)
    const themeColor = useRecoilValue(ColorsState)

    const { t } = useTranslation('components ')
    useImperativeHandle(ref, () => ({
        open: (user: IUser) => {
            if (user) {
                console.log('useris', user);

                setUser(user)
                setVisible(true)
            }
        }

    }));
    const onClose = () => {
        console.log('close');

        setVisible(false)
    }
    return <Modal visible={visible} style={{
        flex: 1
    }}>

        <ImageBackground
            blurRadius={10}
            style={{ flex: 1, backgroundColor: 'pink', display: 'flex', flexDirection: 'column' }}
            source={{ uri: fileService.getFullUrl(user?.avatar ?? '') }}
        >
            <Navbar title={user?.nickName ?? ''} style={{
                backgroundColor: undefined,
            }}
                renderCenter={() => <Text style={{ color: colors.palette.neutral100, fontSize: s(14) }}>{user?.nickName}</Text>}
                renderLeft={() => <TouchableOpacity style={{
                    padding: s(8), backgroundColor: colors.palette.gray500,
                    borderRadius: s(8)
                }} onPress={onClose}>
                    <IconFont name="arrowLeft" color={colors.palette.accent100} size={16} />
                </TouchableOpacity>}
            />
            <View style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '30%'
            }}>
                <AvatarX size={84} border uri={fileService.getFullUrl(user?.avatar ?? '')} />
                <Text style={{
                    marginTop: s(24), color: colors.palette.neutral100, fontSize: s(18)
                }}>等待对方接受邀请...</Text>
            </View>
            <View style={{
                flex: 0.8,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: s(46),
            }}>
                <TouchableOpacity style={{
                    padding: s(16), borderRadius: s(32), backgroundColor: colors.palette.neutral100
                }}>
                    <IconFont name="like" size={32} color={colors.palette.gray950} />
                </TouchableOpacity>
                <TouchableOpacity style={{
                    padding: s(16), borderRadius: s(32), backgroundColor: colors.palette.neutral100
                }}>
                    <IconFont name="like" size={32} color={colors.palette.gray950} />
                </TouchableOpacity>
                <TouchableOpacity style={{
                    padding: s(16), borderRadius: s(32), backgroundColor: colors.palette.neutral100
                }}>
                    <IconFont name="like" size={32} color={colors.palette.gray950} />
                </TouchableOpacity>
            </View>
        </ImageBackground>
    </Modal>
})