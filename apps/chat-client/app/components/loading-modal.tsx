import { verticalScale } from "app/utils/size";
import { forwardRef, useImperativeHandle, useState } from "react"
import { ActivityIndicator, Modal, Text, View } from "react-native"

export interface LoadingModalType {
    open: (title?: string) => void;
    close: () => void;
}
export default forwardRef((_,ref) => {
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState('');
    useImperativeHandle(ref, () => ({
        open: (title?: string) => {
            setVisible(true);
            setTitle(title ?? '');
        },
        close: () => {
            setVisible(false);
        },
    }));
    return <Modal visible={visible} transparent={true} style={{
        flex: 1,
    }}>
        <View style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <ActivityIndicator size="large" color='white' />
            <Text style={{
                color: 'white',
                marginTop: verticalScale(20),
            }}>{title}</Text>
        </View>
    </Modal>
});