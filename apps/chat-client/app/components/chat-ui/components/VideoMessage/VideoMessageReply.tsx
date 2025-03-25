import * as React from 'react'
import { ImageBackground, Text, View } from 'react-native'
import { MessageType, Size } from '../../types'
import { formatDuration, ThemeContext, UserContext } from '../../utils'
import styles from './styles'
import { imageReduce, s } from 'app/utils/size'
import { IconFont } from 'app/components/IconFont/IconFont'
import { colors } from 'app/theme'
import fileService from 'app/services/file.service'

export interface VideoMessageReplyProps {
    message: MessageType.DerivedVideo
    /** Maximum message width */
    messageWidth: number
}

export const VideoMessageReply = ({ message, messageWidth }: VideoMessageReplyProps) => {
    const theme = React.useContext(ThemeContext)
    const user = React.useContext(UserContext)

    const { w, h } = imageReduce(message.width ?? 0, message.height ?? 0, messageWidth)


    const {
        minimizedImageContainer, 
    } = styles({
        aspectRatio: 1,
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
                        justifyContent: 'center',
                        width: w,
                        height: h
                    }
                }
            >
                <View style={{
                    alignSelf: 'center',
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
    )
}
