// TODO: write documentation for colors and palette in own markdown file and add links from here


const palette = {

  green300: '#00D32D',

  neutral100: "#FFFFFF",
  neutral200: "#F4F2F1",
  neutral300: "#D7CEC9",
  neutral400: "#B6ACA6",
  neutral500: "#978F8A",
  neutral600: "#564E4A",
  neutral700: "#3C3836",
  neutral800: "#191015",
  neutral900: "#000000",

  blue200: "#EBF0FF",
  blue600: "#294AF5",


  primary: '#5B6979',
  gray50: "#F9FAFB",
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  gray950: '#030712',

  primary100: "#F4E0D9",
  primary200: "#E8C1B4",
  primary300: "#DDA28E",
  primary400: "#D28468",
  primary500: "#C76542",
  primary600: "#A54F31",

  secondary100: "#DCDDE9",
  secondary200: "#BCC0D6",
  secondary300: "#9196B9",
  secondary400: "#626894",
  secondary500: "#41476E",

  accent100: "#FFEED4",
  accent200: "#FFE1B2",
  accent300: "#FDD495",
  accent400: "#FBC878",
  accent500: "#FFBB50",

  angry100: "#F2D6CD",
  angry500: "#C03403",

  red500: "#fb3737",

  overlay20: "rgba(25, 16, 21, 0.2)",
  overlay50: "rgba(25, 16, 21, 0.5)",
} as const

export const colors = {
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette,
  /**
   * A helper for making something see-thru.
   */
  transparent: "rgba(0, 0, 0, 0)",
  /**
   * The default text color in many components.
   */
  text: palette.neutral800,
  /**
   * Secondary text information.
   */
  textDim: palette.neutral600,
  /**
   * The default color of the screen background.
   */
  background: palette.neutral200,
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color.
   */
  tint: palette.primary500,
  /**
   * A subtle color used for lines.
   */
  separator: palette.neutral300,
  /**
   * Error messages.
   */
  error: palette.angry500,
  /**
   * Error Background.
   *
   */
  errorBackground: palette.angry100,
}

export const $dark: IColors = {
  background: "#1F2937",
  secondaryBackground: "#1F2937",
  text: "white",
  textChoosed: '#FFFFFF',
  btnChoosed: '#294AF5',
  btnDefault: colors.palette.gray800,
  border: colors.palette.gray600,
  primary: "#294AF5",
  secondaryText: '#9CA3AF',
  title: colors.palette.neutral100
}
export const $light: IColors = {
  background: "white",
  secondaryBackground: "#F3F4F6",
  text: colors.palette.gray600,
  textChoosed: 'white',
  btnChoosed: colors.palette.gray800,
  btnDefault: colors.palette.gray100,
  border: "#D1D5DB",
  primary: colors.palette.gray600,
  secondaryText: '#9CA3AF',
  title: colors.palette.gray950
}
export default {
  $dark,
  $light,
}