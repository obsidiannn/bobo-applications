import { IModel } from "@repo/enums";
import { Button } from "app/components";
import { IconFont } from "app/components/IconFont/IconFont";
import { ScreenModal, ScreenModalType } from "app/components/ScreenModal";
import { AuthService } from "app/services/auth.service";
import { ColorsState, ThemeState } from "app/stores/system"
import { s } from "app/utils/size";
import { Image } from "expo-image";
import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native"
import { useRecoilValue } from "recoil";


export interface UpdateGenderModalRef {
    open: (
        param: {
            value: number,
            callback: (value: number) => void
        }
    ) => void;

}

export const UpdateGenderModal = forwardRef((props: {
    theme: 'light' | 'dark'
}, ref) => {
    const { t } = useTranslation('screens')

    const themeColor = useRecoilValue(ColorsState)
    const [val, setVal] = useState<number>(IModel.IUser.Gender.UNKNOWN)
    const [loading, setLoading] = useState<boolean>(false)
    const onFinishRef = useRef<(v: number) => void>()

    const screenModalRef = useRef<ScreenModalType>(null);

    const onClose = () => {
        setVal(IModel.IUser.Gender.UNKNOWN)
        setLoading(false)
        screenModalRef.current?.close()
    }

    useImperativeHandle(ref, () => ({
        open: (param: {
            value: number,
            callback: (value: number) => void
        }) => {
            setVal(param.value)
            screenModalRef.current?.open()
            onFinishRef.current = param.callback
        },
    }));

    const renderMale = () => {
        return <TouchableOpacity style={styles.gender_choose} onPress={() => {
            genderChoose(IModel.IUser.Gender.MALE)
        }}>
            {
                val === IModel.IUser.Gender.MALE ?
                    <>
                        <Image source={require('assets/images/male.png')} style={styles.gender_image} contentFit="fill" />
                        <View style={{
                            padding: s(4),
                            backgroundColor: themeColor.primary,
                            borderRadius: s(16),
                            alignItems: 'center', justifyContent: 'center', marginTop: s(-12)
                        }}>
                            <IconFont name="checkMark" color={themeColor.textChoosed} size={16} />
                        </View>
                    </> :
                    <>
                        <Image source={require('assets/images/male-default.png')} style={styles.gender_image} contentFit="fill" />
                        <View style={{ width: s(12), height: s(12) }}></View>
                    </>
            }
            <Text style={styles.gender_label}>{t('profile.status_gender_male')}</Text>

        </TouchableOpacity>
    }


    const renderFemale = () => {
        return <TouchableOpacity style={styles.gender_choose} onPress={() => {
            genderChoose(IModel.IUser.Gender.FEMALE)
        }}>
            {
                val === IModel.IUser.Gender.FEMALE ?
                    <>
                        <Image source={require('assets/images/female.png')} style={styles.gender_image} contentFit="fill" />
                        <View style={{
                            padding: s(4),
                            backgroundColor: themeColor.primary,
                            borderRadius: s(16),
                            alignItems: 'center', justifyContent: 'center', marginTop: s(-12)
                        }}>
                            <IconFont name="checkMark" color={themeColor.textChoosed} size={16} />
                        </View>
                    </> :
                    <>
                        <Image source={require('assets/images/female-default.png')} style={styles.gender_image} contentFit="fill" />
                        <View style={{ width: s(12), height: s(12) }}></View>
                    </>
            }
            <Text style={styles.gender_label}>{t('profile.status_gender_female')}</Text>
        </TouchableOpacity>

    }

    const genderChoose = (chooseVal: number) => {
        setVal(chooseVal)
    }
    return <ScreenModal theme={props.theme} ref={screenModalRef} title={t('profile.title_choose_gender')} >
        <View
            style={{
                flex: 1,
                padding: s(14)
            }}>
            <View style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: s(12),
                marginTop: s(24)
            }}>
                {renderMale()}
                {renderFemale()}
            </View>
            <Button
                theme={props.theme}
                size="large"
                fullRounded
                type="primary"
                onPress={async () => {
                    if (loading) {
                        return;
                    }
                    setLoading(true);

                    await AuthService.updateGender(val)
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
        fontSize: s(14)
    },
    nextButton: {
        height: s(50),
        width: '100%',
        marginTop: s(64),
        borderRadius: s(16),
    },
    nextButtonLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    gender_label: {
        fontSize: s(16),
        fontWeight: '700',
        marginTop: s(8)
    },
    gender_choose: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: s(4)
    },
    gender_image: {
        width: s(120),
        height: s(170)
    }
})
