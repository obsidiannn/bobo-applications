import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { Image } from "expo-image";
import { s } from "app/utils/size";
import { $colors } from "app/Colors";

interface IContactListItemProps {
    icon: string | null;
    title: string | null;
    secondTitle?: string
    badgeNumber?: number | null;
    subTitle?: string | null;
    onPress?: () => void;
    bottomLine?: boolean;
    theme: 'light' | 'dark';
}
export default (props: IContactListItemProps) => {
    const { theme } = props
    return <TouchableOpacity onPress={props.onPress} style={$container}>
        <View style={styles.iconContainer}>
            <Image source={props.icon} style={styles.icon} />
            {
                props.badgeNumber && props.badgeNumber > 0 ?
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{props.badgeNumber > 99 ? 99 : props.badgeNumber}</Text>
                    </View> : null
            }
        </View>
        <View style={{
            ...styles.rightContainer,
            borderBottomColor: props.bottomLine ? $colors.slate400 : $colors.white,
        }}>
            <View style={styles.titleContainer}>
                <Text style={[
                    $title,
                    {
                        color: theme === 'light' ? $colors.slate800 : $colors.white
                    }
                ]}>{props.title}</Text>
                <Text>{props.secondTitle}</Text>
            </View>
            <View style={styles.subTitleContainer}>
                <Text style={styles.subTitle}>{props.subTitle}</Text>
            </View>
        </View>
    </TouchableOpacity>
}
const $container:ViewStyle = {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
};
const $title:TextStyle = {
    fontWeight: '400',
    fontSize: 16,
};
const styles = StyleSheet.create({
    
    iconContainer: {
        width: s(57),
        paddingVertical: s(14),
        display: 'flex',
        justifyContent: 'center',
    },
    icon: {
        width: s(40),
        height: s(40),
        borderRadius: s(20),
        marginRight: s(10),
        borderWidth: s(0.5),
        borderColor: '#F0F0F0'
    },
    badgeContainer: {
        position: 'absolute',
        top: s(12),
        left: s(32),
        width: s(20),
        height: s(20),
        borderWidth: s(0.5),
        borderColor: '#ffffffcc',
        borderRadius: s(11),
        backgroundColor: '#FF3D00',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    rightContainer: {
        width: s(260),
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        borderBottomWidth: s(0.5),
    },
    titleContainer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center'
    },
    
    subTitleContainer: {
        width: '40%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    subTitle: {
        color: '#999',
        fontWeight: '400',
        fontSize: 12,
        marginRight: s(6),
    }
});
