import { StyleSheet, View } from "react-native";
import { CollectItem } from "../Index";
import { s } from "app/utils/size";
import { Text } from "app/components";
import { Image } from "expo-image";
import { MessageType } from "app/components/chat-ui";


const RecordImageMsg = (props: {
    item: MessageType.Image
    themeState: IColors
    onPress?: () => void
}) => {
    const { item, themeState } = props
    const style = styles({ themeState })

    return <View key={item.id + '_collect'} style={style.item}>
          <Image source={item.uri} style={{
                width: s(64),
                height: s(64)
            }} />
    </View>
}

const styles = (
    { themeState }: { themeState: IColors }
) => StyleSheet.create({
    item: {
        
    },
    bottomLabel: {
        color: themeState.secondaryText,
        fontSize: s(12)
    }
})


export default RecordImageMsg