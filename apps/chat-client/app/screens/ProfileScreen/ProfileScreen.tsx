import { AvatarUpload } from "app/components/AvatarUpload";
import { AuthUser } from "app/stores/auth";
import { ColorsState, ThemeState } from "app/stores/system";
import { s } from "app/utils/size";
import { useTranslation } from "react-i18next";
import { useRecoilState, useRecoilValue } from "recoil";
import { UpdateNickNameModal, UpdateNickNameModalRef } from "./UpdateNickNameModal";
import { UpdateGenderModal, UpdateGenderModalRef } from "./UpdateGenderModal";
import { UpdateSignModal, UpdateSignModalRef } from "./UpdateSignModal";
import { UpdateUserNameModal, UpdateUsernameModalRef } from "./UpdateUserNameModal";
import toast from "app/utils/toast";
import { IModel } from "@repo/enums";
import { AuthService } from "app/services/auth.service";
import fileService from "app/services/file.service";
import { IUser } from "drizzle/schema";
import { LocalUserService } from "app/services/LocalUserService";
import { useRef } from "react"
import { CardMenu } from "app/components/CardMenu/CardMenu";
import { StyleSheet, Text, View } from "react-native";
import profile from "app/utils/profile";
import strUtil from "app/utils/str-util";
import { IconFont } from "app/components/IconFont/IconFont";
import { ScreenX } from "app/components/ScreenX";
export const ProfileScreen = () => {
    const $colors = useRecoilValue(ColorsState);
    const $theme = useRecoilValue(ThemeState);
    const updateNickNameModalRef = useRef<UpdateNickNameModalRef>(null)
    const updateGenderModalRef = useRef<UpdateGenderModalRef>(null)
    const updateSignModalRef = useRef<UpdateSignModalRef>(null)
    const updateUsernameModalRef = useRef<UpdateUsernameModalRef>(null)
    const [authUser, setAuthUser] = useRecoilState(AuthUser)
    const { t } = useTranslation('screens');
    const authUpdate = (user: IUser) => {
        void LocalUserService.addBatch([user])
        setAuthUser(user)
    }

    return <ScreenX theme={$theme} title={t('profile.title_user_profile')} >
        <View style={{
            padding: s(16),
        }}>
            <AvatarUpload avatar={fileService.getFullUrl(authUser?.avatar ?? '')} border onChange={(val: string) => {
                AuthService.updateAvatar(val).then((res) => {
                    if (res) {
                        authUpdate({
                            ...authUser,
                            avatar: res
                        })
                        toast(t('common.success_updated'));
                    } else {
                        toast(t('common.failed_updated'));
                    }
                })
            }} />
        </View>
        <View style={{
            paddingHorizontal: s(16)
        }}>
            <CardMenu theme={$theme} items={[
                {
                    icon: <IconFont name="pencil" color={$colors.text} size={24} />,
                    title: t('profile.title_nickname'),
                    onPress: () => {
                        updateNickNameModalRef.current?.open({
                            value: authUser?.nickName ?? '',
                            callback: (val: string) => {
                                authUpdate({
                                    ...authUser,
                                    nickName: val
                                })
                                toast(t('common.success_updated'));
                            }
                        })
                    },
                    rightArrow: <View style={styles.formLine} >
                        <Text style={{ color: $colors.secondaryText }}>{authUser?.nickName}</Text>
                        <IconFont name="arrowRight" color={$colors.border} size={16} />
                    </View>,
                },
                {
                    icon: <IconFont name="userProfile" color={$colors.text} size={24} />,
                    title: t('profile.title_username'),
                    onPress: () => {
                        updateUsernameModalRef.current?.open({
                            value: authUser?.userName ?? '',
                            callback: (val: string) => {
                                authUpdate({
                                    ...authUser,
                                    userName: val
                                })
                                toast(t('success_updated'));
                            }
                        })
                    },
                    rightArrow: <View style={styles.formLine} >
                        <Text style={{ color: $colors.secondaryText }}>{strUtil.truncateMiddle(authUser?.userName ?? '', 20)}</Text>
                        <IconFont name="arrowRight" color={$colors.border} size={16} />
                    </View>

                },
                {
                    icon: <IconFont name="women" color={$colors.text} size={24} />,
                    title: t('profile.title_gender'),
                    onPress: () => {
                        updateGenderModalRef.current?.open({
                            value: authUser?.gender ?? IModel.IUser.Gender.UNKNOWN,
                            callback: (val: number) => {
                                authUpdate({
                                    ...authUser,
                                    gender: val
                                })
                                toast(t('common.success_updated'));
                            }
                        })
                    },
                    rightArrow: <View style={styles.formLine} >
                        <Text style={{ color: $colors.secondaryText }}>{profile.genderValue(authUser?.gender)}</Text>
                        <IconFont name="arrowRight" color={$colors.border} size={16} />
                    </View>
                },
                {
                    icon: <IconFont name="doc" color={$colors.text} size={24} />,
                    title: t('profile.title_sign'),
                    onPress: () => {
                        updateSignModalRef.current?.open({
                            value: authUser?.sign ?? '',
                            callback: (val: string) => {
                                authUpdate({
                                    ...authUser,
                                    sign: val
                                })
                                toast(t('common.success_updated'));
                            }
                        })
                    },
                    rightArrow: <View style={styles.formLine} >
                        <Text style={{ color: $colors.secondaryText }}>{strUtil.truncateMiddle(authUser?.sign ?? '', 20) ?? t('common.default_label_none')}</Text>
                        <IconFont name="arrowRight" color={$colors.border} size={16} />
                    </View>
                },
            ]} />
        </View>
        <UpdateNickNameModal theme={$theme} ref={updateNickNameModalRef} />
        <UpdateGenderModal theme={$theme} ref={updateGenderModalRef} />
        <UpdateSignModal theme={$theme} ref={updateSignModalRef} />
        <UpdateUserNameModal theme={$theme} ref={updateUsernameModalRef} />
    </ScreenX>
}

const styles = StyleSheet.create({
    formLine: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    }
})
