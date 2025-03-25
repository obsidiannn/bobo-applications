import {
  LinkingOptions,
  NavigationContainer,
} from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import messaging from '@react-native-firebase/messaging';
import React, { useCallback, useContext, useEffect } from "react"
import { AppState, Appearance, Linking, StatusBar } from "react-native"
import * as Screens from "app/screens"
import Config from "../../config"
import { navigate, navigationRef, useBackButtonHandler } from "./../navigationUtilities"
import { useSetRecoilState } from "recoil";
import { NetworkState, ThemeState } from "app/stores/system";
import { init as KVInit } from "app/utils/kv-tool";
import { getNow } from "app/utils/account";
import { Wallet } from "app/utils/wallet";
import { AuthUser, AuthWallet, ChatsStore } from "app/stores/auth";
import TabStack from "./../TabStack/TabStack";
import { Init as DBInit } from "app/utils/database";
import NetInfo from '@react-native-community/netinfo';
import { LocalUserService } from "app/services/LocalUserService";
import { AuthService } from "app/services/auth.service";
import chatService from "app/services/chat.service";
import { SocketContext } from "app/components/socket";
import { SystemService } from "app/services/system.service";
import { App } from "types/app";
import { initNotification } from "app/services/notification.service";
import listenNotification from "app/services/listen-notification";

const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof App.StackParamList> = NativeStackScreenProps<App.StackParamList, T>

const Stack = createNativeStackNavigator<App.StackParamList>()

