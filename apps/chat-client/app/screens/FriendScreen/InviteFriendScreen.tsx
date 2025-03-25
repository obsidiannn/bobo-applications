import { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { useTranslation } from 'react-i18next';
import { App } from "types/app";
import friendApplyService from "app/services/friend-apply.service";
import { Button } from "app/components";
import toast from "app/utils/toast";
import { s, verticalScale } from "app/utils/size";
import { ScreenX } from "app/components/ScreenX";
import { useRecoilValue } from "recoil";
import { ThemeState } from "app/stores/system";
import { $colors } from "app/Colors";

type Props = StackScreenProps<App.StackParamList, 'InviteFriendScreen'>;
export const InviteFriendScreen = ({ navigation, route }: Props) => {
    const [userId, setUserId] = useState<number>();
    const [remark, setRemark] = useState('');
    const $theme = useRecoilValue(ThemeState)
    const [state, setState] = useState(false)
    const { t } = useTranslation('screens')
    useEffect(() => {
        // 監聽頁面獲取焦點
        const unsubscribe = navigation.addListener('focus', () => {
            setUserId(route.params.userId);
        });
        return unsubscribe;
    }, [navigation])
    return <ScreenX title={t('friend.title_invite_info')} theme={$theme}>
        <View>
            <View style={[
                styles.inputContainer,
                { backgroundColor: $theme === 'light'? $colors.slate100 : $colors.slate600  }
            ]}>
                <TextInput
                    style={[
                        styles.input,
                        {
                            color: $theme === 'light'? $colors.slate700 : $colors.slate200,
                        }
                    ]}
                    placeholder={t('friend.placeholder_remark')}
                    onChangeText={text => setRemark(text)}
                    defaultValue={remark}
                    multiline={true}
                    numberOfLines={5}
                    maxLength={120}
                />
            </View>
            <View style={styles.buttonContainer}>
                <Button theme={$theme} size="large" fullWidth fullRounded label={t('friend.btn_send_invite')} onPress={() => {
                    setState(true);
                    if (userId) {
                        friendApplyService.create(userId, remark).then(res => {
                            toast(
                                t('friend.success_send_invite')
                            );
                            setTimeout(() => {
                                navigation.goBack();
                            }, 1000);
                        }).finally(() => {
                            setState(false)
                        })
                    }
                }} />
            </View>
        </View>
    </ScreenX>
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    inputContainer: {
        height: '50%',
        padding: s(15),
        marginHorizontal: s(15),
        borderRadius: s(16),
        marginTop: verticalScale(20),
    },
    input: {
        fontSize: 16,
        fontWeight: '400',
        height: verticalScale(82),
    },
    buttonContainer: {
        paddingHorizontal: s(16),
        marginTop: verticalScale(30),
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
