import { TouchableOpacity, View } from "react-native"
import { useState } from "react"
import { TextInput } from "react-native-gesture-handler"
import { s } from "app/utils/size"
import { IconFont } from "./IconFont/IconFont"

export interface SearchProps {
    onSearch: (val: string) => Promise<void>
    color: IColors
}

export const Search = (props: SearchProps) => {
    const [visible, setVisible] = useState(false)
    const [label, setLabel] = useState<string>('')
    return <View style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    }}>
        {visible ? <TextInput value={label}
            cursorColor={props.color.text}
            style={{
                width: s(120),
                color: props.color.text,
                backgroundColor: props.color.background,
                fontSize: s(12),
                marginRight: s(12),
                borderRadius: s(8),
                height: s(32)
            }}
            onChangeText={(v) => {
                setLabel(v)
            }} /> : null}

        <TouchableOpacity
            onPress={async () => {
                if (visible) {
                    await props.onSearch(label)
                }
                setVisible(!visible)
            }}
            style={{
                backgroundColor: props.color.background,
                padding: s(8),
                borderRadius: s(8),
            }}>
            <IconFont name="search" size={16} color={props.color.text} />
        </TouchableOpacity>
    </View>
}
