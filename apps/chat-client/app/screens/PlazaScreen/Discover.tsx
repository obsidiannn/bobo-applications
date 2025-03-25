import { StackScreenProps } from "@react-navigation/stack";
import { FlashList } from "@shopify/flash-list";
import Navbar from "app/components/Navbar";
import { s } from "app/utils/size";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native"
import { App } from "types/app";
import { GroupCard } from "./GroupCard";
import groupService from "app/services/group.service";
import { GroupDetailItem } from "../../../../../packages/types/dist/client/group";
import { Search } from "app/components/Search";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";


type Props = StackScreenProps<App.StackParamList, 'DiscoverScreen'>;

export const DiscoverScreen = ({ navigation }: Props) => {
    const themeColor = useRecoilValue(ColorsState)
    const [data, setData] = useState<GroupDetailItem[]>([])
    const [pageState, setPageState] = useState({
        keyword: '',
        page: 0,
        total: 0
    })
    const limit = 10
    const init = useCallback(async (val: string, page?: number, append: boolean = false) => {
        const resp = await groupService.searchGroup(val, page ?? 0, limit)
        console.log('pageGroup', resp);
        const groups = resp.items
        const total = resp.total
        setPageState({
            ...pageState,
            total
        })
        if (append) {
            if (!groups || groups.length <= 0) {
                return
            }
            console.log('items');

            setData((items) => {
                return groups.concat(items);
            })
        } else {
            setData(groups)
        }
    }, [])


    const renderSearch = () => {
        return <View>
            <Search color={themeColor} onSearch={async (val) => {
                setPageState({ keyword: val, page: 0, total: 0 })
                init(val, 0)
            }} />
        </View>
    }

    return <View style={{ flex: 1, backgroundColor: themeColor.background }}>
        <Navbar renderRight={renderSearch} rightStyle={{ flex: 1, alignItems: 'flex-end', marginRight: s(12) }} />
        <View style={{
            padding: s(12),
            flex: 1,
        }}>
            <FlashList
                initialScrollIndex={0}
                data={data}
                keyExtractor={(item, i) => { return "group_" + item.id.toString() }}
                onEndReached={() => {
                    console.log('reach');
                    if (data && (pageState.total > data.length || data.length <= 0)) {
                        init(pageState.keyword, pageState.page + 1, true)
                        setPageState({ ...pageState, page: pageState.page + 1 })
                    }
                }}
                estimatedItemSize={s(40)}
                renderItem={({ item, index }) => {
                    return <View style={{ padding: s(8) }} key={item.id}>
                        <GroupCard group={item} onPress={() => {
                            navigation.navigate('GroupInfoScreen', {
                                group: item
                            })
                        }} />
                    </View>
                }}
            />
        </View>

    </View>
}

const styles = StyleSheet.create({

})
