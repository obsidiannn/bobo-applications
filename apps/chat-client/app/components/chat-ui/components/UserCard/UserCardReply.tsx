import * as React from 'react'
import { Text, View } from 'react-native'
import { MessageType } from '../../types'
import { ThemeContext, UserContext } from '../../utils'
import styles from './styles'
import { s } from 'app/utils/size'
import { colors } from 'app/theme'
import fileService from 'app/services/file.service'
import AvatarX from 'app/components/AvatarX'

export interface UserCardMessageProps {
    message: MessageType.DerivedUserCard
}

export const UserCardReply = ({ message }: UserCardMessageProps) => {
    const theme = React.useContext(ThemeContext)
    const user = React.useContext(UserContext)

    const {
        minimizedImageContainer,
    } = styles({
        message,
        theme,
        user,
    })

    return (
        <View style={{
            ...minimizedImageContainer,
        }}>
            <View style={{
                padding: s(12),
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomColor: colors.palette.gray300,
                borderBottomWidth: s(0.5),
            }}>
                <AvatarX uri={fileService.getFullUrl(message.avatar)} border />
                <Text style={{
                    color: theme.colors.inputText,
                    fontSize: s(14),
                    fontWeight: '500',
                    marginLeft: s(12)
                }}>{message.username}</Text>
            </View>
            <Text style={{
                margin: s(12),
                color: colors.palette.gray500,
                textAlign: 'left'
            }}>个人名片</Text>
        </View>
    )
}
