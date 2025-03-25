import { View, ViewStyle } from "react-native"
import { s } from "app/utils/size"
import { OptionItem, OptionItemProps } from "./OptionItem"
import { $colors } from "app/Colors"

export interface CardMenuProps {
    items: OptionItemProps[];
    style?: ViewStyle;
    theme?: "light" | "dark";
}
export const CardMenu = (props: CardMenuProps) => {
    const {theme="dark"} = props;
    return <View style={[
        $container,
        {
            backgroundColor: theme == "dark" ? $colors.slate700 : $colors.gray200,
        },
        props.style
    ]}>
        {props.items.map((item, index) => <OptionItem theme={theme} key={index} {...item} />)}
    </View>
}
const $container: ViewStyle = {
    width: "100%",
    paddingVertical: s(10),
    borderRadius: s(16),
    overflow: "hidden",
}
