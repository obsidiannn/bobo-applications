import React from "react"
import { Image, ImageStyle } from "expo-image"
import { TouchableOpacity, ViewStyle } from "react-native";

import { s } from 'app/utils/size';
import { useRecoilValue } from "recoil"
import { ColorsState, ThemeState } from "app/stores/system"
export interface CheckboxProps {
    checked: boolean;
    onChange: (val: boolean) => void;
}{ }
export const Checkbox = (props: CheckboxProps) => {
    const $theme = useRecoilValue(ThemeState);
    const $colors = useRecoilValue(ColorsState);
    return <TouchableOpacity style={[
        $container,
        {
            borderWidth: $theme == "dark" ? 0 : 1,
            borderColor: $colors.border,
        }
    ]} onPress={() => {
        props.onChange(props.checked)
    }}
    >
        {props.checked && <Image style={$image} source={require("assets/icons/check.png")} />}
    </TouchableOpacity>
}
const $container: ViewStyle = {
    backgroundColor: "white",
    width: s(20),
    height: s(20),
    borderRadius: s(6),
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
}
const $image: ImageStyle = {
    width: s(16),
    height: s(16),
}