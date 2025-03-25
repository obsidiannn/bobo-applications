import { FlashList } from "@shopify/flash-list"
import { EmptyComponent } from "app/components/EmptyComponent"
import LoadingComponent from "app/components/Loading"
import { s } from "app/utils/size"
import { useState } from "react"
import { View, ViewStyle } from "react-native"
import { navigate } from "app/navigators"
import { IUser } from "drizzle/schema"
import ContractListItem from "app/components/ContractListItem"
import fileService from "app/services/file.service"


export interface FriendListViewProps {
  contacts: IUser[]
  theme: 'light' | 'dark'
}

export const FriendListView = (props: FriendListViewProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const defaultItem = { id: -1 } as IUser
  const renderList = () => {
    return <View style={{
      flex: 1,
      width: '100%',
      flexDirection: 'column',
    }}>
      <ContractListItem theme={props.theme} onPress={() => {
        navigate("FriendInviteRecordScreen")
      }} icon={require('assets/icons/friend-add.svg')} bottomLine={props.contacts.length > 1} title="新的好友" />
      <View style={{
        marginBottom: s(14)
      }}></View>
      {
        renderState()
      }
    </View>
  }


  const renderState = () => {
    if (loading) {
      return <LoadingComponent />
    } else {
      return props.contacts.length <= 0 ? <EmptyComponent /> : (
        <FlashList
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => "friend" + item.id.toString()}
          estimatedItemSize={s(76)}
          data={[defaultItem].concat(props.contacts)}
          renderItem={({ item, index }) => {
            if (item.id === -1) {
              return <ContractListItem theme={props.theme} onPress={() => {
                navigate("FriendInviteRecordScreen")
              }} icon={require('assets/icons/friend-add.svg')} bottomLine={props.contacts.length > 1} title="新的好友" />
            }
            return <ContractListItem theme={props.theme} onPress={async () => {
              navigate('UserChatScreen', {
                chatId: item.chatId,
              })
            }}
              icon={fileService.getFullUrl(item.avatar ?? '')}
              title={item?.friendAlias ?? item.nickName ?? item.userName}
              bottomLine={props.contacts.length > 1 && index < props.contacts.length - 1} />;
          }}
        />
      )
    }
  }

  return <>
    <View style={$container}>
      {
        renderState()
      }
    </View>
  </>
}

const $container: ViewStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
}