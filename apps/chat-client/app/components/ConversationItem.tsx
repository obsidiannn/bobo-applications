import { s } from "app/utils/size";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import AvatarComponent from "./Avatar";
import { colors } from "app/theme";
import { IconFont } from "./IconFont/IconFont";
import { $colors } from "app/Colors";
import { $dark, $light } from "app/theme";

export interface IContactListItemProps {
    icon: string | null;
    title: string | null;
    // 未读数量
    badgeNumber?: number | null;
    describe?: string
    subTitle?: string | null;
    onPress?: () => void;
    bottomLine?: boolean;
    online?: boolean
    // 免打扰
    inhibite?: boolean
    theme?: 'light' | 'dark'
}
export default (props: IContactListItemProps) => {
    const styles = style({ themeColor: props.theme && props.theme === 'dark' ? $dark : $light })
    const renderPoint = () => {
        if (props.inhibite) {
            return <IconFont name="silent" color={colors.palette.gray300} size={20} />
        }
        if (props.badgeNumber && props.badgeNumber > 0) {
            return <View style={{
                padding: s(3), backgroundColor: colors.palette.red500, borderRadius: s(8)
            }}>
            </View>
        }
        return null
    }

    return <TouchableOpacity onPress={props.onPress} style={[
        styles.container,
        {
            borderBottomWidth: s(0.5),
        },
        props.bottomLine && {
            borderBottomColor: props.theme === 'light' ? $colors.slate400 : $colors.slate100,
        }
    ]}>
        <View style={styles.iconContainer}>
            <AvatarComponent url={props.icon ?? ''} online={props.online} size={48} />
        </View>
        <View style={{
            ...styles.rightContainer,
        }}>
            <View style={styles.titleContainer}>
                <Text style={[
                    styles.title,
                    {
                        color: props.theme === 'light'? $colors.slate600 : $colors.slate100
                    }
                ]}>{props.title}</Text>
                <Text style={styles.describe}>{props.describe}</Text>
            </View>
            <View style={styles.subTitleContainer}>
                <Text style={styles.subTitle}>{props.subTitle}</Text>
                <View style={{
                    ...styles.subTitleContainer,
                    minWidth: s(20)
                }}>
                    {renderPoint()}
                </View>
            </View>
        </View>
    </TouchableOpacity>
}

const style = ({ themeColor }: { themeColor: IColors }) => StyleSheet.create({
    container: {
        height: s(76),
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
    },
    iconContainer: {
        width: s(57),
        height: s(76),
        display: 'flex',
        justifyContent: 'center',
    },
    rightContainer: {
        width: s(260),
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
    },
    titleContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    title: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: s(8),
        color: themeColor.text
    },
    describe: {
        fontWeight: '400',
        fontSize: 12,
        color: themeColor.secondaryText,
    },
    subTitleContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    subTitle: {
        color: themeColor.secondaryText,
        fontWeight: '400',
        fontSize: 12,
        marginRight: s(12),
    }
});
