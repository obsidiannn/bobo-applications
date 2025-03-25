import { ImageBackground, StyleSheet, View } from "react-native";
import { CollectItem } from "../Index";
import { s } from "app/utils/size";
import { Text } from "app/components";
import { MessageType } from "app/components/chat-ui";
import fileService from "app/services/file.service";
import { IconFont } from "app/components/IconFont/IconFont";
import { colors } from "app/theme";


const CollectVideoMsg = (props: {
    item: CollectItem
    themeState: IColors
    onPress?: () => void
}) => {
    const { item, themeState } = props
    const style = styles({ themeState })
    const data = item.data as MessageType.Video
    return <View key={item.id + '_collect'} style={style.item}>
        <View style={{
            display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
        }}>
            <ImageBackground
                accessibilityRole='image'
                resizeMode={'cover'}
                source={{ uri: fileService.getFullUrl(data.thumbnail) }}
                style={
                    {
                        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                        width: s(64), height: s(64)
                    }
                }
            >
                <View style={{
                    alignSelf: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'black',
                    padding: s(4),
                    borderRadius: s(36),
                    opacity: 0.6,
                    borderWidth: s(1),
                    borderColor: colors.palette.neutral100
                }}>
                    <IconFont name='play' size={16} color={colors.palette.neutral100} />
                </View>
            </ImageBackground>
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


export default CollectVideoMsg