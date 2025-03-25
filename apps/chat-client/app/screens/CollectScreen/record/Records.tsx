import { Pressable, StyleSheet, View } from "react-native";
import { CollectItem, CollectRecord } from "../Index";
import { s } from "app/utils/size";
import { Text } from "app/components";


const CollectRecords = (props: {
    item: CollectItem
    themeState: IColors
    onPress?: () => void
}) => {
    const { item, themeState } = props
    const style = styles({ themeState })
    const data = item.data as CollectRecord[]

    const renderList = () => {
        if (data.length > 3) {
            const _list = data.slice(0, 3).map(d => {
                return <View>
                    <Text style={style.textLine}>{d.name} : {d.title}</Text>
                </View>
            })
            return <>
                {_list}
                <Text>...</Text>
            </>
        } else {
            return data.map(d => {
                return <View>
                    <Text style={style.textLine}>{d.name} : {d.title}</Text>
                </View>
            })
        }
    }

    return <Pressable key={item.id + '_collect'} style={style.item} onPress={() => {
        props.onPress && props.onPress()
    }}>
        <View style={{
            display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
        }}>
            <View>
                <Text style={{
                    color: themeState.text,
                    fontSize: s(16),
                }}>
                    {props.item.title}
                </Text>
                {renderList()}
            </View>


        </View>
        <View style={{
            display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            marginTop: s(8)
        }}>
            <Text style={style.bottomLabel}>{item.fromAuthor}</Text>
            <Text style={style.bottomLabel}>{item.createdAt}</Text>
        </View>
    </Pressable>
}

const styles = (
    { themeState }: { themeState: IColors }
) => StyleSheet.create({
    item: {
        backgroundColor: themeState.background,
        borderRadius: s(8),
        marginHorizontal: s(4),
        marginTop: s(12),
        display: 'flex',
        flexDirection: 'column',
        padding: s(12)
    },
    bottomLabel: {
        color: themeState.secondaryText,
        fontSize: s(12)
    },
    textLine: {
        color: themeState.text
    }
})


export default CollectRecords