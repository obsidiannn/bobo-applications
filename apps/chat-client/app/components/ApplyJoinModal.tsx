import { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import BaseModal from "./base-modal";
import { s, verticalScale } from "app/utils/size";
import { Button } from "./Button";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import groupService from "app/services/group.service";
import toast from "app/utils/toast";
export interface ApplyJoinModalRef {
    open: (gid: number) => void;
}
export default forwardRef<ApplyJoinModalRef>((_, ref) => {
    const [visible, setVisible] = useState(false);
    const [state, setState] = useState(false)
    const [remark, setRemark] = useState('');
    const [gid, setGid] = useState<number>(-1);
    const themeColor = useRecoilValue(ColorsState)
    useImperativeHandle(ref, () => ({
        open: (v: number) => {
            setGid(v);
            setVisible(true);
        }
    }));

    const onClose = () => {
        setRemark('')
        setGid(-1)
        setState(false)
        setVisible(false)
    }

    const { t } = useTranslation('screens')

    return <BaseModal animationType="slide" visible={visible} onClose={onClose} title={t('groupChat.title_apply_join')} styles={{ flex: 1, padding: s(12) }}>
        <View style={styles.contentContainer} >
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={t('groupChat.placeholder_remark')}
                    placeholderTextColor={themeColor.secondaryText}
                    onChangeText={text => setRemark(text)}
                    defaultValue={remark}
                    multiline={true}
                    numberOfLines={5}
                    maxLength={120}
                />
            </View>

        </View>
        <Button disabled={state}
            fullWidth fullRounded
            containerStyle={{
                ...styles.button,
                backgroundColor: themeColor.primary,
                marginBottom: s(24)
            }} onPress={async () => {
                if (state) {
                    return;
                }
                setState(true);
                try {
                    const resp = await groupService.join(gid, remark);
                    if (resp.err) {
                        toast(resp.err);
                    } else {
                        toast(t('groupChat.success_apply_request'));
                    }
                    setTimeout(() => {
                        setVisible(false);
                    }, 500)
                } catch (error) {
                    console.log(error);
                } finally {
                    setState(false);
                }
            }} label={t('groupChat.btn_do_apply')}
            textStyle={{
                ...styles.buttonLabel,
                color: themeColor.textChoosed
            }} />
    </BaseModal>
});
const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
    },
    inputContainer: {
        padding: s(15),
        borderColor: '#F4F4F4',
        borderWidth: 1,
        backgroundColor: '#F8F8F8',
        borderRadius: s(16),
        marginTop: verticalScale(20),
    },
    input: {
        fontSize: 16,
        fontWeight: '400',
        color: '#333',
        height: verticalScale(82),
    },
    buttonContainer: {
        flex: 1,
        paddingHorizontal: s(23),
        marginTop: verticalScale(20),
    },
    button: {
        width: '100%',
        height: verticalScale(50),
        borderRadius: verticalScale(16)
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '700',
    }
});
