import { $colors } from "app/Colors"
import { s } from "app/utils/size"
import { TextStyle } from "react-native"
import { StyleProp, Text, View, ViewStyle } from "react-native"


interface EmptyProps {
    label?: string
    style?: StyleProp<ViewStyle>
}

export const EmptyComponent = (props: EmptyProps) => {
    return <View style={$container}>
        <Text style={[$text, {
            color: $colors.slate400
        }]}>{props.label}</Text>
    </View>
}
const $container: ViewStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
}
const $text: TextStyle = {
    fontWeight: 500, marginTop: s(8)
}
