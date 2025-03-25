import { ColorsState } from "app/stores/system";
import { s, verticalScale } from "app/utils/size";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRecoilValue } from "recoil";
export interface ConfirmInputOption {
    title: string;
    desc: string;
    defaultVal?: string
    placeholder?: string
    onSubmit?: (val: string) => void;
    onCancel?: () => void;
}
export interface ConfirmInputModalType {
    open: (option: ConfirmInputOption) => void;
}
export default forwardRef((_, ref) => {
    const themeColor = useRecoilValue(ColorsState)
    const [visible, setVisible] = useState(false);
    const { t } = useTranslation('components')
    const [value, setValue] = useState('')
    const [option, setOption] = useState<ConfirmInputOption>({
        title: '',
        desc: '',
        placeholder: ''
    });
    useImperativeHandle(ref, () => ({
        open: async (v: ConfirmInputOption) => {
            setOption(v);
            setVisible(true);
            setValue(v.defaultVal ?? '')
        }
    }));

    return <Modal animationType="fade" transparent={true} visible={visible} style={{
        flex: 1,
    }}>
        <View style={{
            flex: 1,
            backgroundColor: '#00000066',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: s(15),
            flexDirection: 'row',
        }}>
            <View style={{
                flex: 1,
                backgroundColor: themeColor.background,
                paddingVertical: verticalScale(24),
                paddingHorizontal: s(14),
                borderRadius: s(15),
            }}>
                <Text style={{
                    fontSize: s(16),
                    fontWeight: '500',
                    textAlign: 'center',
                    color: themeColor.title
                }}>{option.title}</Text>
                <Text style={{
                    color: themeColor.secondaryText,
                    fontSize: s(14),
                    fontWeight: '400',
                    textAlign: 'center',
                    marginTop: verticalScale(9),
                    marginBottom: verticalScale(24),
                    paddingHorizontal: s(15),
                }}>{option.desc}</Text>

                <TextInput value={value} placeholder={option.placeholder}
                    style={{
                        color: themeColor.text,
                        backgroundColor: themeColor.secondaryBackground,
                        fontSize: s(16),
                        marginHorizontal: s(24),
                        marginBottom: s(14)
                    }}
                    cursorColor={themeColor.text}
                    onChangeText={(v) => {
                        setValue(v)
                    }} />
                <TouchableOpacity onPress={() => {
                    setVisible(false)
                    option.onSubmit && option.onSubmit(value)
                }} style={{
                    borderTopColor: '#F4F4F4',
                    borderTopWidth: verticalScale(1),
                    height: verticalScale(64),
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Text style={{
                        color: '#D90000',
                        fontSize: s(16),
                        fontWeight: '500',
                    }}>{t('confirm.btn_submit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    setVisible(false)
                    option.onCancel && option.onCancel()
                }} style={{
                    borderTopColor: '#F4F4F4',
                    borderTopWidth: verticalScale(1),
                    height: verticalScale(64),
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Text style={{
                        fontSize: s(16),
                        fontWeight: '500',
                    }}>{t('confirm.btn_cancel')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
});
