import { StyleSheet, View } from "react-native";
import { CollectItem } from "../Index";
import { s } from "app/utils/size";
import { Text } from "app/components";
import { Image } from "expo-image";
import { MessageType } from "app/components/chat-ui";


const CollectImageMsg = (props: {
    item: CollectItem
    themeState: IColors
    onPress?: () => void
}) => {
    const { item, themeState } = props
    const style = styles({ themeState })
    const data = item.data as MessageType.Image

    return <View key={item.id + '_collect'} style={style.item}>
        <View style={{
            display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
        }}>
            <Image source={data.uri} style={{
                width: s(64),
                height: s(64)
            }} />
        </View>
        <View style={{
            display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            marginTop: s(8)
        }}>
            <Text style={style.bottomLabel}>{item.fromAuthor}</Text>
            <Text style={style.bottomLabel}>{item.createdAt}</Text>
        </View>
    </View>
}

const styles = (
    { themeState }: { themeState: IColors }
) => StyleSheet.create({
    item: {
        backgroundColor: themeState.background,
        borderRadius: s(8),
        marginHorizontal: s(4),
        marginTop: s(12),
        display: 'flex',
        flexDirection: 'column',
        padding: s(12),
        borderBottomWidth:s(0.5),
        borderBottomColor: themeState.border
    },
    bottomLabel: {
        color: themeState.secondaryText,
        fontSize: s(12)
    }
})


export default CollectImageMsg