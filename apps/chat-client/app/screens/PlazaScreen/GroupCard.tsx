import { GroupDetailItem } from "@repo/types"
import AvatarComponent from "app/components/Avatar"
import { IconFont } from "app/components/IconFont/IconFont"
import fileService from "app/services/file.service"
import { AuthUser } from "app/stores/auth"
import { ColorsState, ThemeState } from "app/stores/system"
import { s } from "app/utils/size"
import { ImageBackground, Platform, Pressable, StyleSheet, Text, View } from "react-native"
import { useRecoilValue } from "recoil"



export interface GroupCardProps {
    group: GroupDetailItem
    onPress: () => void
}

export const GroupCard = (props: GroupCardProps) => {
    const authUser = useRecoilValue(AuthUser)
    const themeColor = useRecoilValue(ColorsState)
    const $theme = useRecoilValue(ThemeState)

    const { group } = props
    return <Pressable onPress={props.onPress}>
        <ImageBackground
            accessibilityRole='image'
            resizeMode="cover"
            source={{ uri: fileService.getFullUrl(group?.cover ?? '') }} style={{
                ...styles.container,
                paddingTop: s(36),
                // backgroundColor: themeColor.primary
            }}>
            <View style={{
                display: 'flex', flexDirection: 'column',
                backgroundColor: themeColor.background,
                padding: s(14), width: '100%',
                borderTopRightRadius: s(20), borderTopLeftRadius: s(20)

            }}>
                <AvatarComponent
                    url={fileService.getFullUrl(authUser?.avatar ?? '')}
                    border style={{ marginTop: s(-32) }}
                    size={64}
                />
                <View style={{}}>
                    <Text style={{ ...styles.title, color: themeColor.title }}>{group?.name ?? ''}</Text>
                    <Text style={{ fontSize: s(14), color: themeColor.secondaryText, }}>{group?.desc ?? ''}</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <IconFont name="userGroup" color={themeColor.text} size={24} />
                    <Text>{group?.total}</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ ...styles.tag, borderColor: themeColor.border }}>
                        <Text>标签1</Text>
                    </View>
                    <View style={{ ...styles.tag, borderColor: themeColor.border }}>
                        <Text>标签1</Text>
                    </View>
                    <View style={{ ...styles.tag, borderColor: themeColor.border }}>
                        <Text>标签1</Text>
                    </View>
                </View>
            </View>
        </ImageBackground>
    </Pressable>
}

const styles = StyleSheet.create({

    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: s(24),
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    title: {
        fontSize: s(18),
        fontWeight: '500',
        marginVertical: s(8)
    },
    tag: {
        padding: s(6),
        borderRadius: s(18),
        borderWidth: s(0.5),
        margin: s(6)
    }

})

