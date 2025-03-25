import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import * as clipboard from 'expo-clipboard';
import { IUser } from "drizzle/schema";
import { useTranslation } from 'react-i18next';
import toast from "app/utils/toast";
import { s, verticalScale } from "app/utils/size";
import { isOnline } from "app/utils/account";
import { IModel } from "@repo/enums";
import strUtil from "app/utils/str-util";
import { IconFont } from "app/components/IconFont/IconFont";
import fileService from "app/services/file.service";
import AvatarX from "app/components/AvatarX";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { $colors } from "app/Colors";

export default (props: {
    user: IUser;
    theme: 'dark' | 'light';
}) => {
    const { user } = props;
    const { t } = useTranslation('screens')
    const themeColor = useRecoilValue(ColorsState)
    const styles = style({ themeColor })
    return <View style={{
        ...styles.container,
        backgroundColor: themeColor.background
    }}>
        <View style={styles.infoBox}>
            <View style={{
                marginTop: s(-40)
            }}>
                <AvatarX border size={64}
                    online={isOnline(user.updatedAt?.valueOf() ?? 0)}
                    uri={fileService.getFullUrl(user.avatar ?? '')} />
            </View>
            <View style={styles.rightContainer}>
                <Text style={[styles.nameText, { color: props.theme == 'dark' ? $colors.white : $colors.black }]}>{user.friendAlias ?? user.nickName}</Text>
                {
                    user.gender !== IModel.IUser.Gender.UNKNOWN ?
                        (
                            <IconFont name={user.gender === IModel.IUser.Gender.MALE ? "men" : "women"} color={themeColor.text} />
                        ) : null
                }

            </View>

            <TouchableOpacity style={styles.infoContainer} onPress={async () => {
                await clipboard.setStringAsync(user.userName ?? '');
                toast(t('userInfo.success_copied'));
            }}>
                <Text style={[
                    styles.signText,
                    {
                        color: props.theme == 'dark' ? $colors.gray400 : $colors.gray500,
                    }
                ]}>@{strUtil.truncateMiddle(user.userName ?? "", 30)}</Text>
                <IconFont name={"copy"} color={props.theme == 'dark' ? $colors.white : $colors.gray400} size={16} />
            </TouchableOpacity>
        </View>
        <View style={[
            styles.signContainer,
            {
                backgroundColor: props.theme == 'dark' ? $colors.slate800 : $colors.gray100
            }
        ]}>
            <Text style={{
                ...styles.signText,
                color: $colors.gray500,
                paddingVertical: s(12)
            }}>{!user.sign ? t('userInfo.label_empty') : user.sign}</Text>
        </View>
    </View>
};

const style = ({ themeColor }: { themeColor: IColors }) => StyleSheet.create({
    container: {
        borderRadius: s(16),
        padding: s(16),
    },
    infoBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    rightContainer: {
        borderColor: '#F0F0F0',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: s(24)
    },
    nameText: {
        fontSize: s(30),
        fontWeight: '500',
        color: themeColor.text
    },
    infoContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: s(24),
        padding: s(4)
    },
    copyIcon: {
        width: s(24),
        height: s(24),
    },
    line: {
        height: 1,
        backgroundColor: '#ECECEC',
        marginLeft: s(50),
        marginTop: verticalScale(15),
        marginBottom: verticalScale(10),
    },
    signContainer: {
        padding: s(12),
        minHeight: s(64),
        marginTop: s(24),
        borderRadius: s(14)

    },
    signText: {
        fontSize: s(16),
        fontWeight: '400',
        flexWrap: 'wrap',
        color: themeColor.secondaryText,
        marginRight: s(4)
    }
});
