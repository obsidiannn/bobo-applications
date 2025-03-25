import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { AppState, Linking } from 'react-native';
import { navigate } from 'app/navigators';
import { globalKV } from 'app/utils/kv-tool';
export default async () => {
    console.log('[init] init firebase listener');

    messaging().onNotificationOpenedApp(async (remoteMessage) => {
        await notifee.cancelAllNotifications()
        const state = AppState.currentState
        console.log('后台收到消息',state);

        // if (state === 'active') {
        //     // 活跃状态不进行通知
        //     return
        // }
        await handleMessage(remoteMessage)
    });

    messaging()
        .getInitialNotification()
        .then(async (remoteMessage) => {
            if (remoteMessage) {
                console.log(
                    'Notification caused app to open from quit state:',
                    remoteMessage.data, remoteMessage.messageId
                );
                await notifee.cancelAllNotifications()
                const lastInitId = globalKV.get('string', 'initNotifyId') as string | undefined
                // console.log('last message',globalKV.get('string','RemoteNotification'));

                if (lastInitId && lastInitId === remoteMessage.messageId) {
                    console.log('lastInitId', lastInitId);
                    return
                }
                if (remoteMessage.messageId) {
                    globalKV.set('initNotifyId', remoteMessage.messageId ?? '')
                }
                await handleMessage(remoteMessage)

                // if (remoteMessage.messageId) {
                //     globalKV.set('initNotifyId', remoteMessage.messageId ?? '')
                // }
                // putNotification(remoteMessage.data)
                // navig
            }
        });
}

const handleMessage = async (remoteMessage: any) => {
    const data = remoteMessage.data
    if(data.sourceType === 'link'){
        navigate('LinkScreen', {from: 'notify', url: data.sourceUrl ?? ''})
    }
    // if (data.sourceType === 'link') {
    //     if(data.sourceLink){
    //         if(await Linking.canOpenURL(data.sourceLink)){
    //             await Linking.openURL(data.sourceLink)
    //         }
    //     }
    // } else {
    //     if (globalThis.wallet) {
    //         const target = await handleNofitication(remoteMessage.data)
    //         navigate('AuthStackNav', { screen: target.screen, params: target.params })
    //     } else {
    //         navigate('Unlock', remoteMessage.data)
    //     }
    // }
}

const putNotification = (remoteMessage: any) => {
    console.log('put', remoteMessage);

    globalKV.set('RemoteNotification', JSON.stringify(remoteMessage))
}