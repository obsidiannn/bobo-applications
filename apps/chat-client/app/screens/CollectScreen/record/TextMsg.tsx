import { StyleSheet, View } from "react-native";
import { s } from "app/utils/size";
import { Text } from "app/components";
import { MessageType } from "app/components/chat-ui";


const RecordTextMsg = (props: {
    item: MessageType.Text
    themeState: IColors
}) => {
    const { item, themeState } = props
    const style = styles({ themeState })
    return <View key={item.id + '_collect'} style={style.item}>
        <View style={{
            display: 'flex', flexDirection: 'row', alignItems: 'center'
        }}>
            <Text style={style.bottomLabel}>{item.text}</Text>
        </View>
    </View>
}

const styles = (
    { themeState }: { themeState: IColors }
) => StyleSheet.create({
    item: {
    },
    bottomLabel: {
        color: themeState.text,
        fontSize: s(16)
    }
})


export default RecordTextMsg