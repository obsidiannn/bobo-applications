import { createInstance } from '../req';
import { Platform } from "react-native";
import * as Application from 'expo-application';
import Crypto from "react-native-quick-crypto";
import { globalStorage } from "app/utils/kv-tool";
export interface IRegisterParams {
    token: string;
}
const getDeviceId = () => {
    let uuid = globalStorage.get('string', 'device_id')
    if (!uuid) {
        uuid = Crypto.randomUUID()
        globalStorage.set("device_id", uuid)
    }
    return uuid;
}
const register = async (token: string): Promise<boolean> => {
    const params = {
        token,
        platform: Platform.OS,
        osVersion: Platform.Version + "",
        appVersion: Application.nativeApplicationVersion,
        deviceId: getDeviceId()
    }
    console.log('注册firebase token', params);

    return await createInstance(true).post('/notify/firebaseToken/register', params)
}
export default {
    register
}