import { ThemeState } from "app/stores/system"
import { s } from "app/utils/size"
import { Text, View } from "react-native"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { useRef, useState } from "react";
import { PasswordInput } from "app/components/PasswordInput/PasswordInput"
import { Wallet } from "app/utils/wallet"
import { AuthUser, AuthWallet } from "app/stores/auth"
import { readPriKey, restore, setNow } from "app/utils/account"
import { Init as DBInit } from "app/utils/database";
import { NativeStackScreenProps } from "@react-navigation/native-stack"

import { App } from "types/app"
import { LocalUserService } from "app/services/LocalUserService"
import { ConfirmModal, ConfirmModalType } from "app/components/ConfirmModal"
import toast from "app/utils/toast"
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Button } from "app/components"
import { ScreenX } from "app/components/ScreenX"
import { $colors } from "app/Colors";
import { useTranslation } from "react-i18next";
type Props = NativeStackScreenProps<App.StackParamList, 'UnlockScreen'>;
export const UnlockScreen = ({ navigation }: Props) => {
  const $theme = useRecoilValue(ThemeState)
  // 密码 与 确认密码
  const [password, setPassword] = useState('');
  const setAuthWallet = useSetRecoilState(AuthWallet)
  const setAuthUser = useSetRecoilState(AuthUser)
  const confirmModalRef = useRef<ConfirmModalType>(null);
  const { t } = useTranslation('default')
  return <ScreenX theme={$theme} title={t('Unlock account')}>
    <View style={{
      paddingHorizontal: s(16),
      marginTop: s(20),
      paddingTop: s(25),
    }}>
      <Text style={{
        color: $theme == "dark" ? $colors.slate200 : $colors.slate700,
        fontSize: 16,
        fontWeight: "400"
      }}>{t('Please enter the security password')}</Text>
    </View>
    <View style={{
      alignItems: 'center',
      marginTop: s(20),
      height: s(48),
      paddingHorizontal: s(16),
    }}>
      <PasswordInput theme={$theme} value={password} onChangeText={(v) => setPassword(v)} placeholder={t('Please enter the security password')} />
    </View>
    <View style={{
      alignItems: 'center',
      marginTop: s(20),
      height: s(48),
      marginHorizontal: s(16),
      paddingHorizontal: s(16),
    }}>
      <Text style={{
        fontSize: 14,
        color: $colors.slate400,
      }}>{t('Please enter the security password, the security password will protect your local private key')}</Text>
    </View>
    <View style={{
      paddingHorizontal: s(16),
      marginTop: s(10),
    }}>
      <Button theme={$theme} size="large" fullWidth fullRounded onPress={async () => {
        if (!password) {
          alert(t('The password cannot be empty'));
          return;
        }
        if (password.length < 8) {
          alert(t('The password must be at least 8 characters long'));
          return;
        }
        const priKey = readPriKey(password)
        global.wallet = new Wallet(priKey);
        setNow(priKey);
        await DBInit(global.wallet.getAddress());
        const user = await LocalUserService.findByAddr(global.wallet.getAddress())
        if (user) {
          setAuthUser(user);
        }
        setAuthWallet(global.wallet);
        navigation.replace('TabStack');
      }} label={t('Unlock account')} type="primary" />
      <Button theme={$theme} containerStyle={{ marginTop: s(20) }} fullRounded type="secondary" size="large" fullWidth onPress={async () => {
        confirmModalRef.current?.open({
          title: t('import backup file?'),
          content: t('After import, existing local data will be overwritten, and the application will restart.'),
          onCancel: () => { },
          onSubmit: async () => {
            console.log('di');
            const result = await DocumentPicker.getDocumentAsync({
              copyToCacheDirectory: true
            })
            console.log('document result', result);

            if (result.assets) {
              const content = await FileSystem.readAsStringAsync(result.assets[0].uri, {
                encoding: FileSystem.EncodingType.UTF8
              })
              if (restore(content)) {
                toast(t('import success!'));
                setTimeout(() => {
                  navigation.navigate("UnlockScreen");
                }, 1000);
              }
            }
          }
        })
      }} label={t('import backup file')} />
    </View>
    <ConfirmModal theme={$theme} ref={confirmModalRef} />
  </ScreenX>
}