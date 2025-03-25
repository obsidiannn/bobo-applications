import { GroupApplyItem } from "@repo/types";
import groupService from "app/services/group.service";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Text, View } from "react-native";
import ApplyListItemComponent from "./components/ApplyListItem";
import ApplyInfoModal, { ApplyInfoModalRef } from "./ApplyInfoModal"
import BaseModal from "app/components/base-modal";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { useTranslation } from "react-i18next";

// 羣申請列表
export interface ApplyListModalRef {
    open: (id: number, encKey: string, encPri: string) => void;
}
export default forwardRef((props: {
    onCheck: (item: GroupApplyItem) => void;
}, ref) => {
    const [visible, setVisible] = useState(false);
    const [gid, setGid] = useState<number>(-1);
    const [items, setItems] = useState<GroupApplyItem[]>([]);
    const applyInfoModalRef = useRef<ApplyInfoModalRef>(null);
    const [selfEnc, setSelfEnc] = useState<{ k: string, p: string }>()
    const themeColor = useRecoilValue(ColorsState)
    const { t } = useTranslation('screens')
    useImperativeHandle(ref, () => ({
        open: (id: number, encKey: string, encPri: string) => {
            setGid(id);
            loadApply(id)
            setVisible(true);
            setSelfEnc({ k: encKey, p: encPri })
        }
    }));

    const loadApply = (id: number) => {
        groupService.applyList([id]).then(res => {
            setItems(res);
        });
    }

    const onClose = () => {
        setItems([])
        setVisible(false)
    }

    return <BaseModal animationType="slide" visible={visible} onClose={onClose} title={t('groupChat.title_apply_list')} styles={{
        flex: 1, backgroundColor: themeColor.background
    }}>
        <View style={{ flex: 1, }}>
            {items.map((item, idx) => {
                const isLast = idx === (items.length - 1);
                return <ApplyListItemComponent
                    themeColor={themeColor}
                    key={item.id}
                    onCheck={() => {
                        applyInfoModalRef.current?.open(item, selfEnc?.k ?? '', selfEnc?.p ?? '');
                    }} item={item} isLast={isLast} />
            })}
        </View>
        <ApplyInfoModal onCheck={() => {
            loadApply(gid)
        }} onReject={() => {
            // props.onChangeMemberList?.();
        }} ref={applyInfoModalRef} />

    </BaseModal>
});
