import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { forwardRef, useContext, useImperativeHandle, useMemo, useRef, useState } from "react";
import SelectMemberModal, { SelectMemberModalType, SelectMemberOption } from "app/components/SelectMemberModal/Index";
import groupService from "app/services/group.service";
import { GroupChatUiContext } from "../context";
import BaseModal from "app/components/base-modal";
import { useTranslation } from "react-i18next";
import { IModel } from "@repo/enums";
import { s } from "app/utils/size";
import AvatarComponent from "app/components/Avatar";
import { useRecoilValue } from "recoil";
import { ColorsState, ThemeState } from "app/stores/system"
import { IconFont } from "app/components/IconFont/IconFont";
import { colors } from "app/theme";

export interface GroupManagerModalRef {
  open: (groupId: number) => void;
}

export default forwardRef((props: {
  onCheck: () => void;
}, ref) => {
  const [visible, setVisible] = useState(false);
  const [groupId, setGroupId] = useState<number>();
  const maxManager = 3;
  const selectMemberModalRef = useRef<SelectMemberModalType>(null)
  const themeColor = useRecoilValue(ColorsState)
  const { t } = useTranslation('screens')
  const $theme = useRecoilValue(ThemeState);
  const managerDescribe = [
    t('groupChat.label_manager_1'),
    t('groupChat.label_manager_2'),
    t('groupChat.label_manager_3'),
  ]
  const groupContext = useContext(GroupChatUiContext)

  useImperativeHandle(ref, () => ({
    open: (groupId: number) => {
      setGroupId(groupId);
      console.log('groupcontext=', groupContext);
      setVisible(true);
    }
  }));

  const managers = useMemo(() => {
    console.log('[manager load]', groupContext.members);
    if (groupContext.members && groupContext.members.length > 0) {
      return groupContext.members.filter(m => { return m.role === IModel.IGroup.IGroupMemberRoleEnum.MANAGER })
    }
    return []
  }, [groupContext.members])
  const onClose = () => {
    setGroupId(-1)
    setVisible(false)
  }
  return <BaseModal visible={visible} onClose={onClose} title={'管理員'} animationType="slide" styles={{
    flex: 1,
    backgroundColor: themeColor.secondaryBackground,
    paddingTop: s(24),
  }} >
    <ScrollView style={{
      ...styles.mainContainer,
      backgroundColor: themeColor.background,
      borderTopLeftRadius: s(24),
      borderTopRightRadius: s(24),
    }}>
      <View style={{ marginTop: "5%" }}>
        {
          managerDescribe.map(
            (e, i) => {
              return <View style={styles.groupDescribe} key={"label_" + i}>
                <IconFont name="notification" color={colors.palette.gray500} size={22}/>
                <Text style={{ color: "#6b7280", margin: s(5) }} key={i}> {e} </Text>
              </View>
            }
          )
        }
      </View>

      <View style={{ marginBottom: s(12) }}>
        <View style={styles.managerList}>
          {
            managers.map((e, i) => {
              return <View style={{
                ...styles.managerItem,
                marginTop: i === 0 ? 0 : s(14)
              }} key={e.id + "member"}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <AvatarComponent url={e.avatar} border size={48} />
                  <Text style={{ ...styles.memberText, marginLeft: s(10), color: themeColor.text }}>{e.name}</Text>
                </View>

                <TouchableOpacity
                  style={{ padding: s(4) }}
                  onPress={async () => {

                    if (groupId) {
                      await groupService.adminRemove({
                        id: groupId,
                        uids: [e.uid]
                      })
                      groupContext.reloadMemberByUids(groupId, [e.uid])
                    }
                  }}>

                  <IconFont name="trash" color={themeColor.secondaryText} size={28} />
                </TouchableOpacity>
              </View>
            })
          }
        </View>

        <TouchableOpacity style={{
          ...styles.managerItem,
        }} key={"add_member"}
          onPress={async () => {
            const existIds = managers?.map(item => item.uid) ?? [];
            console.log(groupContext.members);

            const options: SelectMemberOption[] = (groupContext.members ?? [])
              .filter(m => { return m.role !== IModel.IGroup.IGroupMemberRoleEnum.OWNER })
              .map((item) => {
                const disabled = existIds.includes(item.uid);
                console.log(item);
                return {
                  id: item.uid,
                  icon: item.avatar,
                  status: item.role === IModel.IGroup.IGroupMemberRoleEnum.MANAGER,
                  name: item.name,
                  title: item.name,
                  name_index: item.nameIndex,
                  disabled,
                  pubKey: item.pubKey
                } as SelectMemberOption;
              })
            if (options.length > 0) {
              console.log('options', options);
              selectMemberModalRef.current?.open({
                title: t('groupChat.btn_add_manager'),
                options,
                callback: async (ops: SelectMemberOption[]) => {
                  const uids = ops.filter((item) => item.status).map(item => Number(item.id));
                  // const totalManagers = new Set([...managers.map(m=>m.uid),...uids])
                  if (uids.length > 0) {
                    if (groupId) {
                      await groupService.adminAdd({
                        id: groupId,
                        uids: uids
                      })
                      groupContext.reloadMemberByUids(groupId, uids)
                    }

                  }
                },
              })
            }
          }}
        >
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            {/* <Icon name={$theme==='dark'?"plusAddDark":"plusAddLight"} size={48} /> */}
            <View style={{
              padding: s(4), backgroundColor: themeColor.primary, borderRadius: 48
            }}>
              <IconFont name="plus" color={themeColor.textChoosed} />
            </View>
            <Text style={{
              ...styles.memberText,
              color: themeColor.text,
              marginLeft: s(10)
            }}>{t('groupChat.btn_add_manager')}</Text>
          </View>
          <IconFont name="arrowRight" color={themeColor.border} size={18} />
        </TouchableOpacity>

      </View>


    </ScrollView>
    <SelectMemberModal ref={selectMemberModalRef} />
  </BaseModal>
});



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    padding: "5%"
  },

  titleStyle: {
    color: "black",
    marginLeft: s(30),
    marginTop: "5%",
    marginBottom: "5%",
    fontWeight: "bold",
    fontSize: s(16)
  },
  groupDescribe: {
    backgroundColor: "#f3f4f6",
    padding: s(12),
    borderRadius: s(15),
    marginTop: s(8),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  managerList: {
    // backgroundColor:"yellow",
    marginTop: s(18)
  },
  managerItem: {

    borderRadius: s(15),
    paddingVertical: s(12),
    display: 'flex',
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  avatar: {
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },


  button: {
    marginTop: s(40),
    marginBottom: s(40),
    borderRadius: s(15),
    paddingVertical: s(15),
    justifyContent: 'center',
  },
  buttonFont: {
    fontSize: s(14),
    textAlign: "center"
  },
  memberText: {
    fontSize: s(16),
    fontWeight: "500",
  }

})
