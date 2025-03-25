import { Button } from "app/components"
import { ColorsState, ThemeState } from "app/stores/system"

import { StyleSheet, View } from "react-native"
import { useRecoilValue } from "recoil"
import { StackScreenProps } from "@react-navigation/stack"
import { App } from "types/app"
import PagerView from "react-native-pager-view"
import { useRef, useState } from "react"
import { colors } from "app/theme"
import { useTranslation } from "react-i18next"
import { s } from "app/utils/size"
import BannerComponent from "app/components/Banner"
import { $colors } from "app/Colors"
type Props = StackScreenProps<App.StackParamList, 'PlazaScreen'>;
export const PlazaScreen = ({ navigation }: Props) => {
  const pagerViewRef = useRef<PagerView>(null);
  const themeColor = useRecoilValue(ColorsState)
  const $theme = useRecoilValue(ThemeState);
  const [pageIndex, setPageIndex] = useState(0);
  const { t } = useTranslation('screens')

  const changeTab = (idx: number) => {
    pagerViewRef.current?.setPage(idx);
    // if (idx === 0) {
    //   chatService.mineChatList().then(res => {
    //     setChatsStore(res)
    //   })
    // }
    // if (idx === 1) {
    //   groupService.getMineList().then(res => {
    //     setGroups(res)
    //   })
    // }
    // if (idx === 2) {
    //   friendService.getOnlineList().then((val) => {
    //     setFriends(val)
    //   })
    // }
  }


  const btnTextStyle = (idx: number) => {
    const choosed = pageIndex === idx
    return {
      ...styles.btnTextDefault,
      ...(choosed ? {
        color: themeColor.textChoosed
      } : {
        color: themeColor.text
      })
    }
  }
  const btnStyle = (idx: number) => {
    if (pageIndex === idx) {
      return {
        backgroundColor: themeColor.btnChoosed,
        color: themeColor.textChoosed,
        borderColor: colors.palette.gray200,
      }
    } else {
      return {
        backgroundColor: themeColor.btnDefault,
        color: themeColor.text,
        borderColor: colors.palette.gray200,
      }
    }
  }


  return <View style={[{
    flex: 1,
    backgroundColor: $theme == "dark" ? $colors.slate950 : $colors.white,
  }]}>
    <View style={[styles.container, {
      backgroundColor: $theme == "dark" ? $colors.slate800 : $colors.gray100,
      borderBottomEndRadius: s(20),
      borderBottomStartRadius: s(20),
      borderBottomWidth: 1,
      paddingTop:s(16),
      overflow: 'hidden',
    }]}>
      <BannerComponent label={t('discover.labelDiscover')} describe="你最喜欢的社区" onPress={() => {
        console.log('press');

        navigation.navigate('DiscoverScreen')
      }} />
      <View style={styles.topContainer}>
        <Button label={t('chat.btn_recent')} onPress={() => changeTab(0)}
          containerStyle={{ ...styles.tabButton, ...btnStyle(0) }}
          textStyle={btnTextStyle(0)}
        />
        <Button label={t('chat.btn_group')} onPress={() => changeTab(1)}
          containerStyle={{ ...styles.tabButton, ...btnStyle(1) }}
          textStyle={btnTextStyle(1)}
        />
        <Button label={t('chat.btn_contract')} onPress={() => changeTab(2)}
          containerStyle={{ ...styles.tabButton, ...btnStyle(2) }}
          textStyle={btnTextStyle(2)}
        />
      </View>
    </View>
  </View>
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: s(18),
  },
  topContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(18),
    paddingLeft: 0
  },
  tabButton: {
    fontSize: s(10),
    marginRight: s(12),
    display: 'flex',
    flexDirection: 'row',
    minHeight: 0,
    borderRadius: s(8),
  },

  btnTextDefault: {
    fontSize: s(14),
    fontWeight: 400,
  },
})
