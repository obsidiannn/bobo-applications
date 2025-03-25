import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import { Image } from "expo-image";

import { IFriendApplies, IUser } from "drizzle/schema";
import { useTranslation } from 'react-i18next';
import { IModel } from "@repo/enums";
import { navigate } from "app/navigators";
import { s } from "app/utils/size";
import fileService from "app/services/file.service";
import { $colors } from "app/Colors";
dayjs.extend(relativeTime)

export default (props: {
    item: IFriendApplies;
    user: IUser;
    isLast: boolean;
    theme?: "light" | "dark";
    renderRight?: () => React.ReactNode;
}) => {
    const { item, isLast, user, renderRight, theme = "dark" } = props;
    const { t } = useTranslation('screens')
    return <TouchableOpacity onPress={() => {
        if (item.status === IModel.IFriendApply.Status.PENDING) {
            navigate('InviteInfoScreen', {
                id: props.item.id
            });
        } else {
            navigate('UserInfoScreen', {
                userId: user.id
            });
        }
    }} style={styles.container}>
        <View style={styles.avatarContainer}>
            <Image source={fileService.getFullUrl(user.avatar ?? '')} style={styles.avatar} />
        </View>
        <View style={{
            ...styles.rightContainer,
            borderBottomColor: isLast ? $colors.white : '#F4F4F4',
        }}>
            <View style={styles.nameContainer}>
                <Text style={[
                    styles.nameText,
                    {
                        color: theme === 'dark' ? $colors.white : $colors.black
                    }
                ]}>{user.nickName}</Text>
            </View>
            <View style={styles.statusContainer}>
                {renderRight ? renderRight() :
                    <Text style={{
                        ...styles.statusText,
                        color: item.status === IModel.IFriendApply.Status.PENDING ? '#009B0F' : '#999',
                    }}>
                        {item.status === IModel.IFriendApply.Status.PASSED && t('friend.status_apply_passed')}
                        {item.status === IModel.IFriendApply.Status.REJECT && t('friend.status_apply_rejected')}
                        {item.status === IModel.IFriendApply.Status.PENDING && t('friend.status_apply_pending')}
                    </Text>
                }
            </View>
        </View>
    </TouchableOpacity>
}

const styles = StyleSheet.create({
    container: {
        height: s(76),
        width: '100%',
        paddingHorizontal: s(16),
        display: 'flex',
        flexDirection: 'row',
    },
    avatarContainer: {
        width: s(57),
        height: s(76),
        display: 'flex',
        justifyContent: 'center',
    },
    avatar: {
        width: s(48),
        height: s(48),
        borderRadius: s(24),
        marginRight: s(10),
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    rightContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    nameContainer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center'
    },
    nameText: {
        fontWeight: '400',
        fontSize: 16,
    },
    statusContainer: {
        width: '30%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    statusText: {
        fontWeight: '400',
        fontSize: 12,
        textAlign: 'left',
        marginRight: s(6),
    }
});
