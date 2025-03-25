import { MessageType } from "app/components/chat-ui";
import { ColorsState } from "app/stores/system";
import { StyleSheet, Text, View } from 'react-native'
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

import { useRecoilValue } from "recoil";
import { FlashList } from "@shopify/flash-list";
import RecordTextMsg from "./TextMsg";
import RecordImageMsg from "./ImageMsg";
import RecordVideoMsg from "./VideoMsg";
import RecordFileMsg from "./FileMsg";
import { Image } from "expo-image";
import { s } from "app/utils/size";
import dateUtil from "app/utils/dateUtil";
// import { ScreenModal, ScreenModalType } from "app/components/ScreenModal";
import BaseModal from "app/components/base-modal";

export interface RecordDetailModalType {
    open: (list: MessageType.Any[]) => void
}

export default forwardRef((props: {
    theme: "light" | "dark";
}, ref) => {
    const themeColor = useRecoilValue(ColorsState)
    const [data, setData] = useState<MessageType.Any[]>([])
    const style = styles({ themeColor })
    // const screenModalRef = useRef<ScreenModalType>(null)
    const [visible, setVisible] = useState(false)
    useImperativeHandle(ref, () => ({
        open: (list: MessageType.Any[]) => {
            setData(list)
            // screenModalRef.current?.open()
            setVisible(true)
        }
    }));


    const renderItem = (item: MessageType.Any) => {
        return <View style={style.recordItem}>
            <Image source={item.author.imageUrl} style={{
                width: s(36), height: s(36),
                alignSelf: 'flex-start', marginTop: s(8)
            }} />
            <View style={style.renderContent}>
                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: s(4),
                    flex: 1,
                }}>
                    <Text style={style.renderUsername}>{item.author.firstName}</Text>
                    <Text style={style.renderUsername}>{dateUtil.second2Label((item.createdAt ?? 0) / 1000)}</Text>
                </View>
                {renderContent(item)}
            </View>
        </View>
    }

    const renderContent = (item: MessageType.Any) => {
        const k = item.id + 'record'
        switch (item.type) {
            case "text":
                return <RecordTextMsg key={k} item={item} themeState={themeColor} />
            case "image":
                return <RecordImageMsg key={k} item={item} themeState={themeColor} />
            case "video":
                return <RecordVideoMsg key={k} item={item} themeState={themeColor} />
            case "file":
                return <RecordFileMsg key={k} item={item} themeState={themeColor} />
        }
        return <></>
    }

    return <BaseModal visible={visible} title="" onClose={() => { setVisible(false) }} styles={{ flex: 1 }}>
        <FlashList data={data}
            estimatedItemSize={50}
            showsVerticalScrollIndicator
            keyExtractor={item => item.id + "_record"}
            renderItem={({ item }) => renderItem(item)}
        />
    </BaseModal>
})



const styles = (
    { themeColor }: { themeColor: IColors }
) => StyleSheet.create({
    container: {
        padding: s(8),
        display: 'flex',
        flexDirection: 'column',
        flex: 1
    },
    recordItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: s(8),
        backgroundColor: themeColor.secondaryBackground
    },
    renderUsername: {
        color: themeColor.secondaryText,
        fontSize: s(12)
    },
    renderText: {
        color: themeColor.text,
        fontSize: s(16)
    },
    renderContent: {
        marginLeft: s(8),
        borderBottomColor: themeColor.border,
        borderBottomWidth: s(0.5),
        paddingVertical: s(8),
        flex: 1,
    }
})
