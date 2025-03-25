import { FlashList } from "@shopify/flash-list"
import ConversationItem from "app/components/ConversationItem"
import { EmptyComponent } from "app/components/EmptyComponent"
import { formatDate } from "app/utils/formatDate"
import { s } from "app/utils/size"
import { useEffect, useMemo } from "react"
import { View, ViewStyle } from "react-native"
import dayjs from 'dayjs'
import { useRecoilValue } from "recoil"
import { ChatsStore } from "app/stores/auth"
import { IModel } from "@repo/enums"
import { ChatDetailItem } from "@repo/types"
import { navigate } from "app/navigators"
import { useTranslation } from "react-i18next"

export interface ChatViewProps {
    theme: 'light' | 'dark'
}
export const ChatListView = (props: ChatViewProps) => {
    const { t } = useTranslation('default')
    const chats = useRecoilValue(ChatsStore)
    useEffect(()=>{
        console.log('chats', chats)
    },[])
    const { topChats, normalChats } = useMemo(() => {
        const topChats: ChatDetailItem[] = []
        const normalChats: ChatDetailItem[] = []

        chats.forEach(c => {
            if (c.isTop === IModel.ICommon.ICommonBoolEnum.YES) {
                topChats.push(c)
            } else {
                normalChats.push(c)
            }
        })
        return {
            topChats, normalChats
        }
    }, [chats])
    const getOnlineStatus = (item: ChatDetailItem): boolean | undefined => {
        if (item.type === IModel.IChat.IChatTypeEnum.NORMAL) {
            return true
        }
        return undefined
    }

    const itemPress = (item: ChatDetailItem) => {
        if (item.type === IModel.IChat.IChatTypeEnum.NORMAL) {
            navigate('UserChatScreen', {
                chatId: item.id
            })
        } else if (item.type === IModel.IChat.IChatTypeEnum.GROUP) {
            navigate('GroupChatScreen', {
                chatId: item.id
            })
        } else if (item.type === IModel.IChat.IChatTypeEnum.OFFICIAL) {
            // console.log('official item', item);
            // navigate('OfficialChat', {
            //     item
            // })
        }
    }
    const renderItem = (item: ChatDetailItem, isLast: boolean) => {
        const unread = item.lastSequence - item.lastReadSequence
        const online = getOnlineStatus(item)
        return <ConversationItem
            theme={props.theme}
            key={item.id}
            badgeNumber={unread}
            bottomLine={!isLast}
            icon={item.avatar}
            title={item.chatAlias}
            describe={item.describe}
            subTitle={formatDate(dayjs().toISOString())}
            online={online}
            inhibite={item.isMute === IModel.ICommon.ICommonBoolEnum.YES}
            onPress={() => itemPress(item)}
        />
    }

    return <View style={$container}>
        {chats.length <= 0 ? <EmptyComponent label={t('No recent conversations')} /> :
            <View style={{ flex: 1, width: '100%' }}>
                <FlashList
                    keyExtractor={(item) => item.id}
                    data={topChats.concat(normalChats)}
                    renderItem={({ item, index }) => renderItem(item, index === chats.length - 1)}
                    estimatedItemSize={s(76)}
                    showsVerticalScrollIndicator={false}
                />
            </View>}
    </View>
}

const $container: ViewStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
}