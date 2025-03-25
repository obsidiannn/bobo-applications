import "./i18n"
import "./utils/ignoreWarnings"
import React, { useEffect } from "react"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import { AppNavigator, useNavigationPersistence } from "./navigators"
import * as storage from "./utils/storage"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { ViewStyle } from "react-native"
import { RecoilRoot } from 'recoil';
import { SocketProvider } from "app/components/socket"
import 'react-native-url-polyfill/auto'
export const NAVIGATION_PERSISTENCE_KEY = "Login"


interface AppProps {
  hideSplashScreen: () => Promise<boolean>
}

const App = (props: AppProps) => {
  const { hideSplashScreen } = props
  const {
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  useEffect(() => {
    setTimeout(() => {
      hideSplashScreen();
    }, 2000)
  }, [])

  if (!isNavigationStateRestored) {
    return null
  }
  return (
    <RecoilRoot>
      <SocketProvider>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <GestureHandlerRootView style={$container}>
            <AppNavigator />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </SocketProvider>
    </RecoilRoot>
  )
}

export default App

const $container: ViewStyle = {
  flex: 1,
}
