import { StyleSheet } from 'react-native'

import { MessageType, Theme, User } from '../../types'
import { colors } from 'app/theme'
import { s, vs } from 'app/utils/size'

const styles = ({
  message,
  theme,
  messageWidth,
  user,
}: {
  message: MessageType.DerivedFile
  theme: Theme
  user?: User
  messageWidth: number
}) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      padding: theme.insets.messageInsetsVertical,
      paddingRight: theme.insets.messageInsetsHorizontal,
      maxWidth: messageWidth
    },
    icon: {
      tintColor:
        user?.id === message.author.id
          ? theme.colors.sentMessageDocumentIcon
          : theme.colors.receivedMessageDocumentIcon,
    },
    iconContainer: {
      alignItems: 'center',
      backgroundColor:
        user?.id === message.author.id
          ? `${String(theme.colors.sentMessageDocumentIcon)}33`
          : `${String(theme.colors.receivedMessageDocumentIcon)}33`,
      borderRadius: 21,
      height: vs(42),
      justifyContent: 'center',
      width: s(42),
    },
    name: {
      ...(user?.id === message.author.id
        ? theme.fonts.sentMessageBodyTextStyle
        : theme.fonts.receivedMessageBodyTextStyle),
      flexWrap: "wrap",
      maxWidth: messageWidth

    }
    ,
    size: {
      ...(user?.id === message.author.id
        ? theme.fonts.sentMessageCaptionTextStyle
        : theme.fonts.receivedMessageCaptionTextStyle),
      color: colors.palette.gray400,
      marginTop: vs(4),
    },
    textContainer: {
      flexShrink: 1,
      marginLeft: s(16),
    },
  })

export default styles
