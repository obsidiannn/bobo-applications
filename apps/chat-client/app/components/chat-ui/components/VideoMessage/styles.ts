import { StyleSheet } from 'react-native'
import { MessageType, Theme, User } from '../../types'
import { s, vs } from 'app/utils/size'

const styles = ({
    aspectRatio,
    message,
    messageWidth,
    theme,
    user,
}: {
    aspectRatio: number
    message: MessageType.Video
    messageWidth: number
    theme: Theme
    user?: User
}) =>
    StyleSheet.create({
        horizontalImage: {
            height: messageWidth / aspectRatio,
            maxHeight: messageWidth,
            width: messageWidth,
        },
        minimizedImage: {
            borderRadius: 15,
            height: vs(64),
            marginLeft: theme.insets.messageInsetsVertical,
            marginRight: s(16),
            marginVertical: theme.insets.messageInsetsVertical,
            width: s(64),
        },
        minimizedImageContainer: {
            display: 'flex',
            alignItems: 'center',
            backgroundColor:
                user?.id === message.author.id
                    ? theme.colors.primary
                    : theme.colors.secondary,
        },
        durationText:
        {
            ...(theme.fonts.receivedMessageBodyTextStyle),
                color: 'white',
                position: 'absolute',
                left: s(10),
                bottom: vs(5)
        },
        sizeText: {
            ...(user?.id === message.author.id
                ? theme.fonts.sentMessageCaptionTextStyle
                : theme.fonts.receivedMessageCaptionTextStyle),
            marginTop: vs(4),
        },
        textContainer: {
            flexShrink: 1,
            marginRight: theme.insets.messageInsetsHorizontal,
            marginVertical: theme.insets.messageInsetsVertical,
        },
        verticalImage: {
            height: messageWidth,
            minWidth: s(170),
            width: messageWidth * aspectRatio,
        },
    })

export default styles