const AppStack = () => {
  const setAuthUser = useSetRecoilState(AuthUser)
  const setChatsStore = useSetRecoilState(ChatsStore)
  const socketContext = useContext(SocketContext)

  const setAuthWallet = useSetRecoilState(AuthWallet)
  const setNetworkState = useSetRecoilState(NetworkState);


  const handleDeepLink = (event: { url: string }) => {
    console.log('[link_screen]', event);
    //navigate('LinkScreen', { from: 'link', url: event.url })
  };

  const loadOnlineData = useCallback(() => {
    NetInfo.fetch().then(async (state) => {
      if (state.isConnected) {
        try {
          await SystemService.refreshNodes()
          setNetworkState(true)
        } catch (e) {
          console.error(e);
        }
        await initNotification()
        await listenNotification()
        AuthService.getInfo().then((v) => {
          setAuthUser(v)
          AppState.addEventListener('change', nextAppState => {
            socketContext.setAppState(nextAppState);
            if (nextAppState == "background") {
              // 关闭socket
              socketContext.close();
            }
            if (nextAppState == "active") {
              // 打开socket
              socketContext.init(v);
            }
          });
          socketContext.init(v);
        }).catch(e => console.log(e))
        // 刷新请求地址
        // 上报firebase token
        // 连接websocket
        console.log('[init] 加载在线chat');
        chatService.mineChatList().then((res) => {
          if (res !== null && res.length > 0) {
            console.log('change chat detail');
            console.log(res);
            setChatsStore(res)
          }
        })

      } else {
        setNetworkState(false)
      }
    })
  }, [])
  const init = useCallback(async () => {
    await KVInit();
    const now = getNow()
    console.log('now=', now);
    if (now) {
      global.wallet = new Wallet(now);
      setAuthWallet(global.wallet);
      Linking.addEventListener('url', handleDeepLink);
      const initUrl = await Linking.getInitialURL()
      if (initUrl) {
        console.log('[initUrl]', initUrl);
        navigate('LinkScreen', { from: 'link', url: initUrl })
      }

      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: 'TabStack' }],
      })
      await DBInit(global.wallet.getAddress());
      const localChats = await chatService.mineLocalChats()
      if (localChats) {
        setChatsStore(localChats)
      }
      const user = await LocalUserService.findByAddr(global.wallet.getAddress())
      if (user) {
        setAuthUser(user)
      }
      loadOnlineData();
    }
  }, [])
  const setThemeState = useSetRecoilState(ThemeState);
  useEffect(() => {
    const v = Appearance.getColorScheme()
    setThemeState(v === "dark" ? 'dark' : 'light');
    // setThemeState('dark')
    StatusBar.setBarStyle(v === "dark" ? 'dark-content' : 'light-content');
    const subscription = Appearance.addChangeListener(({ colorScheme }) => setThemeState(colorScheme === "dark" ? 'dark' : 'light'));
    const networkSubscription = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        setNetworkState(true)
      } else {
        setNetworkState(false)
      }
    });
    init();
    return () => {
      subscription.remove()
      networkSubscription();
    };
  }, []);
  return (
    <Stack.Navigator
      initialRouteName="WelcomeScreen"
      //initialRouteName="SignUpScreen"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="TabStack" component={TabStack} />
      <Stack.Screen name="UserChatScreen" component={Screens.UserChatScreen} />
      <Stack.Screen name="GroupChatScreen" component={Screens.GroupChatScreen} />
      <Stack.Screen name="WelcomeScreen" component={Screens.WelcomeScreen} />
      <Stack.Screen name="WebViewScreen" component={Screens.WebViewScreen} />
      <Stack.Screen name="SignUpScreen" component={Screens.SignUpScreen} />
      <Stack.Screen name="UserInfoScreen" component={Screens.UserInfoScreen} />
      <Stack.Screen name="InviteFriendScreen" component={Screens.InviteFriendScreen} />
      <Stack.Screen name="InviteInfoScreen" component={Screens.InviteInfoScreen} />
      <Stack.Screen name="FriendInviteRecordScreen" component={Screens.FriendInviteRecordScreen} />
      <Stack.Screen name="AddFriendModal" component={Screens.AddFriendScreen} />
      <Stack.Screen name="GroupCreateScreen" component={Screens.GroupCreateScreen} />
      <Stack.Screen name="ProfileScreen" component={Screens.ProfileScreen} />
      <Stack.Screen name="SafetyScreen" component={Screens.SafetyScreen} />
      <Stack.Screen name="SettingScreen" component={Screens.SettingScreen} />
      <Stack.Screen name="UnlockScreen" component={Screens.UnlockScreen} />

      <Stack.Screen name="DiscoverScreen" component={Screens.DiscoverScreen} />
      <Stack.Screen name="GroupInfoScreen" component={Screens.GroupInfoScreen} />
      <Stack.Screen name="UserBlockScreen" component={Screens.UserBlockScreen} />
      <Stack.Screen name="CollectScreen" component={Screens.CollectScreen} />
      <Stack.Screen name="SystemFeedbackScreen" component={Screens.SystemFeedbackScreen} />
      <Stack.Screen name="DonateScreen" component={Screens.DonateScreen} />
      <Stack.Screen name="LinkScreen" component={Screens.LinkScreen} />
    </Stack.Navigator>
  )
}


export const AppNavigator = () => {

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))
  const linking: LinkingOptions<App.StackParamList> = {
    enabled: true,
    prefixes: ['https://mychat.com', 'nextchat://'],
    config: {
      screens: {
        ChatScreen: 'chat/:id',
        GroupInfoScreen: 'group/:id',
        UserScreen: 'user/:user_name',
        UserInfoScreen: 'userinfo/:userId',
        GroupChatScreen: 'groupchat/:chatId?fromNotify=true',
        UserChatScreen: 'userchat/:chatId?fromNotify=true'
      },
    },
    async getInitialURL() {
      const url = await Linking.getInitialURL();

      if (url != null) {
        return url;
      }
      const message = await messaging().getInitialNotification();
      return message?.data?.url as string;
    },
    subscribe(listener) {
      const onReceiveURL = ({ url }: { url: string }) => listener(url);
      const subscription = Linking.addEventListener('url', onReceiveURL);
      const unsubscribeNotification = messaging().onNotificationOpenedApp(
        (message: any) => {
          const url = message.data?.url;
          if (url) {
            listener(url);
          }
        }
      );

      return () => {
        subscription.remove();
        unsubscribeNotification();
      };
    },
  };
  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={async () => {

      }}
    >
      <AppStack />
    </NavigationContainer>
  )
}
