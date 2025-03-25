import { MMKV } from 'react-native-mmkv'


export type IKVValueType = boolean | number | string | undefined | Uint8Array;
export default class KV {
    private store: MMKV;

    constructor(id: string, key: string | undefined) {
        this.store = new MMKV({ id, encryptionKey: key })
    }
    set(key: string, val: boolean | string | number | Uint8Array) {
        this.store.set(key, val)
        return true
    }
    getObj<T>(key: string) {
        const cacheVal = this.store.getString(key)
        if (cacheVal) {
            return JSON.parse(cacheVal as string) as T;
        }
        return null;
    }
    get(type: 'boolean' | 'number' | 'string' | 'buffer', key: string): IKVValueType {
        if (type == "boolean") {
            return this.store.getBoolean(key);
        }
        if (type == "buffer") {
            return this.store.getBuffer(key);
        }
        if (type == "string") {
            return this.store.getString(key);
        }
        if (type == "number") {
            return this.store.getNumber(key);
        }
        return undefined;
    }
    del(key: string) {
        this.store.delete(key);
        return true;
    }
    has(key: string) {
        return this.store.contains(key);
    }
    flushAll() {
        this.store.clearAll();
    }
    keys() {
        return this.store.getAllKeys() ?? []
    }
    dels(keys: string[]) {
        try {
            for (const key of keys) {
                this.store.delete(key)
            }
            return true;
        } catch (error) {
            throw error;
        }
    }
}