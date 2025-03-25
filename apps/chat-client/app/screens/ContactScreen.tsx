import { ColorsState, ThemeState } from "app/stores/system"
import { useEffect } from "react";
import { View, Text, StatusBar } from "react-native"
import { useRecoilValue } from "recoil"
import { StackScreenProps } from "@react-navigation/stack"
import { s } from "app/utils/size"
import { App } from "types/app";
import { useTranslation } from "react-i18next";
type Props = StackScreenProps<App.StackParamList, 'ContactScreen'>;
export const ContactScreen = ({ navigation }: Props) => {
  const $colors = useRecoilValue(ColorsState);
  const $theme = useRecoilValue(ThemeState);
  const { t } = useTranslation('screens')

  useEffect(() => {
    if ($theme === 'dark') {
      StatusBar.setBarStyle('light-content');
    } else {
      StatusBar.setBarStyle('dark-content');
    }
  }, [])
  
  return <View style={{
    flex: 1,
  }}>
    <View style={{
      flex: 1,
      backgroundColor: '#07101D',
    }}>
      <View style={{
        flex: 1,
        backgroundColor: $colors.background,
        borderBottomLeftRadius: s(12),
        borderBottomRightRadius: s(12),
      }}>
        <View style={{
          height: s(45),
        }}>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            backgroundColor: "red",
            alignItems: "center"
          }}>
            <Text>{t('contract.labelAvatar')}</Text>
            <View style={{
              flex: 1,
              flexDirection: 'column',
            }}>
              <Text>{t('contract.labelScan')}</Text>
              <Text>{t('contract.labelQrcode')}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  </View>
}