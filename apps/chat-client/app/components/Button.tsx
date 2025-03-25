
import { $colors } from "app/Colors";
import { colors } from "app/theme";
import { s } from "app/utils/size";
import { ReactNode } from "react";
import { ActivityIndicator, ColorValue, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

export interface BackupPriKeyModalType {
  open: () => void,
  close: () => void
}
export interface ButtonProps {
  label: string;
  backgroundColor?: ColorValue;
  fullWidth?: boolean;
  size?: "small" | "large";
  type?: "primary" | "secondary";
  rounded?: boolean;
  loading?: boolean
  disabled?: boolean
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
  fullRounded?: boolean;
  icon?: ReactNode;
  theme?: "dark" | "light";
}
export const Button = (props: ButtonProps) => {
  const {
    fullWidth = false,
    rounded = true,
    fullRounded = false,
    size = "small",
    label,
    containerStyle,
    textStyle,
    type = "primary",
    loading,
    disabled,
    icon,
    theme = "dark"
  } = props;
  const $container: Record<string, ViewStyle> = {
    "small": {
      borderRadius: fullRounded ? s(15) : (rounded ? s(7) : 0),
      paddingHorizontal: s(13),
      height: s(30),
      justifyContent: "center"
    },
    "large": {
      borderRadius: fullRounded ? s(24) : (rounded ? s(7) : 12),
      paddingHorizontal: s(13),
      height: s(48),
      justifyContent: "center"
    }
  }
  const $containerType: Record<string, ViewStyle> = {
    "primary": {
      backgroundColor: props.backgroundColor ?? theme == "dark" ? $colors.blue700 : $colors.slate600,
    },
    "secondary": {
      height: Number($container[size].height) - 2,
      borderWidth: s(1),
      borderColor: "#D1D5DB",
      backgroundColor: $colors.white,
    }
  }
  const $label: Record<string, TextStyle> = {
    "small": {
      fontSize: s(12),
      fontWeight: "400",
    },
    "large": {
      fontSize: s(15),
      fontWeight: "400",
    }
  }
  const $labelType: Record<string, TextStyle> = {
    "primary": {
      color: $colors.white,
    },
    "secondary": {
      color: $colors.black
    }
  }
  return <TouchableOpacity disabled={disabled} onPress={props.onPress} style={[
    $container[size],
    fullWidth && {
      width: "100%",
    },
    $containerType[type],
    containerStyle,
    ...[disabled ? {
      backgroundColor: colors.palette.gray400
    } : {}],
    { display: 'flex', flexDirection: 'row', alignItems: 'center' }
  ]}>
    {loading ? <ActivityIndicator color={textStyle?.color ?? $colors.white} /> : null}
    {icon ? icon : null}
    <Text style={[
      {
        color: $colors.white,
        textAlign: "center",
      },
      $label[size],
      $labelType[type],
      textStyle,
      disabled ? {
        color: $colors.neutra100
      } : null,
    ]}>{label}</Text>
  </TouchableOpacity>
}