import { StyleSheet } from 'react-native'

import { Theme } from '../../types'
import { s, vs } from 'app/utils/size'

export default ({ theme }: { theme: Theme }) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      flex: 1,

    },
    emptyComponentContainer: {
      alignItems: 'center',
      marginHorizontal: s(24),
      transform: [{ rotateX: '180deg' }],
    },
    emptyComponentTitle: {
      ...theme.fonts.emptyChatPlaceholderTextStyle,
      textAlign: 'center',
    },
    flatList: {
      backgroundColor: theme.colors.background,
      height: '100%',
    },
    flatListContentContainer: {
      flexGrow: 1,
    },
    footer: {
      height: vs(16),
    },
    footerLoadingPage: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: vs(16),
      height: vs(32),
    },
    header: {
      height: vs(4),
    },
    keyboardAccessoryView: {
      backgroundColor: theme.colors.inputBackground,
      borderTopLeftRadius: theme.borders.inputBorderRadius,
      borderTopRightRadius: theme.borders.inputBorderRadius,
    },
  })
