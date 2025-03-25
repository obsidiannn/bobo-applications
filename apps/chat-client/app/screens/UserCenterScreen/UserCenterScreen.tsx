import { ThemeState } from "app/stores/system"

import { Text, View, ViewStyle } from "react-native"
import { useRecoilValue } from "recoil"
import { AuthUser } from "app/stores/auth"
import { s } from "app/utils/size"
import { navigate } from "app/navigators"
import { CardMenu } from "app/components/CardMenu/CardMenu"
import AvatarComponent from "app/components/Avatar"
import fileService from "app/services/file.service"
import { IconFont } from "app/components/IconFont/IconFont"
import { $colors } from "app/Colors"
import { useTranslation } from "react-i18next"
export const UserCenterScreen = () => {
    const authUser = useRecoilValue(AuthUser);
    const $theme = useRecoilValue(ThemeState);
    const { t } = useTranslation('default');
    return <View style={$container}>
        <View style={[
            {
                flex: 1,
                backgroundColor: $theme == "dark" ? $colors.slate800 : $colors.gray100,
            },
            $lightContainer
        ]}>
            <View style={[
                $contentContainer,
                {
                    backgroundColor: $theme == "dark" ? $colors.slate800 : $colors.gray100,
                },
            ]}>
                <View style={{
                    backgroundColor: $theme == "dark" ? $colors.slate700 : $colors.gray200,
                    borderRadius: s(8),
                    flexDirection: "row",
                    alignItems:"center",
                    paddingHorizontal: s(16),
                    paddingVertical: s(8),
                    marginBottom:s(10)
                }}>
                    <AvatarComponent border size={50} url={fileService.getFullUrl(authUser?.avatar ?? '')} online={true} />
                    <Text style={{
                        color: $theme == "dark" ? $colors.white : $colors.slate700,
                        fontSize: 20,
                        fontWeight: "600"
                    }}>{authUser?.nickName}</Text>
                </View>
                <CardMenu theme={$theme} items={[
                    {
                        icon: <IconFont name="pencil" color={$theme == "dark" ? $colors.white : $colors.slate700} size={24} />,
                        title: t('Edit Profile'),
                        onPress: () => {
                            navigate("ProfileScreen")
                        },
                    },
                    {
                        icon: <IconFont name="userRemove" color={$theme == "dark" ? $colors.white : $colors.slate700} size={24} />,
                        title: t('Favorites'),
                        onPress: () => {
                            navigate('CollectScreen')
                        },
                    },
                    {
                        icon: <IconFont name="safety" color={$theme == "dark" ? $colors.white : $colors.slate700} size={24} />,
                        title: t('Security'),
                        onPress: () => navigate("SafetyScreen"),
                    },
                    {
                        icon: <IconFont name="setting" color={$theme == "dark" ? $colors.white : $colors.slate700} size={24} />,
                        title: t('Settings'),
                        onPress: () => navigate("SettingScreen"),
                    },
                ]} />
            </View>
        </View>
    </View >
}
const $container: ViewStyle = {
    flex: 1,
    backgroundColor: $colors.slate950,
}
const $lightContainer: ViewStyle = {
    borderBottomEndRadius: s(20),
    borderBottomStartRadius: s(20),
    borderBottomWidth: 1,
    overflow: 'hidden',
}
const $contentContainer: ViewStyle = {
    flex: 1,
    borderTopRightRadius: s(32),
    borderTopLeftRadius: s(32),
    padding: s(16),
}