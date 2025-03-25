import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { Modal, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomBar from "./bottom-bar";
import AplphabetIndex from "./alphabet-index";
import { FlashList } from "@shopify/flash-list";
import ListItemComponent from "./list-item";
import Navbar from "../Navbar";
import { s } from "app/utils/size";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { param } from "drizzle-orm";

export interface SelectMemberOption {
    id: number;
    icon: string;
    title: string;
    name: string;
    name_index: string;
    status: boolean;
    disabled: boolean;
    pubKey?: string
}
export interface SelectMemberModalType {
    open: (params: {
        title: string;
        options: SelectMemberOption[],
        max?: number
        callback: (options: SelectMemberOption[]) => void
    }) => void;
}
export interface SelectMemberModalProps {
    disabledUids?: string[];
}

export default forwardRef((props: SelectMemberModalProps, ref) => {
    const [visible, setVisible] = useState<boolean>(false);
    const [checkedAll, setCheckedAll] = useState<boolean>(false);
    const [contactAlphabetIndex, setContactAlphabetIndex] = useState<{ [key: string]: number }>({});
    const [aplphabet, setAplphabet] = useState<string[]>([]);
    const insets = useSafeAreaInsets();
    // users 爲列表數據 可以爲 string 或者 Item
    const [options, setOptions] = useState<SelectMemberOption[]>([]);
    const flashListRef = useRef<FlashList<(SelectMemberOption)>>(null);
    const callbackRef = useRef<(options: SelectMemberOption[]) => void>();
    const [title, setTitle] = useState('')
    const [max, setMax] = useState<number>(0)
    const themeColor = useRecoilValue(ColorsState)

    useImperativeHandle(ref, () => ({
        open: (params: {
            title: string;
            options: SelectMemberOption[],
            max: number
            callback: (users: SelectMemberOption[]) => void
        }) => {
            setTitle(title);
            setMax(params.max)
            callbackRef.current = params.callback;
            setOptions(params.options)
            setVisible(true);
        }
    }));
    return <Modal animationType="slide" transparent={true} visible={visible} style={{
        flex: 1,
    }}>
        <View style={{
            flex: 1,
            backgroundColor: 'white',
            paddingBottom: insets.bottom,
            paddingTop: insets.top,
        }}>
            <Navbar title={title} onLeftPress={() => {
                setCheckedAll(false)
                setVisible(false);
            }} />
            <View style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'row',
                backgroundColor: '#F4F4F4',
            }}>
                <View style={{
                    flex: 1,
                }}>
                    <FlashList
                        data={options}
                        ref={flashListRef}
                        keyExtractor={(item, i) => { return item.id + '' }}
                        estimatedItemSize={s(60)}
                        renderItem={({ item, index }) => {
                            let isLast = index === options.length - 1;
                            return <ListItemComponent
                                primary={themeColor.primary}
                                key={item.id}
                                item={item}
                                index={index}
                                isLast={isLast}
                                onChange={(value) => {
                                    setOptions(items => {
                                        if (value) {
                                            const length = items.filter(i => i.status).length
                                            if (max > 0 && length >= max) {
                                                return items
                                            } else {
                                                return items.map((i, idx) => {
                                                    if (idx === index) {
                                                        return { ...i, status: value }
                                                    } else {
                                                        return i
                                                    }
                                                })
                                            }
                                        } else {
                                            return items.map((i, idx) => {
                                                if (idx === index) {
                                                    return { ...i, status: value }
                                                } else {
                                                    return i
                                                }
                                            })
                                        }
                                    });
                                }} />
                        }}
                    />
                </View>
                <View style={{
                    width: s(24),
                }}>
                    <AplphabetIndex contactAlphabetIndex={contactAlphabetIndex} onScrollToIndex={(v) => {
                        flashListRef.current?.scrollToIndex({
                            index: v,
                            animated: true,
                        });
                    }} alphabet={aplphabet} />
                </View>
            </View>
            <BottomBar
                primary={themeColor.primary}
                onCheckedAllChange={(v) => {
                    if (v) {
                        const tmp = [...options];
                        tmp.forEach((item) => {
                            if (typeof item == 'string') {
                                return;
                            }
                            item.status = true;
                        });
                        setOptions(tmp);
                    } else {
                        const tmp = [...options];
                        tmp.forEach((item) => {
                            if (typeof item == 'string') {
                                return;
                            }
                            item.status = false;
                        });
                        setOptions(tmp);
                    }
                    setCheckedAll(v);
                }} checkedAll={checkedAll} onConfirm={() => {
                    const tmps: SelectMemberOption[] = [];
                    options.forEach((item) => {
                        if (typeof item == 'string') {
                            return;
                        }
                        if (item.status) {
                            tmps.push(item);
                        }
                    });
                    callbackRef.current?.(tmps);
                    setVisible(false);
                }} />
        </View>
    </Modal>
});
