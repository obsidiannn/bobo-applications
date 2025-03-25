import React, { useEffect, useRef, useState } from "react"
import { Image } from "expo-image"
import { ImageStyle, View, Text, Pressable, ViewStyle, TextStyle } from "react-native";
import { s } from 'app/utils/size';
import { useRecoilValue } from "recoil"
import { ThemeState } from "app/stores/system"
import { useTranslation } from 'react-i18next';
import { Button } from "app/components/Button";
import { StackScreenProps } from "@react-navigation/stack";
import { Checkbox } from "./Checkbox";
import { App } from "types/app";
import { ConfirmModal, ConfirmModalType } from "app/components/ConfirmModal";
import { $colors } from "app/Colors";
import { FullScreen } from "app/components/ScreenX";

type Props = StackScreenProps<App.StackParamList, 'WelcomeScreen'>;
export const WelcomeScreen = ({ navigation }: Props) => {
  const $theme = useRecoilValue(ThemeState)
  const [protocolStatus, setProtocolStatus] = useState(false)
  const confirmModalRef = useRef<ConfirmModalType>();
  const { t } = useTranslation('default');
  const protocols = [
    {
      name: 'Privacy Policy',
      url: 'https://pages.ducloud.buzz/#/user-agreement'
    },
    {
      name: 'Acceptable Terms',
      url: 'https://pages.ducloud.buzz/#/privacy-policy'
    },
  ];
  useEffect(() => {
  }, [])
  return (
    <FullScreen theme={$theme}>
      <Text style={[$titleText, {
        color: $theme == "dark" ? $colors.white : $colors.black
      }]}>{t('Hi, welcome to use')}</Text>
      <Image style={$bg} source={require("assets/images/welcomeBg.webp")} cachePolicy="disk" />
      <View style={[$buttonContainer]}>
        <Button theme={$theme} fullRounded onPress={() => navigation.navigate("UnlockScreen")} fullWidth size="large" label={t("sign In")} type="primary" />
        <Button containerStyle={{
          marginTop: s(20)
        }} theme={$theme} onPress={() => {
          if (!protocolStatus) {
            confirmModalRef.current?.open({
              title: t('Confirm that you have read and agreed to the relevant agreements.'),
              content: t('Confirm that you have read and agreed to the relevant agreements.'),
              onSubmit: () => navigation.navigate("SignUpScreen")
            });
            return;
          }
          navigation.navigate("SignUpScreen")
        }} fullWidth fullRounded label={t("Register bobo account")} size="large" type="secondary" />

        <View style={$checkboxContainer}>
          <Checkbox onChange={() => setProtocolStatus(!protocolStatus)} checked={protocolStatus} />
          <Pressable onPress={() => setProtocolStatus(!protocolStatus)}>
            <Text style={[$checkboxText, { color: $theme == "dark" ? $colors.slate200 : $colors.slate400 }]}>{t("I have read and agreed.")}</Text>
          </Pressable>
          {protocols.map((protocol) => {
            return <Pressable key={protocol.name} onPress={() => {
              navigation.push("WebViewScreen", {
                title: t(protocol.name),
                url: protocol.url
              })
            }}>
              <Text style={[$checkboxText, { color: $theme == "dark" ? $colors.slate400 : $colors.slate700 }]}>{t(protocol.name)}</Text>
            </Pressable>
          })}
        </View>
      </View>
      <ConfirmModal theme={$theme} ref={confirmModalRef} />
    </FullScreen>
  )
}
const $titleText: TextStyle = {
  marginTop: s(65),
  fontSize: 36,
  textAlign: 'center',
  fontWeight: "500",
  marginBottom: s(20),
}
const $bg: ImageStyle = {
  width: s(375),
  height: s(365),
}
const $buttonContainer: ViewStyle = {
  marginHorizontal: s(16),
  flex: 1,
  marginTop: s(20),
  alignItems: 'center',
  justifyContent: 'center',
}
const $checkboxContainer: ViewStyle = {
  marginTop: s(20),
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap'
}
const $checkboxText: TextStyle = {
  fontSize: 14,
  marginLeft: s(4)
}