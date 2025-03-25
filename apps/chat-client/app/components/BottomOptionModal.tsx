import { s, verticalScale } from "app/utils/size";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export interface BottomOptionModalProps {
    items: {
        title: string;
        onPress: () => void;
    }[],
    onCancel?: () => void;
}
export interface BottomOptionModalType {
    open: () => void;
}
export default forwardRef((props: BottomOptionModalProps, ref) => {
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);
    const { items, onCancel } = props;
    const { t } = useTranslation('components')
    useImperativeHandle(ref, () => ({
        open: () => setVisible(true)
    }));
    return <Modal animationType="fade" transparent={true} visible={visible} style={{
        flex: 1,
    }}>
        <View style={{
            flex: 1,
            backgroundColor: '#00000066',
            justifyContent: 'center',
            alignItems: 'flex-end',
            flexDirection: 'row',
        }}>
            <View style={{
                flex: 1,
                backgroundColor: 'white',
                paddingTop: verticalScale(13),
                borderTopLeftRadius: s(15),
                borderTopRightRadius: s(15),
                paddingBottom: insets.bottom,
            }}>
                <View style={{
                    display: 'flex',
                }}>
                    {items.map((item, index) => {
                        return <Pressable onPress={() => {
                            console.log('onPress')
                            setVisible(false)
                            item.onPress()
                        }} style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: verticalScale(66),
                        }} key={index}>
                            <Text style={{
                                color: '#333',
                                fontSize: s(16),
                                fontWeight: '500',
                            }}>{item.title}</Text>
                        </Pressable>
                    })}
                    <Pressable onPress={() => {
                        console.log('onPress cancel')
                        setVisible(false)
                        onCancel && onCancel()
                    }} style={{
                        height: verticalScale(66),
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Text style={{
                            color: '#D90000',
                            fontSize: s(16),
                            fontWeight: '500',
                        }}>{t('confirm.btn_cancel')}</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    </Modal>
});
