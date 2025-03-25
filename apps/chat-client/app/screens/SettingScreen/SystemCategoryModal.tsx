import BaseModal from "app/components/base-modal";
import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { View, Text, TouchableOpacity } from "react-native";
import { useRecoilValue } from "recoil";
import { SysCategoryItem } from "@repo/types";
import { FlashList } from "@shopify/flash-list";
import { IconFont } from "app/components/IconFont/IconFont";

export interface SystemCategoryModalType {
    open: () => void
}
/**
 * 用户投诉
 */
export default forwardRef((props: {
    list: SysCategoryItem[]
    onChoose: (item: SysCategoryItem) => void
}, ref) => {

    const [visible, setVisible] = useState<boolean>(false)
    const themeColor = useRecoilValue(ColorsState)
    useImperativeHandle(ref, () => ({
        open: () => {
            setVisible(true)
        }
    }));

    const onClose = () => {
        setVisible(false)
    }

    const _style = styles({ themeColor })


    const renderItem = (item: SysCategoryItem) => {
        return <TouchableOpacity
            onPress={() => {
                props.onChoose && props.onChoose(item)
                onClose()
            }}
            key={item.id + "_category"} style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: s(8),
            }}>
            <View>
                <Text style={{
                    color: themeColor.text,
                    fontSize: s(14)
                }}>{item.name}</Text>
                <Text style={{
                    color: themeColor.secondaryText,
                    fontSize: s(12)
                }}>{item.describe}</Text>
            </View>
            <IconFont name="arrowRight" color={themeColor.secondaryText} size={16} />
        </TouchableOpacity>
    }

    return <BaseModal visible={visible} title="意见反馈" onClose={onClose} styles={{ flex: 1 }}>
        <View style={_style.container}>
            <FlashList
                data={props.list}
                renderItem={(item) => renderItem(item.item)}
                keyExtractor={i => i.id + '_category'}
                estimatedItemSize={300}
            />
        </View>
    </BaseModal>
})


const styles = (
    { themeColor }: { themeColor: IColors }
) => StyleSheet.create({
    container: {
        padding: s(12),
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    title: {
        color: themeColor.text,
        fontSize: s(16)
    },
    imageContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: s(12)
    },
    imageItem: {
        width: s(64), height: s(64),
        marginRight: s(8),
        marginBottom: s(8)
    }
})
