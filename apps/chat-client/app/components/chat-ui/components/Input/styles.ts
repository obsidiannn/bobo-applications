import { StyleSheet } from 'react-native'

import { Theme } from '../../types'
import { s, vs } from 'app/utils/size'

export default ({ theme }: { theme: Theme }) =>
  StyleSheet.create({
    multiContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingHorizontal: s(20),
      paddingVertical: vs(10),
      backgroundColor: theme.colors.inputValueBackground,
      borderRadius: s(36),
      margin: s(12)
    },
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: s(20),
      paddingVertical: vs(10),
      backgroundColor: theme.colors.inputValueBackground,
      borderRadius: s(36),
    },
    input: {
      ...theme.fonts.inputTextStyle,
      color: theme.colors.inputText,
      flex: 1,
      maxHeight: vs(100),
      // Fixes default paddings for Android
      borderRadius: s(8),
      backgroundColor: theme.colors.inputValueBackground,
      paddingBottom: s(5),
      paddingLeft: s(8),
      paddingTop: vs(5),
    },
    marginRight: {
      marginRight: s(16),
    },
  })
