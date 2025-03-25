import * as React from 'react'
import {
  GestureResponderEvent,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'

import { ThemeContext, translate } from '../../utils'
import { colors } from 'app/theme'
import { IconFont } from 'app/components/IconFont/IconFont'
import { s } from 'app/utils/size'

export interface SendButtonPropsAdditionalProps {
  touchableOpacityProps?: TouchableOpacityProps
}

export interface SendButtonProps extends SendButtonPropsAdditionalProps {
  /** Callback for send button tap event */
  onPress: () => void
}

export const SendButton = ({
  onPress,
  touchableOpacityProps,
}: SendButtonProps) => {
  const theme = React.useContext(ThemeContext)

  const handlePress = (event: GestureResponderEvent) => {
    onPress()
    touchableOpacityProps?.onPress?.(event)
  }

  return (
    <TouchableOpacity
      accessibilityLabel={translate('chatUI.btnSend')}
      accessibilityRole='button'
      {...touchableOpacityProps}
      onPress={handlePress}
      style={styles.sendButton}
    >
      <View style={{
        backgroundColor: theme.colors.secondary,
        padding: s(4),
        borderRadius: s(24),
        transform: [{
          rotate: '90deg'
        }]
      }}>
        <IconFont name='send' color={colors.palette.neutral100} />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  sendButton: {
    marginLeft: s(16),
  },
})
