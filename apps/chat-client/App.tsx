import React from "react"
import * as SplashScreen from "expo-splash-screen"
import App from "./app/app"

SplashScreen.preventAutoHideAsync()

export default () => <App hideSplashScreen={SplashScreen.hideAsync} />
