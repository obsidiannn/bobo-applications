import { StyleSheet, Text, View, TextInput } from "react-native"
import { Button } from "app/components";
import { ScreenModal, ScreenModalType } from "app/components/ScreenModal";
import { AuthService } from "app/services/auth.service";
import { ColorsState } from "app/stores/system";
import { s, verticalScale } from "app/utils/size";
import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { useTranslation } from "react-i18next";
import { useRecoilValue } from "recoil";


export interface UpdateUsernameModalRef {
    open: (
        param: {
            value: string,
            callback: (value: string) => void
        }
    ) => void;

}
export const UpdateUserNameModal = forwardRef((props: {
    theme: 'light' | 'dark'
}, ref) => {
    const maxLength = 60
    const { t } = useTranslation('screens')
    const [val, setVal] = useState('')
    const [loading, setLoading] = useState<boolean>(false)
    const onFinishRef = useRef<(v: string) => void>()
    const themeColor = useRecoilValue(ColorsState)

    const screenModalRef = useRef<ScreenModalType>(null);
    const onClose = () => {
        setVal('')
        setLoading(false)
        screenModalRef.current?.close()
    }

    useImperativeHandle(ref, () => ({
        open: (param: {
            value: string,
            callback: (value: string) => void
        }) => {
            console.log('open');

            setVal(param.value)
            screenModalRef.current?.open()
            onFinishRef.current = param.callback
        },
    }));

    const handleTextChange = (input: string) => {
        // 正则表达式，只允许输入英文字符和数字
        const validText = input.replace(/[^a-zA-Z0-9]/g, '');
        setVal(validText);
    };

    return <ScreenModal theme={props.theme} ref={screenModalRef} title={t('profile.title_username')}>
        <View style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingHorizontal: s(16)
        }}>
            <View style={{
                flex: 1,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: s(22)
            }}>
                <TextInput
                    cursorColor={themeColor.text}
                    placeholder={t('profile.placeholder_nickname')}
                    placeholderTextColor={themeColor.border}
                    maxLength={maxLength}
                    style={{
                        height: verticalScale(44),
                        color: themeColor.text,
                        backgroundColor: themeColor.secondaryBackground,
                        width: '100%',
                        borderRadius: s(12),
                        paddingLeft: s(14)
                    }}
                    onChangeText={(v) => {
                        handleTextChange(v)
                    }}
                    value={val}
                />
                <Text style={{
                    color: themeColor.border,
                    alignSelf: 'flex-end',
                    fontSize: s(12),
                    marginVertical: s(8),
                    marginRight: s(4)
                }}>
                    {val.length}/{maxLength}
                </Text>

                <View style={{
                    marginTop: s(32),
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    padding: s(12),
                }}>

                    <Text style={{
                        ...styles.paragraph,
                        color: themeColor.secondaryText
                    }}>
                        * {t('profile.paragraph_username_1')}
                    </Text>

                </View>

                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    padding: s(12)
                }}>

                    <Text style={{
                        ...styles.paragraph,
                        color: themeColor.secondaryText
                    }}>
                        * {t('profile.paragraph_username_2')}
                    </Text>

                </View>

                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    padding: s(12)
                }}>

                    <Text style={{
                        ...styles.paragraph,
                        color: themeColor.secondaryText
                    }}>
                        * {t('profile.paragraph_username_3')}
                    </Text>

                </View>
            </View>

            <Button
                theme={props.theme}
                size="large"
                fullRounded
                fullWidth
                type="primary"
                containerStyle={{
                    marginBottom: s(24)
                }}
                onPress={async () => {
                    if (loading) {
                        return;
                    }
                    if (val.length > maxLength) {
                        return
                    }
                    setLoading(true);

                    await AuthService.updateUserName(val)
                        .then(() => {
                            onFinishRef.current && onFinishRef.current(val)
                        }).catch(() => { })
                        .finally(() => {
                            onClose()
                        })
                }}
                label={t('common.btn_submit')}
            />
        </View>

    </ScreenModal>
})


const styles = StyleSheet.create({
    paragraph: {
        fontSize: s(14),
    },
    nextButton: {
        height: s(50),
        width: '100%',
        marginTop: s(64),
        borderRadius: s(16),
    },
    nextButtonLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
})
