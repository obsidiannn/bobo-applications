import { StackScreenProps } from "@react-navigation/stack";
import { FlashList } from "@shopify/flash-list";
import ContractListItem from "app/components/ContractListItem";
import fileService from "app/services/file.service";
import friendService from "app/services/friend.service";
import { s } from "app/utils/size";
import { IUser } from "drizzle/schema";
import { useCallback, useRef, useState } from "react";
import { App } from "types/app";
import UserBlockModal, { UserBlockModalType } from "./UserBlockModal";
import { ScreenX } from "app/components/ScreenX";
import { useRecoilValue } from "recoil";
import { ThemeState } from "app/stores/system";

type Props = StackScreenProps<App.StackParamList, 'UserBlockScreen'>;

export const UserBlockScreen = (props: Props) => {
    const $theme = useRecoilValue(ThemeState)

    const [users, setUsers] = useState<IUser[]>([])
    const userBlockModalRef = useRef<UserBlockModalType>(null)
    const loadData = useCallback(async () => {
        const list = await friendService.getBlockedList()
        console.log('block users ', list);

        setUsers(list)
    }, [])

    return <ScreenX title="黑名单" theme={$theme} >
        <FlashList
            // ref={listRef}
            onEndReached={loadData}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => "friend" + item.id.toString()}
            estimatedItemSize={s(76)}
            data={users}
            contentContainerStyle={{
                paddingHorizontal: s(8)
            }}
            renderItem={({ item, index }) => {
                return <ContractListItem
                    theme={$theme}
                    onPress={async () => {
                        userBlockModalRef.current?.open(item)
                    }}
                    icon={fileService.getFullUrl(item.avatar ?? '')}
                    title={item?.friendAlias ?? item.nickName ?? item.userName}
                    secondTitle={item.sign ?? ''}
                    bottomLine={users.length > 1 && index < users.length - 1} />;
            }}
        />
        <UserBlockModal ref={userBlockModalRef} />
    </ScreenX>
}


// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: 'white',
//     },
// });
