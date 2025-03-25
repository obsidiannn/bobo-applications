import { IconFont } from "app/components/IconFont/IconFont";
import { colors } from "app/theme";
import { s } from "app/utils/size";
import { Image } from "expo-image";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

export default (props: {
    onPress?: () => void;
    icon?: string;
    label?: string;
    labelColor?: string;
    rightComponent?: React.ReactNode;
    leftIcon?: React.ReactNode
}) => {
    return <Pressable onPress={() => {
        props.onPress?.();
    }} style={{
        borderRadius: s(14),
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: s(10),
        paddingVertical: s(16)
    }}>
        <View style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: s(8),
        }}>
            {props.leftIcon}
            <Text style={{
                fontSize: s(15),
                fontWeight: '400',
                color: (props.labelColor ?? '#000'),
                marginHorizontal: s(6)
            }}>{props.label}</Text>
        </View>
        {props.rightComponent ?? (props.icon ? <IconFont name={props.icon} color={colors.palette.gray300} size={16} /> : null)}

    </Pressable>
}
