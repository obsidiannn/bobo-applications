import * as React from 'react'
import {
  GestureResponderEvent,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'

import { ThemeContext, translate } from '../../utils'
import { s } from 'app/utils/size'
import { colors } from 'app/theme'
import { IconFont } from 'app/components/IconFont/IconFont'

export interface AttachmentButtonAdditionalProps {
  touchableOpacityProps?: TouchableOpacityProps
}

export interface AttachmentButtonProps extends AttachmentButtonAdditionalProps {
  /** Callback for attachment button tap event */
  onPress?: () => void
}

export const AttachmentButton = ({
  onPress,
  touchableOpacityProps,
}: AttachmentButtonProps) => {
  const theme = React.useContext(ThemeContext)

  const handlePress = (event: GestureResponderEvent) => {
    onPress?.()
    touchableOpacityProps?.onPress?.(event)
  }

  return (
    <TouchableOpacity
      accessibilityLabel={translate('chatUI.attachmentButtonAccessibilityLabel')}
      accessibilityRole='button'
      {...touchableOpacityProps}
      onPress={handlePress}
    >
      {theme.icons?.attachmentButtonIcon?.() ?? (
        <View style={{
          backgroundColor: theme.colors.secondary,
          padding: s(8),
          borderRadius: s(24)
        }}>
          <IconFont name='plus' size={28} color={colors.palette.neutral100} />
        </View>
      )}
    </TouchableOpacity>
  )
}


