import { Pressable, StyleSheet, View } from "react-native";
import { CollectItem } from "../Index";
import { s } from "app/utils/size";
import { Text } from "app/components";
import { MessageType } from "app/components/chat-ui";
import AvatarX from "app/components/AvatarX";
import fileService from "app/services/file.service";


const CollectUserCardMsg = (props: {
    item: CollectItem
    themeState: IColors
    onPress?: () => void
}) => {
    const { item, themeState } = props
    const style = styles({ themeState })
    const data = item.data as MessageType.UserCard

    return <View key={item.id + '_collect'} style={style.item}>
        <Pressable style={{
            backgroundColor: props.themeState.secondaryBackground,
            borderRadius: s(8),
            padding: s(12),

        }} onPress={() => {
            props.onPress && props.onPress()
        }}>
            <View style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomColor: props.themeState.border,
                borderBottomWidth: s(0.5),
                padding: s(8),
            }}>
                <AvatarX uri={fileService.getFullUrl(data.avatar)} border size={32} />
                <Text style={{
                    color: props.themeState.text,
                    fontSize: s(12),
                    fontWeight: '500',
                    marginLeft: s(8)
                }}>{data.username}</Text>
            </View>
            <Text style={{
                margin: s(8),
                color: props.themeState.secondaryText,
                textAlign: 'left'
            }}>个人名片</Text>
        </Pressable>

    </View>
}

const styles = (
    { themeState }: { themeState: IColors }
) => StyleSheet.create({
    item: {
        backgroundColor: themeState.background,
        marginHorizontal: s(4),
        marginTop: s(12),
        display: 'flex',
        flexDirection: 'column',
        padding: s(12),
        borderBottomWidth: s(0.5),
        borderBottomColor: themeState.border
    },
    bottomLabel: {
        color: themeState.secondaryText,
        fontSize: s(12)
    }
})


export default CollectUserCardMsg