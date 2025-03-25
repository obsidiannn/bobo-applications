import Navbar from "app/components/Navbar"
import { s } from "app/utils/size"
import { StatusBar, View } from "react-native"
import { $colors } from "app/Colors"
import { useSafeAreaInsets } from "react-native-safe-area-context"
export interface FullScreenProps {
  theme: "light" | "dark";
  children?: React.ReactNode;

}

export interface ScreenXProps extends FullScreenProps {
  title: string;
  onLeftPress?: () => void;
  renderRight?: () => React.ReactNode;
}

export const FullScreen = (props: FullScreenProps) => {
  const insets = useSafeAreaInsets()
  return <View style={{
    flex: 1,
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    backgroundColor: props.theme == "dark" ? $colors.slate950 : $colors.gray100,
  }}>
    <StatusBar barStyle={props.theme == "dark" ? "light-content" : "dark-content"} />
    {props.children}
  </View>
}
export const ScreenX = (props: ScreenXProps) => {
  return <FullScreen {...props}>
    <Navbar onLeftPress={props.onLeftPress} theme={props.theme} title={props.title} renderRight={props.renderRight}/>
    <View style={{
      marginTop: s(20),
      flex: 1,
      backgroundColor: props.theme == "dark" ? $colors.slate700 : $colors.white,
      borderTopStartRadius: s(24),
      borderTopRightRadius: s(24),
    }}>
      {props.children}
    </View>
  </FullScreen>
}