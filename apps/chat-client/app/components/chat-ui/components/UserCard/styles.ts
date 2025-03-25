import { Platform, StyleSheet } from 'react-native'
import { MessageType, Theme, User } from '../../types'
import { s, vs } from 'app/utils/size'

const styles = ({
    message,
    theme,
    user,
}: {
    message: MessageType.UserCard
    theme: Theme
    user?: User
}) =>
    StyleSheet.create({
        minimizedImageContainer: {
            display: 'flex',
            paddingHorizontal: s(12),
            backgroundColor:
                user?.id === message.author.id
                    ? theme.colors.background
                    : theme.colors.background,
            borderRadius: s(12),
            ...Platform.select({
                // ios: {
                //     shadowColor: '#000',
                //     shadowOffset: { width: 0, height: 2 },
                //     shadowOpacity: 0.7,
                //     shadowRadius: 10,
                // },
                // android: {
                //     elevation: 10,
                // },
            })
        },

    })

export default styles
