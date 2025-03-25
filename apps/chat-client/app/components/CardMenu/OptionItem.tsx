
import { Text, TextStyle, View, ViewStyle } from "react-native";
import { s } from "app/utils/size";
import { ReactNode } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { IconFont } from "../IconFont/IconFont";
import { $colors } from "app/Colors";

export interface OptionItemProps {
    title: string;
    icon?: ReactNode;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    rightArrow?: ReactNode;
    theme?: 'light' | 'dark';
}
export const OptionItem = (props: OptionItemProps) => {
    const { theme = "dark" } = props;
    return <TouchableOpacity onPress={props.onPress} style={$container}>
        <View style={$item}>
            {props.icon}
            <Text style={[
                $text,
                {
                    color: theme == "dark" ? $colors.white : $colors.slate700,
                },
                props.textStyle
            ]}>{props.title}</Text>
        </View>
        {props.rightArrow === undefined ? <IconFont name="arrowRight" size={16} color={$colors.slate400} /> : props.rightArrow}
    </TouchableOpacity>
}
const $container: ViewStyle = {
    height: s(50),
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: s(16),
    justifyContent: "space-between",
}
const $text: TextStyle = {
    fontSize: s(15),
    fontWeight: "400",
}
const $item: ViewStyle = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
}