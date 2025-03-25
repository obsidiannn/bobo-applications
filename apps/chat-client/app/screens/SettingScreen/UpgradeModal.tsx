import { ScreenModal, ScreenModalType } from "app/components/ScreenModal";
import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { forwardRef, ReactNode, useCallback, useImperativeHandle, useRef, useState } from "react"
import { ColorValue, Linking, ScrollView, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { useRecoilValue } from "recoil";
import { IServer } from "@repo/types";
import AppApi from "app/api/sys/app";
import { useTranslation } from "react-i18next";
export interface UpgradeModalType {
  open: () => void,
  close: () => void
}
const Card = (props: {
  rounded?: boolean,
  backgroundColor?: ColorValue,
  children: ReactNode,
  style?: ViewStyle
}) => {
  const $colors = useRecoilValue(ColorsState);
  return <View style={[
    {
      width: "100%",
      backgroundColor: props.backgroundColor ?? $colors.background,
      marginBottom: s(10),
      padding: s(16),
    },
    props.rounded && {
      borderRadius: s(20)
    },
    props.style
  ]}>
    {props.children}
  </View>
}
const Button = (props: {
  label: string,
  backgroundColor?: ColorValue,
  fullWidth?: boolean,
  size?: "small",
  rounded?: boolean,
  containerStyle?: ViewStyle,
  textStyle?: TextStyle,
  onPress?: () => void,
}) => {
  const $colors = useRecoilValue(ColorsState);
  const { fullWidth = false, rounded = true, size = "small", label, containerStyle, textStyle } = props;
  const $container: Record<string, ViewStyle> = {
    "small": {
      borderRadius: rounded ? s(7) : 0,
      paddingHorizontal: s(13),
      paddingVertical: s(8)
    }
  }
  const $label: Record<string, TextStyle> = {
    "small": {
      fontSize: s(14),
      fontWeight: "400",
    }
  }
  return <TouchableOpacity onPress={props.onPress} style={[
    {
      backgroundColor: props.backgroundColor ?? $colors.primary,
    },
    $container[size],
    fullWidth && {
      width: "100%",
    },
    containerStyle,
  ]}>
    <Text style={[
      {
        color: "white"
      },
      $label[size],
      textStyle,
    ]}>{label}</Text>
  </TouchableOpacity>
}
const VersionListItem = (props: {
  item: IServer.IAppVersion;
}) => {
  const $colors = useRecoilValue(ColorsState);
  const { item } = props;
  const { t } = useTranslation('screens')

  return <Card rounded>
    <View style={{
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: s(5),
      alignItems: "center",
    }}>
      <Text style={{
        fontSize: s(16),
        fontWeight: "600",
        color: $colors.text
      }}>{item.versionName}</Text>
      <Button onPress={() => Linking.openURL(item.downloadUrl)} label={t('common.btn_download')} />
    </View>
    <View style={{
      width: "100%",
      height: s(1),
      backgroundColor: "#F3F4F6",
      marginVertical: s(10)
    }}></View>
    <View>
      <Text style={{
        fontSize: s(15),
        fontWeight: "400",
        color: $colors.secondaryText
      }}>{item.description}</Text>
    </View>
  </Card>
}
export const UpgradeModal = forwardRef((props:{
  theme: "light" | "dark"
}, ref) => {
  const screenModalRef = useRef<ScreenModalType>(null);
  const [items, setItems] = useState<IServer.IAppVersion[]>([]);
  const loadData = useCallback(async () => {
    const rep = await AppApi.getVersions({
      platform: "android",
      language: "zh-CN",
      offset: 0,
      limit: 10
    });
    setItems(rep.list);
  }, [])
  useImperativeHandle(ref, () => ({
    open: async () => {
      console.log("open");
      screenModalRef.current?.open();
      await loadData();
    },
    close: async () => screenModalRef.current?.close()
  }));
  return (
    <ScreenModal theme={props.theme} title="版本更新" ref={screenModalRef} >
      <View style={{
        flex: 1,
        width: s(375),
        paddingHorizontal: s(16),
        paddingTop: s(20)
      }}>
        <ScrollView style={{
          flex: 1,
        }}>
          {items.map((item) => {
            return <VersionListItem key={item.versionName} item={item} />
          })}
        </ScrollView>
      </View>
    </ScreenModal>
  )
})