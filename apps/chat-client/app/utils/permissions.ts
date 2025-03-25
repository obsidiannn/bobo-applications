import { Alert, NativeModules, Platform } from 'react-native';
import {
    NotificationOption, check, Permission, PERMISSIONS, RESULTS, request,
    openSettings, checkNotifications, requestNotifications, NotificationsResponse,
    checkMultiple, PermissionStatus, requestMultiple
} from 'react-native-permissions';
import toast from './toast';
import RNFS from '@dr.pogodin/react-native-fs';
import { globalStorage } from './kv-tool';
const { AutoStartModule } = NativeModules;


export async function hasAndroidPermission() {
    const version = Number(Platform.Version)
    const getCheckPermissionPromise = async () => {
        let statuses: PermissionStatus[] = [];
        if (version >= 33) {
            const results = await checkMultiple([
                PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
                PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
            ])
            statuses.push(results["android.permission.READ_MEDIA_IMAGES"])
            statuses.push(results["android.permission.READ_MEDIA_VIDEO"])
        } else {
            const result = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
            statuses.push(result)
        }
        return !!statuses.find(v => v == RESULTS.UNAVAILABLE || v == RESULTS.DENIED)
    };

    const hasPermission = await getCheckPermissionPromise();
    if (hasPermission) {
        return true;
    }
    const getRequestPermissionPromise = async () => {
        let statuses: PermissionStatus[] = [];
        if (version >= 33) {
            const results = await requestMultiple([
                PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
                PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
            ])
            statuses.push(results["android.permission.READ_MEDIA_IMAGES"])
            statuses.push(results["android.permission.READ_MEDIA_VIDEO"])
        } else {
            const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
            statuses.push(result)
        }
        return !!statuses.find(v => v == RESULTS.UNAVAILABLE || v == RESULTS.DENIED)
    };
    return await getRequestPermissionPromise();
}

// 請求寫入權限
export const requestWritePermission = async () => {
    if (Platform.OS === 'android') {
        await requestPermission(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    }
    return true
}
export const requestDirectoryPermission = async (): Promise<string | null> => {
    if (Platform.OS == "android") {
        if (Platform.Version >= 30) {
            const downloadDir = RNFS.DownloadDirectoryPath;
            const dir = downloadDir + '/bobochat';
            // 創建目錄
            await RNFS.mkdir(dir);
            return dir;
        } else {
            return RNFS.DownloadDirectoryPath;
        }

    }
    return null;

}
export const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
        return requestPermission(PERMISSIONS.ANDROID.CAMERA);
    }
    return requestPermission(Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA);
}
export const requestMicrophonePermission = async () => {
    return requestPermission(Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO);
}
export const requestPhotoPermission = async () => {
    return requestPermission(Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
}
export const requestDocumentPermission = async () => {
    return requestPermission(Platform.OS === 'ios' ? PERMISSIONS.IOS.MEDIA_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
}


/**
 * 請求通知權限
 * @returns
 */
export const requestNotificationPermission = async () => {
    const result = await checkNotifications()
    console.log('請求通知', result);
    // const autoStart:boolean = await AutoStartModule.checkAutoStartPermission();
    // console.log('自启动开关',autoStart);
    let autoStart: boolean = false
    try {
        AutoStartModule.checkAutoStartPermission((isEnabled: boolean) => {
            autoStart = isEnabled
            console.log('自启动开关', isEnabled);
        });
    } catch { }

    // if (result.status === RESULTS.GRANTED) {
    //     return;
    // }
    const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.REMINDERS : PERMISSIONS.ANDROID.POST_NOTIFICATIONS

    const options: NotificationOption[] = ['alert', 'sound', 'badge', 'provisional', 'providesAppSettings']
    return requestNotifications(options).then((result: NotificationsResponse) => {
        console.log('notify result = ', result.status);
        if (result.status === RESULTS.GRANTED) {
            console.log('開啓權限成功')
        } else {
            if (result.status === RESULTS.BLOCKED || result.status === RESULTS.DENIED) {
                if (!(globalStorage.has(IGNORE_NOTIFY_APPLY_KEY) && globalStorage.get('boolean', IGNORE_NOTIFY_APPLY_KEY))) {
                    if (Platform.OS === 'android') {
                        Alert.alert('通知開啓', '是否開啓通知', [
                            { text: '確認', onPress: () => { openNotifySetting() } },
                            { text: '不再提醒', onPress: () => { ignoreNotifyPermissionApply() } },
                            { text: '取消', style: 'cancel' }
                        ], { cancelable: false });
                    }
                }
            }
        }
    });
}
// 跳轉到權限設置
const openNotifySetting = () => {
    const notifyModule = NativeModules.OpenSettingsModule
    notifyModule.openNotificationSettings((res) => {
        console.log(res);
    })
}

const IGNORE_NOTIFY_APPLY_KEY = "IGNORE_NOTIFY_PERMISSION_APPLY"
// 忽略權限申請
const ignoreNotifyPermissionApply = () => {
    globalStorage.set(IGNORE_NOTIFY_APPLY_KEY, true)
}

export const requestPermission = async (permission: Permission) => {
    return new Promise((resolve, reject) => {
        check(permission)
            .then((result) => {
                switch (result) {
                    case RESULTS.UNAVAILABLE:
                        toast('This feature is not available (on this device / in this context)');
                        reject('This feature is not available (on this device / in this context)');
                        break;
                    case RESULTS.DENIED:
                        request(permission).then((result) => {
                            if (result === RESULTS.GRANTED) {
                                resolve(true);
                            } else {
                                toast(permission + ' is denied');
                                reject(permission + ' is denied');
                            }
                        });
                        break;
                    case RESULTS.GRANTED:
                        console.log('The permission is granted');
                        resolve(true);
                        break;
                    case RESULTS.BLOCKED:
                        openSettings()
                        break;
                    default:
                        break;
                }
            })
            .catch((error) => {
                toast('Something went wrong');
                reject('Something went wrong');
            });
    });
}
