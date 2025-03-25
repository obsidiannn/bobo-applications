import KV from './kv';
import {getUniqueId} from 'react-native-device-info';
export let globalKV: KV;

let kvMap = new Map<string, KV>();
export const init = async ():Promise<KV> => {
    if(!globalKV || globalKV === undefined){
        const key = await getUniqueId() ?? "bobo";
        globalKV = new KV(key, key);
    }
    return globalKV
}
export const getKV = (id: string, key?: string) => {
    if (kvMap.has(id)) {
        return kvMap.get(id);
    }
    const kv = new KV(id, key);
    kvMap.set(id, kv);
    return kv;
}


export const globalStorage = new KV('global', 'bobochat');
export const databaseStorge = new KV('global', 'sqlite');