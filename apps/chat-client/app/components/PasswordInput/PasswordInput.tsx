import { $colors } from "app/Colors";
import { s } from "app/utils/size";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { IconFont } from "../IconFont/IconFont";

export interface PasswordInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    theme: 'dark' | 'light';
}
export interface PasswordInputRef {
    focus: () => void;
}
export const PasswordInput = forwardRef((props: PasswordInputProps, ref) => {
    const [passwordHidden, setPasswordHidden] = useState(true);
    const inputRef = useRef<TextInput>(null);
    useImperativeHandle(ref, () => ({
        focus: () => {
            inputRef.current?.focus();
        }
    }))
    return <View style={{
        height: s(48),
        borderRadius: s(12),
        flex: 1,
        justifyContent: 'center',
        width: "100%",
        backgroundColor: props.theme == "dark" ? $colors.gray600 : $colors.gray50,
        paddingHorizontal: s(16),
        flexDirection: "row",
        alignItems: "center",
    }}>
        <IconFont name={"lock"} color={props.theme == "dark" ? $colors.gray400 : $colors.gray600} size={24} />
        <TextInput placeholderTextColor={props.theme == "dark" ? $colors.gray400 : $colors.gray400} value={props.value} ref={inputRef} secureTextEntry={passwordHidden} style={{
            fontSize: 14,
            color: props.theme == "dark" ? $colors.white : $colors.black,
            flex: 1
        }} onChangeText={props.onChangeText} placeholder={props.placeholder} />
        <Pressable onPress={() => setPasswordHidden(!passwordHidden)}>
            <IconFont name={passwordHidden ? "eyeClose" : "eye"} color={props.theme == "dark" ? $colors.gray400 : $colors.gray600} size={24} />
        </Pressable>
    </View>
})