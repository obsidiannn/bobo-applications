import { StyleSheet, View } from "react-native";
import { CollectItem } from "../Index";
import { s } from "app/utils/size";
import { Text } from "app/components";
import { MessageType, formatBytes } from "app/components/chat-ui";
import { useMemo } from "react";


const RecordFileMsg = (props: {
    item: MessageType.File
    themeState: IColors
    onPress?: () => void
}) => {
    const { item, themeState } = props
    const style = styles({ themeState })
    const fileType = useMemo(() => {
        if (item.name) {
            const nameSplit = item.name.split('.')
            if (nameSplit.length > 0) {
                return nameSplit[nameSplit.length - 1]
            }
        }
        return null
    }, [item.name])
    return <View key={item.id + '_collect'} style={style.item}>
        <View style={{
            display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
        }}>
            <View>
                <Text style={{
                    color: themeState.text,
                    fontSize: s(16),
                }}>
                    {item.name}
                </Text>
                <Text style={style.bottomLabel}>
                    {fileType ?? item.mimeType}  {formatBytes(item.size)}
                </Text>
            </View>
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
        padding: s(12)
    },
    bottomLabel: {
        color: themeState.secondaryText,
        fontSize: s(12)
    }
})


export default RecordFileMsg