import I18n from "i18n-js"
import i18next from "i18next";
// Note the syntax of these imports from the date-fns library.
// If you import with the syntax: import { format } from "date-fns" the ENTIRE library
// will be included in your production bundle (even if you only use one function).
// This is because react-native does not support tree-shaking.
import { FormatOptions, format } from "date-fns/format"
import { parseISO } from "date-fns/parseISO"
import ar from "date-fns/locale/ar-SA"
import ko from "date-fns/locale/ko"
import en from "date-fns/locale/en-US"
import zh from "date-fns/locale/zh-CN"

type Options = Parameters<typeof format>[2]

const getLocale = () => {

  const locale = i18next.language.split("-")[0]
  return zh
}

export const formatDate = (date: string, dateFormat?: string, options?: Options) => {
  const locale = getLocale()
  const dateOptions: FormatOptions = {
    locale: locale.zhCN
  }
  return format(parseISO(date), dateFormat ?? "MMM dd, yyyy", dateOptions)
}
