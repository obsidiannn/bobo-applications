import { Platform, StyleSheet } from 'react-native'

import { MessageType, Theme } from '../../types'
import { s, vs } from 'app/utils/size'

const styles = ({
  currentUserIsAuthor,
  message,
  messageWidth,
  roundBorder,
  theme,
  enableMultiSelect,
  checked
}: {
  currentUserIsAuthor: boolean
  message: MessageType.DerivedAny
  messageWidth: number
  roundBorder: boolean
  theme: Theme
  enableMultiSelect: boolean,
  checked: boolean
}) =>
  StyleSheet.create({
    container: {
      alignSelf: currentUserIsAuthor ? 'flex-end' : 'flex-start',
      justifyContent: currentUserIsAuthor ? (
        enableMultiSelect ? 'space-between' : 'flex-end'
      ) : 'flex-start',
      flex: 1,
      marginBottom: message.type === 'dateHeader' ? 0 : 8 + message.offset,
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
    },
    contentContainer: {
      backgroundColor:
        checked ? theme.colors.pressed : (
          !currentUserIsAuthor || message.type === 'image'
            ? theme.colors.receivedMessageBackground
            : theme.colors.sentMessageBackground
        )
      ,
      borderTopLeftRadius:
        currentUserIsAuthor || roundBorder
          ? theme.borders.messageBorderRadius
          : 0,
      borderTopRightRadius: currentUserIsAuthor
        ? roundBorder
          ? theme.borders.messageBorderRadius
          : 0
        : theme.borders.messageBorderRadius,
      borderColor: 'transparent',
      borderRadius: theme.borders.messageBorderRadius,
      overflow: 'hidden',
      alignSelf: currentUserIsAuthor ? 'flex-end' : 'flex-start',
      // 只针对userCard的处理
      ...(message.type === 'userCard' ? Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          overflow: 'visible',
        },
        android: {
          elevation: 10,
          overflow: 'visible',
        },
      }) : null)
    },
    dateHeader: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: vs(32),
      marginTop: vs(16),
    },
    pressable: {
      maxWidth: messageWidth,
    },
    messageBody: {
    },
    messageHeader: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: currentUserIsAuthor ? 'flex-end' : 'flex-start',
      padding: s(4)
    }
  })

export default styles
