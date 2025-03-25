import * as React from 'react'
import { Image, StyleSheet, View } from 'react-native'

import { MessageType, Theme } from '../../types'
import { CircularActivityIndicator } from '../CircularActivityIndicator'
import { IconFont } from 'app/components/IconFont/IconFont'
import { colors } from 'app/theme'
import { s, vs } from 'app/utils/size'

export const StatusIcon = React.memo(
  ({
    currentUserIsAuthor,
    showStatus,
    status,
    theme,
  }: {
    currentUserIsAuthor: boolean
    showStatus: boolean
    status?: MessageType.Any['status']
    theme: Theme
  }) => {
    let statusIcon: React.ReactNode | null = null

    if (showStatus) {
      switch (status) {
        case 'delivered':
        case 'sent':
          statusIcon = theme.icons?.deliveredIcon?.() ?? (
            <IconFont name='checkMark' color={colors.palette.green300} size={24} />
          )
          break
        case 'error':
          statusIcon = theme.icons?.errorIcon?.() ?? (
            <IconFont name='circleClose' color={theme.colors.error} size={24} />
          )
          break
        case 'seen':
          statusIcon = theme.icons?.seenIcon?.() ?? (
            <Image
              source={require('../../assets/icon-seen.png')}
              style={{ tintColor: theme.colors.primary }}
              testID='SeenIcon'
            />
          )
          break
        case 'sending':
          statusIcon = theme.icons?.sendingIcon?.() ?? (
            <CircularActivityIndicator color={theme.colors.primary} size={10} />
          )
          break
        default:
          break
      }
    }

    return currentUserIsAuthor ? (
      <View style={styles.container} testID='StatusIconContainer'>
        {statusIcon}
      </View>
    ) : null
  }
)

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: vs(16),
    justifyContent: 'center',
    paddingHorizontal: s(4),
    width: s(16),
  },
})
