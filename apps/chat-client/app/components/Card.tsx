import { ReactNode } from "react";
import { ColorValue, View, ViewStyle } from "react-native";
import { s } from "app/utils/size";
import { $colors } from "app/Colors";

export interface CardProps {
  rounded?: boolean;
  backgroundColor?: ColorValue;
  children: ReactNode;
  style?: ViewStyle;
  theme?: "light" | "dark";
}
export const Card = (props: CardProps) => {
  const {theme='light'} = props;
  return <View style={[
    $container,
    {
      backgroundColor: theme == "dark" ? $colors.slate700 : $colors.white,
    },
    props.rounded && {
      borderRadius: s(20)
    },
    props.style
  ]}>
    {props.children}
  </View>
}
const $container: ViewStyle = {
  width: "100%",
  marginBottom: s(10),
  padding: s(16),
}