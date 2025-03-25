import { s } from "app/utils/size";
import { Text, TouchableOpacity, ViewStyle } from "react-native";
import { IconFont, IconFontNameType } from "../IconFont/IconFont";
import { $colors } from "app/Colors";

export interface IMenuItemProps {
    title: string;
    onPress: () => void;
    iconName?: IconFontNameType;
    bottomBorder?: boolean;
    size?: number;
    theme?: "light" | "dark"
}


export const MenuItem = (props: IMenuItemProps) => {
    const { title, onPress, iconName, bottomBorder = false,theme="dark" } = props
    return <TouchableOpacity
        style={[
            $container,
            bottomBorder && {
                borderBottomColor: theme == "dark" ? $colors.slate800 : $colors.white,
                borderBottomWidth: s(0.5),
            }
        ]} onPress={onPress}>
        {iconName ? <IconFont name={iconName} size={props.size ?? 24} color={theme == "dark" ? $colors.white : $colors.slate900} /> : null}
        <Text style={{
            color: theme == "dark" ? $colors.white : $colors.slate900,
            fontSize: 16,
        }}>{title}</Text>
    </TouchableOpacity>
}
const $container: ViewStyle = {
    paddingVertical: s(24),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
}