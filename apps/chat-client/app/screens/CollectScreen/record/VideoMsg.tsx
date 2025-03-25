import { ImageBackground, StyleSheet, View } from "react-native";
import { s } from "app/utils/size";
import { Text } from "app/components";
import { MessageType } from "app/components/chat-ui";
import fileService from "app/services/file.service";
import { IconFont } from "app/components/IconFont/IconFont";
import { colors } from "app/theme";


const RecordVideoMsg = (props: {
    item: MessageType.Video
    themeState: IColors
    onPress?: () => void
}) => {
    const { item, themeState } = props
    const style = styles({ themeState })
    return <View key={item.id + '_collect'} style={style.item}>
        <ImageBackground
                accessibilityRole='image'
                resizeMode={'cover'}
                source={{ uri: fileService.getFullUrl(item.thumbnail) }}
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


export default RecordVideoMsg