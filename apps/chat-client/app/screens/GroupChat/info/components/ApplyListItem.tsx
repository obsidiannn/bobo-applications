import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import { GroupApplyItem } from "@repo/types";
import { useTranslation } from 'react-i18next';
import { IModel } from "@repo/enums";
import { s } from "app/utils/size";
import AvatarX from "app/components/AvatarX";
import fileService from "app/services/file.service";
dayjs.extend(relativeTime)
export default (props: {
    item: GroupApplyItem,
    isLast: boolean,
    onCheck: () => void;
    themeColor: IColors
}) => {
    const { item, isLast } = props;
    const { t } = useTranslation('screens')
    const styles = style({ themeColor: props.themeColor })
    return <TouchableOpacity onPress={() => {
        props.onCheck();
    }} style={styles.container}>
        <View style={styles.avatarContainer}>
            <AvatarX uri={fileService.getFullUrl(item.avatar ?? '')} />
        </View>
        <View style={{
            ...styles.rightContainer,
        }}>
            <View style={styles.nameContainer}>
                <Text style={styles.nameText}>{item.name}</Text>
            </View>
            <View style={styles.statusContainer}>
                <Text style={{
                    ...styles.statusText,
                    color: item.status === IModel.IGroup.IGroupMemberStatus.PENDING ? '#009B0F' : props.themeColor.text,
                }}>
                    {item.status === IModel.IGroup.IGroupMemberStatus.PENDING ? t('groupChat.group_status_pending') : null}
                    {item.status === IModel.IGroup.IGroupMemberStatus.NORMAL ? t('groupChat.group_status_added') : null}
                    {item.status === IModel.IGroup.IGroupMemberStatus.REJECTED ? t('groupChat.group_status_rejected') : null}
                </Text>
            </View>
        </View>
    </TouchableOpacity>
}

const style = ({ themeColor }: { themeColor: IColors }) => StyleSheet.create({
    container: {
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

    rightContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        borderBottomWidth: s(0.5),
        borderBottomColor: themeColor.border
    },
    nameContainer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center'
    },
    nameText: {
        fontWeight: '400',
        fontSize: 16,
        color: themeColor.text,
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
