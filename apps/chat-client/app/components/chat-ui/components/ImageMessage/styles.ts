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
  message: MessageType.Image
  messageWidth: number
  theme: Theme
  user?: User
}) =>
  StyleSheet.create({
    minimizedImage: {
      borderRadius: 15,
      height: vs(64),
      marginLeft: theme.insets.messageInsetsVertical,
      marginRight: s(16),
      marginVertical: theme.insets.messageInsetsVertical,
      width: s(64),
    },
    minimizedImageContainer: {
      alignItems: 'center',
      backgroundColor:
        user?.id === message.author.id
          ? theme.colors.primary
          : theme.colors.secondary,
      flexDirection: 'row',
    },
    nameText:
      user?.id === message.author.id
        ? theme.fonts.sentMessageBodyTextStyle
        : theme.fonts.receivedMessageBodyTextStyle,
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
  
  })

export default styles
