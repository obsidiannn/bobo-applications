
import { Pressable, TouchableOpacity, StyleSheet, Text, View, GestureResponderEvent, Platform } from "react-native"
import { forwardRef, useImperativeHandle, useState } from "react";
import { MessageType } from "./chat-ui";
import { s } from "app/utils/size";
import * as clipboard from 'expo-clipboard';
import { IconFont } from "./IconFont/IconFont";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import toast from "app/utils/toast";
import { useTranslation } from "react-i18next";

interface LongPressProps {
    // 删除回调
    onDelete?: (msgId: string) => void
    // 关闭回调
    onClose?: (msgId: string) => void
    // 多选回调
    onMulti?: (msgId: string, multi: boolean) => void
    // 回复回调
    onReply?: (data: MessageType.Any) => void
    onCollect?: (data: MessageType.Any) => void
}

export interface LongPressModalType {
    open: (params: {
        message: MessageType.Any,
        e: GestureResponderEvent,
    }) => void;
}

export default forwardRef((props: LongPressProps, ref) => {
    const [visible, setVisible] = useState(false)
    const [layout, setLayout] = useState<number[]>([])
    const [height, setHeight] = useState<number>(0)
    const themeColor = useRecoilValue(ColorsState)
    const [message, setMessage] = useState<MessageType.Any | null>(null)
    const { t } = useTranslation('components')

    const openModal = () => {
        setVisible(true)
    }

    const closeModal = () => {
        if (props.onClose && message) {
            props.onClose(message.id)
        }
        setVisible(false)
        setLayout([])
        setMessage(null)
        props.onMulti && props.onMulti(message?.id ?? '', false)
    }

    useImperativeHandle(ref, () => ({
        open: (params: {
            message: MessageType.Any,
            e: GestureResponderEvent
        }) => {
            params.e.target.measureInWindow((x, y, w, h) => {
                console.log('layout', x, y, w, h);
                setLayout([x, y, w, h])
            })
            setMessage(params.message)
            openModal()
        }
    }));

    return <>
        {visible ? (
            <Pressable style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
            }}
                onPress={() => {
                    console.log('close');
                    closeModal()
                }}
            >
                <View
                    onLayout={(e) => {
                        setHeight(e.nativeEvent.layout.height)
                    }}
                    // onStartShouldSetResponderCapture={(ev) => { return true }}
                    style={{
                        ...styles.modal_container,
                        ...(layout.length > 0 ? {
                            top: layout[1] - height
                        } : {}),
                        backgroundColor: themeColor.background
                    }}
                >
                    <TouchableOpacity style={styles.line_button_style} onPress={() => {
                        if (message && message.type === 'text') {
                            clipboard.setStringAsync(message.text ?? '').then(res => {
                                toast(t('common.labelSuccessCopied'));
                            })
                        }
                    }}>
                        <IconFont name="copy" color={themeColor.text} size={32} />
                        <Text style={{ color: themeColor.text }}>{t('longPressModal.btnCopy')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.line_button_style}>
                        <IconFont name="share" color={themeColor.text} size={32} />
                        <Text style={{ color: themeColor.text }}>{t('longPressModal.btnShare')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.line_button_style} onPress={() => {
                        if (message) {
                            setVisible(false)
                            setLayout([])
                            setMessage(null)
                            props.onReply && props.onReply(message)
                        }
                    }}>
                        <IconFont name="quote" color={themeColor.text} size={32} />
                        <Text style={{ color: themeColor.text }}>{t('longPressModal.btnReply')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.line_button_style} onPress={() => {
                        setVisible(false)
                        setLayout([])
                        setMessage(null)
                        props.onMulti && props.onMulti(message?.id ?? '', true)
                    }}>
                        <IconFont name="multipleSelection" color={themeColor.text} size={32} />
                        <Text style={{ color: themeColor.text }}>{t('longPressModal.btnMultiSelect')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.line_button_style, { marginRight: 0 }]}
                        onPress={() => {
                            if (message) {
                                props.onDelete && props.onDelete(message.id)
                            }
                        }}>
                        <IconFont name="trash" color={themeColor.text} size={32} />
                        <Text style={{ color: themeColor.text }}>{t('longPressModal.btnRemove')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.line_button_style} onPress={() => {
                        if (message) {
                            setVisible(false)
                            setLayout([])
                            setMessage(null)
                            props.onCollect && props.onCollect(message)
                        }
                    }}>
                        <IconFont name="multipleSelection" color={themeColor.text} size={32} />
                        <Text style={{ color: themeColor.text }}>{t('longPressModal.btnCollect')}</Text>
                    </TouchableOpacity>
                </View>

            </Pressable>
        ) : null}

    </>


})


const styles = StyleSheet.create({
    modal_container: {
        backgroundColor: '#ffffff',
        position: 'absolute',

        display: 'flex',
        flexDirection: 'row',
        // alignItems: 'center',
        alignSelf: 'center',
        // justifyContent: 'space-around',
        padding: s(8),
        borderRadius: s(16),
        borderBottomEndRadius: 0,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
            },
            android: {
                elevation: 10,
            },
        }),

    },
    line_button_style: {
        padding: s(8),
        alignItems: 'center',
        marginRight: s(6)
    },
    icon_btn: {
        width: 32, height: 32,
        tintColor: '#4b5563',
    }
})
