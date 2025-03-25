import * as React from 'react'
import { ImageBackground, Text, View } from 'react-native'
import { MessageType, Size } from '../../types'
import { formatDuration, ThemeContext, UserContext } from '../../utils'
import styles from './styles'
import { s } from 'app/utils/size'
import { IconFont } from 'app/components/IconFont/IconFont'
import { colors } from 'app/theme'
import fileService from 'app/services/file.service'

export interface VideoMessageProps {
    message: MessageType.DerivedVideo
    /** Maximum message width */
    messageWidth: number
}

/** Image message component. Supports different
 * aspect ratios, renders blurred image as a background which is visible
 * if the image is narrow, renders image in form of a file if aspect
 * ratio is very small or very big. */
export const VideoMessage = ({ message, messageWidth }: VideoMessageProps) => {
    const theme = React.useContext(ThemeContext)
    const user = React.useContext(UserContext)

    const defaultHeight = message.height ?? 0
    const defaultWidth = message.width ?? 0
    const [size, setSize] = React.useState<Size>({
        height: defaultHeight,
        width: defaultWidth,
    })

    const aspectRatio = size.width / (size.height || 1)
    const isMinimized = aspectRatio < 0.1 || aspectRatio > 10
    console.log('size', size);

    const {
        horizontalImage,
        minimizedImage,
        minimizedImageContainer,
        durationText,
        sizeText,
        textContainer,
        verticalImage,
    } = styles({
        aspectRatio,
        message,
        messageWidth,
        theme,
        user,
    })

    return (
        <View style={minimizedImageContainer}>

            <ImageBackground
                accessibilityRole='image'
                resizeMode={'cover'}
                source={{ uri: fileService.getFullUrl(message.thumbnail) }}
                style={
                    {
                        ...(aspectRatio < 1
                            ? verticalImage
                            : horizontalImage),
                        justifyContent: 'center'
                    }
                }
            >
                {/* <Image source={require('../../assets/play.svg')}
                    style={{
                        alignSelf: 'center',
                        width: s(64),
                        height: s(64)
                    }} /> */}
                <View style={{
                    alignSelf: 'center',
                    backgroundColor: 'black',
                    padding: s(10),
                    borderRadius: s(36),
                    opacity: 0.6,
                    borderWidth: s(1),
                    borderColor: colors.palette.neutral100
                }}>
                    <IconFont name='play' size={36} color={colors.palette.neutral100} />
                </View>
                <Text style={durationText}>{formatDuration(message.duration)}</Text>
            </ImageBackground>

        </View>
    )
}
