import React from "react"
import { StyleProp, Text as RNText, TextProps, TextStyle } from "react-native"

/**
 * For your text displaying needs.
 * This component is a HOC over the built-in React Native one.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/Text/}
 * @param {TextProps} props - The props for the `Text` component.
 * @returns {JSX.Element} The rendered `Text` component.
 */
export const Text = (props: TextProps) => {
  const { children, style} = props
  const $styles: StyleProp<TextStyle> = [
    style,
  ]

  return (
    <RNText {...props} style={$styles}>
      {children}
    </RNText>
  )
}
