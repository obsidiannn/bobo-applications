import { FlashList } from "@shopify/flash-list"
import { EmptyComponent } from "app/components/EmptyComponent"
import LoadingComponent from "app/components/Loading"
import { s } from "app/utils/size"
import { useState } from "react"
import { View, ViewStyle } from "react-native"
import { navigate } from "app/navigators"
import { useTranslation } from "react-i18next"
import ContractListItem from "app/components/ContractListItem"
import { GroupDetailItem } from "@repo/types"
import fileService from "app/services/file.service"


export interface GroupListViewProps {
    theme: 'light' | 'dark';
    groups: GroupDetailItem[]
}
export const GroupListView = (props: GroupListViewProps) => {
    const [loading, setLoading] = useState<boolean>(false)
    const { t } = useTranslation('default')
    const defaultItem = { id: -1 } as GroupDetailItem
    const renderState = () => {
        if (loading) {
            return <LoadingComponent />
        } else {
            return (props.groups.length <= 0) ? <EmptyComponent label={t('No group')} /> : (
                <FlashList
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => "group" + item.id.toString()}
                    estimatedItemSize={s(76)}
                    data={[defaultItem].concat(props.groups)}
                    renderItem={({ item }) => {
                        if (item.id === -1) {
                            return <ContractListItem theme={props.theme} onPress={() => {
                                navigate("GroupInviteRecordScreen")
                            }} icon={require('assets/icons/group-add.svg')} title={t('Group waiting verification')} />
                        }
                        return <ContractListItem
                            theme={props.theme}
                            onPress={async () => {
                                navigate('GroupChatScreen', {
                                    chatId: item.chatId
                                })
                            }}
                            icon={fileService.getFullUrl(item.avatar)}
                            title={item?.name}
                        />;
                    }}
                />
            )
        }
    }

    return <>
        <View style={$container}>
            <View style={{
                flex: 1,
                flexDirection: 'column',
            }}>
                {
                    renderState()
                }
            </View>
        </View>
    </>
}

const $container: ViewStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
}
