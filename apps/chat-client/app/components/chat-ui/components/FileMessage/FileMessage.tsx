import * as React from 'react'
import { Image, Text, View } from 'react-native'

import { MessageType } from '../../types'
import {
  formatBytes,
  ThemeContext,
  translate,
  UserContext,
} from '../../utils'
import styles from './styles'

export interface FileMessageProps {
  message: MessageType.DerivedFile
  messageWidth: number
}

export const FileMessage = ({ message, messageWidth }: FileMessageProps) => {
  const theme = React.useContext(ThemeContext)
  const user = React.useContext(UserContext)
  const { container, icon, iconContainer, name, size, textContainer } = styles({
    message,
    messageWidth,
    theme,
    user,
  })

  return (
    <View
      accessibilityLabel={translate("chatUI.fileButtonAccessibilityLabel")}
      style={container}
    >
      <View style={iconContainer}>
        {theme.icons?.documentIcon?.() ?? (
          <Image
            source={require('../../assets/icon-document.png')}
            style={icon}
          />
        )}
      </View>
      <View style={textContainer}>
        <Text style={name}>{message.name}</Text>
        <Text style={size}>{formatBytes(message.size)}</Text>
      </View>
    </View>
  )
}
