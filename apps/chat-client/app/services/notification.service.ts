import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { EventType, AndroidImportance, AndroidVisibility } from '@notifee/react-native';
import { requestNotificationPermission } from 'app/utils/permissions'
import { AppState, Platform } from 'react-native';
import firebaseTokenApi from 'app/api/notify/firebase-token';
const channelId = 'com.tdchat.default'

export const initNotification = async () => {
  try {
    await initService()
    await subscribe()
  } catch (error) {

  }

}

const initService = async () => {
  // const messagePermission = await messaging().hasPermission()
  // console.log('[messagePermission]',messagePermission);
  console.log('初始化消息');
  await messaging().requestPermission()
  try {
    await requestNotificationPermission()
  } catch (e) {
    console.log(e)
  }
  const token = await messaging().getToken();
  if (token) {
    await messaging().registerDeviceForRemoteMessages()
    const newToken = await messaging().getToken()
    console.log('====================================');
    console.log('firebase token 1: ', newToken);
    console.log('====================================');
    global.token = newToken
    console.log('====================================');
    console.log("global.wallet1", global.wallet)
  } else {
    global.token = token
  }

  if (global.wallet) {
    await firebaseTokenApi.register(global.token)
  }
  console.log('====================================');
  console.log('firebase token 3: ', global.token);
  console.log('====================================');
  await firebaseTokenApi.register(global.token)
  messaging().onTokenRefresh(res => {
    console.log('on refresh');
    global.token = res
  })

  // 註冊channel
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: channelId,
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC
    })
  }

  // 註冊
  notifee.registerForegroundService((notification): Promise<void> => {
    return new Promise(() => {
      console.log('[get]');
    });
  });

}

/**
 * 提交token 與 wallet的address傳至server
 */
export const sumbitToken = () => {
  if (global.wallet) {
    //
  }
}

export const backgroundMessageHandle = async (msg: any) => {
  console.log('[onBackgroundMessageHandler]', msg.data);
  const state = AppState.currentState
  if (state === 'active') {
    // 活跃状态不进行通知
    return
  }
  await onDisplayNotification(msg)
}

// 訂閱
const subscribe = async () => {
  // messaging().onMessage((m)=>{
  //   console.log('[onmessage]',m);

  // })
  // 後臺消息處理
  messaging().setBackgroundMessageHandler(backgroundMessageHandle)

  notifee.onBackgroundEvent(async ({ type, detail }) => {
    console.log('onBackgroundEvent ', type, detail);
    const { notification, pressAction } = detail;
    if (type === EventType.ACTION_PRESS) {
      console.log('[onBackgroundEvent] ACTION_PRESS: first_action_reply');
      if (notification?.id) {
        await notifee.cancelNotification(notification?.id);
      }
    }

    // if (type === EventType.APP_BLOCKED) {
    //   if(detail.blocked){
    //   }  
    // }
  });

  if (Platform.OS !== 'ios') {
    notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
        case EventType.ACTION_PRESS:
          break;
      }
    });
  }


}


/**
 * 發送消息
 * @param message 
 */
const onDisplayNotification = async (message: FirebaseMessagingTypes.RemoteMessage) => {
  try {
    const notificationId = await notifee.displayNotification({
      title: message.notification?.title,
      body: message.notification?.body,
      android: {
        channelId,
        asForegroundService: true,
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_react_icon',
        color: '#9c27b0',
        sound: 'default',
        pressAction: {
          id: 'default',
        }
      },
    });

    setTimeout(() => {
      notifee.cancelNotification(notificationId)
    }, 5000)
  } catch (error) {
    console.error(error)
  }
}


export interface NotificationType {
  screen: string
  params: any
}


