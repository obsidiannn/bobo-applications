import { IconFont } from "app/components/IconFont/IconFont"
import { s } from "app/utils/size"
import { useRef, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native"

export const SearchTab = (props: {
    chooseIdx: number
    setChooseIdx: (idx: number) => void
    onSearch: (v: string) => void
    themeColor: IColors
}) => {
    const [label, setLabel] = useState<string>('')
    const textInputRef = useRef<TextInput>(null)
    const [open, setOpen] = useState<boolean>(false)
    const style = styles({ themeColor: props.themeColor })
    const choosedStyle = (idx: number) => {
        if (idx === props.chooseIdx) {
            return {
                backgroundColor: props.themeColor.btnChoosed,
                color: props.themeColor.textChoosed
            }
        }
        return {
            color: props.themeColor.text
        }
    }

    const choosedLabel = (idx: number) => {
        if (idx === props.chooseIdx) {
            return {
                color: props.themeColor.textChoosed
            }
        }
        return {
            color: props.themeColor.text
        }
    }
    const changeType = (idx: number) => {
        if (props.chooseIdx === idx) {
            props.setChooseIdx(-1)
        } else {
            props.setChooseIdx(idx)
        }
    }


    const renderButton = () => {
        if (!open) {
            return <View style={{
                display: 'flex', flexDirection: 'row',
                alignItems: 'center',
                padding: s(8),
                justifyContent: 'space-between'
            }}>
                <View style={{
                    display: 'flex', flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <TouchableOpacity style={{
                        ...style.typeButton,
                        ...choosedStyle(1)
                    }} onPress={() => { changeType(1) }}>
                        <Text style={choosedLabel(1)}>最近使用</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        ...style.typeButton,
                        ...choosedStyle(2)
                    }} onPress={() => { changeType(2) }}>
                        <Text style={choosedLabel(2)}>链接</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        ...style.typeButton,
                        ...choosedStyle(3)
                    }} onPress={() => { changeType(3) }}>
                        <Text style={choosedLabel(3)}>图片与视频</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        ...style.typeButton,
                        ...choosedStyle(4)
                    }} onPress={() => { changeType(4) }}>
                        <Text style={choosedLabel(4)}>语音</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={{
                    ...style.typeButton,
                }} onPress={() => { setOpen(true) }}>
                    <IconFont name="arrowRight" color={props.themeColor.text} size={16} />
                </TouchableOpacity>
            </View >
        } else {
            return <View style={{
                display: 'flex', flexDirection: 'column'
            }}>
                <View style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: s(8),
                }}>
                    <View style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }} >
                        <IconFont name="qrcode" size={22} color={props.themeColor.text} />
                        <Text style={{
                            color: props.themeColor.text
                        }}>类型</Text>
                    </View>
                    <TouchableOpacity style={{
                        ...style.typeButton,
                    }} onPress={() => { setOpen(false) }}>
                        <IconFont name="arrowLeft" color={props.themeColor.text} size={16} />
                    </TouchableOpacity>
                </View>
                <View style={{
                    display: 'flex', flexDirection: 'row', padding: s(8), flexWrap: 'wrap'
                }}>
                    <TouchableOpacity style={{
                        ...style.typeButton,
                        ...choosedStyle(1)
                    }} onPress={() => { changeType(1) }}>
                        <Text style={choosedLabel(1)} >最近使用</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        ...style.typeButton,
                        ...choosedStyle(2)
                    }} onPress={() => { changeType(2) }}>
                        <Text style={choosedLabel(2)}>链接</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        ...style.typeButton,
                        ...choosedStyle(3)
                    }} onPress={() => { changeType(3) }}>
                        <Text style={choosedLabel(3)}>图片与视频</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        ...style.typeButton,
                        ...choosedStyle(4)
                    }} onPress={() => { changeType(4) }}>
                        <Text style={choosedLabel(4)}>语音</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        ...style.typeButton,
                        ...choosedStyle(5)
                    }} onPress={() => { changeType(5) }}>
                        <Text style={{ color: props.themeColor.text }}>文件</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        ...style.typeButton,
                        ...choosedStyle(5)
                    }} onPress={() => { changeType(5) }}>
                        <Text style={choosedLabel(5)}>聊天记录</Text>
                    </TouchableOpacity>
                </View>

            </View >
        }
    }

    return <>
        <View style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: props.themeColor.secondaryBackground,
            borderRadius: s(24),
            paddingHorizontal: s(8)
        }}>
            <TextInput
                ref={textInputRef}
                value={label}
                cursorColor={props.themeColor.text}
                style={{
                    flex: 1,
                    color: props.themeColor.text,
                    backgroundColor: props.themeColor.secondaryBackground,
                    borderRadius: s(24),
                    fontSize: s(12),
                    height: s(42),
                }}
                onChangeText={(v) => {
                    setLabel(v)
                }} >

            </TextInput>
            <TouchableOpacity
                onPress={() => {
                    props.onSearch && props.onSearch(label)
                }}
                style={{
                    alignSelf: 'center',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: s(42),
                }}>
                <IconFont name="search" size={32} color={props.themeColor.secondaryText} />
            </TouchableOpacity>
        </View>
        {renderButton()}
    </>
}


const styles = (
    { themeColor }: { themeColor: IColors }
) => StyleSheet.create({
    headerButton: {
    },
    typeButton: {
        color: themeColor.primary,
        padding: s(6),
        borderRadius: s(4),
        marginRight: s(8)
    }
})
