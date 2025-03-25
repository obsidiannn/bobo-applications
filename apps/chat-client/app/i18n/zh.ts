const en = {
  chat: {
    btn_send: "发送",
    btn_bother_ignore: "消息免打扰",
    btn_message_delete: "清空聊天记录",
    btn_message_delete_desc: "将清空与该好友的聊天记录，且无法恢复",
    success_cleaned: "清除成功"
  },
  common: {
    ok: "OK!",
    cancel: "Cancel",
    back: "Back",
    btn_download: 'Download',
    btn_submit: "",
    btn_cancel: ""
  },
  welcomeScreen: {
    postscript:
      "psst  — This probably isn't what your app looks like. (Unless your designer handed you these screens, and in that case, ship it!)",
    readyForLaunch: "Your app, almost ready for launch!",
    exciting: "(ohh, this is exciting!)",
  },
  errorScreen: {
    title: "Something went wrong!",
    friendlySubtitle:
      "This is the screen that your users will see in production when an error is thrown. You'll want to customize this message (located in `app/i18n/en.ts`) and probably the layout as well (`app/screens/ErrorScreen`). If you want to remove this entirely, check `app/app.tsx` for the <ErrorBoundary> component.",
    reset: "RESET APP",
  },
  emptyStateComponent: {
    generic: {
      heading: "So empty... so sad",
      content: "No data found yet. Try clicking the button to refresh or reload the app.",
      button: "Let's try this again",
    },
  },
}

export default en
export type Translations = typeof en
