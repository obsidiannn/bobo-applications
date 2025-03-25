import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { MessageType, Theme } from '../../types'
import { getUserAvatarNameColor, getUserInitials } from '../../utils'
import AvatarX from 'app/components/AvatarX'
import fileService from 'app/services/file.service'
import { s } from 'app/utils/size'

export const Avatar = React.memo(
  ({
    author,
    currentUserIsAuthor,
    showAvatar,
    showUserAvatars,
    theme,
  }: {
    author: MessageType.Any['author']
    currentUserIsAuthor: boolean
    showAvatar: boolean
    showUserAvatars?: boolean
    theme: Theme
  }) => {
    const renderAvatar = () => {
      const color = getUserAvatarNameColor(
        author,
        theme.colors.userAvatarNameColors
      )
      const initials = getUserInitials(author)
      console.log('[avatar]', author.imageUrl);

      if (author.imageUrl) {

        return (
          <AvatarX uri={fileService.getFullUrl(author.imageUrl ?? '')} />
          // <Image
          //   accessibilityRole='image'
          //   source={{ uri: author.imageUrl }}
          //   style={
          //     {
          //       ...styles.image,
          //       backgroundColor: theme.colors.userAvatarImageBackground
          //     }}
          // />
        )
      } else {
        console.log('miss avatar: ', author);
      }

      return (
        <View style={[styles.avatarBackground, { backgroundColor: 'gray' }]}>
          <Text style={theme.fonts.userAvatarTextStyle}>{initials}</Text>
        </View>
      )
    }

    return showUserAvatars ? (
      <View testID='AvatarContainer' style={{
        ...(currentUserIsAuthor ? { marginHorizontal: s(8) } : { marginHorizontal: s(8) })
      }}>
        {showAvatar ? renderAvatar() : <View style={styles.placeholder} />}
      </View>
    ) : null
  }
)

const styles = StyleSheet.create({
  avatarBackground: {
    alignItems: 'center',
    borderRadius: s(24),
    height: s(48),
    width: s(48),
    justifyContent: 'center',
  },
  image: {
    alignItems: 'center',
    borderRadius: s(24),
    width: s(48),
    height: s(48),
    justifyContent: 'center',
  },
  placeholder: {
    width: s(40),
  },
})
